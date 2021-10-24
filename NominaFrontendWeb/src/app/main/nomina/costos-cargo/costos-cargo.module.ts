import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import {
    MatDialogModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MAT_DATE_LOCALE,
    MatToolbarModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatPaginatorIntl,
    MatAutocompleteModule,
    DateAdapter,
    MAT_DATE_FORMATS,
    MatListModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material';

import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AlcanosSharedModule } from '@alcanos/shared.module';

import { NgxMaskModule } from 'ngx-mask';

import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';
import { ListarService } from './listar/listar.service';
import { CostosCargoGuard } from './costos-cargo.guard'; 


const DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'DD MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'DD MMMM YYYY',
    },
};

const routes: Routes = [
    {
        path: '**',
        component: ListarComponent,
        resolve: {
            data: ListarService
        },
        canActivate: [CostosCargoGuard],
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    },
];

@NgModule({
    declarations: [
        FiltroComponent,
        ListarComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
        MatMenuModule,
        CommonModule,
        MatChipsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatCardModule,
        MatExpansionModule,
        MatTabsModule,
        MatCheckboxModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatDividerModule,
        MatDialogModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatListModule,
        //
        FuseSidebarModule,
        FuseSharedModule,
        //
        AlcanosSharedModule,
        GestorArchivosModule
    ],
    providers: [
        { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        ListarService,
    ],
    entryComponents: [
        FiltroComponent,
    ]
})
export class CostosCargoModule { }
