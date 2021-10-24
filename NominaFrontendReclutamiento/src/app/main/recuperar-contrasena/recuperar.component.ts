import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent, MatSnackBar } from '@angular/material';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { fuseAnimations } from '@fuse/animations';
// Autocompletable
import { Observable, merge } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';
import { indefinido } from '@alcanos/constantes/contratos';
import * as moment from 'moment';
import { DataSource } from '@angular/cdk/table';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { RecuperarService } from './recuperar.service';
import { FuseConfigService } from '@fuse/services/config.service';


@Component({
  selector: 'recuperar-form',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class RecuperarComponent implements OnInit, AfterViewInit {

  enviroments: string = environmentAlcanos.portal;

  form: FormGroup;
  submit: boolean;
  loading: boolean = false;
  /**
   * 
   * @param _formBuilder 
   * @param _alcanosSnackBar 
   * @param _matDialog 
   * @param _router 
   * @param _service 
   */
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: RecuperarService,
    private _matSnackBar: MatSnackBar,
  ) {

    // Configure the layout
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };

    this.submit = false;

    this.form = this._formBuilder.group({
      correoElectronicoPersonal: [null, [AlcanosValidators.correoElectronico, Validators.required]],
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void { }

  guardarHandle(event): void {
    this.submit = true;
    this.loading = true;
    const formValue = this.form.value;
    this._service.recuperar(formValue)
      .then((resp) => {
        let message = JSON.parse(resp).message
        this._matSnackBar.open(message, 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
        this.submit = false;
        this.loading = false;
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this.loading = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 404 && 'message' in error) {
          if ('message' in error) {
            const errors = {};
            errors[error.message] = true;
            this.form.get('correoElectronicoPersonal').setErrors(errors);
          }
        }
      });
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  displayFn(element: any): string {
    return element ? element.nombre : element;
  }
}