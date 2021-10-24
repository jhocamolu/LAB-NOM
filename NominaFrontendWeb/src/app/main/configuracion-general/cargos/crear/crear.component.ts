import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { AlcanosValidators } from '@alcanos/utils';

import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
   selector: 'ayuda-cargos-crear',
   templateUrl: './crear.component.html',
   styleUrls: ['./crear.component.scss'],
   animations: fuseAnimations,
   encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {
   form: FormGroup;
   submit: boolean;
   dependenciasOptions: any[] = [];
   nivelCargoOptions: any[] = [];

   constructor(
      private _formBuilder: FormBuilder,
      private _alcanosSnackBar: AlcanosSnackBarService,
      private _matSnackBar: MatSnackBar,
      private _service: CrearService,
      private _router: Router
   ) {
      this.form = this._formBuilder.group({
         codigo: [null, [Validators.required, AlcanosValidators.maxLength(10), AlcanosValidators.alfanumerico]],
         nombre: [null, [Validators.required, AlcanosValidators.maxLength(40), AlcanosValidators.alfanumerico]],
         objetivoCargo: [null, [Validators.required]],
         nivelCargoId: [null, [Validators.required]],
         costoSicom: [null, [Validators.required]],
         clase: [null, [Validators.required]],
      });
      this.submit = false;
   }

   ngOnInit(): void {
      this.setDependenciasLista();
      this.setNivelCargoLista();
   }

   public setDependenciasLista(): void {
      this._service.getDependenciasLista().then(
         (resp: any[]) => {
            this.dependenciasOptions = resp;
         }
      );
   }

   public setNivelCargoLista(): void {
      this._service.getNivelCargoLista().then(
         (resp: any[]) => {
            this.nivelCargoOptions = resp;
         }
      );
   }

   get codigo(): AbstractControl {
      return this.form.get('codigo');
   }

   get nombre(): AbstractControl {
      return this.form.get('nombre');
   }

   get objetivoCargo(): AbstractControl {
      return this.form.get('objetivoCargo');
   }

   get nivelCargoId(): AbstractControl {
      return this.form.get('nivelCargoId');
   }
   get costoSicom(): AbstractControl {
      return this.form.get('costoSicom');
   }
   get clase(): AbstractControl {
      return this.form.get('clase');
   }

   objToArray(obj: any): any[] {
      return obj !== null ? Object.keys(obj) : [];
   }

   guardarHandle(event): void {
      const formValue = this.form.value;
      this.submit = true;
      this._service.crear(formValue)
         .then((resp) => {
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
            this.submit = false;
            this._router.navigate([`/configuracion/cargos/${resp.id}/editar`], { queryParams: { tab: 1 } });
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
               if ('codigo' in error.errors) {
                  const errores = {};
                  error.errors.codigo.forEach(element => {
                     errores[element] = true;
                  });
                  this.codigo.setErrors(errores);
               }
               if ('nombre' in error.errors) {
                  const errores = {};
                  error.errors.nombre.forEach(element => {
                     errores[element] = true;
                  });
                  this.nombre.setErrors(errores);
               }
               if ('objetivoCargo' in error.errors) {
                  const errores = {};
                  error.errors.objetivoCargo.forEach(element => {
                     errores[element] = true;
                  });
                  this.objetivoCargo.setErrors(errores);
               }
               if ('nivelCargoId' in error.errors) {
                  const errores = {};
                  error.errors.nivelCargoId.forEach(element => {
                     errores[element] = true;
                  });
                  this.nivelCargoId.setErrors(errores);
               }
               if ('costoSicom' in error.errors) {
                  const errores = {};
                  error.errors.costoSicom.forEach(element => {
                     errores[element] = true;
                  });
                  this.costoSicom.setErrors(errores);
               }
               if ('clase' in error.errors) {
                  const errores = {};
                  error.errors.clase.forEach(element => {
                     errores[element] = true;
                  });
                  this.clase.setErrors(errores);
               }
            }
         });

   }

}
