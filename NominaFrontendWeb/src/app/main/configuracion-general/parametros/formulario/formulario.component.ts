import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormularioService } from './formulario.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'parametros-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class FormularioComponent implements OnInit {
  objectValues = Object.values;

  form: FormGroup;
  items: any[];
  selects: any;
  submit: boolean;
  totalAnio: number; 

  constructor(
    private _formBuilder: FormBuilder,
    private _service: FormularioService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
  ) {
    this.selects = {};
    this.submit = false;
    this.items = this._service.items;
    this.form = this._formBuilder.group({ });
    this.totalAnio = this._service.todoAnnios.anno; 

  }

  ngOnInit(): void {
    this.items.forEach(element => {
      let valor = element.valor;
      const validators = [];
      if (element.obligatorio === true) {
        validators.push(Validators.required);
      }

      if (element.htmlOpcion) {
        const validacionesHtml = element.htmlOpcion.split(',');
        validacionesHtml.forEach(option => {
          option = option.split('=');
          if (option.length === 2) {
            const option0 = (option[0]).trim();
            const option1 = (option[1]).split('"').join('').trim();
            if (option0 === 'min') {
              validators.push(Validators.min(option1));
            }
            if (option0 === 'max') {
              validators.push(Validators.max(option1));
            }
            if (option0 === 'Minlength') {
              validators.push(AlcanosValidators.minLength(option1));
            }
            if (option0 === 'Maxlength') {
              validators.push(AlcanosValidators.maxLength(option1));
            }
          }
        });
      }


      switch (element.tipo) {
        case 'Number':
          validators.push(AlcanosValidators.numericoDecimal);
          break;
        case 'Email':
          validators.push(AlcanosValidators.correoElectronico);
          break;
        case 'Url':
          validators.push(AlcanosValidators.paginaWeb);
          break;
        case 'Date':
          valor = moment(`${valor}`);
          break;
        case 'Time':
          valor = moment(`2000-01-01 ${valor}`).format('HH:mm:ss');
          break;
        case 'Select':
          this.selects[element.alias] = [];
          if (element.item) {
            this._service.getData(element.item)
              .then(resp => {
                this.selects[element.alias] = resp;
              });
          }
          break;
        default:
          break;
      }
      this.form.addControl(
        element.alias,
        new FormControl(valor, validators)
      );

    });
    this.form.markAllAsTouched();
  }

  compareWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  onSubmitHandle(event): void {
    this.submit = true;
    const valores = [];
    const formValue = this.form.value;
    for (const key in formValue) {
      if (formValue.hasOwnProperty(key)) {
        const element = formValue[key];
        valores.push({ alias: key, valor: element, AnnoVigenciaId: parseInt(this._service.annoVigencia.toString(), 10) });
      }
    }

    this._service.upsert(valores)
      .then(resp => {
        this.submit = false;
        this._alcanosSnackBar.snackbar({ clase: 'exito' });

        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        this._router.navigate([`/configuracion/parametros/${this._service.categoriaId}/mostrar`], {
          queryParams: {
            $anno: toUrlEncoded({ annoVigente: this._service.annoVigencia }),
          }
        });
      })
      .catch(resp => {
        this.submit = false;
        this._alcanosSnackBar.snackbar({
          mensaje: resp.status === 400 ? 'Se ha presentado un error al procesar el formulario.' : 'Se ha presentado un error en el servidor.',
          clase: 'error'
        });

        if ('errors' in resp.error) {
          for (const key in resp.error.errors) {
            if (resp.error.errors.hasOwnProperty(key)) {
              const error = {};
              const mensajes = resp.error.errors[key];
              mensajes.forEach(element => {
                error[element] = true;
              });
              if (this.form.get(key)) {
                this.form.get(key).setErrors(error);
              }

            }
          }
        }


      });
  }


}
