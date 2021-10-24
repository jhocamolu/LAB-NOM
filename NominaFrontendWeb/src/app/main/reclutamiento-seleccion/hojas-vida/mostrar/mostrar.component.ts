import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef, ViewChild, Input } from '@angular/core';
import { MostrarService } from './mostrar.service';
import { fuseAnimations } from '@fuse/animations';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { MatSnackBar, MatTabChangeEvent } from '@angular/material';
import { merge, Observable, timer } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { MostrarEstudiosComponent } from '../mostrar-estudios/mostrar-estudios.component';
import { MostrarExperienciasComponent } from '../mostrar-experiencias/mostrar-experiencias.component';
import { DatosBasicosService } from '../datos-basicos-form/datos-basicos-form.service';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';

import { estadoEstudioAlcanos } from '@alcanos/constantes/estado-estudios';
import { estadoExperienciaAlcanos } from '@alcanos/constantes/estado-experiencia';

import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { SeleccionarComponent } from '../seleccionar/seleccionar.component';

@Component({
  selector: 'hojas-vida-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class MostrarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  enviroments: string = environmentAlcanos.gestorArchivos;

  estudiosDataSource: EstudiosDataSource | null;
  experienciasDataSource: ExperienciasDataSource | null;
  documentosDataSource: DocumentosDataSource | null;

  estudiosData: any | null;
  experienciasData: any | null;
  documentosData: any | null;


  displayedColumns: string[] = ['nombre', 'apellido', 'parentesco', 'celular', 'estado', 'acciones'];
  displayedColumnsEstudios: string[] = ['nivelEducativo', 'titulo', 'acciones'];
  displayedColumnsExperiencias: string[] = ['nombreCargo', 'empresa', 'telefono', 'acciones'];
  displayedColumnsDocumentos: string[] = ['tipo', 'comentario', 'acciones'];

  item: any;

  estadoEstudio = estadoEstudioAlcanos;
  estadoExperiencia = estadoExperienciaAlcanos;

  estudiosDataRequest: boolean;
  experienciasDataRequest: boolean;
  documentosDataRequest: boolean;

  indexTab: number;

  // Permisos
  arrayHVExperienciaLaboralesPermiso: any;
  arrayHVEstudiosPermiso: any;
  arrayHVDocumentosPermiso: any;
  arraySoloPermiso: any;

  // tslint:disable-next-line: no-input-rename
  @Input('funcionarioId') id: any;

  constructor(
    private _router: Router,
    private _fuseSidebarService: FuseSidebarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _service: MostrarService,
    private _servicePadre: DatosBasicosService,
    private _permisos: PermisosrService
  ) {
    this.estudiosDataRequest = false;
    this.experienciasDataRequest = false;
    this.documentosDataRequest = false;
    this.indexTab = this._service.tab;
    this.arraySoloPermiso = this._permisos.permisosStorage('HojaDeVidas_');
    this.arrayHVExperienciaLaboralesPermiso = this._permisos.permisosStorage('HojaDeVidaExperienciaLaborales_');
    this.arrayHVEstudiosPermiso = this._permisos.permisosStorage('HojaDeVidaEstudios_');
    this.arrayHVDocumentosPermiso = this._permisos.permisosStorage('HojaDeVidaDocumentos_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );
    this._service.estudioDataRequest.subscribe(resp => { this.estudiosDataRequest = resp });
    this._service.experienciaDataRequest.subscribe(resp => { this.experienciasDataRequest = resp });
    this._service.documentoDataRequest.subscribe(resp => { this.documentosDataRequest = resp });


    this.estudiosDataSource = new EstudiosDataSource(this._service);
    this.experienciasDataSource = new ExperienciasDataSource(this._service);
    this.documentosDataSource = new DocumentosDataSource(this._service);

  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  volverHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida`],
    );
  }

  crearDocumentoHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/${this.item.id}/documentos`],
    );
  }

  crearExperienciaHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/${this.item.id}/experiencia-laboral`],
    );
  }

  crearEstudioHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/${this.item.id}/estudio`],
    );
  }


  editarDatosBasicosHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/${this.item.id}/datos-basicos`],
    );
  }

  crearContratoBasicosHandle(event): void {
    this._router.navigate(
      [`/reclutamiento-seleccion/hojas-vida/crear`],
    );
  }


  mostrarEstudiosHandle(event, elment): void {
    const dialogRef = this._matDialog.open(MostrarEstudiosComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: elment
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  mostrarExperienciasHandle(event, elment): void {
    const dialogRef = this._matDialog.open(MostrarExperienciasComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: elment
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  seleccionarHandle(event, element): void {
    const dialogRef = this._matDialog.open(SeleccionarComponent, {
      panelClass: 'modal-dialog',
      disableClose: true,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // this._service.getAusentismoFuncionario();
      }
    });
  }




  ngOnDestroy(): void {
    this._service.onItemChanged.next({});
    this._service.onEstudiosChanged.next([]);
    this._service.onExperienciasChanged.next([]);
    this._service.onDocumentosChanged.next([]);
  }


  get hasEstudiosDataSource(): boolean {
    return this._service.onEstudiosChanged.value != null && this._service.onEstudiosChanged.value.length > 0;
  }

  get hasExperienciasDataSource(): boolean {
    return this._service.onExperienciasChanged.value != null && this._service.onExperienciasChanged.value.length > 0;
  }

  get hasDocumentosDataSource(): boolean {
    return this._service.onDocumentosChanged.value != null && this._service.onDocumentosChanged.value.length > 0;
  }


  descargarHandle(event, element): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${element.adjunto}`, '_blank');
  }

  onTabChangedHandle(event: MatTabChangeEvent): void {
    this._service.getData(event.index);
  }


  eliminarEstudios(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarEstudios(element.id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });

          this._service.getEstudios();
        }, error => {
        });
      }
    });


  }

  eliminarExperiencia(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarExperiencia(element.id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });

          this._service.getExperiencias();
        }, error => {
        });
      }
    });


  }

  eliminarDocumento(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarDocumento(element.id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });

          this._service.getDocumentos();
        }, error => {
        });
      }
    });


  }


}


export class EstudiosDataSource extends DataSource<any>{

  constructor(
    private _service: MostrarService,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onEstudiosChanged,

    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onEstudiosChanged.value.slice();
          return data;
        }
        ));
  }

  /**
   * Disconnect
   */
  disconnect(): void {
  }

}

export class ExperienciasDataSource extends DataSource<any>{

  constructor(
    private _service: MostrarService,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onExperienciasChanged,

    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onExperienciasChanged.value.slice();
          return data;
        }
        ));
  }

  /**
   * Disconnect
   */
  disconnect(): void {
  }

}


export class DocumentosDataSource extends DataSource<any>{

  constructor(
    private _service: MostrarService,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onDocumentosChanged,

    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onDocumentosChanged.value.slice();
          return data;
        }
        ));
  }

  /**
   * Disconnect
   */
  disconnect(): void {
  }

}


