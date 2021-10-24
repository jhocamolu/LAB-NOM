import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'alcanos-empty-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListComponent {

  @Input()
  visible: boolean;

  @Input()
  visibleBtnCreate: boolean;

  @Input()
  labelH1: string;

  @Input()
  labelBtn: string;

  @Input()
  iconBtn: boolean;

  @Output()
  fnCreate: EventEmitter<any>;

  constructor() {
    this.visible = true;
    this.visibleBtnCreate = true;
    this.iconBtn = false; 
    this.fnCreate = new EventEmitter();
  }

  fnCreateHandle(event): void {
    this.fnCreate.emit(event);
  }



}
