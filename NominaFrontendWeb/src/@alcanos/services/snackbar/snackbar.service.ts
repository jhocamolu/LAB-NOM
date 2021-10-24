import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

export interface AlcanosSnackBar {
    mensaje?: string;
    clase: 'error' | 'exito' | 'advertencia' | 'informativo';
    time?: number;
}


@Injectable({
    providedIn: 'root'
})
export class AlcanosSnackBarService {

    constructor(private _matSnackBar: MatSnackBar) { }

    snackbar(operacion: AlcanosSnackBar): void {
        let mensajes: string;
        let timer: number;

        if (!operacion.mensaje && operacion.clase === 'exito') {
            mensajes = '¡Perfecto! la operación se ha realizado exitosamente.';
        } else if (!operacion.mensaje && operacion.clase === 'error') {
            mensajes = 'Lo sentimos, ha ocurrido un error inesperado.';
        } else if (!operacion.mensaje && operacion.clase === 'advertencia') {
            mensajes = 'Hemos tenido algunos inconvenientes con la operación realizada.';
        } else if (!operacion.mensaje && operacion.clase === 'informativo') {
            mensajes = null;
            console.error('@alcanos:  El snackbar debe contener un mensaje escrito por el usuario');
        } else if (!operacion.mensaje) {
            console.error('@alcanos: El snackbar debe contener un mensaje escrito por el usuario');
        } else {
            mensajes = operacion.mensaje;
        }


        if (!operacion.time) {
            timer = 3000;
        } else {
            timer = operacion.time;
        }

        this._matSnackBar.open(mensajes, 'Aceptar', {
            verticalPosition: 'top',
            duration: timer,
            panelClass: [`${operacion.clase}-snackbar`],
        });
    }
}
