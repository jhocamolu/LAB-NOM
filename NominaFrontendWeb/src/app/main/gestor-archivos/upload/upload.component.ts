import { Component, OnInit, ChangeDetectorRef, Optional, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UploadService } from './upload.service';

@Component({
  selector: 'gestor-archivos-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class GestrorArchivosUploadComponent {

  form: FormGroup;
  submit: boolean;
  fileToUpload: File = null;
  previewSignsrc: any;
  accept:any;
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public element: string,
    public dialogRef: MatDialogRef<GestrorArchivosUploadComponent>,
    private _formBuilder: FormBuilder,
    private _service: UploadService
  ) {
    this.submit = false;
    this.form = this._formBuilder.group({
      file: [null, Validators.required]
    });
    if(!this.element['imagen']){
      this.accept = '.png, .jpg, .jpeg, .pdf'
    }else{
      this.accept = '.png, .jpg, .jpeg'
    }
    
  }

  fileInputHandle(event): void {
    const validFileExtensions = ['png', 'jpg', 'jpeg']
    let errors = {};
    if(!this.element['imagen']){
      validFileExtensions.push('pdf')
    }
    
    const extension = event.target.files[0].name.split('.').pop();
    const maxFileSize = 5242880; // unidad de medida bits (5 Mb)
    if (extension !== 'pdf') {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (_event) => {
        this.previewSignsrc = reader.result;
      }
    }else{
      this.previewSignsrc = null
    }

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

  onSubmitHandle(event): void {


    this.submit = true;
    this._service.upload(this.fileToUpload).then(
      (resp) => {
        if(this.element['imagen']){
          if (this.element['img'] != null) {
            this._service.delete(this.element['img']);
          }
        }else{
          if (this.element != null) {
            this._service.delete(this.element);
          }
        }
        
        this.dialogRef.close(resp);
      }
    );
  }
}
