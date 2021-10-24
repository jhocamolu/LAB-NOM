import { Component, ElementRef, Input, Renderer2, ViewEncapsulation } from '@angular/core';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { AlcanosConfigService } from '@alcanos/services/config.service';

@Component({
    selector     : 'navbar',
    templateUrl  : './navbar.component.html',
    styleUrls    : ['./navbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarComponent
{

    alcanosConfig: any; 
    newImage: string; 

    // Private
    _variant: string;

    /**
     * Constructor
     *
     * @param {ElementRef} _elementRef
     * @param {Renderer2} _renderer
     */
    constructor(
        private _elementRef: ElementRef,
        private _renderer: Renderer2,
        private _fuseSidebarService: FuseSidebarService,
        private _alcanosConfigService: AlcanosConfigService
    )
    {
        // Set the private defaults
        this._variant = 'vertical-style-1';
        this.alcanosConfig = this._alcanosConfigService.defaultConfig;
        this.newImage = this.alcanosConfig.alcanos.logoDesp; 

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Variant
     */
    get variant(): string
    {
        return this._variant;
    }

    @Input()
    set variant(value: string)
    {
        // Remove the old class name
        this._renderer.removeClass(this._elementRef.nativeElement, this.variant);

        // Store the variant value
        this._variant = value;

        // Add the new class name
        this._renderer.addClass(this._elementRef.nativeElement, value);
    }

    mouseEnterHover(): void {
        if ( this._fuseSidebarService.getSidebar('navbar').folded ){
            this.newImage = this.alcanosConfig.alcanos.logoDesp; 
        } 
    }
    
    mouseLeaveHover(): void {
        if ( this._fuseSidebarService.getSidebar('navbar').folded ){
            this.newImage = this.alcanosConfig.alcanos.logoMenu; 
        } 
    }

}
