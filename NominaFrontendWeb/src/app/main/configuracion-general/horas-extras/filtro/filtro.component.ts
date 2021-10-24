import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { tipoHoraExtra } from '@alcanos/constantes/tipo-hora-extra';
import { debounceTime, switchMap } from 'rxjs/operators';
import { EditarService } from '../editar/editar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'horas-extras-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;

  tipoHoraExtra = tipoHoraExtra;
  // conceptoNominaOptions: Observable<string[]>;
  conceptoNominaOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: EditarService,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      tipo: [this.element.tipo, []],
      conceptoNomina: [this.element.conceptoNomina, []],
    });
  }

  ngOnInit(): void {

    // if (this.element.conceptoNomina != null) {
    //   this._service.getConceptos(this.element.conceptoNomina).then((resp) => {
    //     this.conceptoNominaOptions = resp[0];
    //   });
    // }

    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this.selectConceptos();
  }

  public selectConceptos(): void {
    this._service.getConceptosFiltro().then(
      (resp: any[]) => {
        this.conceptoNominaOptions = resp;
      }
    );
  }

  // public selectConceptosLista(): void {
  //   this.conceptoNominaOptions = this.form.get('conceptoNomina')
  //     .valueChanges.pipe(
  //       debounceTime(300),
  //       switchMap(value => this._service.getConceptos(value))
  //     );
  // }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/horas-extras'],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
    this.dialogRef.close({});

  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this._router.navigate(
      ['/configuracion/horas-extras'],
      {
        queryParams: {
          $filter: toUrlEncoded(this.form.value),
          $top: 5,
          $skip: 0,
        },
        queryParamsHandling: 'merge',
      });
    this.dialogRef.close(this.form.value);

  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  displayFnConceptos(element: any): string {
    return element ? `${element.codigo} - ${element.nombre}` : element;
  }


}
