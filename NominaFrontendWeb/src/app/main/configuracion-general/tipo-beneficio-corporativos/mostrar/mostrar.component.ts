import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MostrarService } from './mostrar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatTabChangeEvent } from '@angular/material';
import { Route, Router } from '@angular/router';
import { Observable, merge } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { RequisitoComponent } from '../requisito/requisito.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');


@Component({
  selector: 'tipo-beneficio-corporativo-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations:
    [
      fuseAnimations
    ],
})
export class MostrarComponent implements OnInit {

  // Permisos
  arrayPermisos: any;
  arrayPermisosRequisitos: any;

  id: any;
  item: any;
  element: any;
  requisitos: any[];
  count: any;

  submit: boolean;
  path: string;
  desabilitar: boolean;
  selectedTab = 0;

  constructor(
    private _fuseSidebarService: FuseSidebarService,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: MostrarService,
    private _router: Router,
    private _permisos: PermisosrService,

  ) {

    this._service.onItemsChanged.subscribe((resp) => {
      this.element = resp;
      this.id = resp.id;
    });

    this._service.getRequisito(this.id).then((resp) => {
      this.path = this._service.path;
      this.requisitos = resp;
      this.count = this._service.totalCount;
    });
    this.arrayPermisos = this._permisos.permisosStorage('TipoBeneficios_');
    this.arrayPermisosRequisitos = this._permisos.permisosStorage('TipoBeneficioRequisitos_');
  }

  ngOnInit(): void { }

  tabChangeHandle(event): void {
    this.selectedTab = event.index;
  }

  // se comunica con el componente Dependencia
  requisitoHandle(event): void {
    const dialogRef = this._matDialog.open(RequisitoComponent, {
      panelClass: 'crear-dialog',
      data: { id: this._service.id },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._service.getRequisito(this.id).then((resp) => {
          this.requisitos = resp;
          this.count = this._service.totalCount;
        });
        this.selectedTab = 1;
      }
    });
  }

  public siguienteHandle() {
    this.selectedTab += 1;
  }

  public anteriorHandle() {
    this.selectedTab -= 1;
  }

  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }

}
