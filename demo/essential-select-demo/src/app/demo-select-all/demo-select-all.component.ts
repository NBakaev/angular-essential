import {Component, OnInit} from '@angular/core';
import {allCountries, Country, TreeNode} from './es.models';
import {WrapperContent} from 'angular-essential-select';

@Component({
  selector: 'app-demo-select-all',
  templateUrl: './demo-select-all.component.html',
  styleUrls: ['./demo-select-all.component.scss']
})
export class DemoSelectAllComponent implements OnInit {

  public wrapperType: any = WrapperContent.MATCH_FORM;

  public selectOptions2: string[] = [
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

  public wrapperSelect: WrapperContent;

  // multiselected: string[] = ['US', 'RU'];
  multiselected: string[] = ['US', 'RU'];
  multiselectedCountryOptions: Country[] = allCountries;

  // yourCountry: string;
  yourCountry: string;

  disabledCountrySelect = false;

  constructor() {
    const yourCountry2 = navigator.language;
    console.log('navigator.language', this.yourCountry);
    let find = allCountries.find(x => x.language === yourCountry2);
    if (find != null) {
      this.yourCountry = find.code;
    }
  }

  wrapperTypes: any[] = [
    {name: 'CSS Auto', value: WrapperContent.AUTO},
    {name: 'CSS Max content', value: WrapperContent.MAX_CONTENT},
    {name: 'Match form', value: WrapperContent.MATCH_FORM}
  ];

  codeDropdownWidth = `
  <essentials-ui-select
                       [options]="wrapperTypes"
                       [(value)]="wrapperType"
                       [fieldName]="'name'"
                       [fieldValue]="'value'"
                       [bindObject]="false"
                       [wrapType]="wrapperType"
                       [placeholder]="'Click me'"
                       [hasSearchInput]="false"
                       [invalidText]="'You must select some value!'">
   </essentials-ui-select>`;

  codeMultiselect = `
## TS

  multiselected: string[] = ['US', 'RU'];
  multiselectedCountryOptions: Country[] = [
  {code: 'US', name: 'United States'},
  {code: 'CA', name: 'Canada'},
  {code: 'AU', name: 'Australia'}
  ...];

## HTML

  <essentials-ui-select [options]="selectOptions2"
                        [(value)]="multiselected"
                        [fieldName]="'name'"
                        [fieldValue]="'value'"
                        [bindObject]="false"
                        [useMultiSelect]="true"
                        [placeholder]="'Click me'"
                        [hasSearchInput]="false"
                        [invalidText]="'You must select some value!'">
   </essentials-ui-select>`;

  codeYourCountry = `
  <essentials-ui-select [options]="multiselectedCountryOptions"
                        [(value)]="yourCountry"
                        [fieldName]="'name'"
                        [fieldValue]="'code'"
                        [bindObject]="false"
                        [wrapType]="wrapperType"
                        [placeholder]="'Click me'"
                        [hasSearchInput]="true"
                        [invalidText]="'You must select some value!'">
        </essentials-ui-select>
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

  }

}
