import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ConceptosListarService } from '../listar/listar.service';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'distribucion-costos-conceptos-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConceptosFiltroComponent implements OnInit {

  form: FormGroup;
  centroCostos: any[] = [];
  //
  paises: any[];
  departamentosOrigen: any[];
  municipiosOrigen: any[];
  filterCentroCosto: any[];

  filteredCentroCostos: Observable<string[]>;


  constructor(
    public dialogRef: MatDialogRef<ConceptosFiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: ConceptosListarService
  ) {
    this.departamentosOrigen = [];
    this.municipiosOrigen = [];
    this.filterCentroCosto = null;
    
    this._service.getPaises().then((resp) => {
      this.paises = resp;
      this._departamentos(resp[0].id, this.departamentosOrigen);
    });

    this.element = this.element === null ? {} : this.element;
    
    this.form = this._formBuilder.group({
      departamentoOrigenId: [this.element.departamentoOrigenId ? parseInt(this.element.departamentoOrigenId, 10) : null, []],
      municipioId: [this.element.municipioId ? parseInt(this.element.municipioId, 10) : null, []],
      centroCostoId: [this.filterCentroCosto, []],
    });

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.form.patchValue({
        departamentoOrigenId: this.element.departamentoOrigenId ? parseInt(this.element.departamentoOrigenId, 10) : null,
        municipioId: this.element.municipioId ? parseInt(this.element.municipioId, 10) : null
      });
    }, 1000); 
    
    if (this.element.centroCostoId != null) {
      this._service.getCentroCostosFiltro(this.element.centroCostoId).then((resp) => {
        this.filterCentroCosto = resp[0];
      });
    }

    setTimeout(() => {
      if (this.element != null) {
        this.form.patchValue({
          departamentoOrigenId: this.element.departamentoOrigenId,
          centroCostoId: this.filterCentroCosto,
        });
      }
      if (this.element.municipioId != null) {
        this.form.patchValue({
          municipioId: this.element.municipioId,
        });
      }
    }, 600);


    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

    this.form.get('departamentoOrigenId').valueChanges.subscribe(
      (value) => {
        this.municipiosOrigen = [];
        this.form.get('municipioId').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipiosOrigen);
        }
      }
    );

    this.filteredCentroCostos = this.form.get('centroCostoId')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this._service.getCentroCostosFiltro(value))
      );

  }

  get departamentoOrigenId(): AbstractControl {
    return this.form.get('departamentoOrigenId');
  }
  get municipioId(): AbstractControl {
    return this.form.get('municipioId');
  }
  get centroCostoId(): AbstractControl {
    return this.form.get('centroCostoId');
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
    if (formValue.centroCostoId != null) {
      formValue.centroCostoId = formValue.centroCostoId.nombre;
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

  private _departamentos(paisId, array: any[]): void {
    this._service.getDepartamentos(paisId).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

  private _municipios(departamentoId, array: any[]): void {
    this._service.getMunicipios(departamentoId).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

  displayFn(element: any): string {
    return element ? element.nombre : element;
  }

}
