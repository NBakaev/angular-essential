import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-esform',
  templateUrl: './esform.component.html',
  styleUrls: ['./esform.component.scss']
})
export class EsformComponent implements OnInit {

  public selectOptions2: string[] = [
    'option 1', 'option 2', 'another option', 'somethin else', 'and another one', 'finally last option',
    'hurr durr', 'herp derp', 'hurrrr', 'durrrr', 'derp derp'
  ];

  isRequired = false;

  superValueVal: string;

  changeRequired() {
    this.isRequired = !this.isRequired;
  }

  constructor() { }

  ngOnInit() {
  }

  esNgForm = `
  <form #form="ngForm">
      <essentials-ui-select name="counter" 
        ngModel [options]="selectOptions2">
      </essentials-ui-select>
  </form>`;

}
