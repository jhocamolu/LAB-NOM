import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { EditarService } from './editar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';

import { fuseAnimations } from '@fuse/animations';
import { DiaComponent } from '../dia/dia.component';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { DiaMostrarComponent } from '../dia-mostrar/dia-mostrar.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'jornada-laboral-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {

  // Permisos
  arrayPermisosDias: any;

  id: number;
  form: FormGroup;
  submit: boolean;

  selectedTab: number;

  @ViewChild(DiaMostrarComponent, { static: true })
  tablaDia: DiaMostrarComponent;


  constructor(
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: EditarService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _permisos: PermisosrService,
  ) {
    this.form = this._formBuilder.group({
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(100)]],
    });
    this.submit = false;
    this.selectedTab = this._service.selectedTab;

    this.arrayPermisosDias = this._permisos.permisosStorage('JornadaLaboralDias_');
  }


  ngOnInit(): void {
    this._service.onJornadaLaboralChanged.subscribe(data => {
      this.id = data.id;
      this.form.patchValue({
        id: this.id,
        nombre: data.nombre,
      });
    });
    this.form.markAllAsTouched();

  }

 
  // se comunica con el componente Dia
  diaHandle(event): void {
    this.tablaDia.diaHandle(event);
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
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



  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = true;
    formValue.id = this._service.id;

    // se inyecta en el promise editar el id y el formValue
    this._service.editar(this._service.id, formValue)
      .then((resp) => {
        this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
        this.submit = false;
        this.selectedTab = 1;
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('nombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }  
        }
      });
  }


}

