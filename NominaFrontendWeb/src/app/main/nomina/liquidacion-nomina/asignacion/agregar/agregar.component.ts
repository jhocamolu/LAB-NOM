import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, AfterContentInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { fuseAnimations } from '@fuse/animations';
import { Observable, merge } from 'rxjs';
import { debounceTime, switchMap, map } from 'rxjs/operators';
import { AsignacionService } from '../asignacion.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
 
@Component({
  selector: 'liquidacion-nomina-asignacion-agregar',
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AsignacionAgregarComponent implements OnInit, AfterContentInit, OnDestroy {


  form: FormGroup;
  submit: boolean;

  filteredFuncionarios: Observable<string[]>;
  centroOperativos: any[];
  dependencias: any[];
  grupoNominas: any[];


  // listar
  selection = new SelectionModel<any>(true, []);
  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['seleccion', 'numeroDocumento', 'nombre', 'cargo', 'grupoNomina'];
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  panelOpenState = true
  spinner:boolean= false;
  showTable:boolean=true;
  constructor(
    public dialogRef: MatDialogRef<AsignacionAgregarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _service: AsignacionService,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {
    this.form = this._formBuilder.group({
      nominaId: [this.element.id],
      funcionario: [null],
      centroOperativoId: [null],
      dependenciaId: [null],
      grupoNominaId: [null],
    });
    this.centroOperativos = this._service.centroOperativos;
    this.dependencias = this._service.dependencias;
    this.grupoNominas = this._service.grupoNominas;
    this.submit = false;
  }


  ngOnInit(): void {
    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getFuncionarios(value))
      );
  }

  ngAfterContentInit(): void {
    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
  }

  ngOnDestroy(): void {
    this.dataSource = null;
    this.selection = null;
    this._service.nominaFuncionarios = [];
    this._service.onNominaFuncionariosChange.next([]);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
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

  buscarHandle(event): void {
    //crego esta variable y le digo que cada vez que den buscar, me cierre el acordion
    this.panelOpenState = !this.panelOpenState
    this.submit = true;
    this.spinner = true;
    this.showTable = false;
    // 
    const formValue = this.form.value;
    if (formValue.funcionario && formValue.funcionario.id) {
      formValue.funcionarioId = formValue.funcionario.id;
    }

    this._service.getNominaFuncionarios(formValue)
      .finally(() => {
        this.submit = false;
        this.spinner = false;
      });
  }

  // Limpio la tabla de seleccion de funcionarios
  limpiarHandle($event): void{
    this._service.nominaFuncionarios = [];
    this._service.onNominaFuncionariosChange.next([]);
    this.form.get('funcionario').reset()
    this.form.get('centroOperativoId').reset()
    this.form.get('dependenciaId').reset()
    this.form.get('grupoNominaId').reset()
    this.showTable = true;
  }

  seleccionarHandle(event): void {
    this.submit = true;
    this.spinner = true;
    const datos = {
      nominaId: this.element.id,
      funcionarios: [],
    };
    this.selection.selected.forEach(element => {
      datos.funcionarios.push(element.funcionarioId);
    });

    this._service.asignar(datos)
      .then(resp => {
      
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.dialogRef.close(true);
      })
      .catch(resp => {
        this._alcanosSnackBar.snackbar({ clase: 'error' });
      })
      .finally(() => {
        this.submit = false;
        this.spinner = false;
      });

  }

  displayFn(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

}


export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: AsignacionService,
    private _matPaginator: MatPaginator,
    private _matSort: MatSort,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onNominaFuncionariosChange,
      this._matPaginator.page,
      this._matSort.sortChange
    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          let data = this._service.nominaFuncionarios.slice();

          data = this.sortData(data);
          // Grab the page's slice of data.
          const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
          return data.splice(startIndex, this._matPaginator.pageSize);
        }
        ));
  }


  get length(): number {
    return this._service.nominaFuncionarios.length;
  }

  get data(): any[] {
    return this._service.nominaFuncionarios;
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
        case 'cargo':
          [propertyA, propertyB] = [a.cargoNombre, b.cargoNombre];
          break;
        case 'price':
          [propertyA, propertyB] = [a.grupoNominaNombre, b.grupoNominaNombre];
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
