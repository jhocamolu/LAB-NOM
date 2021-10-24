import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';

@Component({
  selector: 'concepto-nomina-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  tipoConceptos: any[] = [];
  claseConceptos: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _service: ListarService
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      codigo: [this.element.codigo, []],
      alias: [this.element.alias, []],
      nombre: [this.element.nombre, []],
      tipoConceptoNomina: [this.element.tipoConceptoNomina, []],
      claseConceptoNomina: [this.element.claseConceptoNomina, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

    this._service.getClaseConceptonominas().then((resp) => {
      this.claseConceptos = resp;
    });

    this._service.getTipoConceptoNominas().then((resp) => {
      this.tipoConceptos = resp;
    });
  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }
  get alias(): AbstractControl {
    return this.form.get('alias');
  }
  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get tipoConceptoNomina(): AbstractControl {
    return this.form.get('tipoConceptoNomina');
  }
  get claseConceptoNomina(): AbstractControl {
    return this.form.get('claseConceptoNomina');
  }
  get estado(): AbstractControl {
    return this.form.get('estado');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/nomina/concepto-nominas'],
      {
        queryParams: {
          $filter: true,
        },
      });
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this._router.navigate(
      ['/nomina/concepto-nominas'],
      {
        queryParams: {
          $filter: toUrlEncoded(this.form.value),
          $top: 5,
          $skip: 0,
        },
      });
    this.dialogRef.close(this.form.value);

  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }


}
