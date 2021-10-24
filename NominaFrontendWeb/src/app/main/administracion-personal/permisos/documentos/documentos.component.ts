import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosValidators } from '@alcanos/utils';
import { HttpErrorResponse } from '@angular/common/http';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

import { DocumentosService } from './documentos.service';

@Component({
    selector: 'permisos-documentos',
    templateUrl: './documentos.component.html',
    styleUrls: ['./documentos.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class DocumentosComponent implements OnInit {

    enviroments: string = environmentAlcanos.gestorArchivos;

    form: FormGroup;
    submit: boolean;
    itemPermisos: any;
    fileToUpload: File = null;
    //
    tipoSoportes: any[];

    /**
     * 
     * @param _formBuilder 
     * @param _matSnackBar 
     * @param _matDialog 
     * @param _router 
     * @param _service 
     */
    constructor(
        public dialogRef: MatDialogRef<DocumentosComponent>,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: DocumentosService,
    ) {
        this.submit = false;
        this._service.getTipoSoportes().then(resp => {
            this.tipoSoportes = resp;
        });
        this.form = this._formBuilder.group({
            tipoSoporteId: [null, [Validators.required]],
            comentario: [null, []],
            file: [null, [Validators.required]],
        });
    }

    ngOnInit(): void {
    }

    fileInputHandle(event): void {

        const errors = {};
        const validFileExtensions = ['pdf'];
        const extension = event.target.files[0].name.split('.').pop();
        const maxFileSize = 5242880; // unidad de medida bits (5 Mb)
    
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
                formValue.solicitudPermisoId = this.element.id;
                this._service.crear(formValue).then((resp) => {
                        this.dialogRef.close(resp);
                        this.submit = false;
                    }
                    ).catch((resp: HttpErrorResponse) => {
                        this.submit = false;
                        if (resp.status === 400 && 'errors' in resp.error) {

                            if ('file' in resp.error.errors) {
                                const errors = {};
                                resp.error.errors.file.forEach(element => {
                                    errors[element] = true;
                                });
                                this.form.get('file').setErrors(errors);
                            }

                            if ('tipoSoporteId' in resp.error.errors) {
                                const errors = {};
                                resp.error.errors.tipoSoporteId.forEach(element => {
                                    errors[element] = true;
                                });
                                this.form.get('tipoSoporteId').setErrors(errors);
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
