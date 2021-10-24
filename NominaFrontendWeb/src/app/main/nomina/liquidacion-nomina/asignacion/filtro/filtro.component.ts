import { Component, OnInit, ViewEncapsulation, Inject, Optional } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { AsignacionService } from '../asignacion.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'liquidacion-nomina-asignacion-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class AsignacionFiltroComponent implements OnInit {

  item: any;

  form: FormGroup;

  centroOperativos: any[];
  dependencias: any[];
  grupoNominas: any[];

  constructor(
    public dialogRef: MatDialogRef<AsignacionFiltroComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _service: AsignacionService
  ) {
    this.centroOperativos = this._service.centroOperativos;
    this.dependencias = this._service.dependencias;
    this.grupoNominas = this._service.grupoNominas;

    this.item = this.element.item;
    const url = this.element.url ? this.element.url : {};

    this.form = this._formBuilder.group({
      numeroDocumento: [url.numeroDocumento, [AlcanosValidators.maxLength(90), AlcanosValidators.numerico]],
      primerNombre: [url.primerNombre, [AlcanosValidators.maxLength(120), AlcanosValidators.alfabetico]],
      primerApellido: [url.primerApellido, [AlcanosValidators.maxLength(120), AlcanosValidators.alfabetico]],
      centroOperativoId: [url.centroOperativoId, []],
      dependenciaId: [url.dependenciaId, []],
      cargoId: [url.cargoId, []],
      grupoNominaId: [url.grupoNominaId, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this._router.navigate(
      [`nomina/liquidacion-nomina/${this.item.id}/asignacion`],
      {
        queryParams: {
          $filter: toUrlEncoded(this.form.value),
          $top: 5,
          $skip: 0,
        },
      });
    this.dialogRef.close(this.form.value);
  }

  limpiarHandle(event): void {
    this._router.navigate(
      [`nomina/liquidacion-nomina/${this.item.id}/asignacion`],
      {
        queryParams: {
          $filter: true,
        },
      });
    this.dialogRef.close({});
  }


  compareWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

}
