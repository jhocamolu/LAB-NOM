import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AlcanosChartComponent } from './chart.component';

@NgModule({
  declarations: [AlcanosChartComponent],
  imports: [
    CommonModule,
    ChartsModule,
    NgxChartsModule,
  ],
  exports: [
    AlcanosChartComponent,
  ]
})
export class AlcanosChartModule { }
