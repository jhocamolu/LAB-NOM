import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VentanaComponent } from '../ventana/ventana.component';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-ayuda-boton',
  templateUrl: './buttom.component.html',
  styleUrls: ['./buttom.component.scss']
})
export class ButtomComponent implements OnInit {

  constructor(
    private _matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }


  filtroHandle(event): void {
    const dialogRef = this._matDialog.open(VentanaComponent, {
      panelClass: 'ayuda-dialog',
      hasBackdrop: true,
    });
    dialogRef.afterClosed().subscribe(result => { });
  }


}
