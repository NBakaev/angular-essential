import { Component, OnInit } from '@angular/core';
import {TreeNode} from './es.models';
import {WrapperContent} from '../../../../../src/essential-select/essential-select.settings';

@Component({
  selector: 'app-demo-select-all',
  templateUrl: './demo-select-all.component.html',
  styleUrls: ['./demo-select-all.component.scss']
})
export class DemoSelectAllComponent implements OnInit {

  public esContentWrapper: typeof WrapperContent = WrapperContent;

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

  wrapperTypes: any[] = [
    {name: 'CSS Auto', value: WrapperContent.AUTO},
    {name: 'CSS Max content', value: WrapperContent.MAX_CONTENT},
    {name: 'Match form', value: WrapperContent.MATCH_FORM}
    ];

  setWrapperAuto(){
    this.wrapperType = WrapperContent.AUTO;
  }

  setWrapperMatchContent(){
    this.wrapperType = WrapperContent.MAX_CONTENT;
  }

  setWrapperMatchForm(){
    this.wrapperType = WrapperContent.MATCH_FORM;
  }

  constructor() { }

  ngOnInit() {

    const oneVal = new TreeNode();
    oneVal.name = 'Первая нода';
    oneVal.depth = 0;

    this.esMultiselect.push(oneVal);

  }

}
