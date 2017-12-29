import {AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {ValidateEssentialSelectFn} from './essential-select.validator';
import {EssentialSelectOptions, EssentialSelectRowOptions} from './essential-select.printable';
import {ObjectUtils} from '../util/object.utils';
import {StringUtils} from '../util/string.utils';
import {EssentialsSelectFilter} from './filters/filter.models';
import {TextToShowEssentialFilter} from './filters/text-to-show.essential-filter';

const MAXIMUM_NUMBER_OPTIONS_TO_DISPLAY = 500;
const DELAY_UNTIL_UPDATE_FILTER = 100; // miliseconds

// import {FormComponentControlValidator, FormComponentControlValidatorResponse} from '../../../core/forms/form-validator.model';

@Component({
  selector: 'essentials-ui-select',
  templateUrl: './essential-select.component.html',
  styleUrls: ['./essential-select.component.scss']
})
export class EssentialSelectComponent implements DoCheck, OnInit, AfterViewInit {

  // аналог ngModel - значение, которое будет у входного параметра
  @Input() value: any;
  // необходимо информировать angular об изменении входного компонента
  // для two-way binding (по соглашению метод с постфиксом полеChange)
  @Output() valueChange = new EventEmitter<any>();

  // список (массив) всех возможных вариантов для выбора
  @Input() options: any[];
  @Input() optionsDisplayLimit: number = MAXIMUM_NUMBER_OPTIONS_TO_DISPLAY;

  // если передается сложный объект, то это поле ID, которое будет выставляться в входном параметре [(value)]
  @Input() fieldValue: string;
  // поле, которое будет показываться в списке
  @Input() fieldName: string;
  // будет ли сам value с ID сложным объектом на выходе
  @Input() bindObject = false;
  // Лимит на кол-во символов , костыль!
  @Input() limit = 22;
  // Писался лимит, но не пошло
  // @Input() multiselectLimit: number;

  // обязательное ли поле для валидации
  @Input() required = true;
  // Auto-complete option
  @Input() hasSearchInput = false;
  @Input() searchInputType = 'text';
  // содержимое searchBoxValue поля (hasSearchInput === true)
  public searchBoxValue = '';
  @Output() searchChange = new EventEmitter<string>();

  // опционален. сообщение, которое показывать при невалидном компоненте.
  // если значение не использьзуется, используется сообщение по умолчанию
  @Input() invalidText: string;

  @Input() selectAllText: string;

  @Input() unselectAllText: string;

  //
  @Input() notSelectedText: string;

  @Input() placeholder: string;
  // не показывать опцию 'Не выбрано'
  @Input() disableUnselected: boolean;
  // функция валидации
  @Input() validateFn: ValidateEssentialSelectFn;

  @Input() selectPrintable: EssentialSelectOptions<any>;

  @Input() essentialsSelectFilter: EssentialsSelectFilter = new TextToShowEssentialFilter();

  @ViewChild('container') container: ElementRef;
  @ViewChild('selectForm') ngForm: NgForm;

  // использовать ли multiselect
  @Input() useMultiSelect: boolean;

  @Input() multiSelectMaximumInlinedElements = 100;

  // TOOD: should be private
  public internalValue: any = null;
  private prevValue: any = null;

  isOpen = false;

  @Input() disabled: boolean;

  @Input() wrapperClasses: string[] = [];

  userHasInputTextToSearchBeforeSelect = false;

  isValidated = false;


  scrollToElement(): ElementRef {
    return this.container;
  }

  isOpenEditable(): boolean {
    return this.isOpen && !this.disabled;
  }

  onSearchInputChange() {
    if (!StringUtils.isEmpty(this.searchBoxValue)) {
      this.isOpen = true;
    }

    this.userHasInputTextToSearchBeforeSelect = true;
  }

  // valid(): FormComponentControlValidatorResponse {
  //     let isValid: boolean;
  //
  //     if (this.validateFn) {
  //         isValid = this.validateFn(this.value);
  //     } else if (this.required) {
  //         isValid = this.value !== undefined && this.value !== null;
  //     } else {
  //         isValid = true;
  //     }
  //     return FormComponentControlValidatorResponse.create().withoutRecursiveCheck().withValid(isValid);
  // }

  valid(): boolean {
    return true;
  }

  onValidation() {
    this.isValidated = true;
  }

  ngOnInit() {

    // TODO: i18n
    this.invalidText = 'Не выбрано';
    this.notSelectedText = 'Не выбрано';
    this.unselectAllText = 'Убрать всех';
    this.selectAllText = 'Выбрать всех';

    if (this.useMultiSelect) {
      this.internalValue = [];
    }

    if (this.hasSearchInput) {
      this.updateSearchInput();
    }
  }

  /**
   * Multiselect only; Select all elements
   */
  selectAll() {
    const selectedValue = (this.options as Array<any>).filter(x => !this.isSelected(x));
    for (const value of selectedValue) {
      if (!this.onOptionSelected(value)) {
        break;
      }
    }
    this.isOpen = false;
  }

  /**
   * Multiselect only; Unselect all elements
   */
  unselectAll() {
    // that is for multiselect only. So value is array
    this.internalValue.length = 0;
    this.handleNewInternalMultibindingValue();
    this.isOpen = false;
  }

  ngAfterViewInit() {
    if (!this.hasSearchInput) {
      return;
    }
    this.ngForm.valueChanges
      .debounceTime(DELAY_UNTIL_UPDATE_FILTER)
      .distinctUntilChanged()
      .subscribe(x => this.searchChange.emit(x.input));
  }

  // helper
  private haveFieldValue(): boolean {
    return !!(this.value && this.fieldValue);
  }

  // helper
  private isValueComplexObjectBinding(): boolean {
    return this.bindObject;
  }

  // helper
  private getSimpleTextPrintable(item: any): string {
    if (StringUtils.isString(item)) {
      return item;
    }

    if (item instanceof EssentialSelectRowOptions) {
      return item.text;
    }

    return '';
  }

  public haveNotValue(value: any): boolean {
    if (!value) {
      return true;
    } else {
      if (ObjectUtils.isArray(value)) {
        if (value.length === 0) {
          return true;
        }
      }
    }
    return false;
    // return value === undefined || value === null;
  }

  public enabledRowClasses() {

    if (this.selectPrintable && this.options && this.options.length > 0) {
      const val = this.selectPrintable.printValue(this.options[0]);
      if (val instanceof EssentialSelectRowOptions) {
        return true;
      }
    }

    return false;
  }

  // IMPORTANT: before call always check by enabledRowClasses function
  public printRowClasses(item: any): string {
    return (this.selectPrintable.printValue(item) as EssentialSelectRowOptions).rowClasses.join(' ');
  }

  /**
   * We need to check to first bind object or detect changes with was done outside the component
   */
  ngDoCheck(): void {

    // если мы сравниваем сложный объект по некоторому уникльному полю ID(this.fieldValue) в нем с значениями в this.option
    if (this.haveFieldValue()) {
      const equals = ObjectUtils.deepEquals(this.prevValue, this.internalValue);
      if (!equals) {
        // если объекты не равны (например из вне пришло что-то новое) -

        // TODO: fix
        if (!this.useMultiSelect) {
          this.select(this.internalValue);
        }

        // обновляем предыдущее значение текущим
        this.prevValue = ObjectUtils.deepCopy(this.internalValue);
      }
    }

    // при первой инициализации у нас нет внутреннего объекта
    if (this.haveFieldValue() && !this.internalValue && this.options && this.options.length > 0) {

      let selectedValue = null;

      // если у нас входной/выходной value сложный объект - нужно найти его из this.options так же по ID
      if (this.isValueComplexObjectBinding()) {
        selectedValue = this.options.find(x => x[this.fieldValue] === this.value[this.fieldValue]);
      } else {
        // если value === ID - простой тип - нужно просто найти его в this.options
        selectedValue = this.options.find(x => x[this.fieldValue] === this.value);
      }

      if (selectedValue !== null && typeof selectedValue !== 'undefined') {
        this.select(selectedValue);
      }
    }
  }

  public printValue(): string {

    if (this.value && this.fieldName) {
      return this.printItemValue(this.internalValue);
    }

    return this.printItemValue(this.value);
  }

  public isSelected(val: any): boolean {

    if (this.useMultiSelect) {
      // assume that always have this.value && this.fieldValue in multiselect
      return this.internalValue.find(x => x[this.fieldValue] === val[this.fieldValue]);
    }

    if (this.haveFieldValue()) {
      return ObjectUtils.deepEquals(val, this.internalValue);
    }

    return this.value === val;
  }

  public printItemValueAdditionalNotes(item: any): string[] {

    if (!this.selectPrintable || !this.selectPrintable.printAdditionalLinesOnOpen) {
      return [];
    }

    const printAdditionalLinesOnOpen = this.selectPrintable.printAdditionalLinesOnOpen(item);
    if (printAdditionalLinesOnOpen instanceof EssentialSelectRowOptions) {
      // TODO: support that
      console.error('Not supported printAdditionalLinesOnOpen with EssentialSelectRowOptions');
      return [];
    }

    return printAdditionalLinesOnOpen.map(x => this.getSimpleTextPrintable(x));
  }

  public printItemValue(item: any): string {

    // если есть кастомный печатальщик каждой строки - используем его
    if (this.selectPrintable) {

      // если меню открыто - то можно задавать отдельный опциональный печатальщик под это
      if (this.selectPrintable.printValueOnOpen && this.isOpen) {
        return this.getSimpleTextPrintable(this.selectPrintable.printValueOnOpen(item));
      } else {
        return this.getSimpleTextPrintable(this.selectPrintable.printValue(item));
      }

    }

    // TODO: what is it 0 ???
    if (item === '0' || item === 0) {
      return '0';
    }

    if (!item) {
      return '';
    }

    if (!this.fieldName) {
      return item as string;
    } else {
      return item[this.fieldName] as string;
    }

  }

  /**
   * @param option
   * @returns {boolean} - true if can select option
   */
  public onOptionSelected(option: any): boolean {

    const selectedResult = this.select(option);
    if (selectedResult.wasSelected) {
      this.isOpen = false;

      this.valueChange.emit(selectedResult.selectedValue);
    } else {
      return false;
    }

    if (this.hasSearchInput) {
      this.updateSearchInput();
    }
    return true;
  }

  private handleNewInternalMultibindingValue() {
    this.value.length = 0;
    if (!this.isValueComplexObjectBinding()) {
      ObjectUtils.replaceObject(this.internalValue.map(x => x[this.fieldValue]), this.value);
    } else {
      ObjectUtils.replaceObject(this.internalValue, this.value);
    }
  }

  /** Содержит логику по выбору значения, которое хранит/отдает компонент
   * @param form новое значение объекта
   */
  private select(form: any): { selectedValue: any, wasSelected: boolean } {
    let val;

    this.userHasInputTextToSearchBeforeSelect = false;

    if (this.useMultiSelect) {

      // clear array of we set 'not selected' for multiselect
      if (form === null) {
        this.internalValue.length = 0;
        this.isValidated = true;
        this.handleNewInternalMultibindingValue();
        return {selectedValue: this.value, wasSelected: true};

      } else {
        // if we really select some value
        const formInValue = this.internalValue.findIndex(x => x[this.fieldValue] === form[this.fieldValue]);

        // if we already have selected element - remove
        // otherwise - add
        if (formInValue !== -1) {

          if (this.selectPrintable && this.selectPrintable['allowToDeselectValue']) {
            const allowedSelect = this.selectPrintable.allowToDeselectValue(form, this.internalValue);
            if (!allowedSelect) {
              return {selectedValue: null, wasSelected: false};
            }
          }

          this.internalValue.splice(formInValue, 1);
        } else {
          if (this.selectPrintable && this.selectPrintable['allowToSelectValue']) {
            const allowedSelect = this.selectPrintable.allowToSelectValue(form, this.internalValue);
            if (!allowedSelect) {
              return {selectedValue: null, wasSelected: false};
            }
          }

          this.internalValue.push(form);
        }

        this.prevValue = ObjectUtils.deepCopy(this.internalValue);
        this.handleNewInternalMultibindingValue();

        // TODO: prevValue ломает если менить объект из вне
        // this.prevValue = ObjectUtils.deepCopy(this.value);
        // this.internalValue = ObjectUtils.deepCopy(this.value);
        this.isValidated = true;
        return {selectedValue: this.value, wasSelected: true};
      }
    }

    // null = элемент не выбран
    if (form === null) {

      // если у нас value сложный объект - нужно выставлять его же в модель
    } else if (!StringUtils.isEmpty(this.fieldValue) && !this.isValueComplexObjectBinding()) {
      val = form[this.fieldValue];
    } else {
      val = form;
    }

    this.value = val;
    this.internalValue = form;
    this.isValidated = true;
    return {selectedValue: val, wasSelected: true};
  }

  // после выбора когда включен поиск - обновить модель с выбраным значением
  private updateSearchInput(): void {
    this.searchBoxValue = this.printItemValue(this.internalValue);
    this.searchChange.emit(this.searchBoxValue);
  }

  public joinDefaultMultiSelect(): string {
    if (!ObjectUtils.isArray(this.internalValue)) {
      return '';
    }
    return (this.internalValue as Array<any>).map(x => this.printItemValue(x)).slice(0, this.multiSelectMaximumInlinedElements).join(', ');
  }

  // handle when user clicked outside the essential-select => close
  @HostListener('window:click', ['$event'])
  clickHandler(event: any): void {
    let parent = event.target;

    while (parent !== this.container.nativeElement && parent !== document) {
      parent = parent ? parent.parentNode : document;
    }

    if (parent === document) {
      this.isOpen = false;

      if (this.hasSearchInput) {
        this.updateSearchInput();
      }
    }
  }
}
