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
   selector: 'pagina-reportes-crear',
   templateUrl: './crear.component.html',
   styleUrls: ['./crear.component.scss'],
   animations: fuseAnimations,
   encapsulation: ViewEncapsulation.None
})
export class PaginaCrearComponent implements OnInit {
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
      });
      this.submit = false;
   }

   ngOnInit(): void {  }

  
   get codigo(): AbstractControl {
      return this.form.get('codigo');
   }

   
   objToArray(obj: any): any[] {
      return obj !== null ? Object.keys(obj) : [];
   }

   guardarHandle(event): void {
      return null; 
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
            }
         });

   }

}
