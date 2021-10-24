import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { MatSnackBar } from '@angular/material';
import { merge, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'funcionarios-mostrar-contrato',
  templateUrl: './mostrar-contrato.component.html',
  styleUrls: ['./mostrar-contrato.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarContratoComponent {

  item: any;

  constructor(
    public dialogRef: MatDialogRef<MostrarContratoComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
  ) { 
  }

}
