import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { DashboardService } from './dashboard.service';
import { FuseConfigService } from '@fuse/services/config.service';


@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class DashboardComponent implements OnInit, OnDestroy {
    menu: string;
    submenu: string = '';
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DashboardService} _dashboardService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {MatDialog} _matDialog
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _dashboardService: DashboardService,
        private _fuseSidebarService: FuseSidebarService,
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };


        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.menu = 'inicio'
        this._dashboardService.onFilterChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(menu => {
                this.menu = menu;
            });

        this._dashboardService.onFilterSubChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(menu => {
                this.submenu = menu;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
}
