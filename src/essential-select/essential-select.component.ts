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
import {AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgForm} from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {ValidateEssentialSelectFn} from './essential-select.validator';
import {EssentialSelectOptions, EssentialSelectRowOptions} from './essential-select.printable';
import {ObjectUtils} from '../util/object.utils';
import {StringUtils} from '../util/string.utils';
import {EssentialsSelectFilter} from './filters/filter.models';
import {TextToShowEssentialFilter} from './filters/text-to-show.essential-filter';
import {WrapperContent} from './essential-select.settings';
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
    }, {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => EssentialSelectComponent),
            multi: true,
        }
    ]
})
export class EssentialSelectComponent implements DoCheck, OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {

    /**
     * analogue of [(ngModel)]; selected value of
     */
    @Input() value: any;

    /**
     * subscribe to value changes
     * @type {EventEmitter<any>}
     */
    @Output() valueChange = new EventEmitter<any>();

    /**
     * array of possible options that user can select
     */
    @Input() options: any[];

    /**
     * limit to show options in list
     * @type {number}
     */
    @Input() optionsDisplayLimit: number = MAXIMUM_NUMBER_OPTIONS_TO_DISPLAY;

    /**
     *  If you pass some complex objects (not number/string) - you must pass ID of property that every "options" object contains
     */
    @Input() fieldValue: string;

    /**
     * Name of property to show in "options" object
     */
    @Input() fieldName: string;

    /**
     * false - if we want "value" to contain only some ID instead of all object from global; true if we want to store the whole object
     * @type {boolean}
     */
    @Input() bindObject = false;

    // обязательное ли поле для валидации
    /**
     * Is it a required field for validation
     * @type {boolean}
     */
    @Input() required = false;

    /**
     * Enable auto-complete option
     * @type {boolean}
     */
    @Input() hasSearchInput = false;
    @Input() searchInputType = 'text';

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

    // использовать ли multiselect
    @Input() useMultiSelect: boolean;

    @Input() multiSelectMaximumInlinedElements = 100;

    @Input() disabled: boolean;
    @Input() wrapType: WrapperContent = WrapperContent.MATCH_FORM;

    @Input() wrapperClasses: string[] = [];

    // angular forms automatically change null/undefined string to empty ""
    // that's a workaround. If you need empty string as a value - disable that
    @Input() treatEmptyStringAsNull = true;

    userHasInputTextToSearchBeforeSelect = false;

    isValidated = false;

    showOpenCloseIcon = true;

    // trigger to redraw pipe input
    pipeNumber = 0;

    public isOpen = false;

    // содержимое searchBoxValue поля (hasSearchInput === true)
    public searchBoxValue = undefined;

    private prevValueOutside: any = MAGIC_EMPTY_STRING;
    private ourChange = false;

    private onresizeSubscriber: any;

    // number of times user selected some value
    private _userSelectedTimes = 0;
    private _limit: number;

    private _internalValue: any = null;

    @ViewChild('container') private container: ElementRef;
    @ViewChild('containerLength') private containerLength: ElementRef;
    @ViewChild('inputSelectPlaceholder') private inputSelectPlaceholder: ElementRef;
    @ViewChild('selectForm') private ngForm: NgForm;
    @ViewChild('notSearchContaner') private notSearchContaner: ElementRef;
    @ViewChild('selectDropdown') private selectDropdown: ElementRef;

    // private formControl: AbstractControl;

    get limit(): number {
        return this._limit;
    }

    /**
     * Primary for integration purposes
     * @returns {any}
     */
    get internalValue(): any {
        return this._internalValue;
    }

    /**
     *
     * @returns {boolean} true if user selected some value after components initialized
     */
    isDirty(): boolean {
        return !NumberUtils.isPositive(this._userSelectedTimes);
    }

    // ngForms integration
    propagateChange = (_: any) => {
    };

    private onTouched = () => {
        this.isValidated = true;
    };

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    writeValue(obj: any): void {
        this.select(obj);
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    public validate(c: FormControl) {

        // if (!this.formControl) {
        //     this.formControl = c;
        //     // this.formControl.parent
        //     this.formControl.statusChanges.subscribe(x => {
        //         console.log(x);
        //     })
        // };

        if (this.valid()) {
            return null;
        }

        return false;
    }

    // end ngForms

    // // TODO: does not override disabled input
    setDisabledState(isDisabled: boolean): void {
        this.disabled = true;
    }

    constructor(private _changeDetectionRef: ChangeDetectorRef, private ngZone: NgZone) {
    }

    public getElementRef(): ElementRef {
        return this.container;
    }

    setOpen(newState: boolean) {

        if (newState === true) {
            this.showOpenCloseIcon = false;
            if (this.useMultiSelect && !this.isOpen) {
                this.searchBoxValue = undefined;
            }

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
        this.onTouched();
        this.isValidated = true;

        if (this.disabled) {
            return;
        }
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

    valid(): boolean {
        let isValid: boolean;

        if (this.validateFn) {
            isValid = this.validateFn(this.value);
        } else if (this.required) {

            if (this.treatEmptyStringAsNull) {
                isValid = (this.value !== undefined && this.value !== null) && !(typeof this.value === 'string' && StringUtils.isEmpty(this.value));
            } else {
                isValid = this.value !== undefined && this.value !== null;
            }

        } else {
            isValid = true;
        }
        return isValid;
    }

    markTouched() {
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
            // TODO: allow to customize when "break" (does not allowed to select some value)
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
        this._internalValue.length = 0;
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

        this.ngZone.runOutsideAngular(() => {
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

    public printRowClasses(item: any): string {
        return (this.selectPrintable.printValue(item) as EssentialSelectRowOptions).rowClasses.join(' ');
    }

    getCssClasses(item: any) {
        // TODO: optimize
        if (!this.enabledRowClasses()) {
            return '';
        }
        return (this.selectPrintable.printValue(item) as EssentialSelectRowOptions).entireRowClasses.join(' ');
    }

    /**
     * Change detection from outside
     * We need to check to first bind object or detect changes with was done outside the component
     */
    ngDoCheck(): void {

        // handle when value is changed outside the component
        let haveChangedOutside = false;
        if (!ObjectUtils.deepEquals(this.prevValueOutside, this.value)) {

            if (this.ourChange) {
                this.prevValueOutside = ObjectUtils.deepCopy(this.value);
            } else {
                haveChangedOutside = true;
            }
        }

        this.ourChange = false;

        if (haveChangedOutside && this.options instanceof Array) {

            if (!this.useMultiSelect) {
                // if null/undefined is selected outside the component or it is initial value
                if (this.value == null) {
                    this.select(null);
                    return this.doFinalOusideChanges();
                }

                if (this.haveFieldValue()) {
                    let selectedValue = null;

                    // если у нас входной/выходной value сложный объект - нужно найти его из this.options так же по ID
                    if (this.bindObject) {
                        selectedValue = this.options.find(x => x[this.fieldValue] === this.value[this.fieldValue]);
                    } else {
                        // если value === ID - простой тип - нужно просто найти его в this.options
                        selectedValue = this.options.find(x => x[this.fieldValue] === this.value);
                    }
                    this.select(selectedValue == null ? null : selectedValue);
                    this.doFinalOusideChanges();
                    return;
                } else {
                    let selectedValue: any;
                    selectedValue = this.options.find(x => x === this.value);
                    this.select(selectedValue == null ? null : selectedValue);
                    return this.doFinalOusideChanges();
                }
            }

            // TODO: check other cases
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
                return this.doFinalOusideChanges();
            }
        }

    }

    private doFinalOusideChanges() {
        this.prevValueOutside = ObjectUtils.deepCopy(this.value);
    }

    public printValue(): string {
        return this.printItemValue(this._internalValue);
    }

    public isSelected(val: any): boolean {

        if (this.useMultiSelect) {
            this.safeAccessInternavlValue();

            // assume that always have this.value && this.fieldValue in multiselect
            if (this.bindObject) {
                return this._internalValue.find(x => ObjectUtils.deepEquals(x, val));
            } else {
                return this._internalValue.find(x => x[this.fieldValue] === val[this.fieldValue]);
            }

        }

        return ObjectUtils.deepEquals(val, this._internalValue);
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

        // if item is null - immediately return and do not pass to printable
        if (!item) {
            return undefined;
        }

        // if we have custom printer - use it
        if (this.selectPrintable) {

            // если меню открыто - то можно задавать отдельный опциональный печатальщик под это
            if (this.selectPrintable.printValueOnOpen && this.isOpen) {
                return this.getSimpleTextPrintable(this.selectPrintable.printValueOnOpen(item));
            } else {
                return this.getSimpleTextPrintable(this.selectPrintable.printValue(item));
            }

        }

        if (!this.fieldName) {
            return item as string;
        } else {
            return item[this.fieldName] as string;
        }

    }

    public onUserOptionSelected(option: any): boolean {
        this._userSelectedTimes++;
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
        if ( (this._internalValue == null || typeof this._internalValue === 'undefined') && this.useMultiSelect) {
            this._internalValue = [];
        }
    }

    private handleNewInternalMultibindingValue() {
        if (!this.bindObject) {
            ObjectUtils.replaceObject(this._internalValue.map(x => x[this.fieldValue]), this.value);
        } else {
            ObjectUtils.replaceObject(this._internalValue, this.value);
        }
    }

    private checkCanBeDeSelected(form: any): boolean {
        if (this.selectPrintable && this.selectPrintable['allowToDeselectValue']) {
            const allowedSelect = this.selectPrintable.allowToDeselectValue(form, this._internalValue);
            if (!allowedSelect) {
                return false;
            }
        }
        return true;
    }

    private checkCanBeSelected(form: any): boolean {
        if (this.selectPrintable && this.selectPrintable['allowToSelectValue']) {
            const allowedSelect = this.selectPrintable.allowToSelectValue(form, this._internalValue);
            if (!allowedSelect) {
                this.ourChange = true;
                return false;
            }
        }
        return true;
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
                this._internalValue.length = 0;
                this.handleNewInternalMultibindingValue();
                this.ourChange = true;
                this.propagateChange(this.value);
                return {selectedValue: this.value, wasSelected: true};

            } else {

                let formInValue;
                if (this.bindObject && this.haveFieldValue()) {
                    formInValue = this._internalValue.findIndex(x => x[this.fieldValue] === form[this.fieldValue]);
                } else {
                    formInValue = this._internalValue.findIndex(x => ObjectUtils.deepEquals(x, form));
                }

                // if we already have selected element - remove
                // otherwise - add
                if (formInValue !== -1) {

                    let b = this.checkCanBeDeSelected(form);
                    if (!b) {
                        return {selectedValue: null, wasSelected: false};
                    }

                    // remove selected value
                    this._internalValue.splice(formInValue, 1);

                } else {
                    let b = this.checkCanBeSelected(form);
                    if (!b) {
                        return {selectedValue: null, wasSelected: false};
                    }
                    this._internalValue.push(form);
                }

                this.handleNewInternalMultibindingValue();
                this.ourChange = true;
                this.propagateChange(this.value);
                return {selectedValue: this.value, wasSelected: true};
            }
        } else {
            let b = this.checkCanBeSelected(form);
            if (!b) {
                return {selectedValue: null, wasSelected: false};
            }
        }

        // null = элемент не выбран
        if (form === null) {
        //     this.searchBoxValue = undefined;

            // если у нас value сложный объект - нужно выставлять его же в модель
        } else if (!StringUtils.isEmpty(this.fieldValue) && !this.bindObject) {
            val = form[this.fieldValue];
        } else {
            val = form;
        }

        this.value = val;
        this._internalValue = form;
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

        if (this.useMultiSelect) {
            if (!this.isOpen) {
                Observable.of({}).delay(0).subscribe(x => {
                    this.searchBoxValue = this.joinDefaultMultiSelect();
                })
            }

        } else {
            this.searchBoxValue = this.printItemValue(this._internalValue);
        }

        this.setOpen(this.isOpen);
        this.findPlaceholderLength(this.searchBoxValue || this.placeholder);
        this.searchChange.emit(this.searchBoxValue);

        Observable.of({}).delay(0).subscribe(x => {
            if (!this._changeDetectionRef['destroyed']) {
                this.pipeNumber++;
                this._changeDetectionRef.detectChanges();
            }
            // TODO: if immediately set pipNumber => get ExpressionChangedAfterItHasBeenCheckedError
        })

    }

    public joinDefaultMultiSelect(): string {
        if (!ObjectUtils.isArray(this._internalValue) || (this._internalValue as Array<any>).length === 0 ) {
            return undefined;
        }
        return (this._internalValue as Array<any>).map(x => this.printItemValue(x)).slice(0, this.multiSelectMaximumInlinedElements).join(', ');
    }

    private getStringVisualLengthInPx(stringTest: string): number {
        const ruler = this.containerLength.nativeElement;
        ruler.style.display = 'inline';
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

        // TODO: better algorithm
        for (let i = 1; i <= stringTest.length; i++) {
            let candidateSubstring = stringTest.slice(0, i);

            if (this.getStringVisualLengthInPx(candidateSubstring) + 40 > inputWidth.offsetWidth) {
                break;
            }

            limit = i;
        }

        this._limit = limit;
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
