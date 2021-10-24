import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'formula-probar',
  templateUrl: './probar.component.html',
  styleUrls: ['./probar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProbarComponent implements OnInit {


  resultado: any;
  funciones: any = {};
  conceptos: any = {};

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ProbarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {
    this.resultado = 0;
    this.form = null;
  }


  ngOnInit(): void {
    this._fillHtmlData();
    this._createForm().then(form => this.form = form);
  }


  onSubmitHandle(event): void {
    try {
      const htmlObject = document.createElement('div');
      htmlObject.innerHTML = this.element;
      const operacion: string = this._operacion(htmlObject);
      this.resultado = eval(operacion);
      this._alcanosSnackBar.snackbar({
        clase: 'informativo',
        mensaje: `El resultado de la operacion es ${this.resultado}`
      });
    } catch (error) {
      this._alcanosSnackBar.snackbar({
        clase: 'error'
      });
    }

  }

  private _operacion(htmlObject): string {
    let operacion = '';
    htmlObject.childNodes.forEach((element: any) => {
      if (element.nodeType !== Node.TEXT_NODE) {
        const valor = element.getAttribute('valor');
        const data = element.getAttribute('data');
        if (data === 'concepto') {
          operacion += this._findInObj(this.form.value.conceptos, valor);
        }
        else if (data === 'funcion') {
          operacion += this._findInObj(this.form.value.funciones, valor)
        }
        else if (data === 'condicional') {
          const condicion = element.querySelectorAll('span[data="condicion"]')[0];
          const verdadero = element.querySelectorAll('span[data="verdadero"]')[0];
          const falso = element.querySelectorAll('span[data="falso"]')[0];
          const valorCondicion = this._operacion(condicion)
            .replace('>=', 'MAI')
            .replace('<=', 'mei')
            .replace('=', '==')
            .replace('<>', '!=')
            .replace('Y', '&&')
            .replace('O', '||')
            .replace('MAI', '>=')
            .replace('mei', '<=');
          const valorVerdadero = this._operacion(verdadero);
          const valorFalso = this._operacion(falso);
          operacion += eval(valorCondicion) ? eval(valorVerdadero) : eval(valorFalso);
        }
        else {
          operacion += valor;
        }
      }
    });
    return operacion;
  }

  private _fillHtmlData(): void {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = this.element;
    const condicionales: HTMLCollection = htmlObject.getElementsByClassName('condicional');
    for (let index = 0; index < condicionales.length; index++) {
      const element = condicionales[index];
      const condicion = element.querySelectorAll('span[data="condicion"]')[0];
      const verdadero = element.querySelectorAll('span[data="verdadero"]')[0];
      const falso = element.querySelectorAll('span[data="falso"]')[0];
      this._findHtmlData(condicion);
      this._findHtmlData(verdadero);
      this._findHtmlData(falso);
    }

    this._findHtmlData(htmlObject);
  }

  private _findHtmlData(htmlObject: any): void {
    htmlObject.childNodes.forEach((element: any) => {
      if (element.nodeType !== Node.TEXT_NODE) {
        const valor = element.getAttribute('valor');
        const data = element.getAttribute('data');
        const text = element.innerHTML;
        if (data === 'concepto') {
          this.conceptos[valor] = {
            name: valor,
            label: text
          };
        }
        if (data === 'funcion') {
          this.funciones[valor] = {
            name: valor,
            label: text
          };
        }
      }
    });
  }

  private _createForm(): Promise<FormGroup> {
    return new Promise((resolve, reject) => {
      const form = this._formBuilder.group({
        conceptos: this._formBuilder.group({
        }),
        funciones: this._formBuilder.group({
        })
      });

      const conceptosForm = form.get('conceptos') as FormGroup;
      for (const key in this.conceptos) {
        if (this.conceptos.hasOwnProperty(key)) {
          conceptosForm.addControl(
            key,
            new FormControl(null, [Validators.required, AlcanosValidators.decimal])
          );
        }
      }

      const funcionesForm = form.get('funciones') as FormGroup;
      for (const key in this.funciones) {
        if (this.funciones.hasOwnProperty(key)) {
          funcionesForm.addControl(
            key,
            new FormControl(null, [Validators.required, AlcanosValidators.decimal])
          );
        }
      }
      resolve(form);
    });

  }


  objToArray(object: any): any[] {
    const array = [];
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const element = object[key];
        array.push(element);
      }
    }
    return array;
  }

  private _findInObj(object: any, search: any): string {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const element = object[key];
        if (key == search) {
          return element;
        }

      }
    }
    return '';
  }

}
