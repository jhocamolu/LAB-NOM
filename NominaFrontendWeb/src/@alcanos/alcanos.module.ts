import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { AlCANOS_CONFIG } from './services/config.service';


@NgModule()
export class AlcanosModule {

    constructor(@Optional() @SkipSelf() parentModule: AlcanosModule) {
        if (parentModule) {
            throw new Error('FuseModule is already loaded. Import it in the AppModule only!');
        }
    }

    static forRoot(config): ModuleWithProviders {
        return {
            ngModule: AlcanosModule,
            providers: [
                {
                    provide: AlCANOS_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
