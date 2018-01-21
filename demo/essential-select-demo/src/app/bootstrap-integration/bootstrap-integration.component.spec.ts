import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BootstrapIntegrationComponent } from './bootstrap-integration.component';

describe('BootstrapIntegrationComponent', () => {
  let component: BootstrapIntegrationComponent;
  let fixture: ComponentFixture<BootstrapIntegrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BootstrapIntegrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BootstrapIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
