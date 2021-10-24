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
import { MostrarContratoComponent } from '../mostrar-contrato/mostrar-contrato.component';
import { MostrarFamiliaresComponent } from '../mostrar-familiares/mostrar-familiares.component';
import { MostrarEstudiosComponent } from '../mostrar-estudios/mostrar-estudios.component';
import { MostrarExperienciasComponent } from '../mostrar-experiencias/mostrar-experiencias.component';
import { DatosBasicosService } from '../datos-basicos-form/datos-basicos-form.service';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';

import { estadoFamiliarAlcanos } from '@alcanos/constantes/estado-familiares';
import { estadoEstudioAlcanos } from '@alcanos/constantes/estado-estudios';
import { estadoExperienciaAlcanos } from '@alcanos/constantes/estado-experiencia';

import { AprobarFamiliarComponent } from '../aprobar_familiar/aprobar.component';
import { AprobarEstudioComponent } from '../aprobar_estudio/aprobar.component';
import { AprobarExperienciaComponent } from '../aprobar_experiencia/aprobar.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { CrearRetefuenteComponent } from '../crear-retefuente/crear-retefuente.component';
import { EditarRetefuenteComponent } from '../editar-retefuente/editar-retefuente.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'funcionarios-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class MostrarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  enviroments: string = environmentAlcanos.gestorArchivos;

  familiaresDataSource: FamiliaresDataSource | null;
  estudiosDataSource: EstudiosDataSource | null;
  experienciasDataSource: ExperienciasDataSource | null;
  contratosDataSource: ContratosDataSource | null;
  documentosDataSource: DocumentosDataSource | null;
  retefuenteDataSource: RetefuenteDataSource | null;
  familiaresData: any | null;
  estudiosData: any | null;
  experienciasData: any | null;
  contratosData: any | null;
  documentosData: any | null;
  retefuenteData: any | null;


  displayedColumns: string[] = ['nombre', 'apellido', 'parentesco', 'celular', 'estado', 'acciones'];
  displayedColumnsEstudios: string[] = ['nivelEducativo', 'titulo', 'estado', 'acciones'];
  displayedColumnsExperiencias: string[] = ['nombreCargo', 'empresa', 'telefono', 'estado', 'acciones'];
  displayedColumnsContratos: string[] = ['numeroContrato', 'tipoContrato', 'fechaInicio', 'fechaFinalizacion', 'estado', 'acciones'];
  displayedColumnsDocumentos: string[] = ['tipo', 'comentario', 'acciones'];
  displayedColumnsRetefuente: string[] = ['annoVigencia', 'interesVivienda', 'medicinaPrepagada', 'acciones'];

  item: any;

  estadoFamiliar = estadoFamiliarAlcanos;
  estadoEstudio = estadoEstudioAlcanos;
  estadoExperiencia = estadoExperienciaAlcanos;

  familiaresDataRequest: boolean;
  estudiosDataRequest: boolean;
  experienciasDataRequest: boolean;
  contratosDataRequest: boolean;
  documentosDataRequest: boolean;
  retefuenteDataRequest: boolean;

  indexTab: number;

  // tslint:disable-next-line: no-input-rename
  @Input('funcionarioId') id: any;
  arrayPermisos:any;
  arrayPermisosInformacionFamiliares:any;
  arrayPermisosFuncionarioEstudios:any;
  arrayPermisosExperienciaLaborales:any;
  arrayPermisosDocumentoFuncionarios:any;
  arrayPermisosDeduccionRetefuentes:any;
  constructor(
    private _router: Router,
    private _fuseSidebarService: FuseSidebarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _service: MostrarService,
    private _servicePadre: DatosBasicosService,
    private _permisos : PermisosrService
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('Funcionarios_');
    this.arrayPermisosInformacionFamiliares = this._permisos.permisosStorage('InformacionFamiliares_');
    this.arrayPermisosFuncionarioEstudios = this._permisos.permisosStorage('FuncionarioEstudios_');
    this.arrayPermisosExperienciaLaborales = this._permisos.permisosStorage('ExperienciaLaborales_');
    this.arrayPermisosDocumentoFuncionarios = this._permisos.permisosStorage('DocumentoFuncionarios_');
    this.arrayPermisosDeduccionRetefuentes = this._permisos.permisosStorage('DeduccionRetefuentes_');
    this.familiaresDataRequest = false;
    this.estudiosDataRequest = false;
    this.experienciasDataRequest = false;
    this.contratosDataRequest = false;
    this.documentosDataRequest = false;
    this.retefuenteDataRequest = false;
    this.indexTab = this._service.tab;
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );

    this._service.familiarDataRequest.subscribe(resp => { this.familiaresDataRequest = resp });
    this._service.estudioDataRequest.subscribe(resp => { this.estudiosDataRequest = resp });
    this._service.experienciaDataRequest.subscribe(resp => { this.experienciasDataRequest = resp });
    this._service.contratoDataRequest.subscribe(resp => { this.contratosDataRequest = resp });
    this._service.documentoDataRequest.subscribe(resp => { this.documentosDataRequest = resp });
    this._service.retefuenteDataRequest.subscribe(resp => { this.retefuenteDataRequest = resp });

    this.familiaresDataSource = new FamiliaresDataSource(this._service);
    this.estudiosDataSource = new EstudiosDataSource(this._service);
    this.experienciasDataSource = new ExperienciasDataSource(this._service);
    this.contratosDataSource = new ContratosDataSource(this._service);
    this.documentosDataSource = new DocumentosDataSource(this._service);
    this.retefuenteDataSource = new RetefuenteDataSource(this._service);
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  crearDocumentoHandle(event): void {
    this._router.navigate(
      [ `/administracion-personal/funcionarios/${this.item.id}/documentos`],
    );
  }

  crearExperienciaHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/experiencia-laboral`],
    );
  }

  crearEstudioHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/estudio`],
    );
  }

  crearFamiliarHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/familiar`],
    );
  }

  editarDatosBasicosHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/datos-basicos`],
    );
  }

  crearContratoBasicosHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/contratos/crear`],
    );
  }

  mostrarContratoHandle(event, elment): void {
    const dialogRef = this._matDialog.open(MostrarContratoComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: elment
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  mostrarFamiliaresHandle(event, elment): void {
    const dialogRef = this._matDialog.open(MostrarFamiliaresComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: elment
    });
    dialogRef.afterClosed().subscribe(result => {
    });
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

  aprobarFamiliarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AprobarFamiliarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getFamiliares();
      }
    });
  }

  aprobarEstudioHandle(event, element): void {
    const dialogRef = this._matDialog.open(AprobarEstudioComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getEstudios();
      }
    });
  }

  aprobarExperienciaHandle(event, element): void {
    const dialogRef = this._matDialog.open(AprobarExperienciaComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getExperiencias();
      }
    });
  }


  ngOnDestroy(): void {
    this._service.onItemChanged.next({});
    this._service.onFamiliaresChanged.next([]);
    this._service.onEstudiosChanged.next([]);
    this._service.onExperienciasChanged.next([]);
    this._service.onContratosChanged.next([]);
    this._service.onDocumentosChanged.next([]);
    this._service.onRetefuenteChanged.next([]);
  }

  get hasFamiliaresDataSource(): boolean {
    return this._service.onFamiliaresChanged.value != null && this._service.onFamiliaresChanged.value.length > 0;
  }

  get hasEstudiosDataSource(): boolean {
    return this._service.onEstudiosChanged.value != null && this._service.onEstudiosChanged.value.length > 0;
  }

  get hasExperienciasDataSource(): boolean {
    return this._service.onExperienciasChanged.value != null && this._service.onExperienciasChanged.value.length > 0;
  }

  get hasContratosDataSource(): boolean {
    return this._service.onContratosChanged.value != null && this._service.onContratosChanged.value.length > 0;
  }

  get hasDocumentosDataSource(): boolean {
    return this._service.onDocumentosChanged.value != null && this._service.onDocumentosChanged.value.length > 0;
  }
  get hasRetefuenteDataSource(): boolean {
    return this._service.onRetefuenteChanged.value != null && this._service.onRetefuenteChanged.value.length > 0;
  }


  descargarHandle(event, element): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${element.adjunto}`, '_blank');
  }

  onTabChangedHandle(event: MatTabChangeEvent): void {
    this._service.getData(event.index);
  }

  eliminarFamiliares(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarFamiliares(element.id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });

          this._service.getFamiliares();
        }, error => {
        });
      }
    });


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

  crearRetefuenteHandle(event): void {
    const dialogRef = this._matDialog.open(CrearRetefuenteComponent, {
      panelClass: 'modal-dialog',
      data: { funcionarioId: this._service.id},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getRetefuente();
      }
    });
  }
  editarRetefuenteHandle(event, element): void {
    const dialogRef = this._matDialog.open(EditarRetefuenteComponent, {
      panelClass: 'modal-dialog',
      data: element,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getRetefuente();
      }
    });
  }

  eliminarRetefuente(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ¿Estás seguro que deseas eliminar este registro?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarRetefuente(element.id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });

          this._service.getRetefuente();
        }, error => {
        });
      }
    });
  }

}

export class FamiliaresDataSource extends DataSource<any>{

  constructor(
    private _service: MostrarService,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onFamiliaresChanged,

    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onFamiliaresChanged.value.slice();
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

export class ContratosDataSource extends DataSource<any>{

  constructor(
    private _service: MostrarService,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onContratosChanged,

    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onContratosChanged.value.slice();
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

export class RetefuenteDataSource extends DataSource<any>{

  constructor(
    private _service: MostrarService,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onRetefuenteChanged,

    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onRetefuenteChanged.value.slice();
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



