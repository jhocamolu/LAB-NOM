import { Component, OnInit, ViewEncapsulation, ViewChild, AfterContentInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatPaginator, MatSort, PageEvent, Sort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { fuseAnimations } from '@fuse/animations';
import { Observable, merge, BehaviorSubject } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PrenominaService } from '../prenomina.service';
import { PrenominaFiltroComponent } from '../filtro/filtro.component';
import { SelectionModel } from '@angular/cdk/collections';
import { MostrarPrenominaComponent } from '../mostrar/mostrar.component';
import { estadoNominaFuncionarioAlcanos } from '@alcanos/constantes/estado-nomina-funcionario';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';


import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'liquidacion-nomina-prenomina-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class PrenominaListarComponent implements OnInit, OnDestroy {

  // Permisos
  arrayPermisosDetalle: any;
  arrayPermisosFuncionarios: any;

  _this: PrenominaListarComponent;

  estadoNomina = estadoNominaAlcanos;
  estadoNominaFuncionario = estadoNominaFuncionarioAlcanos;
  newEstado: any;
  item: any;

  submit: boolean;
  espera: boolean = false;

  dataRequest: boolean;

  filtroChange: BehaviorSubject<any>;

  // listar
  selection = new SelectionModel<any>(true, []);
  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['seleccion', 'numeroDocumento', 'nombre', 'cargoNombre', 'netoPagar', 'estadoNominaFuncionario', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;
  loadTable: boolean;

  constructor(
    private _router: Router,
    private _service: PrenominaService,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _permisos: PermisosrService,
  ) {
    this.newEstado = { estado: null };
    this._this = this;
    this.filtroChange = new BehaviorSubject(null);
    this.item = this._service.item;
    this.dataRequest = false;
    this.submit = false;
    this.loadTable = false;
    this.arrayPermisosDetalle = this._permisos.permisosStorage('NominaDetalles_');
    // tslint:disable-next-line: max-line-length
    this.arrayPermisosFuncionarios = this._permisos.permisosStorage('NominaFuncionarios_', null, 'NominaFuncionarios_CrearListado', 'NominaFuncionarios_Iniciar', 'NominaFuncionarios_Finalizar', 'NominaFuncionarios_EliminarUno', 'NominaFuncionarios_EliminarFuncionarios', 'NominaFuncionarios_LimpiarNomina');
  }


  ngOnInit(): void {
    this._service.getIdNomina(this.item.id).then(resp => {
      this.newEstado = resp;
    });

    this._service.dataRequest.subscribe(
      (resp: boolean) => { this.dataRequest = resp; }
    );
    this._service.onItemChange.subscribe(
      (resp) => { this.item = resp; }
    );

    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort, this.filtroChange);

    if (this._service.action === 'calculate') {
      this.calcularHandle(null);
    }
    if (this._service.action === 'finish') {
      this.finalizarHandle(null);
    }
  }

  ngOnDestroy(): void {
    this.dataSource = null;
    this.selection = null;
    this._service.prenomina = [];
    this._service.onPrenominaChange.next([]);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.dataOriginalLength;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.dataOriginal.forEach(row => this.selection.select(row));

  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;

  }

  get hasSelected(): boolean {
    return this.selection.selected.length > 0;
  }

  get dataLength(): number {
    if (!this.dataSource) {
      return 0;
    }
    return this.dataSource.length;
  }

  get dataOriginalLength(): number {
    return this._service.totalCount;
  }

  get filterSize(): number {
    let i = 0;
    for (const key in this.filtroChange.value) {
      if (this.filtroChange.value.hasOwnProperty(key)
        && this.filtroChange.value[key] != null &&
        `${this.filtroChange.value[key]}`.trim().length > 0
      ) {
        i++;
      }
    }
    return i;
  }

  get hasFilter(): boolean {
    return this.filterSize > 0;
  }

  filtroPrenominaHandle(event): void {
    const dialogRef = this._matDialog.open(PrenominaFiltroComponent, {
      panelClass: 'filtro-dialog',
      hasBackdrop: true,
      data: {
        item: this.item,
        data: this.filtroChange.value
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.filtroChange.next(data);
      }
    });
  }

  limpiarHandle(event): void {
    this.filtroChange.next({ limpiar: true });
  }

  refreshHandle(event): void {
    this._service.getIdNomina(this.item.id).then(resp => {
      this.newEstado = resp;
    });
    this._service.refreshData();
    // window.location.reload();
  }

  calcularHandle(event): void {
    this.submit = false;
    this.loadTable = true;
    const datos = {
      nominaId: this.item.id,
      nominaFuncionario: [],
    };
    this.selection.selected.forEach(element => {
      datos.nominaFuncionario.push(element.nominaFuncionarioId);
    });

    this.espera = true;
    this.submit = true;
    this._service.calcular(datos)
      .then(resp => {

        this.espera = false;
        this.submit = false;
        this.loadTable = false;
        this._service.getIdNomina(this.item.id).then(resp => {
          this.newEstado = resp; 
        });
        this._service.refreshData()
          .finally((onfinally?) => {
            this.submit = false;
          });
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.selection.clear();
        // this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/prenomina`]);
      })
      .catch(resp => {
        this.submit = false;
        this.espera = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }

        if (resp.status === 400 && 'errors' in error) {
          if ('snack' in error.errors) {
            const errors = {};
            // En el caso de requerir reiniciar la tabla use este código
            setTimeout(() => {
              
              this._service.getIdNomina(this.item.id).then(resp => {
                this.newEstado = resp; 
              });
              this._service.refreshData()
                .finally((onfinally?) => {
                  this.submit = false;
                  this.espera = false;
                  this.loadTable = false;
                });
              this.selection.clear();
            }, 4000);
            error.errors.snack.forEach(element => {
              this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: element,
                time: 6000
              });
            });
          }
          if ('nominaId' in error.errors) {
            const errors = {};
            error.errors.nominaId.forEach(element => {
              this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: element,
                time: 6000
              });
            });
          }
        }
        // this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'El Valor solicitado excede el valor máximo de anticipo a las cesantías.' });
        this.submit = false;

      });
  }

  finalizarHandle(event): void {
    const datos = {
      nominaId: this.item.id,
    };
    this._service.finalizar(datos)
      .then(resp => {
        this._service.getIdNomina(this.item.id).then(resp => {
          this.newEstado = resp; 
        });
        this._service.refreshData()
          .finally((onfinally?) => {
            this.submit = true;
          });
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
      })
      .catch(resp => {
        let mensaje = null;
        if (resp.error.hasOwnProperty('errors') && resp.error.errors.hasOwnProperty('nominaId')) {
          mensaje = resp.error.errors.nominaId;
        }
        this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: mensaje });
        this.submit = false;
      });
  }


  mostrarHandle(event, element): void {
    const dialogRef = this._matDialog.open(MostrarPrenominaComponent, {
      panelClass: 'modal-dialogAnchoTotal',
      maxWidth: '90vw',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }


}

export class FilesDataSource extends DataSource<any>{

  public length = 0;

  constructor(
    private _service: PrenominaService,
    private _matPaginator: MatPaginator,
    private _matSort: MatSort,
    private _fitro: BehaviorSubject<any>
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onPrenominaChange,
      this._matPaginator.page,
      this._matSort.sortChange,
      this._fitro
    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          let data = this._service.prenomina.slice();

          data = this.filterData(data);

          data = this.sortData(data);
          // Grab the page's slice of data.
          const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
          const elements = data.splice(startIndex, this._matPaginator.pageSize);
          this.length = elements.length;
          return elements;
        }
        ));
  }

  get dataOriginal(): any[] {
    return this._service.prenomina;
  }

  get dataOriginalLength(): number {
    return this._service.prenomina.length;
  }

  filterData(data): any[] {
    if (!this._fitro.value || (this._fitro.value && this._fitro.value.hasOwnProperty('limpiar'))) {
      return data;
    }



    const array = [];
    data.forEach(element => {
      let agregar = true;
      if (this._fitro.value.numeroDocumento &&
        !`${element.numeroDocumento}`.toLowerCase().includes(`${this._fitro.value.numeroDocumento}`.toLowerCase())) {
        agregar = false;
      }

      if (this._fitro.value.primerNombre &&
        !element.primerNombre.toLowerCase().includes(this._fitro.value.primerNombre.toLowerCase())) {
        agregar = false;
      }


      if (this._fitro.value.primerApellido &&
        !element.primerApellido.toLowerCase().includes(this._fitro.value.primerApellido.toLowerCase())) {
        agregar = false;
      }

      if (this._fitro.value.centroOperativoId &&
        element.centroOperativoId != this._fitro.value.centroOperativoId) {
        agregar = false;
      }

      if (this._fitro.value.cargoId &&
        element.cargoId != this._fitro.value.cargoId) {
        agregar = false;
      }

      if (agregar) {
        array.push(element);

      }

    });


    return array;

  }

  /**
   * Sort data
   *
   * @param data
   * @returns {any[]}
   */
  sortData(data): any[] {
    if (!this._matSort.active || this._matSort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._matSort.active) {
        case 'numeroDocumento':
          [propertyA, propertyB] = [a.numeroDocumento, b.numeroDocumento];
          break;
        case 'nombre':
          [propertyA, propertyB] = [a.primerNombre, b.primerNombre];
          break;
        case 'cargoNombre':
          [propertyA, propertyB] = [a.cargoNombre, b.cargoNombre];
          break;
        case 'netoPagar':
          [propertyA, propertyB] = [a.netoPagar, b.netoPagar];
          break;
        case 'estadoNominaFuncionario':
          [propertyA, propertyB] = [a.estadoNominaFuncionario, b.estadoNominaFuncionario];
          break;

      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
    });
  }

  disconnect(): void {
  }

}


