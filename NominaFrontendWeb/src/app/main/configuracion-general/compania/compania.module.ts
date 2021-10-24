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
} from '@angular/material';

import { MostrarComponent } from './mostrar/mostrar.component';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { MostrarService } from './mostrar/mostrar.service';
import { EditarService } from './editar/editar.service';
import { EditarComponent } from './editar/editar.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { CompaniaGuard } from './compania.guard';


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
        path: ':id/editar',
        component: EditarComponent,
        resolve: {
            data: EditarService
        },
        canActivate: [CompaniaGuard]
    },
    {
        path: '**',
        component: MostrarComponent,
        resolve: {
            data: MostrarService
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [CompaniaGuard]
    },
];
@NgModule({
    declarations: [MostrarComponent, EditarComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,

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
        MatBadgeModule,
        MatAutocompleteModule,
        //
        FuseSidebarModule,
        FuseSharedModule,
        //
        AlcanosSharedModule

    ],
    providers: [
        { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        MostrarService
    ],
    entryComponents: [
        MostrarComponent,
        EditarComponent,
    ]
})
export class CompaniaModule { }
