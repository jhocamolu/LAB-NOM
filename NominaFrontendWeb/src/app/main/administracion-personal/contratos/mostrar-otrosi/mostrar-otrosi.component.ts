import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { MatSnackBar } from '@angular/material';
import { merge, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'contratos-mostrar-otrosi',
  templateUrl: './mostrar-otrosi.component.html',
  styleUrls: ['./mostrar-otrosi.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarOtrosiComponent{


  constructor(
    public dialogRef: MatDialogRef<MostrarOtrosiComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
  ) { 
    this.element.sueldo = String(this.element.sueldo).replace(',','.');
  }

 

}
