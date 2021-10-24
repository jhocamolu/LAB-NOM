import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';

// Autocompletable
import { Observable, merge } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'proceso-costos-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  filteredDependencias: Observable<string[]>;
  filteredCargos: Observable<string[]>;
  dependencias: any;
  cargos: any;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _service: ListarService
  ) {

    this.element = this.element === null ? {} : this.element;
    this.dependencias = this._service.onDependenciasChanged.value;
    this.cargos = this._service.onCargosChanged.value;

    this.form = this._formBuilder.group({
      funcionario: [this.element.funcionario, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(100)]],
      dependencia: [null, []],
      cargo: [null, []]
    });


    if (this.element.dependencia != null && typeof this.element.dependencia !== 'object') {
      this._service.getDependenciasSolo(this.element.dependencia).then(resp => {
        this.form.patchValue({
          dependencia: resp
        });
      });
    }

    if (this.element.cargo != null && typeof this.element.cargo !== 'object') {
      this._service.getCargosSolo(this.element.cargo).then(resp => {
        this.form.patchValue({
          cargo: resp
        });
      });
    }


  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

    this.filteredDependencias = this.form.get('dependencia').valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filteredDependencias(view) : this.dependencias.slice())
        ),
      );

    this.filteredCargos = this.form.get('cargo').valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filteredCargos(view) : this.cargos.slice())
        ),
      );

  }

  get funcionario(): AbstractControl {
    return this.form.get('funcionario');
  }
  get dependencia(): AbstractControl {
    return this.form.get('dependencia');
  }
  get cargo(): AbstractControl {
    return this.form.get('cargo');
  }


  limpiarHandle(event): void {
    this._router.navigate(
      ['/nomina/proceso-costos'],
      {
        queryParams: {
          $filter: true,
        },
      });
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const formValue = this.form.value;

    if (formValue.dependencia) {
      formValue.dependencia = formValue.dependencia.id;
    }

    if (formValue.cargo) {
      formValue.cargo = formValue.cargo.id;
    }
    
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this._router.navigate(
      ['/nomina/proceso-costos'],
      {
        queryParams: {
          $filter: toUrlEncoded(formValue),
          $top: 5,
          $skip: 0,
        },
      });
    this.dialogRef.close(this.form.value);

  }

  // Filtros
  private _filteredDependencias(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.dependencias.filter(option => this._normalizeValue(option.nombre).includes(filterValue));
  }

  private _filteredCargos(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.cargos.filter(option => this._normalizeValue(option.nombre).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  displayFnDependencias(element: any): string {
    return element ? element.codigo + ' - ' + element.nombre : element;
  }

  displayFnCargos(element: any): string {
    return element ? element.codigo + ' - ' + element.nombre : element;
  }



}
