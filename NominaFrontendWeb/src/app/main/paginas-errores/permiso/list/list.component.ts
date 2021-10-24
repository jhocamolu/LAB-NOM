import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'alcanos-page-error',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListComponent implements OnInit {

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
  ngOnInit(): void {
  }

  fnCreateHandle(event): void {
    this.fnCreate.emit(event);
  }



}
