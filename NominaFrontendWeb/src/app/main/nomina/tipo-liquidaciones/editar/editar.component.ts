import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { EditarService } from './editar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosValidators } from '@alcanos/utils';
import { ListarEditarComponent } from '../listar-editar/listar-editar.component';
import { EstadosComponent } from '../estados/estados.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
//
import { tipoLiquidacionAlcanos } from '@alcanos/constantes/tipo-liquidacion';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { OperacionTotal, NovedadLiquidar } from '@alcanos/constantes/tipo-liquidacion';
import { ParametroComponent } from '../parametros/parametro.component';
import { FormularioParametroComponent } from '../parametros-formulario/formulario.component';
@Component({
  selector: 'tipo-liquidaciones-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class EditarComponent implements OnInit {

  // Permisos
  arrayPermisosConceptos: any;
  arrayPermisosEstados: any;

  form: FormGroup;
  submit: boolean;
  item: any;
  id: number;

  tipoPeriodosOptions: any[] = [];

  tipoLiquidacion = tipoLiquidacionAlcanos;
  operacionesTotales: any = OperacionTotal;
  novedadesLiquidar: any = NovedadLiquidar;
  //
  conceptoNominaOptions: Observable<string[]>;



  // etiqueta 2
  conceptosList: any[] = [];

  selectedTab: number;

  @ViewChild(ListarEditarComponent, { static: false })
  listarEditar: ListarEditarComponent;


  @ViewChild(EstadosComponent, { static: false })
  Estados: EstadosComponent;

  @ViewChild(ParametroComponent, { static: false })
  Parametros: ParametroComponent;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
    private _permisos: PermisosrService,
    private _matDialog: MatDialog
  ) {
    this.form = this._formBuilder.group({
      codigo: [null, [Validators.required, AlcanosValidators.maxLength(20), AlcanosValidators.alfanumerico]],
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(180), AlcanosValidators.alfabetico]],
      tipoPeriodoId: [null, [Validators.required]],
      fechaManual: [null, [Validators.required]],
      descripcion: [null, []],
      contabiliza: [null, [Validators.required]],
      aplicaPila: [null, [Validators.required]],
      proceso: [null, [Validators.required]],
      conceptoNominaAgrupadorId: [null, [Validators.required]],
      operacionTotal: [null, [Validators.required]],
      ListaTipoLiquidacionModulos: [null, []]
    });
    this.id = this._service.id;
    this.selectedTab = this._service.selectedTab;

    this.arrayPermisosConceptos = this._permisos.permisosStorage('TipoLiquidacionConceptos_');
    this.arrayPermisosEstados = this._permisos.permisosStorage('TipoLiquidacionEstados_');
    this.submit = false;
  }

  ngOnInit(): void {
    this.selecTipoPeriodosLista();
    this._service.onTipoLiquidacionesChanged.subscribe(data => {
      const modulo = [];
      this._service.getTipoliquidacionModulos(data.id).then(resp => {
        resp.map(element => {
          modulo.push(element.modulo);
        });

        this.item = data;
        // se aplica un set time para darle tiempo al select tipo liquidación de modulos para que ejecute la consulta y se integre al modulo lita tpi liquidación modulos
        setTimeout(() => {
          this.form.patchValue({
            id: data.id,
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
            tipoPeriodoId: data.tipoPeriodoId,
            fechaManual: data.fechaManual,
            contabiliza: data.contabiliza,
            aplicaPila: data.aplicaPila,
            proceso: data.proceso,
            conceptoNominaAgrupadorId: data.conceptoNominaAgrupador,
            operacionTotal: data.operacionTotal,
            ListaTipoLiquidacionModulos: modulo
          });
        }, 600);
      });
    });

    // Object.keys(this.form.controls).forEach(key => {
    //   console.log(`${key} es valido : ${this.form.get(key).valid}`);
    //   console.log(this.form.get(key).errors);
    // });

    this.conceptoNominaOptions = this.form.get('conceptoNominaAgrupadorId')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this._service.getConceptos(value))
      );

    // servicio para llenar la tabla
    this._service.onDataConceptos.subscribe(resp => {
      this.conceptosList = resp;
    });
    this.form.markAllAsTouched();
  }

  tabChangeHandle(event): void {
    this.selectedTab = event.index;
  }

  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }
  public tercero(): void {
    this.selectedTab = 2;
  }
  public cuarto(): void {
    this.selectedTab = 3;
  }

  public selecTipoPeriodosLista(): void {
    this._service.getTipoPeriodoLista().then(
      (resp: any[]) => {
        this.tipoPeriodosOptions = resp;
      });
  }

  conceptoHandle(event): void {
    this.segundo();
    this.listarEditar.conceptoHandle(event);
  }

  estadoHandle(event): void {
    this.tercero();
    this.Estados.estadoHandle(event);
  }

  crearParametroHandle(event): void {
    this.cuarto();
    this.Parametros.crearParametroHandle(event);
  }

  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = true;
    formValue.id = this._service.id;

    if (formValue.conceptoNominaAgrupadorId != null) {
      formValue.conceptoNominaAgrupadorId = formValue.conceptoNominaAgrupadorId.id;
    }


    if (formValue.ListaTipoLiquidacionModulos != null) {
      const tipoLiquidacionesA = [];
      formValue.ListaTipoLiquidacionModulos.map(element => {
        tipoLiquidacionesA.push({
          'Modulo': element
        });
      });
      formValue.ListaTipoLiquidacionModulos = tipoLiquidacionesA;
    }

    // Object.keys(this.form.controls).forEach(key => {
    //   console.log(`${key} es valido : ${this.form.get(key).valid}`);
    //   console.log(this.form.get(key).errors);
    // });


    // se inyecta en el promise editar el id y el formValue
    this._service.editar(this._service.id, formValue)
      .then((resp) => {
        this._service.getTipoLidacion();
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this.selectedTab = 1;
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in error) {
          if ('codigo' in error.errors) {
            const errores = {};
            error.errors.codigo.forEach(element => {
              errores[element] = true;
            });
            this.form.get('codigo').setErrors(errores);
          }

          if ('nombre' in error.errors) {
            const errores = {};
            error.errors.nombre.forEach(element => {
              errores[element] = true;
            });
            this.form.get('nombre').setErrors(errores);
          }

          if ('tipoPeriodoId' in error.errors) {
            const errores = {};
            error.errors.tipoPeriodoId.forEach(element => {
              errores[element] = true;
            });
            this.form.get('tipoPeriodoId').setErrors(errores);
          }

          if ('fechaManual' in error.errors) {
            const errores = {};
            error.errors.fechaManual.forEach(element => {
              errores[element] = true;
            });
            this.form.get('fechaManual').setErrors(errores);
          }

          if ('descripcion' in error.errors) {
            const errores = {};
            error.errors.descripcion.forEach(element => {
              errores[element] = true;
            });
            this.form.get('descripcion').setErrors(errores);
          }

          if ('proceso' in error.errors) {
            const errors = {};
            error.errors.proceso.forEach(element => {
              errors[element] = true;
            });
            this.form.get('proceso').setErrors(errors);
          }

          if ('contabiliza' in error.errors) {
            const errors = {};
            error.errors.contabiliza.forEach(element => {
              errors[element] = true;
            });
            this.form.get('contabiliza').setErrors(errors);
          }

          if ('aplicaPila' in error.errors) {
            const errors = {};
            error.errors.aplicaPila.forEach(element => {
              errors[element] = true;
            });
            this.form.get('aplicaPila').setErrors(errors);
          }

          if ('conceptoNominaAgrupadorId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaAgrupadorId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('conceptoNominaAgrupadorId').setErrors(errors);
          }
        }
      });
  }


  displayFnConceptos(element: any): string {
    return element ? `${element.codigo}, ${element.nombre}` : element;
  }

}
