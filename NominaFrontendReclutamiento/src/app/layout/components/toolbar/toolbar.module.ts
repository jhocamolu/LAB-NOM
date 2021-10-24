import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';

import { FuseSearchBarModule, FuseShortcutsModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { ToolbarComponent } from 'app/layout/components/toolbar/toolbar.component';

@NgModule({
    declarations: [
        ToolbarComponent

    ],
    imports     : [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatListModule,
        MatGridListModule,

        FuseSharedModule,
        FuseSearchBarModule,
        FuseShortcutsModule,        
    ],
    exports     : [
        ToolbarComponent,
        MatGridListModule,
        
    ]
})
export class ToolbarModule
{
}
