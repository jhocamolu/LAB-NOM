import { Component, OnInit, ViewEncapsulation, ViewChildren, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, AbstractControl, FormGroup } from '@angular/forms';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

export interface ItemDashboard {
    redirect: string;
    modulo: string;
    abreviatura: string;
    permisos: any;
}

@Component({
    selector: 'configuracion-general-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {


    @ViewChild('buscarIcon', { static: false }) buscarIcon: ElementRef;

    form: FormGroup;

    items: ItemDashboard[];
    busquedaItems: ItemDashboard[];

    // permisos
    arrayPermisos: any;



    colors: string[] = [
        '#B72974',
        '#FFA124',
        '#066F77',
        '#6232CC',
        '#004693',
        '#EE564C',
        '#602411',
        '#EF6100',
        '#FF7D43',
        '#8822A0',
        '#3DBDD3',
        '#CE7459',
        '#9B193E',
        '#3FD195',
        '#FF7D7D',
        '#9ABF00',
    ];


    public constructor(
        private _formBuilder: FormBuilder,
        private _permisos: PermisosrService
    ) {
        this.items = [];
        this.form = this._formBuilder.group({
            modulo: [null],
        });

        this.arrayPermisos = JSON.parse(localStorage.getItem('Permisos'));
    }

    ngOnInit(): void {
        this.items.push({
            redirect: '/configuracion/centro-trabajos',
            modulo: 'Centros de trabajo',
            abreviatura: 'CT',
            permisos: this.arrayPermisos.find(x => x === 'CentroTrabajos_Listar') ? true : false
        });


        this.items.push({
            redirect: '/configuracion/paises',
            modulo: 'Países',
            abreviatura: 'PA',
            permisos: this.arrayPermisos.find(x => x === 'Paises_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/tipo-documentos',
            modulo: 'Tipos de documento',
            abreviatura: 'TD',
            permisos: this.arrayPermisos.find(x => x === 'TipoDocumentos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/tipo-viviendas',
            modulo: 'Tipos de vivienda',
            abreviatura: 'TV',
            permisos: this.arrayPermisos.find(x => x === 'TipoViviendas_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/ocupaciones',
            modulo: 'Ocupaciones',
            abreviatura: 'OC',
            permisos: this.arrayPermisos.find(x => x === 'Ocupaciones_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/estado-civiles',
            modulo: 'Estados civiles',
            abreviatura: 'EC',
            permisos: this.arrayPermisos.find(x => x === 'EstadoCiviles_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/administradoras',
            modulo: 'Administradoras',
            abreviatura: 'AD',
            permisos: this.arrayPermisos.find(x => x === 'Administradoras_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/profesiones',
            modulo: 'Profesiones',
            abreviatura: 'PR',
            permisos: this.arrayPermisos.find(x => x === 'Profesiones_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/idiomas',
            modulo: 'Idiomas',
            abreviatura: 'ID',
            permisos: this.arrayPermisos.find(x => x === 'Idiomas_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/forma-pagos',
            modulo: 'Formas de pago',
            abreviatura: 'FP',
            permisos: this.arrayPermisos.find(x => x === 'FormaPagos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/tipo-monedas',
            modulo: 'Tipos de moneda',
            abreviatura: 'TM',
            permisos: this.arrayPermisos.find(x => x === 'TipoMonedas_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/nivel-cargos',
            modulo: 'Niveles de cargos',
            abreviatura: 'NC',
            permisos: this.arrayPermisos.find(x => x === 'NivelCargos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/nivel-educativos',
            modulo: 'Niveles educativos',
            abreviatura: 'NE',
            permisos: this.arrayPermisos.find(x => x === 'NivelEducativos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/jornada-laborales',
            modulo: 'Jornada laboral',
            abreviatura: 'JL',
            permisos: this.arrayPermisos.find(x => x === 'JornadaLaborales_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/terceros',
            modulo: 'Otros terceros',
            abreviatura: 'OT',
            permisos: this.arrayPermisos.find(x => x === 'Terceros_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/tipo-contratos',
            modulo: 'Tipos de contrato',
            abreviatura: 'TC',
            permisos: this.arrayPermisos.find(x => x === 'TipoContratos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/tipo-ausentismos',
            modulo: 'Tipos de ausentismos',
            abreviatura: 'TA',
            permisos: this.arrayPermisos.find(x => x === 'TipoAusentismos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/tipo-periodos',
            modulo: 'Tipos de período',
            abreviatura: 'TP',
            permisos: this.arrayPermisos.find(x => x === 'TipoPeriodos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/grupo-nominas',
            modulo: 'Grupos de nómina',
            abreviatura: 'GN',
            permisos: this.arrayPermisos.find(x => x === 'GrupoNominas_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/tipo-embargos',
            modulo: 'Tipos de embargo',
            abreviatura: 'TE',
            permisos: this.arrayPermisos.find(x => x === 'TipoEmbargos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/tipo-soportes',
            modulo: 'Tipos de soporte',
            abreviatura: 'TS',
            permisos: this.arrayPermisos.find(x => x === 'TipoSoportes_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/entidad-financieras',
            modulo: 'Entidades financieras',
            abreviatura: 'EF',
            permisos: this.arrayPermisos.find(x => x === 'EntidadFinancieras_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/diagnosticos',
            modulo: 'Diagnósticos CIE-10',
            abreviatura: 'DC',
            permisos: this.arrayPermisos.find(x => x === 'DiagnosticoCies_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/beneficios',
            modulo: 'Tipos de beneficios',
            abreviatura: 'TB',
            permisos: this.arrayPermisos.find(x => x === 'TipoBeneficios_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/cargos',
            modulo: 'Cargos',
            abreviatura: 'CA',
            permisos: this.arrayPermisos.find(x => x === 'Cargos_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/dependencias',
            modulo: 'Dependencias',
            abreviatura: 'DE',
            permisos: this.arrayPermisos.find(x => x === 'Dependencias_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/rangos-uvt',
            modulo: 'Rangos UVT',
            abreviatura: 'RU',
            permisos: this.arrayPermisos.find(x => x === 'RangoUvts_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/horas-extras',
            modulo: 'Conceptos horas extras',
            abreviatura: 'HE',
            permisos: this.arrayPermisos.find(x => x === 'TipoHoraExtras_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/categoria-novedades',
            modulo: 'Categorías de novedades',
            abreviatura: 'CN',
            permisos: this.arrayPermisos.find(x => x === 'Novedades_Listar') ? true : false
        });

        this.items.push({
            redirect: '/configuracion/gasto-viajes',
            modulo: 'Conceptos gastos de viaje',
            abreviatura: 'GV',
            permisos: this.arrayPermisos.find(x => x === 'TipoGastoViajes_Listar') ? true : false
        });

        this.limpiarHandle(null);
    }

    limpiarHandle(event): void {
        this.modulo.setValue('');
        this.busquedaItems = [...this.items];
        this.busquedaItems.sort(function (a: ItemDashboard, b: ItemDashboard) {
            if (a.modulo > b.modulo) {
                return 1;
            }
            if (b.modulo > a.modulo) {
                return -1;
            }
            return 0;
        });
    }

    buscarHandle(event): void {
        const array = [];
        this.items.forEach(element => {
            const modulo = element.modulo.toUpperCase();
            if (modulo.includes(this.modulo.value.toUpperCase())) {
                array.push(element);
            }
        });
        this.busquedaItems = [...array];
    }

    get modulo(): AbstractControl {
        return this.form.get('modulo');
    }


    color(i: number): string {
        return this.colors[i % this.colors.length];
    }

}
