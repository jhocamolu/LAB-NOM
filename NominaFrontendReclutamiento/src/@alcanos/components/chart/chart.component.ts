import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'alcanos-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class AlcanosChartComponent implements OnInit {

  @ViewChild(BaseChartDirective, { static: true })
  chart: BaseChartDirective;

  @Input()
  title: string;

  @Input()
  footerVisible: boolean;
  @Input()
  footerTitle: string;
  @Input()
  footerValue: string;

  @Input()
  labels: string[] = [];
  @Input()
  data: any[] = [];
  @Input()
  type;

  @Input()
  options: any = {
    responsive: true,
    maintainAspectRatio: false,
  };

  @Output()
  fnHover: EventEmitter<any>;

  @Output()
  fnClick: EventEmitter<any>;


  constructor() {
    this.footerVisible = true;
    this.fnHover = new EventEmitter();
    this.fnClick = new EventEmitter();
  }

  ngOnInit(): void {
  }

  // events on slice click
  chartClicked(e: any): void {
    this.fnClick.emit(e);
  }

  // event on pie chart slice hover
  chartHovered(e: any): void {
    this.fnHover.emit(e);
  }

}
