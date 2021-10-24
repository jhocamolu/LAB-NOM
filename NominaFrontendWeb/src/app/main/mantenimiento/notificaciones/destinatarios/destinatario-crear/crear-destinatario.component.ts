import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { DestinatarioCrearService } from './crear-destinatario.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { ListarEditarService } from '../destinatario-listar/listar-editar.service';
// Autocompletable
import { Observable } from 'rxjs';

@Component({
    selector: 'destinatario-crear',
    templateUrl: './crear-destinatario.component.html',
    styleUrls: ['./crear-destinatario.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DestinatarioCrearComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    requisitosOptions: any[] = [];
    tipoBeneficioId: any;
    funcionarios: any[];
    filteredFuncionarios: Observable<string[]>;
    idFuncionario: any;
    constructor(
        public dialogRef: MatDialogRef<DestinatarioCrearComponent>,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: DestinatarioCrearService,
        private _serviceLista: ListarEditarService,
        private _alcanosSnackBar: AlcanosSnackBarService,
    ) {
        this.funcionarios = [];
        this.form = this._formBuilder.group({
            destinatarioId: [null, [Validators.required]],
            funcionario: [null, [Validators.required]],
            correo: [null, [Validators.required, AlcanosValidators.correoElectronico]],
            
        });
        this.submit = false;
    }

    ngOnInit(): void {
        if(this.element.tipo === 'Email'){
            this.form.get('destinatarioId').valueChanges.subscribe(
                (value) => {
                    if(value !== null){
                        if (value === '1'){
                            this.funcionario.enable()
                            this.correo.disable()
                        }else{
                            this.correo.enable()
                            this.funcionario.disable()
                        }
                    }
                }
            );
        }else{
            this.funcionario.enable();
            this.correo.disable();
        }
        

        this.filteredFuncionarios = this.form.get('funcionario')
            .valueChanges
            .pipe(
                debounceTime(300),
                switchMap(value => this._service.getFuncionarios(value))
            );
    }

    get funcionario(): AbstractControl {
        return this.form.get('funcionario');
    }

    get correo(): AbstractControl {
        return this.form.get('correo');
    }

    get destinatarioId(): AbstractControl {
        return this.form.get('destinatarioId');
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

    selectFuncionario(id){
        this.idFuncionario = id.id
    }

    guardarHandle(event): void {
        this.submit = true;

        const formValue = this.form.value;
        if(this.destinatarioId.value === "1"){
            formValue.funcionarioId = this.idFuncionario;
        }else{
            formValue.CorreoElectronico = this.correo.value;
        }
        formValue.notificacionId = parseInt(this.element.id, 10);

        this._service.crear(formValue).then((resp) => {
            this._serviceLista.getDestinatarios();
            this.dialogRef.close(resp);
        }).catch((resp: HttpErrorResponse) => {
            this.submit = true;
            let error = resp.error;
            if (typeof resp.error === 'string') {
                error = JSON.parse(resp.error);
            } else {
                error = resp.error;
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('funcionarioId' in error.errors) {
                    const errores = {};
                    error.errors.funcionarioId.forEach(element => {
                        errores[element] = true;
                    });
                    this.funcionario.setErrors(errores);
                }
            }

            if (resp.status === 400 && 'errors' in error) {
                if ('correoElectronico' in error.errors) {
                    const errores = {};
                    error.errors.correoElectronico.forEach(element => {
                        errores[element] = true;
                    });
                    this.correo.setErrors(errores);
                }
            }
        });

    }

    displayFnFuncionarios(element: any): string {
        return element ? element.criterioBusqueda : element;
    }

}
