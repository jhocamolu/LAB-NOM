import { SharedServiceProf } from '@alcanos/services/shared.service';
import { Component, OnInit, ChangeDetectorRef, Optional, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { CookieService } from 'ngx-cookie-service';
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
  codeImg: any;
  accept:any;
  enviroments = environmentAlcanos.gestorArchivos;
  user:any;
  idHojaVida:number;
  changeImg:boolean;
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public element: string,
    public dialogRef: MatDialogRef<GestrorArchivosUploadComponent>,
    private _formBuilder: FormBuilder,
    private _service: UploadService,
    private _cookieService : CookieService,
    private sharedService : SharedServiceProf
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

    if (this._cookieService.check('User')) {
      // this.previewSignsrc = JSON.parse(this._cookieService.get('User')).urlImagen
      this.codeImg = JSON.parse(this._cookieService.get('User')).urlImagen
      let token = JSON.parse(this._cookieService.get('User')).token
      this.user = JSON.parse(atob(token.split('.')[1]))
    }

    this._service._getAspirante(this.user.jti).then(data =>{
      this.idHojaVida = data.value[0].id
      this.previewSignsrc = data.value[0].adjunto
    })
    
  }

  fileInputHandle(event): void {
    this.changeImg = true;
    const validFileExtensions = ['png', 'jpg', 'jpeg']
    let errors = {};
    if(!this.element['imagen']){
      validFileExtensions.push('pdf')
    }
    
    const extension = event.target.files[0].name.split('.').pop();
    const maxFileSize = 5242880; // unidad de medida bits (5 Mb)
    if (validFileExtensions.includes(extension)) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (_event) => {
        this.previewSignsrc = reader.result;
      }
    }else{
      this.previewSignsrc = null
    }

    if (validFileExtensions.includes(extension) == false) {
      this.previewSignsrc = null
      errors['El archivo no tiene una extensión válida.'] = true;
      this.form.get('file').setErrors(errors);
    }

    if (event.target.files[0].size > maxFileSize) {
      errors['El archivo tiene un tamaño mayor al máximo permitido.'] = true;
      this.form.get('file').setErrors(errors);
      this.previewSignsrc = null
    }


    if (event.target.files && event.target.files.length) {
      this.fileToUpload = event.target.files[0];
    }
  }

  onSubmitHandle(event): void {


    this.submit = true;
    this._service.upload(this.fileToUpload).then(
      (resp) => {
        // if(this.codeImg){
        //   this._service.delete(this.codeImg);
        // }
        let adjunto = {
          id:this.idHojaVida,
          adjunto:resp.object_id
        }
        this._service.imagenHojaVida(adjunto).then(data=>{
          this.sharedService.nextMessage(adjunto.adjunto)
        })
        

        this.dialogRef.close(resp);
      }
    );
  }
}
