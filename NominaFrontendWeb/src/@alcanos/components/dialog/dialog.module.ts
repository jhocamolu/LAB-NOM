import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlcanosDialogComponent } from './dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule, MatButtonModule, MatIconModule } from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material';

@NgModule({
  declarations: [
    AlcanosDialogComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  entryComponents: [
    AlcanosDialogComponent
  ],
})
export class AlcanosDialogModule { }
