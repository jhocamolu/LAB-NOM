import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { HomeService } from './home.service';

interface ItemAyuda {
    catagoriaPadre: any;
    listaCategias: any[];
    listaArticulos: any[];
}
@Component({
    selector: 'app-ayuda-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
    categoriaOnly: any[] = [];
    categoriaAll: ItemAyuda[] = [];
    estado: boolean;
    estaOcultoSpinner: boolean;
    noContenido: boolean;
    inputValue: string;

    @Output() emitCategoria = new EventEmitter();
    @Output() emitArticulo = new EventEmitter();

    constructor(public _service: HomeService) {
        this.estado = true;
        this.inputValue = '';
    }

    ngOnInit(): void {
        this.estaOcultoSpinner = false;
        this.homeCategoria();
    }

    public emitirCategoria(event, categoria): void {
        this.emitCategoria.emit(categoria);
    }

    public emitirArticulo(event, articulo): void {
        this.emitArticulo.emit(articulo);
    }

    public homeCategoria(): void {
        this.estaOcultoSpinner = true;
        this._service.getHome().then(
            (resp: any[]) => {
                this.estaOcultoSpinner = false;
                resp.forEach((item) => {
                    const itemAyuda: ItemAyuda = {
                        catagoriaPadre: item,
                        listaCategias: [],
                        listaArticulos: []
                    };
                    this.estaOcultoSpinner = true;
                    this._service.getAll(item.id).then((resp) => {
                        resp[0].forEach(element => {
                            itemAyuda.listaArticulos.push({
                                idCategoria: item.id,
                                id: element.id,
                                titulo: element.titulo,
                                categoriaId: element.categoriaId,
                            });
                        });
                        resp[1].forEach(element => {
                            itemAyuda.listaCategias.push({
                                idCategoria: item.id,
                                id: element.id,
                                nombre: element.nombre,
                                categoriaId: element.categoriaId,
                            });
                        });
                        this.categoriaAll.push(itemAyuda);
                        this.estaOcultoSpinner = false;
                    });
                });

            }
        );
    }


    onSearchChange(event): void {
        if (this.inputValue != null && this.inputValue.trim().length > 0) {
            this.estaOcultoSpinner = true;
            this.estado = false;
            this.noContenido = false;
            this._service.getBuscar(this.inputValue).then((resp) => {
                this.estaOcultoSpinner = false;
                this.categoriaOnly = resp;
                if (this.categoriaOnly.length === 0) {
                    this.noContenido = true;
                }
            }
            );
        } else {
            this.estado = true;
        }
    }

    limpiarHandle(event: string): void {
        this.estado = true;
        this.noContenido = false;
        this.inputValue = '';
    }


}
