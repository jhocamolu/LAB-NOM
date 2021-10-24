import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'jornada-laboral-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<MostrarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
  ) {

  }

  ngOnInit(): void {
  }

}
