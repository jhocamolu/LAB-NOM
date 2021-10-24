import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MatRippleModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseSidebarModule } from '@fuse/components';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { MenuComponent } from './sidebars/menu/menu.component';
import { MatAutocompleteModule, MatCardModule, MatDialogModule, MatPaginatorIntl, MatPaginatorModule, MatProgressSpinnerModule, MatSelectModule, MatSortModule, MatTabsModule, MatTooltipModule } from '@angular/material';
import { AvanceService } from './avance/avances.service';
import { CookieService } from 'ngx-cookie-service';
import { AvanceComponent } from './avance/avance.component';

// Convocatorias
import { ListarComponent as ConvocatoriaComponent} from '../convocatorias/listar/listar.component';
import { ListarService as ConvocatoriaService} from '../convocatorias/listar/listar.service';
import { MostrarComponent as ConvocatoriaMostrarComponent} from '../convocatorias/mostrar/mostrar.component';
import { MostrarService as ConvocatoriaMostrarService} from '../convocatorias/mostrar/mostrar.service';

import { ListComponent as EmptyStateComponent} from '@alcanos/components/empty-states/list/list.component';

// Aplicaciones
import { ListarComponent as AplicacionComponent} from '../aplicaciones/listar/listar.component';
import { ListarService as AplicacionService} from '../aplicaciones/listar/listar.service';
import { MostrarComponent as AplicacionMostrarComponent} from '../aplicaciones/mostrar/mostrar.component';
import { MostrarService as AplicacionMostrarService} from '../aplicaciones/mostrar/mostrar.service';
import { DatosBasicosFormComponent } from '../hojas-vida/datos-basicos-form/datos-basicos-form.component';
import { DatosBasicosService } from '../hojas-vida/datos-basicos-form/datos-basicos-form.service';
import { NgxMaskModule } from 'ngx-mask';
import { AlcanosEmptyStatesModule } from '@alcanos/components';
import { GestrorArchivosUploadComponent } from '../gestor-archivos/upload/upload.component';
import { SharedServiceProf } from '@alcanos/services/shared.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginatorEs } from '@material/matpaginatores';

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
        path     : '**',
        component: DashboardComponent,
        resolve:{
            data:DashboardService
        }
    }
];

@NgModule({
    declarations   : [
        AvanceComponent,
        ConvocatoriaMostrarComponent,
        ConvocatoriaComponent,
        
        AplicacionComponent,
        AplicacionMostrarComponent,

        DatosBasicosFormComponent,

        DashboardComponent,
        MenuComponent,
        GestrorArchivosUploadComponent

        // EmptyStateComponent
    ],
    imports        : [
        RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
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
        MatSortModule,
        MatProgressSpinnerModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatTabsModule,
        AlcanosEmptyStatesModule,
        MatDialogModule

        // AvanceModule
    ],
    providers      : [
        DashboardService,
        AvanceService,
        ConvocatoriaService,
        ConvocatoriaMostrarService,

        AplicacionService,
        AplicacionMostrarService,

        DatosBasicosService,
        
        CookieService,
        SharedServiceProf,
        { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
    ],
    entryComponents: [
        GestrorArchivosUploadComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
})
export class DashboardModule
{
}
