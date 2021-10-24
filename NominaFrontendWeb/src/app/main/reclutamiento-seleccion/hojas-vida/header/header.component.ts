import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { fuseAnimations } from '@fuse/animations';
import { HeaderService } from './header.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { DatosBasicosService } from '../datos-basicos-form/datos-basicos-form.service';

@Component({
  selector: 'hojas-vida-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  enviroments: string = environmentAlcanos.gestorArchivos;
  datosActuales: any;
  @Input('aspirante') item: any;

  @Input('editar-img') editarImg: boolean = true;

  constructor(
    private _service: HeaderService,
    private _matDialog: MatDialog,
    private _matSnackBar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    // if (this.item != null) {
    //   this._service.getDatosActuales(this.item.id).then(
    //     resp => {
    //       this.datosActuales = resp;
    //     }
    //   ).catch(error => {

    //   });

    // }

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
