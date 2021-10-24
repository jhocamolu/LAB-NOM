import { Component, ViewEncapsulation, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface AlcanosDialog {
  mensaje: string;
  clase: 'error' | 'advertencia' | 'exito' | 'informativo';
}


@Component({
  selector: 'alcanos-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlcanosDialogComponent {

  /**
   * Constructor
   *
   * @param {MatDialogRef<FuseConfirmDialogComponent>} dialogRef
   */
  constructor(
    public dialogRef: MatDialogRef<AlcanosDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: AlcanosDialog,
  ) {
    this.element = this.element == null ? { mensaje: '', clase: 'informativo' } : this.element;
  }

}
