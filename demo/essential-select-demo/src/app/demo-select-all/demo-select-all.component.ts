import {Component, OnInit, ViewChild} from '@angular/core';
import {allCountries, Country, TreeNode} from './es.models';
import {WrapperContent, EssentialSelectComponent} from 'angular-essential-select';
import {CountryPrintable} from './country-printable';

@Component({
  selector: 'app-demo-select-all',
  templateUrl: './demo-select-all.component.html',
  styleUrls: ['./demo-select-all.component.scss']
})
export class DemoSelectAllComponent implements OnInit {

  @ViewChild('simpleSelectComponent') simpleSelectComponent: EssentialSelectComponent;
  @ViewChild('multiselectSearchInputSelect') multiselectSearchInputSelect: EssentialSelectComponent;

  public wrapperType: any = WrapperContent.MATCH_FORM;

  public selectOptions2: string[] = [
    'The group of optimal control systems', 'Department for Foreign Economic Affairs',
    'option 1', 'option 2', 'another option', 'somethin else', 'and another one', 'finally last option',
    'hurr durr', 'herp derp', 'hurrrr', 'durrrr', 'derp derp'
  ];

  public simpleSelect = 'herp derp';
  public esWithSearch = '';
  public esLong = 'very long ooooooooooooooooooooooooooooooptionsooooooooooooooooooooooooooooooptionsooooooooooooooooooooooooooooooptions';

  public esMultiselect: TreeNode[] = [];

  public seletOptionsLong: string[] = [
    'very long ooooooooooooooooooooooooooooooptionsooooooooooooooooooooooooooooooptionsooooooooooooooooooooooooooooooptions',
    'option 2', 'another option', 'somethin else', 'and another one', 'finally last option',
    'hurr durr', 'herp derp', 'hurrrr', 'durrrr', 'derp derp'
  ];

  public virualScollVals: string[] = [];
  public virualScollValsValue: string;

  public wrapperSelect: WrapperContent;

  multiselectModel: string[] = ['US', 'RU'];
  multiselectSearchInputModel: string[] = ['US', 'RU'];
  multiselectCountryOptions: Country[] = allCountries;

  yourCountry: string;

  disabledCountrySelect = false;

  countryPrintableAllowed = new CountryPrintable();

  constructor() {
    const yourCountry2 = navigator.language;
    // console.log('navigator.language', this.yourCountry);
    const find = allCountries.find(x => x.language === yourCountry2);
    if (find != null) {
      this.yourCountry = find.code;
    }
  }

  wrapperTypes: any[] = [
    {name: 'CSS Auto', value: WrapperContent.AUTO},
    {name: 'CSS Max content', value: WrapperContent.MAX_CONTENT},
    {name: 'Match form', value: WrapperContent.MATCH_FORM}
  ];

  codeSimple = `
   <essential-select [options]="selectOptions2"
                     [(value)]="simpleSelect"
                     [placeholder]="'Click me'"
                     [required]="true"
                     [invalidText]="'Please select value!'">
   </essential-select>
  `;

  codeSimpleWithDisplayedName = `
   <essential-select [options]="selectOptions2"
                     [(value)]="esWithSearch"
                     [hasSearchInput]="true"
                     [placeholder]="'Click me'"
                     [required]="true"
                     [invalidText]="'Please select value!'">
        </essential-select>
  `;

  codeDropdownWidth = `
  <essential-select [options]="wrapperTypes"
                    [(value)]="wrapperType"
                    [fieldName]="'name'"
                    [fieldValue]="'value'"
                    [bindObject]="false"
                    [wrapType]="wrapperType"
                    [placeholder]="'Click me'"
                    [hasSearchInput]="false"
                    [invalidText]="'Please select value!'">
   </essential-select>`;

  codeMultiselect = `
## TS

  multiselected: string[] = ['US', 'RU'];
  multiselectedCountryOptions: Country[] = [
  {code: 'US', name: 'United States'},
  {code: 'CA', name: 'Canada'},
  {code: 'AU', name: 'Australia'}
  ...];

## HTML

  <essential-select [options]="selectOptions2"
                    [(value)]="multiselected"
                    [fieldName]="'name'"
                    [fieldValue]="'value'"
                    [bindObject]="false"
                    [useMultiSelect]="true"
                    [placeholder]="'Click me'"
                    [hasSearchInput]="false"
                    [invalidText]="'Please select value!'">
   </essential-select>`;

  codeYourCountry = `
  <essential-select [options]="multiselectedCountryOptions"
                    [(value)]="yourCountry"
                    [fieldName]="'name'"
                    [fieldValue]="'code'"
                    [bindObject]="false"
                    [wrapType]="wrapperType"
                    [placeholder]="'Click me'"
                    [hasSearchInput]="true"
                    [invalidText]="'Please select value!'">
  </essential-select>
`;

 codeYourCountryDisable = `
  ## HTML
   <essential-select [options]="multiselectedCountryOptions"
                     [(value)]="yourCountry"
                     [fieldName]="'name'"
                     [fieldValue]="'code'"
                     [bindObject]="false"
                     [wrapType]="wrapperType"
                     [placeholder]="'Click me'"
                     [disabled]="disabledCountrySelect"
                     [hasSearchInput]="true"
                     [selectPrintable]="countryPrintableAllowed"
                     [invalidText]="'You must select value!'">
   </essential-select>

  `;
  codeYourCountryDisableTs = `
 ## TS
(input countryPrintableAllowed)

export class CountryPrintable
implements EssentialSelectOptions<Country> {

  printValue(value: Country): EssentialSelectRowOptions {
    const o = new EssentialSelectRowOptions();
    o.text = value.name;

    if (value.code === 'RU') {
      o.entireRowClasses.push('disabled-css');
    }

    return o;
  }

  allowToSelectValue?(value: Country, model: any): boolean {
    if (value.code === 'RU') {
      alert('Ru can not be selected');
      return false;
    }
    return true;
  }`;

 codeYourCountryWithSearch = `
   <essential-select [options]="multiselectedCountryOptions"
                     [(value)]="multiselected2"
                     [fieldName]="'name'"
                     [fieldValue]="'code'"
                     [bindObject]="false"
                     [wrapType]="wrapperType"
                     [useMultiSelect]="true"
                     [placeholder]="'Click me'"
                     [hasSearchInput]="true"
                     [invalidText]="'Please select value!'">
   </essential-select>
`;

  setWrapperAuto() {
    this.wrapperType = WrapperContent.AUTO;
  }

  setWrapperMatchContent() {
    this.wrapperType = WrapperContent.MAX_CONTENT;
  }

  setWrapperMatchForm() {
    this.wrapperType = WrapperContent.MATCH_FORM;
  }

  ngOnInit() {

    const oneVal = new TreeNode();
    oneVal.name = 'Первая нода';
    oneVal.depth = 0;

    this.esMultiselect.push(oneVal);

    for (let i = 0; i < 1000; i++) {
      this.virualScollVals.push(`string ${i}`);
    }

  }

  setCoutry(multiselectSearchInputModel: string[]) {
    this.multiselectSearchInputModel = multiselectSearchInputModel;
  }

}
