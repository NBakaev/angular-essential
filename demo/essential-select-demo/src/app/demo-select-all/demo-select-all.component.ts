import { Component, OnInit } from '@angular/core';
import {TreeNode} from './es.models';

@Component({
  selector: 'app-demo-select-all',
  templateUrl: './demo-select-all.component.html',
  styleUrls: ['./demo-select-all.component.scss']
})
export class DemoSelectAllComponent implements OnInit {

  public selectOptions2: string[] = [
    'option 1', 'option 2', 'another option', 'somethin else', 'and another one', 'finally last option',
    'hurr durr', 'herp derp', 'hurrrr', 'durrrr', 'derp derp'
  ];

  public simpleSelect = 'herp derp';
  public esWithSearch = 'herp derp';

  public esMultiselect: TreeNode[] = [];

  constructor() { }

  ngOnInit() {

    const oneVal = new TreeNode();
    oneVal.name = 'Первая нода';
    oneVal.depth = 0;

    this.esMultiselect.push(oneVal);

  }

}
