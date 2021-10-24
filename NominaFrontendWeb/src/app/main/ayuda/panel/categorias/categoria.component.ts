import { Component, OnInit, Input } from "@angular/core";
import { CategoriasService } from './categorias.service';


@Component({
    selector: 'app-ayuda-categoria',
    templateUrl: './categoria.component.html',
    styleUrls: ['./categoria.component.scss']
})
export class CategoriaComponent implements OnInit {
    categoriaOnly: any[] = [];

    constructor(public _service: CategoriasService) { }

    ngOnInit(): void {
    }
}
