import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormularioService } from './formulario.service';
// Autocompletable
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';

import * as moment from 'moment';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { ClaseConceptoAlcanos } from '@alcanos/constantes/clase-concepto-nomina';
import { DestinatarioCrearComponent } from '../destinatarios/destinatario-crear/crear-destinatario.component';


@Component({
  selector: 'formulario-tipo-beneficios',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class FormularioComponent implements OnInit, AfterViewInit {

  enviroments: string = environmentAlcanos.gestorArchivos;

  form: FormGroup;
  submit: boolean;
  item: any;

  Notificaciones: any[];
 
  selectedTab = 0;
  id: number;

  /**
   * 
   * @param _formBuilder 
   * @param _matDialog 
   * @param _router 
   * @param _service 
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: FormularioService,
  ) {
    this.selectedTab = this._service.selectedTab;
    this.submit = false;
    this.id = null;
  
    this.form = this._formBuilder.group({
      id: [null, []],
      tipo: [null, [Validators.required]],
      fecha: [null, []],
      titulo: [null, [Validators.required, AlcanosValidators.maxLength(200)]],
      mensaje: [null, [Validators.required]],
    });

  }
  
 // se comunica con el componente Dependencia
  destinatarioHandle(event): void {
    const dialogRef = this._matDialog.open(DestinatarioCrearComponent, {
      panelClass: 'crear-dialog',
      data: { 
        id: this._service.id,
        tipo: this.item.tipo  
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.selectedTab = 1;
      }
    });
  }

  ngOnInit(): void {
    // Determina si se observa o no el requisitos
    this._service.onItemChanged.subscribe(
      (response: any) => {
        this.item = response;
        if (response != null) {
          this.id = this.item.id;
          this.form.patchValue({
            id: this.item.id,
            tipo: this.item.tipo,
            fecha: this.item.fecha,
            titulo: this.item.titulo,
            mensaje: this.item.mensaje,
          });
          this.form.markAllAsTouched();
        }
      }
    );

  }

  ngAfterViewInit(): void {
  }

  tabChangeHandle(event): void {
    this.selectedTab = event.index;
  }

  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }


  public deleteDestinatario(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        
      }
    });
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
   
    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        // this.segundo();
        this.submit = false;
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
        this._service.getNotificaciones(resp.id); 
        this._router.navigate([`/mantenimiento/notificaciones/${resp.id}/editar`], { queryParams: { tab: 1 } });
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

          if ('titulo' in error.errors) {
            const errors = {};
            error.errors.titulo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('titulo').setErrors(errors);
          }

          if ('fecha' in error.errors) {
            const errors = {};
            error.errors.fecha.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fecha').setErrors(errors);
          }

          if ('titulo' in error.errors) {
            const errors = {};
            error.errors.titulo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('titulo').setErrors(errors);
          }

          if ('mensaje' in error.errors) {
            const errors = {};
            error.errors.mensaje.forEach(element => {
              errors[element] = true;
            });
            this.form.get('mensaje').setErrors(errors);
          }

        }
      });
  }

}
