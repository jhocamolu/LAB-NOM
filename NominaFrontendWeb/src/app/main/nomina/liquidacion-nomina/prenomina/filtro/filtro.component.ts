import { Component, OnInit, ViewEncapsulation, Inject, Optional } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { PrenominaService } from '../prenomina.service';

@Component({
  selector: 'liquidacion-nomina-prenomina-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class PrenominaFiltroComponent implements OnInit {

  item: any;

  form: FormGroup;

  centroOperativos: any[];
  cargos: any[];


  constructor(
    public dialogRef: MatDialogRef<PrenominaFiltroComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _service: PrenominaService
  ) {
    this.centroOperativos = this._service.centroOperativos;
    this.cargos = this._service.cargos;

    this.item = this.element.item;
    const data = this.element.data ? this.element.data : {};

    this.form = this._formBuilder.group({
      numeroDocumento: [data.numeroDocumento, [AlcanosValidators.maxLength(90), AlcanosValidators.numerico]],
      primerNombre: [data.primerNombre, [AlcanosValidators.maxLength(120), AlcanosValidators.alfabetico]],
      primerApellido: [data.primerApellido, [AlcanosValidators.maxLength(120), AlcanosValidators.alfabetico]],
      centroOperativoId: [data.centroOperativoId, []],
      cargoId: [data.cargoId, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  buscarHandle(event): void {
    this.dialogRef.close(this.form.value);
  }

  limpiarHandle(event): void {
    this.dialogRef.close({ limpiar: true });
  }


  compareWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

}
