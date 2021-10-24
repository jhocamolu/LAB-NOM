import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'formula-ayuda',
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AyudaComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AyudaComponent>,
  ) {

  }

  ngOnInit(): void {
  }

}
