import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTabChangeEvent, MatDialogRef } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { CrearOtrosiService } from './crear-otrosi.service';
import { AlcanosDialogComponent } from '@alcanos/components/dialog/dialog.component';
import { contratosAlcanos } from '@alcanos/constantes/contratos';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'contratos-crear-otrosi',
  templateUrl: './crear-otrosi.component.html',
  styleUrls: ['./crear-otrosi.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class CrearOtrosiComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  item: any;
  
  indefinido: boolean;
  paises: any[];
  departamentosOrigen: any[];
  departamentoId: number;
  municipiosOrigen: any[];
  tipoContratos: any[];
  dependencias: Observable<string[]>;
  cargosA: any[];
  cargos: Observable<string[]>;
  centroOperativos: any[];
  haydatos: any;
  nombreContratos: any;
  idContrato: any; 
  id: number; 
  /**
   * 
   * @param _formBuilder 
   * @param _matSnackBar 
   * @param _matDialog 
   * @param _router 
   * @param _service 
   */

  constructor(
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: CrearOtrosiService,
  ) {

    this.submit = false;
    this.departamentosOrigen = [];
    this.municipiosOrigen = [];
    // this.cargos = [];
    this.item = this._service.onItemChanged.value;
    this.tipoContratos = this._service.onTipoContratosChanged.value;
    // this.dependencias = this._service.onDependenciasChanged.value;
    this.centroOperativos = this._service.onCentroOperativosChanged.value;

    this._service.getPaises().then((resp) => {
      this.paises = resp;
      this._departamentos(resp[0].id, this.departamentosOrigen);
    });

    this.form = this._formBuilder.group({
      tipoContratoId: [null, [Validators.required]],
      fechaFinalizacion: [null, [Validators.required]],
      fechaAplicacion: [null, [Validators.required]],
      dependenciaId: [null, [Validators.required]],
      cargoId: [null, [Validators.required]],
      sueldo: [null, [Validators.required, Validators.max(9999999999999)]],
      centroOperativoId: [null, [Validators.required]],
      departamentoOrigenId: [null, [Validators.required]],
      municipioOrigenId: [null, [Validators.required]],
      observaciones: [null, [Validators.required, AlcanosValidators.maxLength(300)]],
    });
    // this.form.markAllAsTouched();
  }

  ngOnInit(): void {
    this._service.getValores().then(resp => {
      if (resp.contratoOtroSi != null) {
        this.item = resp.contratoOtroSi;
        this.id = this.item.contratoId;
        this.nombreContratos =  this.item.contratoId;
      } else {
        this.item = resp.contrato;
        this.id = this.item.id;
        this.nombreContratos =  this.item.numeroContrato;
      }

      let departamentoOrigenId = null;

      if (resp != null) {
        const dependenciaId = null;
        // const dependenciaId = this._inArray(this.item.cargoDependencia.dependenciaId, this.dependencias) ? this.item.cargoDependencia.dependenciaId : null;
        if (this.item.divisionPoliticaNivel2Id != null) {
          departamentoOrigenId = this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id;
        }
        this.idContrato = this.item.id;

        this.form.get('tipoContratoId').valueChanges.subscribe(
          (value) => {
            let accept = false;
            let num = null;
            this.tipoContratos.map(( resp ) => {
              if (value === resp.id && resp.terminoIndefinido === true) {
                accept = resp.terminoIndefinido;
                num = resp.id;
              }
            });

            this.form.get('fechaFinalizacion').enable();
            this.form.get('fechaFinalizacion').setValue(null);
            this.indefinido = false;
            if (value === num && accept) {
              this.form.get('fechaFinalizacion').disable();
              this.indefinido = true;
            }
          }
        );

        let dependencia_id  = {
          id:this.item.cargoDependencia.dependencia.id,
          codigo:this.item.cargoDependencia.dependencia.codigo,
          nombre:this.item.cargoDependencia.dependencia.nombre,
          autocomplete:this.item.cargoDependencia.dependencia.codigo+ ' - ' +this.item.cargoDependencia.dependencia.nombre
        }

        let cargo_id  = {
          id:this.item.cargoDependencia.cargo.id,
          codigo:this.item.cargoDependencia.cargo.codigo,
          nombre:this.item.cargoDependencia.cargo.nombre,
          autocomplete:this.item.cargoDependencia.cargo.codigo+ ' - ' +this.item.cargoDependencia.cargo.nombre
        }

        this.form.patchValue({
          tipoContratoId: this.item.tipoContratoId,
          fechaFinalizacion: this.item.fechaFinalizacion,
          dependenciaId: dependencia_id,
          cargoId: cargo_id,
          sueldo: String(this.item.sueldo).replace('.',','),
          centroOperativoId: this.item.centroOperativoId,
          departamentoOrigenId: this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id,
          municipioOrigenId: this.item.divisionPoliticaNivel2Id,
        });

        if (departamentoOrigenId !== null) {
          this._municipios(departamentoOrigenId, this.municipiosOrigen);
        }

        if (dependenciaId !== null) {
          this._cargos(dependenciaId);
        }

        if (this.item.tipoContrato.terminoIndefinido === true) {
          this.form.get('fechaFinalizacion').disable();
          this.form.get('fechaFinalizacion').setValue(null);
        }

      }
    });

    this.form.get('departamentoOrigenId').valueChanges.subscribe(
      (value) => {
        this.municipiosOrigen = [];
        this.form.get('municipioOrigenId').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipiosOrigen);
        }
      }
    );

    this.form.get('dependenciaId').valueChanges.subscribe(
      (value) => {
        // this.cargos = null
        this.form.get('cargoId').setValue('')
        this.cargos = null
        if (value.id != null) {
          this._cargos(value.id);
        }
      }
    );

    this.dependencias = this.form.get('dependenciaId')
      .valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.autocomplete)),
        map(view => (view ? this._filterDependencias(view) : this._service.onDependenciasChanged.value.slice())
        ),
      );
  }

  linkAtras(id: number): void{
    this._router.navigate([
      `/administracion-personal/contratos/${id}/mostrar`
    ], {
      queryParams: {
        tab: 1
      }
    });
  }
  ngAfterViewInit(): void {
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }
  get sueldo(): AbstractControl {
    return this.form.get('sueldo');
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.divisionPoliticaNivel2Id = formValue.municipioOrigenId;
    formValue.cargoDependenciaId = formValue.cargoId.id;
    formValue.contratoId = this._service.id;
    if(event === 'dialog'){
      formValue.confirmacion = true;
    }
    if (!this.indefinido){
      formValue.fechaFinalizacion = moment(formValue.fechaFinalizacion).format('YYYY-MM-DDTHH:mm:ssZ');
    }else{
      // formValue.fechaFinalizacion = null; 
    }
    formValue.fechaAplicacion = moment(formValue.fechaAplicacion).format('YYYY-MM-DDTHH:mm:ssZ');
    formValue.sueldo = String(formValue.sueldo).replace(',','.');
    formValue.contratoId = this.id; 

    
    this._service.crear(formValue)
      .then((resp) => {
        this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
        this.submit = false;
        this._router.navigate([
          `/administracion-personal/contratos/${resp.contratoId}/mostrar`
        ], {
          queryParams: {
            tab: 1
          }
        });
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in error) {

          if ('contratoId' in error.errors) {
            const clase = 'error';
            const dialogRef = this._matDialog.open(AlcanosDialogComponent, {
              disableClose: false,
              data: {
                mensaje: error.errors.contratoId,
                clase: clase,
              }
            });

            dialogRef.afterClosed().subscribe(confirm => {
              if (confirm) {
                this._router.navigate([`/administracion-personal/contratos/${this._service.id}/mostrar`]);
              }
            });
          }

          if ('tipoContratoId' in error.errors) {
            const errores = {};
            error.errors.tipoContratoId.forEach(element => {
              errores[element] = true;
            });
            this.form.get('tipoContratoId').setErrors(errores);
          }

          if ('fechaFinalizacion' in error.errors) {
            const errores = {};
            error.errors.fechaFinalizacion.forEach(element => {
              errores[element] = true;
            });
            this.form.get('fechaFinalizacion').setErrors(errores);
          }

          if ('fechaAplicacion' in error.errors) {
            const errores = {};
            error.errors.fechaAplicacion.forEach(element => {
              errores[element] = true;
            });
            this.form.get('fechaAplicacion').setErrors(errores);
          }

          if ('dependenciaId' in error.errors) {
            const errores = {};
            error.errors.dependenciaId.forEach(element => {
              errores[element] = true;
            });
            this.form.get('dependenciaId').setErrors(errores);
          }

          if ('cargoId' in error.errors) {
            const errores = {};
            error.errors.cargoId.forEach(element => {
              errores[element] = true;
            });
            this.form.get('cargoId').setErrors(errores);
          }

          if ('sueldo' in error.errors) {
            const errores = {};
            error.errors.sueldo.forEach(element => {
              errores[element] = true;
            });
            this.form.get('sueldo').setErrors(errores);
          }

          if ('centroOperativoId' in error.errors) {
            const errores = {};
            error.errors.centroOperativoId.forEach(element => {
              errores[element] = true;
            });
            this.form.get('centroOperativoId').setErrors(errores);
          }

          if ('departamentoOrigenId' in error.errors) {
            const errores = {};
            error.errors.departamentoOrigenId.forEach(element => {
              errores[element] = true;
            });
            this.form.get('departamentoOrigenId').setErrors(errores);
          }

          if ('municipioOrigenId' in error.errors) {
            const errores = {};
            error.errors.municipioOrigenId.forEach(element => {
              errores[element] = true;
            });
            this.form.get('municipioOrigenId').setErrors(errores);
          }

          if ('observaciones' in error.errors) {
            const errores = {};
            error.errors.observaciones.forEach(element => {
              errores[element] = true;
            });
            this.form.get('observaciones').setErrors(errores);
          }

          if ('dialogConfirmacion' in error.errors) {
            const clase = 'error';
            const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
              disableClose: false,
              data: {
                mensaje: error.errors.dialogConfirmacion,
                clase: clase,
              }
            });

            dialogRef.afterClosed().subscribe(confirm => {
              if (confirm) {
                this.guardarHandle('dialog')
              }
            });
          }
        }
      });
  }

  private _inArray(id: number, array: any[]): boolean {
    let dev = false;
    array.forEach(element => {
      if ('id' in element && element.id === id) {
        dev = true;
        return true;
      }
    });
    return dev;
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

  private _cargos(dependenciaId): void {
    this._service.getCargo(dependenciaId).then(
      (response: any[]) => {
        this.cargosA = response;
        this.cargos = this.form.get('cargoId')
      .valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.autocomplete)),
        map(view => (view ? this._filterCargos(view) : response.slice())
        ),
      );
      }
    );
  }

  private _filterDependencias(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this._service.onDependenciasChanged.value.filter(option => this._normalizeValue(option.autocomplete).includes(filterValue));
  }

  private _filterCargos(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.cargosA.filter(option => this._normalizeValue(option.autocomplete).includes(filterValue));
  }
  
  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  displayFnDependencias(element: any): string {
    return element ? element.autocomplete : element;
  }

  displayFnCargos(element: any): string {
    return element ? element.autocomplete : element;
  }

}
