import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { claseAprobador } from '@alcanos/constantes/clase-aprobador';
import { RevisoresFormularioService } from './formulario.service';
import { FormularioService } from '../../formulario/formulario.service';


@Component({
  selector: 'aprobaciones-revisores-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RevisoresFormularioComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  item: any;
  id: number;
  aplicacionExterna: number;
  filteredCargos: Observable<any[]>;

  coRevisorOptions: any;
  claseAprobador = claseAprobador;
  cargoRevisorOptions: any[];
  cargoDependienteOptions: any[];
  coDependienteOptions: any[];
  arrayCargoDependienteId: any[] = [];
  totalCargoDependienteId: any[] = [];
  itemCargoDependienteExterna: any[] = [];

  dependenciOptions: any[];

  // Variable para ocultar si el centro operativo no esta disponible
  ocultarCentroOperativoIndependienteId:boolean;
  ocultarCentroOperativoDependienteId:boolean;

  constructor(
    public dialogRef: MatDialogRef<RevisoresFormularioComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: RevisoresFormularioService,
    private _service_principal: FormularioService
  ) {
    this.id = element.id
    if(element.id){
      
    }

    if(element.element && element.element.id){
      this.id =element.element.id
    }
    
    this.aplicacionExterna = this.element.aplicacionExternaId;

    this.form = this._formBuilder.group({
      id: [this.id],
      tipo: ['Revision'],
      dependenciaRevisorId: [null, [Validators.required]],
      cargoIndependienteId: [null, [Validators.required]],
      centroOperativoIndependienteId: [null, [Validators.required]],
      cargoDependiente: [null, [Validators.required]],
      centroOperativoDependienteId: [null, [Validators.required]],
      cargoDependenciaIndependienteId: [null],
    });
    if (this.id) {
      this.form.markAllAsTouched();
    }
    this.submit = false;

    this._service.getDependencias().then(resp => {
      this.dependenciOptions = resp;
    });

    this._service.getCentroOperativos().then(resp => {
      this.coRevisorOptions = resp;
    });
  }

  ngOnInit(): void {

    this.selectCORevisor();
    this.selectCODependiente();

    if (this.id != undefined) {
      this._service.getAplicacionExternaCargos(this.id).then(resp => {
        this.item = resp;
        const cargoIndependienteId = null;


        this.form.patchValue({
          id: this.item.id,
          dependenciaRevisorId: this.item.cargoDependenciaIndependiente.dependenciaId,
          centroOperativoDependienteId: this.item.centroOperativoDependienteId,


        });

        this._service.getCargos(this.item.cargoDependenciaIndependiente.cargo.codigo, this._dependenciaRevisorId.value).then(resp => {
          this.form.patchValue({
            cargoIndependienteId: resp[0]
          });
          this.centroOperativoRevisor(this.item.cargoDependenciaIndependiente.cargo.clase);
        })

        this._service.getCargoDependenciaEdit(this.item.id,this.item.tipo).then(resp => {
          let value = [];
          resp.forEach(element => {
            value.push(element.cargoDependencia)
          });
          this._cargoDependenciaEdit(this.item.cargoDependenciaIndependiente.id,value)
          this.centroOperativoDependiente(value)
        });

        if (this.item.centroOperativoIndependienteId !== null) {
          this.form.patchValue({
            centroOperativoIndependienteId: this.item.centroOperativoIndependienteId
          });
        }
      });
    }



    this.form.get('dependenciaRevisorId').valueChanges.subscribe(
      (valueDependencia) => {
        this.filteredCargos = null
        // this._cargoIndependienteId.setValue('')
        if (valueDependencia != null && valueDependencia != undefined) {
          this.filteredCargos = this.form.get('cargoIndependienteId')
            .valueChanges
            .pipe(
              debounceTime(300),
              switchMap(value => this._service.getCargos(value, this._dependenciaRevisorId.value))
            )
        }
      }
    );

    //--  Se obtiene en forma de array todos los items seleccionados de cargo Dependiente (  se requiere en cargoDependienteCharge() )
    this.form.get('cargoDependiente').valueChanges.subscribe(
      (value) => {
        if (value != null) {
          // Cargue de cargo dependencia
          this.arrayCargoDependienteId = value;
          
          this.centroOperativoDependiente(value);
        }
      }
    );

    this.form.get('dependenciaRevisorId').valueChanges.subscribe(
      (value) => {
        if (value != null && value != undefined) {
          this._cargoRevisores(value, this._dependenciaRevisorId.value);
        }
      }
    );

    this.form.get('cargoIndependienteId').valueChanges.subscribe(
      (value) => {
        if(value.cargo) {
          this.centroOperativoRevisor(value.cargo.clase);
          this._cargoDependencia(value.id)
        }
      }
    );

  }

  centroOperativoRevisor(clase: string): void {
    switch (clase) {
      case claseAprobador.nacional:
        this.ocultarCentroOperativoIndependienteId = true
        this.form.get('centroOperativoIndependienteId').disable();
        break;
      default:
        const errors = {};
        errors['Requerido'] = true;
        this.form.get('centroOperativoIndependienteId').setErrors(errors);
        this.form.get('centroOperativoIndependienteId').enable();
        this.ocultarCentroOperativoIndependienteId = false
        break;
    }

  }

  centroOperativoDependiente(clase: any[]): void {
    
    clase.find(tipo =>{
      
      if (tipo.cargo.clase === claseAprobador.centroOperativo){
        this.ocultarCentroOperativoDependienteId = false
        const errors = {};
        errors['Requerido'] = true;
        this.form.get('centroOperativoDependienteId').setErrors(errors);
        this.form.get('centroOperativoDependienteId').enable();
        return true
      }else{
        this.ocultarCentroOperativoDependienteId = true
        this.form.get('centroOperativoDependienteId').disable();
      }
      
      
    })  
  }

  //--  se obtienen los cargoFuncionarioId pasando el array obtenido en this.arrayCargoDependienteId filtrandolo por el servicio
  //--  esto se realiza por el componente asincronico que no permite actualizarlo en el guardarHandle
  cargoDependienteCharge(): void {
    const array: any[] = [];
    this.arrayCargoDependienteId.forEach(element => {
      array.push({ CargoDependenciaId: element.id })
      // this._service.getCargoReportasSolo(element).then((resp) => {
      //   array.push({ cargoDependienteId: resp.cargoFuncionarioId });
      // });
    });
    // se envia de manera global al ser focus out

    this.totalCargoDependienteId = array;
  }

  public selectCORevisor(): void {
    this._service.getCentroOperativos().then(
      (resp: any[]) => {
        this.coRevisorOptions = resp;
      });
  }

  public selectCODependiente(): void {
    this._service.getCentroOperativos().then(
      (resp: any[]) => {
        this.coDependienteOptions = resp;
      });
  }

  displayFncargos(element: any): string {
    return element ? `${element.cargo.codigo} - ${element.cargo.nombre}` : element;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    

    // Convierto la variable aplicacionExterna en numero ya que es un ID
    formValue.aplicacionExternaId = Number(this.aplicacionExterna);
    //-- se obtiene la variable global de la funcion cargoDependienteCharge()
    formValue.cargoDependencia = this.totalCargoDependienteId;
    formValue.cargoDependenciaIndependienteId = formValue.cargoIndependienteId.id;
    
    this._service.upsert(formValue).then((resp) => {
      if(this.element.aplicacioneExterna && this.element.aplicacioneExterna.value.id){
        this._service_principal.guardarHandle(event, this.element.aplicacioneExterna)
      }
      this._alcanosSnackBar.snackbar({ clase: 'exito' });
      this.dialogRef.close(true);
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
        if ('cargoDependiente' in error.errors) {
          const errors = {};
          error.errors.cargoDependiente.forEach(element => {
            errors['Error'] = true;
          });
          this.form.get('cargoDependiente').setErrors(errors);
        }
        if ('centroOperativoDependienteId' in error.errors) {
          const errors = {};
          error.errors.centroOperativoDependienteId.forEach(element => {
            errors[element] = true;
          });
          this.form.get('centroOperativoDependienteId').setErrors(errors);
        }
        if ('cargoIndependienteId' in error.errors) {
          const errors = {};
          error.errors.cargoIndependienteId.forEach(element => {
            errors[element] = true;
          });
          this.form.get('cargoIndependienteId').setErrors(errors);
        }
        if ('centroOperativoIndependienteId' in error.errors) {
          const errors = {};
          error.errors.centroOperativoIndependienteId.forEach(element => {
            errors[element] = true;
          });
          this.form.get('centroOperativoIndependienteId').setErrors(errors);
        }
        if ('snackbar' in error.errors) {
          let msg = '';
          error.errors.snackbar.forEach(element => {
            msg = element;
          });
          this._alcanosSnackBar.snackbar({
            clase: 'error',
            mensaje: msg,
            time: 7000,
          });
        }
      }

    });
  }

  private _cargoDependencia(id): void {
    if (id != undefined && !this.item) {
      this._service.getCargoDependencia(id).then(
        (response: any[]) => {
          this.cargoDependienteOptions = response;
        }
      );
    }
  }

  // creo esta funcion, para no tocar la funcion del crear para traer los cargos dependientes
  private _cargoDependenciaEdit(id,value): void {
    
    if (id != undefined && this.item) {
      let arraySelectCargoDependiente: any[] = []
      this._service.getCargoDependencia(id).then(
        (response: any[]) => {
          this.cargoDependienteOptions = response;
          // recorro con un for para obtener los index, no realizo foreach ya que tendria que hacer dos , uno dentro de otro
          for(let index =0;index < this.cargoDependienteOptions.length; index++){
            if(value[index]){
              this.cargoDependienteOptions.filter(cargoId => {
                if(cargoId.cargoDependenciaId === value[index].id ){
                  arraySelectCargoDependiente.push(cargoId.cargoDependencia)
                  this.totalCargoDependienteId.push({ CargoDependenciaId: cargoId.cargoDependenciaId })
                }
              })
            }
            
          }
          //Igualo esta variable en caso que no editen los cargos dependientes
            this._cargoDependiente.setValue(arraySelectCargoDependiente)
        }
      );
    }
  }

  private _cargoRevisores(filtro, id): void {
    if (id != undefined) {
      this._service.getCargos(filtro, id).then(
        (response: any[]) => {
          this.cargoDependienteOptions = response;
        }
      );
    }
  }

  //crear los get de los campos de los fomularios para obtenerlos mas facilmente a la hora de llamarlos
  get _id() { return this.form.get('id') }
  get _dependenciaRevisorId() { return this.form.get('dependenciaRevisorId') }
  get _cargoIndependienteId() { return this.form.get('cargoIndependienteId') }
  get _cargoDependiente() { return this.form.get('cargoDependiente') }


}
