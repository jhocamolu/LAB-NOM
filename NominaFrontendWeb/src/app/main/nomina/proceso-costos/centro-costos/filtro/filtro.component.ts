import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CentroCostosListarService } from '../listar/listar.service';



// Autocompletable
import { Observable } from 'rxjs';

@Component({
  selector: 'concepto-nominas-cuentas-formulario',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CentroCostosFiltroComponent implements OnInit {

  form: FormGroup;
  centroCostos: any;
  filteredCentroCostos: Observable<string[]>;


  constructor(
    public dialogRef: MatDialogRef<CentroCostosFiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _service: CentroCostosListarService
  ) {
    this.element = this.element === null ? {} : this.element;

    this.form = this._formBuilder.group({
      codigoCentrodeCostos: [this.element.codigoCentrodeCostos, []],
      centrodeCostos: [this.element.centrodeCostos, []],
      cantidad: [this.element.cantidad, []],
      fechaCorte: [this.element.fechaCorte, []]
    });

    if (this.element.centroCosto != null && typeof this.element.centroCosto !== 'object') {
      this._service.getCentroCostosSolo(this.element.centroCosto).then(resp => {
        this.form.patchValue({
          centroCosto: resp
        });
      });
    }

  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  get codigoCentrodeCostos(): AbstractControl {
    return this.form.get('codigoCentrodeCostos');
  }
  get centrodeCostos(): AbstractControl {
    return this.form.get('centrodeCostos');
  }
  get cantidad(): AbstractControl {
    return this.form.get('cantidad');
  }
  get fechaCorte(): AbstractControl {
    return this.form.get('fechaCorte');
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
