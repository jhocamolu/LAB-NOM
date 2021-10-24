import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { EditarService } from './editar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { fuseAnimations } from '@fuse/animations';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'companias-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {
  form: FormGroup;
  item: any;

  submit: boolean;
  companiaOptions: any[] = [];
  public element: any;
  startDate = new Date(1990, 0, 1);
  actividadEconomica: any[];

  // Pais - Departamento - Municipio
  paises: any[];
  departamentosOrigen: any[];
  municipiosOrigen: any[];

  // otros Servicios
  administradora: any[] = [];
  filteredActividadEconomica: Observable<string[]>;

  tipoDocumento:any[]=[];
  naturalezaJuridica:any[]=[];
  tipoPersona:any[]=[];
  tipoContribuyentes: any[] = [];
  claseAportante: any[] = [];
  tipoAportante: any[] = [];
  cargo: any[] = [];
  operadorPagos: any[] = [];
  options: any[] = [];

  spinner:boolean=false;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
    private _router: Router,
  ) {

    this.paises = this._service.onPaisesChanged.value;
    this.departamentosOrigen = [];
    this.municipiosOrigen = [];
    this.actividadEconomica = this._service.onActividadEconomicaChanged.value;
    this.tipoDocumento = this._service.onTipoDocumentoChanged.value;
    this.naturalezaJuridica = this._service.onNaturalezaJuridicaChanged.value;
    this.tipoPersona = this._service.onTipoPersonaChanged.value;
    this.cargo = this._service.onCargosChanged.value;
    this.claseAportante = this._service.oncClaseAportanteChanged.value;
    this.tipoAportante = [];

    this.form = this._formBuilder.group({
      id: [],
      nombre: [null, [Validators.required, AlcanosValidators.minLength(4), AlcanosValidators.maxLength(128)]],
      tipoDocumentoId: [null, [Validators.required]],
      nit: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(999999999999999)]],
      digitoVerificacion: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(1)]],
      razonSocial: [null, [Validators.required, AlcanosValidators.minLength(4), AlcanosValidators.maxLength(128)]],
      actividadEconomicaId: [null, [Validators.required]],

      paisOrigenId: [null, []],
      departamentoOrigenId: [null, [Validators.required]],
      municipioOrigenId: [null, [Validators.required]],

      direccion: [null, [Validators.required, AlcanosValidators.maxLength(255)]],
      telefono: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.minLength(1), AlcanosValidators.maxLength(10)]],
      fax: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.minLength(1), AlcanosValidators.maxLength(10)]],
      correoElectronico: [null, [Validators.required, AlcanosValidators.maxLength(255), Validators.pattern('[\\w\\._-]{1,30}\\+?[\\w]{0,10}@[\\w\\.\\-]{3,}\\.\\w{2,5}')]],
      web: [null, [Validators.required, AlcanosValidators.maxLength(255)]],
      fechaConstitucion: [null, [Validators.required]],
      tipoContribuyenteId: [null, [Validators.required]],
      operadorPagoId: [null, [Validators.required]],
      arlId: [null, [Validators.required]],

      claseAportanteTipoAportanteId:[],
      naturalezaJuridicaId: [null, [Validators.required]],
      tipoPersonaId: [null, [Validators.required]],
      claseAportanteId: [null, [Validators.required]],
      tipoAportanteId: [null, [Validators.required]],
      cargoId: [null, [Validators.required]],
      beneficiarioLey1429De2010: [null, [Validators.required]],
      beneficiarioImpuestoEquidad: [null, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this._service.onAdministradoraChanged.subscribe((resp) => {
      this.administradora = resp;
    });

    this._service.onTipoContribuyentesChanged.subscribe((resp) => {
      this.tipoContribuyentes = resp;
    });

    this._service.onOperadorPagosChanged.subscribe((resp) => {
      this.operadorPagos = resp;
    });

    this._service.onCompaniasChanged.subscribe(data => {
      this.item = data;

      let paisOrigenId = null;
      let departamentoOrigenId = null;

      if (this.item.divisionPoliticaNivel2 != null && this.item.divisionPoliticaNivel2.divisionPoliticaNivel1 != null) {
        paisOrigenId = this.item.divisionPoliticaNivel2.divisionPoliticaNivel1.paisId;
        departamentoOrigenId = this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id;
      }

      let claseAportanteId = null;
      let tipoAportanteId = null;

      if (this.item.claseAportanteTipoAportanteId != null && this.item.claseAportanteTipoAportante != null) {
        claseAportanteId = this.item.claseAportanteTipoAportante.claseAportanteId;
        tipoAportanteId = this.item.claseAportanteTipoAportante.tipoAportanteId;
      }

      if (claseAportanteId !== null) {
        this._tiposAportante(claseAportanteId, this.tipoAportante);
      }

      this.form.patchValue({
        id: data.id,
        nombre: data.nombre,
        tipoDocumentoId: data.tipoDocumentoId,
        nit: data.nit,
        digitoVerificacion: data.digitoVerificacion,
        razonSocial: data.razonSocial,
        actividadEconomicaId: data.actividadEconomica,

        paisOrigenId: paisOrigenId,
        departamentoOrigenId: departamentoOrigenId,
        municipioOrigenId: data.divisionPoliticaNivel2.id,

        direccion: data.direccion,
        telefono: data.telefono,
        fax: data.fax,
        correoElectronico: data.correoElectronico,
        web: data.web,
        fechaConstitucion: data.fechaConstitucion,
        tipoContribuyenteId: data.tipoContribuyenteId,
        operadorPagoId: data.operadorPagoId,
        arlId: data.arlId,

        naturalezaJuridicaId: data.naturalezaJuridicaId,
        tipoPersonaId: data.tipoPersonaId,
        claseAportanteId: claseAportanteId,
        tipoAportanteId: tipoAportanteId,
        cargoId: data.cargoId,
        beneficiarioLey1429De2010: data.beneficiarioLey1429De2010 ? 'true' : 'false',
        beneficiarioImpuestoEquidad: data.beneficiarioImpuestoEquidad  ? 'true' : 'false',
      });


      if (paisOrigenId !== null) {
        this._departamentos(paisOrigenId, this.departamentosOrigen);
      }

      if (departamentoOrigenId !== null) {
        this._municipios(departamentoOrigenId, this.municipiosOrigen);
      }

    });




    this.form.get('paisOrigenId').valueChanges.subscribe(
      (value) => {
        this.departamentosOrigen = [];
        this.municipiosOrigen = [];
        this.form.get('departamentoOrigenId').setValue(null);
        this.form.get('municipioOrigenId').setValue(null);
        if (value != null) {
          this._departamentos(value, this.departamentosOrigen);
        }
      }
    );

    this.form.get('departamentoOrigenId').valueChanges.subscribe(
      (value) => {
        this.municipiosOrigen = [];
        this.form.get('municipioOrigenId').setValue(null);
        this._municipios(value, this.municipiosOrigen);
      }
    );

    this.form.get('claseAportanteId').valueChanges.subscribe(
      (value) => {
        this.tipoAportante = [];
        this.form.get('tipoAportanteId').setValue(null);
        if(value != null){
          this._tiposAportante(value, this.tipoAportante);
        }
        
      }
    );

    this.form.get('tipoAportanteId').valueChanges.subscribe(
      (value) => {
        this.claseAportanteTipoAportanteId.setValue(this.tipoAportanteId.value)
      }
    );


    this.filteredActividadEconomica = this.form.get('actividadEconomicaId')
      .valueChanges.pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filterActividadEconomica(view) : this.actividadEconomica.slice())
        ),
      );



  }

  private _filterActividadEconomica(value: any): any[] {
    return this.actividadEconomica.filter(option => option.nombre.toLowerCase().indexOf(value.toLowerCase()) === 0);
  }

  displayFn(element: any): string {
    return element ? element.nombre : element;
  }

  private _departamentos(paisId, array: any[]): void {
    this._service.getDepartamentos(paisId).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

  private _municipios(departamentoId, array: any[]): void {
    this._service.getMunicipios(departamentoId).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

  private _tiposAportante(claseAportanteId, array: any[]): void {
    this._service.getTiposAportante(claseAportanteId).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

  onSearchChange(searchValue: string): void {
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get tipoDocumentoId(): AbstractControl {
    return this.form.get('tipoDocumentoId');
  }

  get nit(): AbstractControl {
    return this.form.get('nit');
  }

  get digitoVerificacion(): AbstractControl {
    return this.form.get('digitoVerificacion');
  }

  get razonSocial(): AbstractControl {
    return this.form.get('razonSocial');
  }

  get actividadEconomicaId(): AbstractControl {
    return this.form.get('actividadEconomicaId');
  }

  get paisOrigenId(): AbstractControl {
    return this.form.get('paisOrigenId');
  }

  get departamentoOrigenId(): AbstractControl {
    return this.form.get('departamentoOrigenId');
  }

  get municipioOrigenId(): AbstractControl {
    return this.form.get('municipioOrigenId');
  }

  get direccion(): AbstractControl {
    return this.form.get('direccion');
  }

  get telefono(): AbstractControl {
    return this.form.get('telefono');
  }

  get fax(): AbstractControl {
    return this.form.get('fax');
  }

  get correoElectronico(): AbstractControl {
    return this.form.get('correoElectronico');
  }

  get web(): AbstractControl {
    return this.form.get('web');
  }

  get fechaConstitucion(): AbstractControl {
    return this.form.get('fechaConstitucion');
  }

  get tipoContribuyenteId(): AbstractControl {
    return this.form.get('tipoContribuyenteId');
  }

  get operadorPagoId(): AbstractControl {
    return this.form.get('operadorPagoId');
  }

  get arlId(): AbstractControl {
    return this.form.get('arlId');
  }

  get naturalezaJuridicaId(): AbstractControl {
    return this.form.get('naturalezaJuridicaId');
  }

  get tipoPersonaId(): AbstractControl {
    return this.form.get('tipoPersonaId');
  }

  get claseAportanteId(): AbstractControl {
    return this.form.get('claseAportanteId');
  }

  get claseAportanteTipoAportanteId(): AbstractControl {
    return this.form.get('claseAportanteTipoAportanteId');
  }

  get tipoAportanteId(): AbstractControl {
    return this.form.get('tipoAportanteId');
  }

  get cargoId(): AbstractControl {
    return this.form.get('cargoId');
  }

  get beneficiarioLey1429De2010(): AbstractControl {
    return this.form.get('beneficiarioLey1429De2010');
  }

  get beneficiarioImpuestoEquidad(): AbstractControl {
    return this.form.get('beneficiarioImpuestoEquidad');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = true;
    this.spinner = true;
    this._service.editar(formValue.id, formValue)
      .then((resp) => {
        this.spinner = false;
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate(['/configuracion/compania']);
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this.spinner = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in error) {
          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }

          if ('tipoDocumentoId' in error.errors) {
            const errors = {};
            error.errors.tipoDocumentoId.forEach(element => {
              errors[element] = true;
            });
            this.tipoDocumentoId.setErrors(errors);
          }

          if ('nit' in error.errors) {
            const errors = {};
            error.errors.nit.forEach(element => {
              errors[element] = true;
            });
            this.nit.setErrors(errors);
          }

          if ('digitoVerificacion' in error.errors) {
            const errors = {};
            error.errors.digitoVerificacion.forEach(element => {
              errors[element] = true;
            });
            this.digitoVerificacion.setErrors(errors);
          }

          if ('razonSocial' in error.errors) {
            const errors = {};
            error.errors.razonSocial.forEach(element => {
              errors[element] = true;
            });
            this.razonSocial.setErrors(errors);
          }

          if ('actividadEconomicaId' in error.errors) {
            const errors = {};
            error.errors.actividadEconomicaId.forEach(element => {
              errors[element] = true;
            });
            this.actividadEconomicaId.setErrors(errors);
          }

          if ('paisOrigenId' in error.errors) {
            const errors = {};
            error.errors.paisOrigenId.forEach(element => {
              errors[element] = true;
            });
            this.paisOrigenId.setErrors(errors);
          }

          if ('departamentoOrigenId' in error.errors) {
            const errors = {};
            error.errors.departamentoOrigenId.forEach(element => {
              errors[element] = true;
            });
            this.departamentoOrigenId.setErrors(errors);
          }

          if ('municipioOrigenId' in error.errors) {
            const errors = {};
            error.errors.municipioOrigenId.forEach(element => {
              errors[element] = true;
            });
            this.municipioOrigenId.setErrors(errors);
          }

          if ('direccion' in error.errors) {
            const errors = {};
            error.errors.direccion.forEach(element => {
              errors[element] = true;
            });
            this.direccion.setErrors(errors);
          }

          if ('telefono' in error.errors) {
            const errors = {};
            error.errors.telefono.forEach(element => {
              errors[element] = true;
            });
            this.telefono.setErrors(errors);
          }

          if ('fax' in error.errors) {
            const errors = {};
            error.errors.fax.forEach(element => {
              errors[element] = true;
            });
            this.fax.setErrors(errors);
          }

          if ('correoElectronico' in error.errors) {
            const errors = {};
            error.errors.correoElectronico.forEach(element => {
              errors[element] = true;
            });
            this.correoElectronico.setErrors(errors);
          }

          if ('web' in error.errors) {
            const errors = {};
            error.errors.web.forEach(element => {
              errors[element] = true;
            });
            this.web.setErrors(errors);
          }

          if ('fechaConstitucion' in error.errors) {
            const errors = {};
            error.errors.fechaConstitucion.forEach(element => {
              errors[element] = true;
            });
            this.fechaConstitucion.setErrors(errors);
          }

          if ('tipoContribuyenteId' in error.errors) {
            const errors = {};
            error.errors.tipoContribuyenteId.forEach(element => {
              errors[element] = true;
            });
            this.tipoContribuyenteId.setErrors(errors);
          }

          if ('fechaConstitucion' in error.errors) {
            const errors = {};
            error.errors.fechaConstitucion.forEach(element => {
              errors[element] = true;
            });
            this.fechaConstitucion.setErrors(errors);
          }

          if ('operadorPagoId' in error.errors) {
            const errors = {};
            error.errors.operadorPagoId.forEach(element => {
              errors[element] = true;
            });
            this.operadorPagoId.setErrors(errors);
          }

          if ('arlId' in error.errors) {
            const errors = {};
            error.errors.arlId.forEach(element => {
              errors[element] = true;
            });
            this.arlId.setErrors(errors);
          }

          if ('naturalezaJuridicaId' in error.errors) {
            const errors = {};
            error.errors.naturalezaJuridicaId.forEach(element => {
              errors[element] = true;
            });
            this.naturalezaJuridicaId.setErrors(errors);
          }

          if ('tipoPersonaId' in error.errors) {
            const errors = {};
            error.errors.tipoPersonaId.forEach(element => {
              errors[element] = true;
            });
            this.tipoPersonaId.setErrors(errors);
          }

          if ('claseAportanteId' in error.errors) {
            const errors = {};
            error.errors.claseAportanteId.forEach(element => {
              errors[element] = true;
            });
            this.claseAportanteId.setErrors(errors);
          }

          if ('tipoAportanteId' in error.errors) {
            const errors = {};
            error.errors.tipoAportanteId.forEach(element => {
              errors[element] = true;
            });
            this.tipoAportanteId.setErrors(errors);
          }

          if ('cargoId' in error.errors) {
            const errors = {};
            error.errors.cargoId.forEach(element => {
              errors[element] = true;
            });
            this.cargoId.setErrors(errors);
          }

          if ('beneficiarioLey1429De2010' in error.errors) {
            const errors = {};
            error.errors.beneficiarioLey1429De2010.forEach(element => {
              errors[element] = true;
            });
            this.beneficiarioLey1429De2010.setErrors(errors);
          }

          if ('beneficiarioImpuestoEquidad' in error.errors) {
            const errors = {};
            error.errors.beneficiarioImpuestoEquidad.forEach(element => {
              errors[element] = true;
            });
            this.beneficiarioImpuestoEquidad.setErrors(errors);
          }

        }
      });
  }

}
