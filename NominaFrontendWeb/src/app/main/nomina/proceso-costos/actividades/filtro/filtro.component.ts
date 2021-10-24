import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ActividadesListarService } from '../listar/listar.service';


// Autocompletable
import { Observable, merge } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';


@Component({
  selector: 'actividad-proceso-costos-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActividadesFiltroComponent implements OnInit {

  form: FormGroup;
  actividades: any;
  filteredActividad: Observable<string[]>;
  municipiosOrigen: any;

  constructor(
    public dialogRef: MatDialogRef<ActividadesFiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _service: ActividadesListarService
  ) {
    this.element = this.element === null ? {} : this.element;
    this.actividades = this._service.onActividadChanged.value;
    if (this.element.fechaMixta != null) {
      this.element.fechaInicio = this.element.fechaMixta[0]
      this.element.fechaFinalizacion = this.element.fechaMixta[1]
    }

    this.form = this._formBuilder.group({
      codigoActividad: [this.element.codigoActividad, []],
      actividad: [this.element.actividad, []],
      municipio: [this.element.municipio, []],
      fechaFinalizacion: [this.element.fechaFinalizacion, []],
      fechaInicio: [this.element.fechaInicio, []],
      cantidad: [this.element.cantidad, []],
      estado: [this.element.estado, []]
    });

    if (this.element.dependencia != null && typeof this.element.dependencia !== 'object') {
      this._service.getActividadSolo(this.element.dependencia).then(resp => {
        this.form.patchValue({
          dependencia: resp
        });
      });
    }

  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

    this._service.getMunicipios().then(resp => {
      this.municipiosOrigen = resp;
    });
  }

  get codigoActividad(): AbstractControl {
    return this.form.get('codigoActividad');
  }
  get fechaFinalizacion(): AbstractControl {
    return this.form.get('fechaFinalizacion');
  }
  get fechaInicio(): AbstractControl {
    return this.form.get('fechaInicio');
  }
  get estado(): AbstractControl {
    return this.form.get('estado');
  }
  get actividad(): AbstractControl {
    return this.form.get('actividad');
  }
  get municipio(): AbstractControl {
    return this.form.get('municipio');
  }
  get cantidad(): AbstractControl {
    return this.form.get('cantidad');
  }


  limpiarHandle(event): void {
    const queryParams = {
      $filter: 'true',
    };
    this._service.buildFilter(queryParams);
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const formValue = this.form.value;

    if (formValue.fechaInicio && formValue.fechaFinalizacion) {
      formValue.fechaMixta = [formValue.fechaInicio, formValue.fechaFinalizacion];
      formValue.fechaInicio = null;
      formValue.fechaFinalizacion = null;
    }

    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const queryParams = {
      $filter: toUrlEncoded(formValue),
      $top: 5,
      $skip: 0,
    };
    this._service.buildFilter(queryParams);
    this.dialogRef.close(formValue);
  }

}
