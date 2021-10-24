import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { DocumentosService } from './documentos.service';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosValidators } from '@alcanos/utils';
import { HttpErrorResponse } from '@angular/common/http';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'funcionarios-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class DocumentosComponent implements OnInit {


  enviroments: string = environmentAlcanos.gestorArchivos;

  form: FormGroup;
  submit: boolean;
  itemFuncionario: any;
  fileToUpload: File = null;
  //
  tipoSoportes: any[];

  // Permisos
  arrayPermisos: any;
  arraySoloPermiso: any;

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
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: DocumentosService,
    private _permisos: PermisosrService
  ) {
    this.submit = false;
    this.itemFuncionario = this._service.itemFuncionario;
    this.tipoSoportes = this._service.onTipoSoportesChanged.value;

    this.form = this._formBuilder.group({
      hojaDeVidaId: [this.itemFuncionario.id],
      tipoSoporteId: [null, [Validators.required]],
      comentario: [null, []],
      file: [null, [Validators.required]],
    });

    this.arraySoloPermiso = this._permisos.permisosStorage('HojaDeVidas_');
    this.arrayPermisos = this._permisos.permisosStorage('HojaDeVida', null,
      'HojaDeVidaExperienciaLaborales_Crear',
      'HojaDeVidaEstudios_Crear',
      'HojaDeVidaDocumentos_Crear'
    );
  }

  ngOnInit(): void {
  }

  editarDatosBasicosHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/${this.itemFuncionario.id}/datos-basicos`],
    );
  }

  crearEstudioHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/${this.itemFuncionario.id}/estudio`],
    );
  }
  crearExperienciaHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/${this.itemFuncionario.id}/experiencia-laboral`],
    );
  }
  crearDocumentoHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/${this.itemFuncionario.id}/documentos`],
    );
  }

  volverHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida`],
    );
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }


  tabChangeHandle(event: MatTabChangeEvent): void {
    this._router.navigate([`/reclutamiento-seleccion/hojas-vida/${this.itemFuncionario.id}/mostrar`],
      { queryParams: { tab: event.index } });
  }


  fileInputHandle(event): void {
    let errors = {};
    const validFileExtensions = ['pdf'];
    const extension = event.target.files[0].name.split('.').pop();
    const maxFileSize = 2097152; // unidad de medida bits (2 Mb)

    if (validFileExtensions.includes(extension) == false) {
      errors['El archivo no tiene una extensión válida.'] = true;
      this.form.get('file').setErrors(errors);
    }

    if (event.target.files[0].size > maxFileSize) {
      errors['El archivo tiene un tamaño mayor al máximo permitido.'] = true;
      this.form.get('file').setErrors(errors);
    }

    if (event.target.files && event.target.files.length) {
      this.fileToUpload = event.target.files[0];
    }
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.upload(this.fileToUpload).then(
      (fileResp) => {
        formValue.file = null;
        formValue.adjunto = fileResp.object_id;
        this._service.crear(formValue)
          .then((resp) => {
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
            this._router.navigate(
              [`/reclutamiento-seleccion/hojas-vida/${this.itemFuncionario.id}/mostrar`],
              {
                queryParams: {
                  tab: 3
                }
              }
            );
            this.submit = false;
          }
          ).catch((resp: HttpErrorResponse) => {
            this.submit = false;
            if (resp.status === 400 && 'errors' in resp.error) {

              if ('nombre' in resp.error.errors) {
                const errors = {};
                resp.error.errors.nombre.forEach(element => {
                  errors[element] = true;
                });
                this.form.get('nombre').setErrors(errors);
              }

              if ('comentario' in resp.error.errors) {
                const errors = {};
                resp.error.errors.comentario.forEach(element => {
                  errors[element] = true;
                });
                this.form.get('comentario').setErrors(errors);
              }

            }
          });
      })
      .catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this._alcanosSnackBar.snackbar({ clase: 'error' });
      });

  }

}
