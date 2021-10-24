import { Component, OnInit, ViewEncapsulation, Inject, Optional } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { NovedadesService } from '../novedades.service';

@Component({
  selector: 'liquidacion-filtro-novedades',
  templateUrl: './filtro-novedades.component.html',
  styleUrls: ['./filtro-novedades.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class FiltroNovedadesComponent implements OnInit {

  item: any;

  form: FormGroup;

  fuenteNovedades: any[];

  constructor(
    public dialogRef: MatDialogRef<FiltroNovedadesComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _service: NovedadesService
  ) { 
    this.fuenteNovedades = this._service.fuenteNovedades;

    this.item = this.element.item;
    const url = this.element.url ? this.element.url : {};

    this.form = this._formBuilder.group({
      numeroDocumento: [url.numeroDocumento, [AlcanosValidators.maxLength(90), AlcanosValidators.numerico]],
      primerNombre: [url.primerNombre, [AlcanosValidators.maxLength(120), AlcanosValidators.alfabetico]],
      primerApellido: [url.primerApellido, [AlcanosValidators.maxLength(120), AlcanosValidators.alfabetico]],
      fuenteNovedadesId: [url.fuenteNovedadesId, []],
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
      [`nomina/liquidacion-nomina/${this.item.id}/novedades`],
      {
        queryParams: {
          $filter: toUrlEncoded(this.form.value),
        },
      });
    this.dialogRef.close(this.form.value);
  }

  limpiarHandle(event): void {
    this._router.navigate(
      [`nomina/liquidacion-nomina/${this.item.id}/novedades`],
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
