import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, AfterViewInit, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatTabChangeEvent, MatTabGroup } from '@angular/material';
import { Route, Router } from '@angular/router';
import { Observable, merge } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { AlcanosValidators } from '@alcanos/utils';
import { FormularioService } from './formulario.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { TipoAplicacionExterna } from '@alcanos/constantes/aplicacion-externa';
import { AprobadoresListarComponent } from '../aprobadores/listar/listar.component';
import { AutorizadoresListarComponent } from '../autorizadores/listar/listar.component';
import { RevisoresListarComponent } from '../revisores/listar/listar.component';

@Component({
  selector: 'aprobaciones-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class FormularioComponent implements OnInit , AfterViewInit{

  revisorApruebaAutoriza = TipoAplicacionExterna;

  id: any;
  item: any;

  form: FormGroup;
  submit: boolean;

  desabilitar: boolean;
  selectedTab: number;

  @ViewChild(RevisoresListarComponent, { static: false })
  Revisor: RevisoresListarComponent;

  @ViewChild(AprobadoresListarComponent, { static: false })
  Aprobador: AprobadoresListarComponent;


  @ViewChild(AutorizadoresListarComponent, { static: false })
  Autorizador: AutorizadoresListarComponent;


  @ViewChild("tabGroup", { static: false }) tabGroup: MatTabGroup;

  storage_;
  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: FormularioService,
    private _router: Router,
  ) {
    this.id = this._service.id;
    this.form = this._formBuilder.group({
      id: [null],
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(100), AlcanosValidators.alfabetico]],
      codigo: [null, [Validators.required, AlcanosValidators.maxLength(3), AlcanosValidators.alfabetico]],
      revisa: [null, [Validators.required]],
      aprueba: [null, [Validators.required]],
      autoriza: [null, [Validators.required]],
      descripcion: [null, [Validators.required,AlcanosValidators.maxLength(255)]],
    });
    this.submit = false;
    this.selectedTab = this._service.tab;
  }

  ngOnInit(): void {
    this.storage_ = localStorage.getItem('crear_editar')
    this._service.onItemChanged.subscribe(data => {
      if (data) {
        this.item = data;
        this.form.patchValue({
          id: data.id,
          nombre: data.nombre,
          codigo: data.codigo,
          revisa: data.revisa,
          aprueba: data.aprueba,
          autoriza: data.autoriza,
          descripcion: data.descripcion,
        });
        this.form.markAllAsTouched();

        // Desabilitar campos en el editar
        this.form.get('codigo').disable();

      }
    });
    this._service.getTabSelected().subscribe((tabIndex : number) =>{
      this.selectedTab = tabIndex;
     })
    
  }

  ngAfterViewInit(): void {
    if(this.storage_){
      if(this.storage_.split(',')[0] === '1'){
        setTimeout(()=>{
          this.revisorHandle(null,this.form)
        },1)
      }

      if(this.storage_.split(',')[0] === '2'){
        setTimeout(()=>{
          this.aprobadorHandle(null,this.form)
        },1)
      }

      if(this.storage_.split(',')[0] === '3'){
        setTimeout(()=>{
          this.autorizadorHandle(null,this.form)
        },1)
      }
    }
    
    localStorage.removeItem('crear_editar')
  }

  tabChangeHandle(event: MatTabChangeEvent): void {
    this.selectedTab = event.index;
  }
  

  //Get's para los campos y valores del formularios

  get _id(){ return this.form.get('id') }
  get _nombre(){ return this.form.get('nombre') }
  get _codigo(){ return this.form.get('codigo') }
  get _revisa(){ return this.form.get('revisa') }
  get _aprueba(){ return this.form.get('aprueba') }
  get _autoriza(){ return this.form.get('autoriza') }
  get _descripcion(){ return this.form.get('descripcion') }

  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }
  public tercero(): void {
    this.selectedTab = 2;
  }
  public cuarto(): void {
    this.selectedTab = 3;
  }

  revisorHandle(event,item): void {
    this.segundo();
    this.Revisor.revisorHandle(event,item);
  }

  aprobadorHandle(event,item): void {
    this.tercero();
    this.Aprobador.aprobadorHandle(event,item);
  }

  autorizadorHandle(event,item): void {
    this.cuarto();
    this.Autorizador.autorizadorHandle(event);
  }

  guardarHandle(event): void {
    const formValue = this.form.value;

    this.submit = true;
    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        
        if(resp.revisa === 'Otro' || resp.aprueba === 'Otro' || resp.autoriza === 'Otro'){
          this._router.navigate([`/flujo-trabajos/vistos-buenos/`+resp.id+'/editar']);          
        }else{
          this._router.navigate([`/flujo-trabajos/vistos-buenos`]);
        }
      }
      ).catch((resp: HttpErrorResponse) => {
        this._alcanosSnackBar.snackbar({
          clase: 'error',
          mensaje: resp.status === 400 ? 'Se ha presentado un error al procesar el formulario.' : null,
        });
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        }

        if (resp.status === 400 && 'errors' in error) {

          if ('nombre' in error.errors) {
            const errores = {};
            error.errors.nombre.forEach(element => {
              errores[element] = true;
            });
            this.form.get('nombre').setErrors(errores);
          }

          if ('codigo' in error.errors) {
            const errores = {};
            error.errors.codigo.forEach(element => {
              errores[element] = true;
            });
            this.form.get('codigo').setErrors(errores);
          }

          if ('revisa' in error.errors) {
            const errores = {};
            error.errors.revisa.forEach(element => {
              errores[element] = true;
            });
            this.form.get('revisa').setErrors(errores);
          }

          if ('aprueba' in error.errors) {
            const errores = {};
            error.errors.aprueba.forEach(element => {
              errores[element] = true;
            });
            this.form.get('aprueba').setErrors(errores);
          }

          if ('autoriza' in error.errors) {
            const errores = {};
            error.errors.autoriza.forEach(element => {
              errores[element] = true;
            });
            this.form.get('autoriza').setErrors(errores);
          }

          if ('descripcion' in error.errors) {
            const errores = {};
            error.errors.descripcion.forEach(element => {
              errores[element] = true;
            });
            this.form.get('descripcion').setErrors(errores);
          }

          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 3000
            });
          }

        }
      });
  }

}
