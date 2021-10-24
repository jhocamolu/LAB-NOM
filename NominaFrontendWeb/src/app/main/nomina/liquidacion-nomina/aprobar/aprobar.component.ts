import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { AprobarService } from './aprobar.service';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosDialogComponent } from '@alcanos/components/dialog/dialog.component';


@Component({
    selector: 'aprobar-graficos',
    templateUrl: './aprobar.component.html',
    styleUrls: ['./aprobar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AprobarComponent implements OnInit {

    estadoLiquidacion = estadoNominaAlcanos;
    widgets: any;
    newEstado: any;
    item: any;
    msWidget7: any;
    disable: boolean = false;
    id: number;
    labelsBar = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    dataBar = [
        {
            label: 'Liquidaciones',
            data: [2500, 1500, 1800, 1500, 900, 2200],
            backgroundColor: [
                'rgba(136,34,160,0.6)',
                '#EF6100',
                '#3FD195',
                '#3DBDD3',
                '#FF7D7D',
                '#FFA124'
            ],
            hoverBackgroundColor: [
                'rgba(136,34,160,1)',
                '#EF6100',
                '#3FD195',
                '#3DBDD3',
                '#FF7D7D',
                '#FFA124'
            ],
        },
    ];
    barFooterTitle: any;
    barFooterValue: any;
    optionsBar = {
        responsive: true,
        spanGaps: false,
        legend: {
            display: false,
        },
        maintainAspectRatio: false,
    };

    doughnutFooterTitle: any;
    doughnutFooterValue: any;
    labelsDoughnut = ['Parafiscales', 'Arl', 'Provisiones', 'S. social'];
    dataDoughnut = [
        {
            data: [25, 15, 35, 35],
            backgroundColor: [
                'rgba(136,34,160,0.6)',
                '#EF6100',
                '#3FD195',
                '#3DBDD3',
                '#FF7D7D',
                '#FFA124'
            ],
            hoverBackgroundColor: [
                'rgba(136,34,160,1)',
                '#EF6100',
                '#3FD195',
                '#3DBDD3',
                '#FF7D7D',
                '#FFA124'
            ],
        },
    ];
    constructor(
        private _service: AprobarService,
        private _matDialog: MatDialog,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
    ) {
        this.newEstado = { estado: null };
        this.id = this._service.id;
        this._service.onItemChanged.subscribe(resp => {
            if (resp != null) {
                this.item = resp;
                this._service.getIdNomina(this.item.id).then(resp => {
                    this.newEstado = resp;
                });
            }
        });

        // Sobreescribe los datos de prueba quemados // no borrar
        this._service.onGraphicChanged.subscribe(resp => {
            if (resp != null) {
                //Datos del backend incluyen todo los contenidos del componente #2 en el html Bars
                this.labelsBar = resp.bar.labels;
                this.dataBar = [
                    {
                        label: resp.bar.data.label,
                        data: resp.bar.data.data,
                        backgroundColor: resp.bar.data.backgroundColor,
                        hoverBackgroundColor: resp.bar.data.hoverBackgroundColor,
                    },
                ];
                this.barFooterTitle = resp.bar.footerTitle;
                this.barFooterValue = resp.bar.footerValue;
                if (resp.bar.options != null) {
                    this.optionsBar = resp.bar.options;
                }

                if (resp.bar.labels) {
                    if (this.labelsBar.length === 0) {
                        this.disable = true;
                    }
                }
                // Datos del backend incluyen todo los contenidos del componente #1 en el html Dona grafica doughnut
                // this.labelsDoughnut = resp.doughnut.labels;
                // this.dataDoughnut = [
                //     {
                //         data: resp.doughnut.data.data,
                //         backgroundColor: resp.doughnut.data.backgroundColor,
                //         hoverBackgroundColor: resp.doughnut.data.hoverBackgroundColor,
                //     },
                // ];
                // this.doughnutFooterTitle = resp.doughnut.footerTitle;
                // this.doughnutFooterValue = resp.doughnut.footerValue;
                this.widgets = {
                    'widget1': resp.widget1,
                    'widget2': resp.widget2,
                    'widget3': resp.widget3,
                    'widget4': resp.widget4,
                    'widget5': resp.widget5,
                    'widget6': resp.widget6,
                }

                this.msWidget7 = {
                    'widget7': resp.widget7,
                }
            }
        });

    }

    ngOnInit(): void {
        this._service.getIdNomina(this.id).then(resp => {
            this.newEstado = resp;
        });
    }

    desaprobarHandle(event, element): void {
        const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
            disableClose: false,
            data: {
                mensaje: ` ¿Desea desaprobar la nómina?`,
                clase: 'error',
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this._service.aprobar(element, false).then(() => {
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                    this._router.navigate([`/nomina/liquidacion-nomina/${element}/prenomina`]);

                }).catch((resp: HttpErrorResponse) => {
                    let error = resp.error;
                    if (typeof resp.error === 'string') {
                        error = JSON.parse(resp.error);
                    } else {
                        error = resp.error;
                    }

                    if (resp.status === 400 && 'errors' in error) {
                        if ('snackError' in error.errors) {
                            const errors = {};
                            error.errors.snackError.forEach(element => {
                                this._alcanosSnackBar.snackbar({
                                    clase: 'error',
                                    mensaje: element,
                                    time: 6000
                                });
                            });
                        }
                    }
                });
            }
        });
    }

    aprobarHandle(event, element): void {
        const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
            disableClose: false,
            data: {
                mensaje: ` ¿Desea aprobar la nómina?`,
                clase: 'exito',
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                if (this.msWidget7.widget7.count > 0) {

                    let mensajes = [];
                    this.msWidget7.widget7.dataModal.forEach(element => {
                        mensajes.push(element.mensaje);
                    });

                    const dialogRef2 = this._matDialog.open(AlcanosDialogComponent, {
                        disableClose: false,
                        data: {
                            mensaje: mensajes.join(', '),
                            clase: 'error',
                        }
                    });
                    dialogRef2.afterClosed().subscribe(confirm => {
                        if (confirm) {
                        }
                    });

                } else {
                    this._service.aprobar(element, true).then(() => {
                        this._alcanosSnackBar.snackbar({ clase: 'exito' });
                        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
                        this._router.onSameUrlNavigation = 'reload';
                        this._service.refreshData();
                        this._router.navigate([`/nomina/liquidacion-nomina/${this.id}/aprobar`]);
                    }).catch((resp: HttpErrorResponse) => {
                        let error = resp.error;
                        if (typeof resp.error === 'string') {
                            error = JSON.parse(resp.error);
                        } else {
                            error = resp.error;
                        }

                        if (resp.status === 400 && 'errors' in error) {
                            if ('snackError' in error.errors) {
                                const errors = {};
                                error.errors.snackError.forEach(element => {
                                    this._alcanosSnackBar.snackbar({
                                        clase: 'error',
                                        mensaje: element,
                                        time: 6000
                                    });
                                });
                            }
                        }
                    });
                }
            }
        });

    }

    aplicarHandle(event, element): void {
        this._service.aplicar(element).then(() => {
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
            this._router.routeReuseStrategy.shouldReuseRoute = () => false;
            this._router.onSameUrlNavigation = 'reload';
            this._service.refreshData();
            this._router.navigate([`/nomina/liquidacion-nomina/${this.id}/aprobar`]);
        }).catch((resp: HttpErrorResponse) => {
            let error = resp.error;
            if (typeof resp.error === 'string') {
                error = JSON.parse(resp.error);
            } else {
                error = resp.error;
            }

            if (resp.status === 400 && 'errors' in error) {
                if ('snackError' in error.errors) {
                    const errors = {};
                    error.errors.snackError.forEach(element => {
                        this._alcanosSnackBar.snackbar({
                            clase: 'error',
                            mensaje: element,
                            time: 6000
                        });
                    });
                }
            }
        });
    }

    actualizarHandle(): void {
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
        this._service.refreshData();
        this._router.navigate([`/nomina/liquidacion-nomina/${this.id}/aprobar`]);
    }


}
