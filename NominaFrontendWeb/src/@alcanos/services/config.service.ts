import { Inject, Injectable, InjectionToken } from '@angular/core';
import * as _ from 'lodash';

// Create the injection token for the custom settings
export const AlCANOS_CONFIG = new InjectionToken('alcanosCustomConfig');

@Injectable({
    providedIn: 'root'
})
export class AlcanosConfigService {
    // Private
    private readonly _defaultConfig: any;

    /**
     * Constructor
     *
     * @param _config
     */
    constructor(
        @Inject(AlCANOS_CONFIG) private _config
    ) {
        // Set the default config from the user provided config (from forRoot)
        this._defaultConfig = _config;
    }
    /**
     * Get default config
     *
     * @returns {any}
     */
    get defaultConfig(): any {
        return this._defaultConfig;
    }
}

