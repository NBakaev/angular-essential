import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm} from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {ValidateEssentialSelectFn} from './essential-select.validator';
import {EssentialSelectOptions, EssentialSelectRowOptions} from './essential-select.printable';
import {ObjectUtils} from '../util/object.utils';
import {StringUtils} from '../util/string.utils';
import {EssentialsSelectFilter} from './filters/filter.models';
import {TextToShowEssentialFilter} from './filters/text-to-show.essential-filter';
import {WrapperContent} from './essential-select.settings';
import {EssentialSelectTruncatePipe} from './essential-select-truncate.pipe';
import {NumberUtils} from '../util/number.utils';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

const MAXIMUM_NUMBER_OPTIONS_TO_DISPLAY = 500;
const DELAY_UNTIL_UPDATE_FILTER = 100; // miliseconds

// внутренняя строка. нужна строка чтобы определить было ли что-то иницилизировано во взодном value
const MAGIC_EMPTY_STRING = 'SOME_MAGIC_STRING_FOR_ESSENTAL_SELECT';

@Component({
    selector: 'essentials-ui-select',
    templateUrl: './essential-select.component.html',
    styleUrls: ['./essential-select.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => EssentialSelectComponent),
        multi: true
    }
    ]
})
export class EssentialSelectComponent implements DoCheck, OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {

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
    // @Input() limit;
    public limit: number;

    // обязательное ли поле для валидации
    @Input() required = true;
    // Auto-complete option
    @Input() hasSearchInput = false;
    @Input() searchInputType = 'text';
    // содержимое searchBoxValue поля (hasSearchInput === true)
    public searchBoxValue = undefined;
    @Output() searchChange = new EventEmitter<string>();

    // опционален. сообщение, которое показывать при невалидном компоненте.
    // если значение не использьзуется, используется сообщение по умолчанию
    @Input() invalidText: string;

    @Input() selectAllText: string;

    @Input() unselectAllText: string;

    @Input() notSelectedText: string;

    @Input() placeholder: string;

    // не показывать опцию 'Не выбрано'
    @Input() disableUnselected: boolean;
    // функция валидации
    @Input() validateFn: ValidateEssentialSelectFn;

    @Input() selectPrintable: EssentialSelectOptions<any>;

    @Input() essentialsSelectFilter: EssentialsSelectFilter = new TextToShowEssentialFilter();

    @ViewChild('container') private container: ElementRef;
    @ViewChild('containerLength') private containerLength: ElementRef;
    @ViewChild('inputSelectPlaceholder') private inputSelectPlaceholder: ElementRef;
    @ViewChild('selectForm') private ngForm: NgForm;
    @ViewChild('notSearchContaner') private notSearchContaner: ElementRef;
    @ViewChild('selectDropdown') private selectDropdown: ElementRef;

    // использовать ли multiselect
    @Input() useMultiSelect: boolean;

    @Input() multiSelectMaximumInlinedElements = 100;

    // TODO: should be private
    public internalValue: any = null;

    private prevValueOutside: any = MAGIC_EMPTY_STRING;
    private ourChange = false;

    public isOpen = false;

    @Input() disabled: boolean;
    @Input() wrapType: WrapperContent = WrapperContent.MATCH_FORM;

    @Input() wrapperClasses: string[] = [];

    userHasInputTextToSearchBeforeSelect = false;

    isValidated = false;

    public esContent: typeof WrapperContent = WrapperContent;

    showOpenCloseIcon = true;

    pipeTrunc: EssentialSelectTruncatePipe;

    // trigger to redraw pipe input
    pipeNumber = 0;

    onresizeSubscriber: any;

    userChangedTimes = 0;

    isDirty(): boolean {
        return !NumberUtils.isPositive(this.userChangedTimes);
    }

    // angular forms integration
    propagateChange = (_: any) => {
    };

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    writeValue(obj: any): void {
        this.select(obj);
    }

    registerOnTouched(fn: any): void {
    }

    // // TODO: does not override disabled input
    // setDisabledState(isDisabled: boolean): void {
    //     this.disabled = true;
    // }

    constructor(private _changeDetectionRef: ChangeDetectorRef, private ngZone: NgZone, private renderer: Renderer2) {
        this.pipeTrunc = new EssentialSelectTruncatePipe();
    }

    scrollToElement(): ElementRef {
        return this.container;
    }

    setOpen(newState: boolean) {

        if (newState === true) {
            this.showOpenCloseIcon = false;
        } else {
            this.showOpenCloseIcon = true;
        }
        this.isOpen = newState;
    }

    getDropdownWidth(): string {
        if (this.wrapType === WrapperContent.MATCH_FORM && this.hasSearchInput) {
            let offsetWidth = this.inputSelectPlaceholder.nativeElement.clientWidth;
            return `${offsetWidth}px`;
        }
        if (this.wrapType === WrapperContent.MATCH_FORM && !this.hasSearchInput) {
            let offsetWidth = this.notSearchContaner.nativeElement.clientWidth;
            return `${offsetWidth}px`;
        }

        if (this.wrapType === WrapperContent.AUTO) {
            return 'auto';
        }
        if (this.wrapType === WrapperContent.MAX_CONTENT) {
            return 'max-content';
        }

        return '';
    }

    changeOpen() {
        this.setOpen(!this.isOpen);
    }

    isOpenEditable(): boolean {
        return this.isOpen && !this.disabled;
    }

    onSearchInputChange($event) {

        this.searchBoxValue = $event;

        if (this.userHasInputTextToSearchBeforeSelect) {

            if (!StringUtils.isEmpty(this.searchBoxValue)) {
                this.setOpen(true);
            }
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
        if (StringUtils.isEmpty(this.invalidText)) {
            this.invalidText = 'Не выбрано';
        }

        if (StringUtils.isEmpty(this.notSelectedText)) {
            this.notSelectedText = 'Не выбрано';
        }

        if (StringUtils.isEmpty(this.unselectAllText)) {
            this.unselectAllText = 'Убрать всех';
        }

        if (StringUtils.isEmpty(this.selectAllText)) {
            this.selectAllText = 'Выбрать всех';
        }

    }

    /**
     * Multiselect only; Select all elements
     */
    selectAll() {
        this.safeAccessInternavlValue();

        const selectedValue = (this.options as Array<any>).filter(x => !this.isSelected(x));
        for (const value of selectedValue) {
            if (!this.onOptionSelected(value)) {
                break;
            }
        }
        this.setOpen(false);
    }

    /**
     * Multiselect only; Unselect all elements
     */
    unselectAll() {
        // that is for multiselect only. So value is array
        this.safeAccessInternavlValue();
        this.internalValue.length = 0;
        this.handleNewInternalMultibindingValue();
        this.setOpen(false);
    }

    ngAfterViewInit() {
        if (!this.hasSearchInput) {
            return;
        }
        this.ngForm.valueChanges
            .debounceTime(DELAY_UNTIL_UPDATE_FILTER)
            .distinctUntilChanged()
            .subscribe(x => this.searchChange.emit(x.input));

        this.checkAndUpdateSearchInput();
        this.setOpen(false);

        this.ngZone.run(() => {
            this.onresizeSubscriber = window.addEventListener('resize', () => {
                this.checkAndUpdateSearchInput();
            });
        });

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

        return undefined;
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

        // handle when value is changed outside the component
        let haveChangedOutside = false;
        if (!ObjectUtils.deepEquals(this.prevValueOutside, this.value) && !this.ourChange) {
            haveChangedOutside = true;
        }

        // при первой инициализации у нас нет внутреннего объекта
        if (haveChangedOutside && this.options && this.options.length > 0) {

            // if null is selected outside the component or it is initial value
            if (this.value === null && !this.useMultiSelect) {
                this.select(null);
            }

            if (this.haveFieldValue() && !this.useMultiSelect) {
                let selectedValue = null;

                // если у нас входной/выходной value сложный объект - нужно найти его из this.options так же по ID
                if (this.isValueComplexObjectBinding()) {
                    selectedValue = this.options.find(x => x[this.fieldValue] === this.value[this.fieldValue]);
                } else {
                    // если value === ID - простой тип - нужно просто найти его в this.options
                    selectedValue = this.options.find(x => x[this.fieldValue] === this.value);
                }
                this.select(selectedValue == null ? null : selectedValue);
            }

            // TODO: другие случаи
            if (this.useMultiSelect && this.value instanceof Array) {

                // если у нас входной/выходной value сложный объект - нужно найти его из this.options так же по ID
                const initialValueCopy = ObjectUtils.deepCopy(this.value);
                this.value.length = 0;

                if (!this.haveFieldValue()) {
                    (initialValueCopy as Array<any>).forEach(x => {
                        this.select(x);
                    });
                } else {
                    (initialValueCopy as Array<any>).forEach(y => {
                        if (this.bindObject) {
                            const selectedValue = this.options.find(x => x[this.fieldValue] === y[this.fieldValue]);
                            this.select(selectedValue);
                        } else {
                            const selectedValue = this.options.find(x => x[this.fieldValue] === y);
                            this.select(selectedValue);
                        }

                    });
                }
            }
        }

        this.prevValueOutside = ObjectUtils.deepCopy(this.value);
        this.ourChange = false;
    }

    public printValue(): string {

        if (this.value && this.fieldName) {
            return this.printItemValue(this.internalValue);
        }

        return this.printItemValue(this.value);
    }

    public isSelected(val: any): boolean {

        if (this.useMultiSelect) {
            this.safeAccessInternavlValue();

            // assume that always have this.value && this.fieldValue in multiselect
            if (this.bindObject) {
                return this.internalValue.find(x => ObjectUtils.deepEquals(x, val));
            } else {
                return this.internalValue.find(x => x[this.fieldValue] === val[this.fieldValue]);
            }

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
            return undefined;
        }

        if (!this.fieldName) {
            return item as string;
        } else {
            return item[this.fieldName] as string;
        }

    }

    public onUserOptionSelected(option: any): boolean {
        this.userChangedTimes++;
        return this.onOptionSelected(option);
    }

    /**
     * @param option
     * @returns {boolean} - true if can select option
     */
    public onOptionSelected(option: any): boolean {

        const selectedResult = this.select(option);
        if (selectedResult.wasSelected) {
            this.setOpen(false);
            this.valueChange.emit(selectedResult.selectedValue);
        } else {
            return false;
        }

        this.checkAndUpdateSearchInput();
        return true;
    }

    private safeAccessInternavlValue() {
        if (this.internalValue == null && this.useMultiSelect) {
            this.internalValue = [];
        }
    }

    private handleNewInternalMultibindingValue() {
        // this.value.length = 0;
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
        this.safeAccessInternavlValue();

        this.userHasInputTextToSearchBeforeSelect = false;

        if (this.useMultiSelect) {

            // clear array of we set 'not selected' for multiselect
            if (form === null) {
                this.internalValue.length = 0;
                this.isValidated = true;
                this.handleNewInternalMultibindingValue();
                this.ourChange = true;
                this.propagateChange(this.value);
                return {selectedValue: this.value, wasSelected: true};

            } else {

                let formInValue;
                if (this.isValueComplexObjectBinding() && this.haveFieldValue()) {
                    formInValue = this.internalValue.findIndex(x => x[this.fieldValue] === form[this.fieldValue]);
                } else {
                    formInValue = this.internalValue.findIndex(x => ObjectUtils.deepEquals(x, form));
                }

                // if we already have selected element - remove
                // otherwise - add
                if (formInValue !== -1) {

                    if (this.selectPrintable && this.selectPrintable['allowToDeselectValue']) {
                        const allowedSelect = this.selectPrintable.allowToDeselectValue(form, this.internalValue);
                        if (!allowedSelect) {
                            return {selectedValue: null, wasSelected: false};
                        }
                    }

                    // remove selected value
                    this.internalValue.splice(formInValue, 1);

                } else {
                    if (this.selectPrintable && this.selectPrintable['allowToSelectValue']) {
                        const allowedSelect = this.selectPrintable.allowToSelectValue(form, this.internalValue);
                        if (!allowedSelect) {
                            this.ourChange = true;
                            return {selectedValue: null, wasSelected: false};
                        }
                    }

                    this.internalValue.push(form);
                }

                this.handleNewInternalMultibindingValue();
                this.isValidated = true;
                this.ourChange = true;
                this.propagateChange(this.value);
                return {selectedValue: this.value, wasSelected: true};
            }
        }

        // null = элемент не выбран
        if (form === null) {
            this.searchBoxValue = undefined;

            // если у нас value сложный объект - нужно выставлять его же в модель
        } else if (!StringUtils.isEmpty(this.fieldValue) && !this.isValueComplexObjectBinding()) {
            val = form[this.fieldValue];
        } else {
            val = form;
        }

        this.value = val;
        this.internalValue = form;
        this.isValidated = true;
        this.ourChange = true;

        this.checkAndUpdateSearchInput();

        this.propagateChange(this.value);
        return {selectedValue: val, wasSelected: true};
    }

    // после выбора когда включен поиск - обновить модель с выбраным значением
    private checkAndUpdateSearchInput(): void {
        if (!this.hasSearchInput) {
            return;
        }

        this.searchBoxValue = this.printItemValue(this.internalValue);
        this.setOpen(this.isOpen);
        this.findPlaceholderLength(this.searchBoxValue || this.placeholder);
        this.searchChange.emit(this.searchBoxValue);

        Observable.of({}).delay(0).subscribe(x => {
            // this.ngZone.run( () => {
            if (!this._changeDetectionRef['destroyed']) {
                this.pipeNumber++;
                this._changeDetectionRef.detectChanges();
            }
            // });
            // TODO: IMPORTANT; if immediatly set pipNumber => get ExpressionChangedAfterItHasBeenCheckedError
            // but now we have timeout :(
            // this._changeDetectionRef.markForCheck();
        })

    }

    public joinDefaultMultiSelect(): string {
        if (!ObjectUtils.isArray(this.internalValue)) {
            return undefined;
        }
        return (this.internalValue as Array<any>).map(x => this.printItemValue(x)).slice(0, this.multiSelectMaximumInlinedElements).join(', ');
    }

    private getStringVisualLengthInPx(stringTest: string): number {
        const ruler = this.containerLength.nativeElement;
        ruler.style.display = 'inline';
        // console.log(ruler);
        ruler.innerHTML = stringTest;
        let offsetWidth = ruler.offsetWidth;
        ruler.style.display = 'none';
        return offsetWidth;
    }

    public findPlaceholderLength(stringTest: string): void {
        if (!this.inputSelectPlaceholder) {
            return;
        }
        const inputWidth = this.inputSelectPlaceholder.nativeElement;

        let limit = 0;

        for (let i = 1; i <= stringTest.length; i++) {
            let candidateSubstring = stringTest.slice(0, i);

            if (this.getStringVisualLengthInPx(candidateSubstring) + 40 > inputWidth.offsetWidth) {
                break;
            }

            limit = i;
        }

        this.limit = limit;
    }

    ngOnDestroy(): void {
        if (this.onresizeSubscriber) {
            this.onresizeSubscriber();
        }
    }

    // handle when user clicked outside the essential-select => close
    @HostListener('window:click', ['$event'])
    clickHandler(event: any): void {
        let parent = event.target;

        while (parent !== this.container.nativeElement && parent !== document) {
            parent = parent ? parent.parentNode : document;
        }

        if (parent === document) {
            this.setOpen(false);
            this.checkAndUpdateSearchInput();
        }
    }
}
