import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { SampleComponent } from './sample.component';
import { MatIconModule } from '@angular/material';
import { FuseSidebarModule } from '@fuse/components';

const routes = [
    {
        path: 'sample',
        component: SampleComponent
    }
];

@NgModule({
    declarations: [
        SampleComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        TranslateModule,
        //
        FuseSidebarModule,
        FuseSharedModule,
        MatIconModule
    ],
    exports: [
        SampleComponent
    ]
})

export class SampleModule {
}
