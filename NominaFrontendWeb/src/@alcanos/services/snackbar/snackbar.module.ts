import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material';
import { AlcanosSnackBarService } from './snackbar.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatSnackBarModule,
  ],
  providers: [
    AlcanosSnackBarService,
  ],
})
export class AlcanosSnackbarModule { }
