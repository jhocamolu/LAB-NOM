import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestrorArchivosUploadComponent } from './upload/upload.component';
import { MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    // GestrorArchivosUploadComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule
  ],
  entryComponents: [
    // GestrorArchivosUploadComponent
  ],
})
export class GestorArchivosModule { }
