import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { Router } from '@angular/router';
import { CrearService } from './crear.service';

// chips
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fuseAnimations } from '@fuse/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'prorroga-contratos-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  getTipoContratosOptions: any[] = [];
  getCentroOperativoOptions: any[] = [];
  getDependenciaOptions: any[] = [];
  filteredCargos: Observable<string[]>;
  espera: boolean = false;

  // Chips
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  cargos: any = [];
  todosCargos: any = [] = [];
  disableChip: boolean = true;

  @ViewChild('CargoInput', { static: true }) CargoInput: ElementRef;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: CrearService
  ) {
    this.form = this._formBuilder.group({
      tipoContratoTerminoFijo: [null, [Validators.required]],
      numeroProrroga: [null, [Validators.required]],
      centroOperativo: [null, []],
      dependencia: [null, []],
      cargo: [null, []],
    });
    this.submit = false;

    this._service.getCargo().then(resp => {
      this.todosCargos = resp;
    });

    this.filteredCargos = this.form.get('cargo').valueChanges.pipe(
      startWith(null),
      map((cargo: string | null) => cargo ? this._filter(cargo) : this.todosCargos.slice()));
  }

  ngOnInit(): void {

    this._service.getTipoContratos().then(resp => {
      this.getTipoContratosOptions = resp;
    });

    this._service.getCentroOperativos().then(resp => {
      this.getCentroOperativoOptions = resp;
    });

    this._service.getDependencias().then(resp => {
      this.getDependenciaOptions = resp;
    });

  }

  get tipoContratoTerminoFijo(): AbstractControl {
    return this.form.get('tipoContratoTerminoFijo');
  }
  get numeroProrroga(): AbstractControl {
    return this.form.get('numeroProrroga');
  }

  get cargo(): AbstractControl {
    return this.form.get('cargo');
  }

  get centroOperativo(): AbstractControl {
    return this.form.get('centroOperativo');
  }

  get dependencia(): AbstractControl {
    return this.form.get('dependencia');
  }


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add our cargo
    // if ((value || '').trim()) {
    //     this.cargos.push({
    //         id: Math.random(),
    //         nombre: value.trim()
    //     });
    // }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.form.get('cargo').setValue(null);
  }

  remove(cargo, indx): void {
    this.cargos.splice(indx, 1);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.cargos.push(event.option.value);
    this.CargoInput.nativeElement.value = '';
    this.form.get('cargo').setValue(null);
  }

  private _filter(value: any): any {
    // se incluye el filtro como servicio
    this._service.getSoloCargo(value).then(resp => {
      this.todosCargos = resp;
    });
    return this.todosCargos;
  }

  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = false;
    const array = [];

    if (formValue.centroOperativo != null) {
      if (typeof formValue.centroOperativo != 'string') {
        if (formValue.centroOperativo == "") {
          formValue.centroOperativo = null;
        } else {
          formValue.centroOperativo = formValue.centroOperativo.join(',');
        }
      }
    }

    if (formValue.dependencia != null) {
      if (typeof formValue.dependencia != 'string') {
        if (formValue.dependencia == "") {
          formValue.dependencia = null;
        } else {
          formValue.dependencia = formValue.dependencia.join(',');
        }
      }
    }

    if (formValue.tipoContratoTerminoFijo != null) {
      if (typeof formValue.tipoContratoTerminoFijo != 'string') {
        if (formValue.tipoContratoTerminoFijo == "") {
          formValue.tipoContratoTerminoFijo = null;
        } else {
          formValue.tipoContratoTerminoFijo = formValue.tipoContratoTerminoFijo.join(',');
        }
      }
    }

    if (this.cargos != null) {
      this.cargos.forEach(element => {
        array.push(element.id);
      });

      formValue.cargo = array.join(',');
    }

    if (formValue.cargo === '') {
      formValue.cargo = null;
    }

    this.espera = true;
    this.submit = true;

    this._service.crear(formValue)
      .then((resp) => {
        this.espera = false;
        this.submit = false;

        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        window.open(resp.url + resp.file, "_blank");
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400) {
          if ('tipoContratoTerminoFijo' in error) {
            const errores = {};
            error.tipoContratoTerminoFijo.forEach(element => {
              errores[element] = true;
            });
            this.tipoContratoTerminoFijo.setErrors(errores);
          }
          if ('numeroProrroga' in error) {
            const errores = {};
            error.numeroProrroga.forEach(element => {
              errores[element] = true;
            });
            this.numeroProrroga.setErrors(errores);
          }

          if ('centroOperativo' in error) {
            const errores = {};
            error.centroOperativo.forEach(element => {
              errores[element] = true;
            });
            this.centroOperativo.setErrors(errores);
          }

          if ('dependencia' in error) {
            const errores = {};
            error.dependencia.forEach(element => {
              errores[element] = true;
            });
            this.dependencia.setErrors(errores);
          }

          if ('cargo' in error) {
            const errores = {};
            error.cargo.forEach(element => {
              errores[element] = true;
            });
            this.cargo.setErrors(errores);
          }

          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 5000
            });
          }

          if ('snackbarError' in error.errors) {
            let msg = '';
            error.errors.snackbarError.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 5000
            });
          }
        }
      });

  }

}
