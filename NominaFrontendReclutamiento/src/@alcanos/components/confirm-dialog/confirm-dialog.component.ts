import { Component, ViewEncapsulation, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface AlcanosConfirmDialog {
    mensaje: string;
    clase: 'error' | 'advertencia' | 'exito' | 'informativo';
}


@Component({
    selector: 'alcanos-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlcanosConfirmDialogComponent {

    /**
     * Constructor
     *
     * @param {MatDialogRef<FuseConfirmDialogComponent>} dialogRef
     */
    constructor(
        public dialogRef: MatDialogRef<AlcanosConfirmDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: AlcanosConfirmDialog,
    ) {
        this.element = this.element == null ? { mensaje: '', clase: 'informativo' } : this.element;
    }

}
