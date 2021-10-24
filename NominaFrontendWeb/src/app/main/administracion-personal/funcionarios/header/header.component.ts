import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { fuseAnimations } from '@fuse/animations';
import { HeaderService } from './header.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { DatosBasicosService } from '../datos-basicos-form/datos-basicos-form.service';
import { SharedServiceProf } from '@alcanos/services/shared.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'funcionarios-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  enviroments: string = environmentAlcanos.gestorArchivos;
  datosActuales: any;
  @Input('funcionario') item: any;
  @Input('editar-img') editarImg: boolean = true;
  message:string;

  constructor(
    private _service: HeaderService,
    private _matDialog: MatDialog,
    private _matSnackBar: MatSnackBar,
    private sharedService: SharedServiceProf,
    private _cookieService: CookieService,
  ) {
  }

  ngOnInit(): void {
    if (this.item != null) {
      
      this._service.getDatosActuales(this.item.id).then(
        resp => {
          this.datosActuales = resp;
        }
      ).catch(error => {

      });

    }

  }

  cambiarImgHandle(event): void {
    
    if (this.item != null) {
      const img = this.item != null ? this.item.adjunto : null;
      const dialogRef = this._matDialog.open(GestrorArchivosUploadComponent, {
        disableClose: false,
        data: {
          img:img,
          imagen:true
        },
      });
      dialogRef.afterClosed().subscribe(confirm => {
        if (confirm != null) {
          this._service.editarImg(this.item.id, confirm.object_id).then(
            (resp) => {
              this.item.adjunto = resp.adjunto;
              this.sharedService.sharedMessage.subscribe(message => this.message = message)
              let info = {
                cedula:this.item.numeroDocumento,
                codeImagen:this.item.adjunto,
                cambioFoto:true
              }
              let cedula = JSON.parse(atob(JSON.parse(this._cookieService.get('User')).token.split('.')[1])).Identificacion
              if(cedula === this.item.numeroDocumento){
                this.sharedService.nextMessage(info)
                localStorage.setItem('changeImagen',this.item.adjunto)
              }
              this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
                verticalPosition: 'top',
                duration: 3000,
                panelClass: ['exito-snackbar'],
              });
            }
          );
        }
      });
    }

  }
}
