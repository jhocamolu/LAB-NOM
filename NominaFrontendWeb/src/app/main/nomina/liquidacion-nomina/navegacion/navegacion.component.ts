import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';

@Component({
    selector: 'liquidacion-nomina-navegacion',
    templateUrl: './navegacion.component.html',
    styleUrls: ['./navegacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NavegacionComponent {

    @Input()
    paso: number;

    @Input()
    item: any;

    @Input()
    nuevoEstado: any;

    estadoLiquidacion = estadoNominaAlcanos;

    constructor(
        private _router: Router,
    ) { }

    navegarHandle(event, paso): void {
        switch (paso) {
            case 1:
                if (this.item) {
                    this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/basica`]);
                } else {
                    this._router.navigate([`/nomina/liquidacion-nomina/crear`]);
                }
                break;
            case 2:
                this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/asignacion`]);
                break;
            case 3:
                this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/novedades`]);
                break;
            case 4:
                this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/prenomina`]);
                break;
            case 5:
                this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/aprobar`]);
                break;
            default:
                break;
        }
    }



}
