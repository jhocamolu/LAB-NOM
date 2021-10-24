import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'articulos',
        loadChildren: () => import('./articulos/articulos.module').then(mod => mod.ArticulosModule),
    },
    {
        path: 'categorias',
        loadChildren: () => import('./categorias/categorias.module').then(mod => mod.CategoriasModule),
    }
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forChild(routes),
        CommonModule
    ]
})
export class AyudaModule { }
