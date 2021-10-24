import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { VentanaService } from './ventana.service';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-ayuda-ventana',
    templateUrl: './ventana.component.html',
    styleUrls: ['./ventana.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class VentanaComponent implements OnInit {

    ventana: string;
    articuloClick: any;
    categoriaOnly: any[] = [];
    categoria: any[] = [];
    articulo: any[] = [];
    articuloOnly: any[] = [];
    estaOcultoSpinner: boolean;

    constructor(
        public dialogRef: MatDialogRef<VentanaComponent>,
        public _service: VentanaService,
    ) {
        this.ventana = '';
    }

    ngOnInit(): void {
        this.estaOcultoSpinner = false;
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
    }

    escuchaEventArticulo(articulo): void {
        this.ventana = 'item';
        this.articuloClick = articulo;
        this.articuloSearch(articulo.id);
    }

    escuchaEventCategoria(categoria): void {
        this.ventana = 'categorias';
        this.categoriaSearch(categoria.id);
    }

    urlHome(): void {
        this.ventana = '';
    }

    public categoriaSearch(item: any): void {
        this.estaOcultoSpinner = true;
        this.ventana = 'categorias';
        this._service.getChildCategoria(item).then((resp) => {
            this.categoria = resp;
        });

        this._service.getListaArticulos(item).then((resp) => {
            this.categoriaOnly = resp;
            this.estaOcultoSpinner = false;
        });
    }

    public articuloSearch(item: any): void {
        this.estaOcultoSpinner = true;
        this.ventana = 'item';
        this._service.getSoloArticulo(item).then((resp) => {
            this.estaOcultoSpinner = false;
            this.articuloOnly = resp;
        });
    }

}
