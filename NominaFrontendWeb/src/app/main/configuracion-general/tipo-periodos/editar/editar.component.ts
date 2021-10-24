import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { SubperiodoComponent } from '../subperiodos/subperiodos.component';
import { fuseAnimations } from '@fuse/animations';


@Component({
  selector: 'tipo-periodos-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit, AfterViewInit {

  item: any;
  id: number;
  form: FormGroup;
  submit: boolean;

  selectedTab: number;

  @ViewChild(SubperiodoComponent, { static: false })
  subperiodo: SubperiodoComponent;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
  ) {

    this.form = this._formBuilder.group({
      id: [null],
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      pagoPorDefecto: [null, [Validators.required]]
    });
    this.submit = false;
    this.id = this._service.id;
    this.selectedTab = this._service.selectedTab;
  }

  ngOnInit(): void {
    this._service.onTipoPeriodosChanged.subscribe(data => {
      this.item = data;
      this.form.patchValue({
        id: data.id,
        nombre: data.nombre,
        pagoPorDefecto: data.pagoPorDefecto
      });
      this.form.markAllAsTouched();
    });
  }

  tabChangeHandle(event): void {
    this.selectedTab = event.index;
  }

  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }

  ngAfterViewInit(): void {

  }

  subperiodoHandle(event): void {
    this.segundo();
    this.subperiodo.subperiodoHandle(event);
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get pagoPorDefecto(): AbstractControl {
    return this.form.get('pagoPorDefecto');
  }


  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }


  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = true;
    formValue.id = this._service.id;

    this._service.editar(this._service.id, formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this.selectedTab = 1;
      }
      ).catch((resp: HttpErrorResponse) => {

        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('nombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }
          if ('pagoPorDefecto' in resp.error.errors) {
            const errors = {};
            resp.error.errors.pagoPorDefecto.forEach(element => {
              errors[element] = true;
            });
            this.pagoPorDefecto.setErrors(errors);
          }
        }
      });
  }
}
