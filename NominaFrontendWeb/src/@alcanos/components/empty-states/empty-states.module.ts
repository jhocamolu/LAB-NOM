import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { FilterComponent } from './filter/filter.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule, MatButtonModule, MatIconModule } from '@angular/material';


@NgModule({
  declarations: [ListComponent, FilterComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    ListComponent,
    FilterComponent
  ]
})
export class AlcanosEmptyStatesModule { }
