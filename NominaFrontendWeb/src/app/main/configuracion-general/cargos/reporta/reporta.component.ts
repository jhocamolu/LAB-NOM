import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
// Autocomplete
import { debounceTime, switchMap } from 'rxjs/operators';
import { ReportaService } from './reporta.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { Observable } from 'rxjs';


export interface CargoReportas {
   id: number;
   nombre: string;
}

@Component({
   selector: 'reporta-cargos-crear',
   templateUrl: './reporta.component.html',
   styleUrls: ['./reporta.component.scss'],
   encapsulation: ViewEncapsulation.None
})
export class ReportaComponent implements OnInit {

   form: FormGroup;
   submit: boolean;
   dependenciaCargoOptions: any[] = [];
   cargoDependencia: any[] = [];
   cargoDependenciaReporta: any[] = [];
   id: any;

   // Autocomplete 
   filteredCargoreporta: Observable<any>;

   constructor(
      public dialogRef: MatDialogRef<ReportaComponent>,
      @Inject(MAT_DIALOG_DATA) public element: any,
      private _formBuilder: FormBuilder,
      private _alcanosSnackBar: AlcanosSnackBarService,
      private _service: ReportaService,
   ) {
      this.form = this._formBuilder.group({
         cargoDependenciaId: [Validators.required],
         dependenciaSuperior: [Validators.required],
         cargoDependenciaReportaId: [null, [Validators.required]],
         jefeInmediato: [null, [Validators.required]],
      });
      this.submit = false;
      this.id = element.cargoId;

      /* VERSIÖN 3 */
      // this._service.getDependenciaCargosLista(element.cargoId).then(resp => {
      //    this.dependenciaCargoOptions = resp;
      // });

      this._service.getDependenciaCargosLista().then(resp => {
         this.dependenciaCargoOptions = resp;
      });

      this._service.getCargoDependencia(this.id).then(resp => {
         this.cargoDependencia = resp;
      });

   }

   ngOnInit(): void {

      // V 4.0
      // this.filteredCargoreporta = this.form.get('cargoJefe')
      //    .valueChanges.pipe(
      //       debounceTime(300),
      //       switchMap(value => this.cargoReportaDependencia(value))
      //    );


      this.form.get('dependenciaSuperior').valueChanges.subscribe(value => {
         this.cargoDependenciaReporta = [];
         this.form.get('cargoDependenciaReportaId').setValue(null);
         if (value != null) {
            this._cargoDependenciaReporta(value);
         }
      });
   }

   // V 4.0
   // cargoReportaDependencia(value: any): any {
   //    const cargoDependenciaId = this.form.get('cargoDependenciaId').value;
   //    if (value != null && value != undefined) {
   //       return this._service.getCargoreportaFiltro(value, cargoDependenciaId);
   //    }
   // }


   guardarHandle(event): void {
      this.submit = true;
      const formValue = this.form.value;
      this._service.crear(formValue).then((resp) => {
         this.submit = false;
         this.dialogRef.close(true);
         this._alcanosSnackBar.snackbar({ clase: 'exito' });
      }).catch((resp: HttpErrorResponse) => {
         this.submit = false;
         let error = resp.error;
         if (typeof resp.error === 'string') {
            error = JSON.parse(resp.error);
         } else {
            error = resp.error;
         }

         if (resp.status === 400 && 'errors' in error) {
            if ('cargoDependenciaId' in error.errors) {
               const errores = {};
               error.errors.cargoDependenciaId.forEach(element => {
                  errores[element] = true;
               });
               this.form.get('cargoDependenciaId').setErrors(errores);
            }
         }

         if (resp.status === 400 && 'errors' in error) {
            if ('cargoDependenciaReportaId' in error.errors) {
               const errores = {};
               error.errors.cargoDependenciaReportaId.forEach(element => {
                  errores[element] = true;
               });
               this.form.get('cargoDependenciaReportaId').setErrors(errores);
            }
         }
         if (resp.status === 400 && 'errors' in error) {
            if ('jefeInmediato' in error.errors) {
               const errores = {};
               error.errors.jefeInmediato.forEach(element => {
                  errores[element] = true;
               });
               this.form.get('jefeInmediato').setErrors(errores);
            }
         }
         if (resp.status === 400 && 'errors' in error) {
            if ('snack' in error.errors) {
               let msg = '';
               error.errors.snack.forEach(element => {
                  msg = element;
               });
               this._alcanosSnackBar.snackbar({
                  clase: 'error',
                  mensaje: msg,
                  time: 5000
               });
            }
         }
      });

   }

   private _cargoDependenciaReporta(dependenciaId): void {
      this._service.getDependenciaCargo(dependenciaId).then((response: any[]) => {
         this.cargoDependenciaReporta = response;
      });
   }

   displayFn(element: any): string {
      return element ? `${element.cargo.nombre}` : element;
   }

}
