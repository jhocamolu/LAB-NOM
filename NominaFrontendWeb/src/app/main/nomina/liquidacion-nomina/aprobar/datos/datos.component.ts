import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { MatSort, MatPaginator, PageEvent } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'datos-aprobar',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class DatosComponent implements OnInit {

  model: any[]; 
  title: string; 

  constructor(
    public dialogRef: MatDialogRef<DatosComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
  ) {
    this.title = element.label; 
    this.model = element.dataModal;
  }

  ngOnInit(): void { }

}
