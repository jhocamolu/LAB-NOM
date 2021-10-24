import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { SeleccionarService } from './seleccionar.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'seleccionar-hoja-vida',
  templateUrl: './seleccionar.component.html',
  styleUrls: ['./seleccionar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class SeleccionarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  requisiciones: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<SeleccionarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: SeleccionarService,
    private _router: Router
  ) {
    this.form = this._formBuilder.group({
      hojaDeVidaId: [element.id, []],
      requisicionPersonalId: [null, Validators.required],
    });
    
  }

  ngOnInit(): void {
    this._service.getRequisiciones().then(resp => {
      this.requisiciones = resp; 
    });
  }


  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }


  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.estado(formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/reclutamiento-seleccion/hojas-vida`]);
        //this._router.navigate([`/reclutamiento-seleccion/requisiciones-personal/${this.form.value.requisicionPersonalId}/mostrar`], { queryParams: { tab: 1 } });
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
          if ('hojaDeVidaId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.hojaDeVidaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('requisicionPersonalId').setErrors(errors);
          }
        }
      });
  }


}
