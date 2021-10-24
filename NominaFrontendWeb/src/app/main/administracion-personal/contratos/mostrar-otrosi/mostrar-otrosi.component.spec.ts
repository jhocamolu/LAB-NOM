import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MostrarOtrosiComponent } from './mostrar-otrosi.component';

describe('MostrarOtrosiComponent', () => {
  let component: MostrarOtrosiComponent;
  let fixture: ComponentFixture<MostrarOtrosiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MostrarOtrosiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MostrarOtrosiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
