import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';


@NgModule({
    declarations: [ 
        AlcanosConfirmDialogComponent
    ],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    entryComponents: [
        AlcanosConfirmDialogComponent
    ],
})
export class AlcanosConfirmDialogModule {
}
