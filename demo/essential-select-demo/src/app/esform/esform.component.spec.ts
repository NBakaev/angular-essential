import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EsformComponent } from './esform.component';

describe('EsformComponent', () => {
  let component: EsformComponent;
  let fixture: ComponentFixture<EsformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EsformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EsformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
