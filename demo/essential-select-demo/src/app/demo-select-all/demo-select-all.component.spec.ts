import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoSelectAllComponent } from './demo-select-all.component';

describe('DemoSelectAllComponent', () => {
  let component: DemoSelectAllComponent;
  let fixture: ComponentFixture<DemoSelectAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoSelectAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoSelectAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
