import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DemoSelectAllComponent} from './demo-select-all.component';
import {EssentialSelectModule} from 'angular-essential-select';
import {CommonModule} from '@angular/common';
import {BrowserModule, By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';

describe('Essential-select examples', () => {
  let component: DemoSelectAllComponent;
  let fixture: ComponentFixture<DemoSelectAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DemoSelectAllComponent
      ],
      imports: [
        EssentialSelectModule,
        BrowserModule,
        EssentialSelectModule,

        CommonModule,
        FormsModule,
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoSelectAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create all essential-select', () => {
    expect(component).toBeTruthy();
  });

  describe('Simple', () => {

    it('Verify ngModel', () => {
      const de = fixture.debugElement.query(By.css('#simpleTextModel'));
      const el2 = de.nativeElement;

      fixture.detectChanges();
      expect(el2.textContent).toBe('herp derp');
    });

    it('Verify placeholder', () => {
      const de = fixture.debugElement.query(By.css('#simpleSelectComponent > div > div:nth-child(1) > form > fieldset > div'));
      const el2 = de.nativeElement;

      fixture.detectChanges();
      expect(el2.innerText).toBe('herp derp');
    });

    it('Check change detection outside', () => {
      const de = fixture.debugElement.query(By.css('#simpleTextModel'));
      const el2 = de.nativeElement;

      fixture.detectChanges();
      expect(el2.textContent).toBe('herp derp');

      component.simpleSelect = component.selectOptions2[2];
      fixture.detectChanges();
      expect(el2.textContent).toBe(component.selectOptions2[2]);

    });
  });

  describe('Mulltiselect id in object with search', () => {
    it('Verify model', () => {
      const de = fixture.debugElement.query(By.css('#multiselectSearchInputBind'));
      const el2 = de.nativeElement;

      fixture.detectChanges();
      expect(el2.innerText).toBe('[ "US", "RU" ]');
    });
  });

});
