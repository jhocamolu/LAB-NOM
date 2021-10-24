import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FuseSidebarModule, FuseWidgetModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
  MatPaginatorIntl,
  MatBadgeModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatProgressBarModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatMenuModule,
  MatListModule,
  MatStepperModule,
} from '@angular/material';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { ArchivoDispersionComponent } from './crear.component';
import { NominaGuard } from '../nomina.guard';
import { AlcanosConfirmDialogModule } from '@alcanos/components';
import { AlcanosSnackbarModule } from '@alcanos/services';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ArchivoDispersionService } from './archivo-dispersion.service';

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
    component: ArchivoDispersionComponent,
    canActivate: [NominaGuard]
  },
];


@NgModule({
  declarations: [ArchivoDispersionComponent],
  imports: [
    RouterModule.forChild(routes),
    MatMenuModule,
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
    MatAutocompleteModule,
    MatBadgeModule,
    MatListModule,
    CdkStepperModule,
    MatStepperModule,
    MatCheckboxModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    FuseWidgetModule,
    NgxChartsModule,
    //
    AlcanosConfirmDialogModule,
    AlcanosSnackbarModule,
    //
    AlcanosSharedModule

  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
  ],
  entryComponents: [],
})
export class ArchivoDispersionModule { }
