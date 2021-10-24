import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ElementRef, ViewChild, ContentChildren, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgModel, FormControlDirective } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { ConceptoComponent } from '../concepto/concepto.component';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'tipo-ausentismos-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit, AfterViewInit {

  arrayPermisosConceptos: any;

  item: any;
  id: number;
  form: FormGroup;
  submit: boolean;
  claseAusentismoOptions: any[] = [];

  selectedTab: number;



  @ViewChild(ConceptoComponent, { static: false })
  concepto: ConceptoComponent;


  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
    private _permisos: PermisosrService,
  ) {
    this.form = this._formBuilder.group({
      id: [null],
      nombre: [null, [AlcanosValidators.alfabetico, Validators.required, AlcanosValidators.maxLength(100)]],
      claseAusentismoId: [null, [Validators.required]],
      unidadTiempo: [null, [Validators.required]],

    });
    this.submit = false;
    this.id = this._service.id;
    this.selectedTab = this._service.selectedTab;

    this.arrayPermisosConceptos = this._permisos.permisosStorage('TipoAusentismoConceptoNominas_');
  }

  ngOnInit(): void {
    this.selecClaseAusentismoLista();
    this._service.onTipoAusentismosChanged.subscribe(data => {
      this.item = data;
      this.form.patchValue({
        id: data.id,
        codigo: data.codigo,
        nombre: data.nombre,
        claseAusentismoId: data.claseAusentismoId,
        unidadTiempo: data.unidadTiempo,

      });
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

  public selecClaseAusentismoLista(): void {
    this._service.getClaseLista().then(
      (resp: any[]) => {
        this.claseAusentismoOptions = resp;
      });
  }

  ngAfterViewInit(): void {

  }

  conceptoHandle(event): void {
    this.segundo();
    this.concepto.conceptoHandle(event);
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get claseAusentismoId(): AbstractControl {
    return this.form.get('claseAusentismoId');
  }

  get unidadTiempo(): AbstractControl {
    return this.form.get('unidadTiempo');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = true;
    formValue.id = this._service.id;

    this._service.editar(this._service.id, formValue)
      .then((resp) => {
        this._service.getTipoAusentismo();
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this.selectedTab = 1;
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('nombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }

          if ('claseAusentismoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.claseAusentismoId.forEach(element => {
              errors[element] = true;
            });
            this.claseAusentismoId.setErrors(errors);
          }
          if ('conceptoNomina' in resp.error.errors) {
            const errors = {};
            resp.error.errors.conceptoNomina.forEach(element => {
              errors[element] = true;
            });
            this.unidadTiempo.setErrors(errors);
          }

          if ('unidadTiempo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.unidadTiempo.forEach(element => {
              errors[element] = true;
            });
            this.unidadTiempo.setErrors(errors);

          }
        }
      });
  }
}
