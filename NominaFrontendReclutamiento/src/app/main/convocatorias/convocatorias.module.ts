import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseSidebarModule } from '@fuse/components';
import { MatCardModule, MatPaginatorIntl, MatPaginatorModule, MatSortModule, MatTooltipModule } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';
import { ListarComponent } from './listar/listar.component';
import { ListarService } from './listar/listar.service';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { CurrencyPipe } from '@angular/common';

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
    // {
    //     path     : '**',
    //     component: ListarComponent,
    //     resolve:{
    //       data: ListarService
    //     },
    //     runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    // }
];

@NgModule({
    declarations   : [
    ],
    imports        : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatTableModule,
        MatToolbarModule,
        MatCardModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        FuseSidebarModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatSortModule
    ],
    providers: [
        { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        ListarService,
        CurrencyPipe
      ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
})
export class ConvocatoriasModule
{
}
