import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'alcanos-empty-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FilterComponent {


  @Input()
  visible: boolean;

  @Input()
  visibleBtnClear: boolean;

  @Input()
  visibleBtnFilter: boolean;

  @Output()
  fnClear: EventEmitter<any>;

  @Output()
  fnFilter: EventEmitter<any>;

  constructor() {
    this.visible = true;
    this.visibleBtnClear = true;
    this.visibleBtnFilter = true;
    this.fnClear = new EventEmitter();
    this.fnFilter = new EventEmitter();
  }

  fnClearHandler(event): void {
    this.fnClear.emit(event);
  }

  fnFilterHandler(event): void {
    this.fnFilter.emit(event);
  }

}
