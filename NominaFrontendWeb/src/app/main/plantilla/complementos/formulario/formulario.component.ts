import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { FormularioService } from './formulario.service';
import { AlcanosValidators } from '@alcanos/utils';
import { HttpErrorResponse } from '@angular/common/http';
import * as ClassicEditor from '@ckeditor';

@Component({
  selector: 'plantilla-complementos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit, AfterViewInit {

  item: any | null;
  form: FormGroup;
  submit: boolean;

  tipos: any[];
  grupos: any[];

  Editor = ClassicEditor;
  config: any;

  public onReady(editor): void {
  }


  constructor(
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: FormularioService,
  ) {
    this.submit = false;
    this.tipos = this._service.onTipoChanged.value;
    this.grupos = [this._service.onGrupoDocumentoChanged.value];
    const etiquetas = [];
    this._service.onEtiquetasChanged.value.forEach(element => {
      etiquetas.push(element.etiqueta.slug);
    });
    this.config = {
      toolbar: [
        'heading',
        '|', 'fontSize', 'fontColor', 'fontBackgroundColor',
        '|', 'alignment:left', 'alignment:right', 'alignment:center', 'alignment:justify',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'code',
        'subscript',
        'superscript',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'indent',
        'outdent',
        '|',
        'imageUpload',
        'blockQuote',
        'insertTable',
        'undo',
        'redo',
        '|', 'etiquetas'
      ],
      language: 'es',
      etiquetasConfig: {
        types: etiquetas
      },
      fontSize: {
        options: [
          9,
          11,
          13,
          'default',
          17,
          19,
          21
        ]
      },
      image: {
        toolbar: [
          'imageStyle:alignLeft',
          'imageStyle:full',
          'imageStyle:alignRight',
          '|',
          'imageTextAlternative'
        ],
        styles: [
          'full',
          'alignLeft',
          'alignRight'
        ]
      },

    };
    this.form = this._formBuilder.group({
      id: [null],
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      tipo: [null, [Validators.required]],
      alto: [null, [Validators.required, Validators.min(1), Validators.max(99)]],
      grupoDocumentoId: [this._service.grupoDocumentoId, [Validators.required]],
      cuerpoDocumento: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp: any) => {
        if (resp != null) {
          this.item = resp;
          this.form.patchValue({
            id: this.item.id,
            nombre: this.item.nombre,
            tipo: this.item.tipo,
            alto: this.item.alto,
            cuerpoDocumento: this.item.cuerpoDocumento,
          });
          this.form.markAllAsTouched();
        }
      }
    );

  }

  ngAfterViewInit(): void {
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    const node = document.createElement('div');
    node.innerHTML = formValue.cuerpoDocumento;
    const xdata = new XMLSerializer().serializeToString(node);
    formValue.cuerpoDocumento = xdata;
    this._service.upsert(formValue)
      .then((resp) => {
        this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
        this.submit = false;
        this._router.navigate(['/plantilla/complementos']);
      }
      ).catch((resp: HttpErrorResponse) => {
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
        }
        this._matSnackBar.open(mensaje, 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['error-snackbar'],
        });

        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        }

        if (resp.status === 400 && 'errors' in error) {

          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombre').setErrors(errors);
          }
          if ('alto' in error.errors) {
            const errors = {};
            error.errors.alto.forEach(element => {
              errors[element] = true;
            });
            this.form.get('alto').setErrors(errors);
          }
          if ('tipo' in error.errors) {
            const errors = {};
            error.errors.tipo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipo').setErrors(errors);
          }
          if ('cuerpoDocumento' in error.errors) {
            const errors = {};
            error.errors.cuerpoDocumento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cuerpoDocumento').setErrors(errors);
          }

        }
      });
  }

  compareWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

}
