import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { EditarService } from './editar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

import * as ClassicEditor from '@ckeditor';
import { AlcanosValidators } from '@alcanos/utils';

// chips
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';

/**
 * @autor @darwinyusef - @robinson
 * componente creado para edición en página libre
 */
export interface Palabra {
    name: string;
}
@Component({
    selector: 'ayuda-articulos-editar',
    templateUrl: './editar.component.html',
    styleUrls: ['./editar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {
    form: FormGroup;
    submit: boolean;
    articuloOptions: any[] = [];
    public element: any;
    // CKE Editor
    public Editor = ClassicEditor;
    idArticulo: number;

    // Chips
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    palabra: Palabra[] = [];

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: EditarService
    ) {
        this.form = this._formBuilder.group({
            id: [this.idArticulo],
            titulo: [null, [Validators.required, AlcanosValidators.minLength(3), AlcanosValidators.maxLength(255)]],
            orden: [null, [Validators.required, AlcanosValidators.minLength(1), AlcanosValidators.maxLength(4), AlcanosValidators.numerico]],
            palabras: [null, [Validators.required]],
            descripcion: [null, [Validators.required]],
            categoriaId: [null, []],
        });
        this.submit = false;
    }

    ngOnInit(): void {
        this.selectDatos();

        this._service.onArticulosChanged.subscribe(data => {
            // se inyectan en el form control data.palabras para que evitar se quede null 
            // la inyección se realiza en un input espejo de tipo hidden la siguiente linea solo muestra los datos en el chip
            data.palabras.map(element => { this.palabra.push({ name: element.trim() }); })
            this.form.patchValue({
                id: data.id,
                titulo: data.titulo,
                palabras: data.palabras,
                orden: data.orden,
                descripcion: data.descripcion,
                categoriaId: data.categoriaId,
            });
            this.idArticulo = data.id;
        });
        this.selectDatos();
    }

    public selectDatos(): void {
        this._service.getCategorias().then(
            (resp: any[]) => {
                this.articuloOptions = resp;
            }
        );
    }

    get orden(): AbstractControl {
        return this.form.get('orden');
    }

    get titulo(): AbstractControl {
        return this.form.get('titulo');
    }

    get categoria(): AbstractControl {
        return this.form.get('categoria');
    }

    get palabras(): AbstractControl {
        return this.form.get('palabras');
    }

    get descripcion(): AbstractControl {
        return this.form.get('descripcion');
    }

    get categoriaId(): AbstractControl {
        return this.form.get('categoriaId');
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }


    // chips 
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        // Add our word
        if ((value || '').trim()) {
            this.palabra.push({ name: value.trim() });
            // data.palabras.map(element => { this.palabra.push({ name: element.trim() }); })
            this.form.get('palabras').setValue(this.palabra)
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    remove(word: Palabra): void {
        const index = this.palabra.indexOf(word);
        if (index >= 0) {
            this.palabra.splice(index, 1);
            this.form.get('palabras').setValue(this.palabra)
        }
        if (this.palabra.length === 0) {
            this.form.get('palabras').setValue(null);
        }
    }
    // end chips

    guardarHandle(event): void {
        const formValue = this.form.value;
        this.submit = true;
        const array = [];
        // se listan los elementos de this.palabras bajo el array name
        this.palabra.forEach(element => {
            array.push(element.name);
        });
        // se inyecta manualmente el campo palabras que viene de add()
        formValue.palabras = array;

        // se inyecta en el promise editar el id y el formValue
        this._service.editar(formValue.id, formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._router.navigate(
                    ['/ayuda/articulos'],
                );
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
                    if ('orden' in error) {
                        const errores = {};
                        error.orden.forEach(element => {
                            errores[element] = true;
                        });
                        this.orden.setErrors(errores);
                    }

                    if ('titulo' in error) {
                        const errores = {};
                        error.titulo.forEach(element => {
                            errores[element] = true;
                        });
                        this.titulo.setErrors(errores);
                    }

                    if ('categoria' in error) {
                        const errores = {};
                        error.categoria.forEach(element => {
                            errores[element] = true;
                        });
                        this.categoria.setErrors(errores);
                    }

                    if ('palabras' in error) {
                        const errores = {};
                        error.palabras.forEach(element => {
                            errores[element] = true;
                        });
                        this.palabras.setErrors(errores);
                    }

                    if ('descripcion' in error) {
                        const errores = {};
                        error.descripcion.forEach(element => {
                            errores[element] = true;
                        });
                        this.descripcion.setErrors(errores);
                    }

                    if ('categoriaId' in error) {
                        const errores = {};
                        error.categoriaId.forEach(element => {
                            errores[element] = true;
                        });
                        this.categoriaId.setErrors(errores);
                    }
                }
            });
    }



}
