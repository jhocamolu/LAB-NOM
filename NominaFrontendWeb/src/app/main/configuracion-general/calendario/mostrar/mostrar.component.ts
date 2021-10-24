import { Component, OnInit, ViewEncapsulation, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { startOfDay, isSameDay, isSameMonth } from 'date-fns';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';

import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { fuseAnimations } from '@fuse/animations';

import { MostrarService } from './mostrar.service';
import { MatSnackBar } from '@angular/material';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FormularioComponent } from '../formulario/formulario.component';
import * as moment from 'moment';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'calendario-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,

})
export class MostrarComponent implements OnInit {

  locale: string = 'es';
  actions: CalendarEventAction[];
  activeDayIsOpen: boolean;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  dialogRef: any;
  events: CalendarEvent[];
  refresh: Subject<any> = new Subject();
  selectedDay: any;
  view: string;
  viewDate: Date;

  // Permisos
  arrayPermisos: any;


  constructor(
    private _matDialog: MatDialog,
    private _matSnackBar: MatSnackBar,
    private _calendarService: MostrarService,
    private _permisos: PermisosrService,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {
    this.events = [];
    this.view = 'month';
    this.viewDate = new Date();
    this.activeDayIsOpen = true;
    this.selectedDay = { date: startOfDay(new Date()) };
    this.arrayPermisos = this._permisos.permisosStorage('Calendarios_');

    this.actions = [
      {
        label: '<i class="material-icons s-16">edit</i>',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.arrayPermisos.actualizar ? this.editEvent('edit', event) : this.snackSinPermiso();
        }
      },
      {
        label: '<i class="material-icons s-16">delete</i>',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.arrayPermisos.eliminar ? this.deleteEvent(event) : this.snackSinPermiso();
        }
      }
    ];

    /**
     * Get events from service/server
     */
    this.setEvents();
  }

  ngOnInit(): void {

    this._calendarService.onEventsUpdated.subscribe(events => {
      this.setEvents();
      this.refresh.next();
    });
  }

  setEvents(): void {
    this.events = this._calendarService.events.map(item => {
      const fecha = moment(item.fecha).toDate();
      const start = new Date(fecha.setHours(1));
      const end = new Date(fecha.setHours(23));
      return {
        id: item.id,
        start: start,
        end: end,
        title: item.nombre,
        draggable: false,
        allDay: false,
        meta: item,
        actions: this.actions,
      };
    });
  }

  /**
   * Before View Renderer
   *
   * @param {any} header
   * @param {any} body
   */
  beforeMonthViewRender({ header, body }): void {
    /**
     * Get the selected day
     */
    const _selectedDay = body.find((_day) => {
      return _day.date.getTime() === this.selectedDay.date.getTime();
    });

    if (_selectedDay) {
      /**
       * Set selected day style
       * @type {string}
       */
      _selectedDay.cssClass = 'cal-selected';
    }

  }

  snackSinPermiso(): void {
    this._alcanosSnackBar.snackbar({
      clase: 'informativo',
      mensaje: 'No autorizado: sin permisos para realizar esta acción.',
    });
  }

  /**
   * Day clicked
   *
   * @param {MonthViewDay} day
   */
  dayClicked(day: CalendarMonthViewDay): void {
    const date: Date = day.date;
    const events: CalendarEvent[] = day.events;

    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      }
      else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
    this.selectedDay = day;
    this.refresh.next();
  }

  /**
   * Event times changed
   * Event dropped or resized
   *
   * @param {CalendarEvent} event
   * @param {Date} newStart
   * @param {Date} newEnd
   */
  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next(true);
  }

  /**
   * Delete Event
   *
   * @param event
   */
  deleteEvent(event): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._calendarService.deleteEvent(event.id).then(
          (resp) => {
            this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['exito-snackbar'],
            });
            const eventIndex = this.events.indexOf(event);
            this.events.splice(eventIndex, 1);
            this.refresh.next(true);
          }
        );
      }
      this.confirmDialogRef = null;
    });

  }

  /**
   * Edit Event
   *
   * @param {string} action
   * @param {CalendarEvent} event
   */
  editEvent(action: string, event: CalendarEvent): void {
    const eventIndex = this.events.indexOf(event);

    this.dialogRef = this._matDialog.open(FormularioComponent, {
      panelClass: 'event-form-dialog',
      disableClose: true,
      data: {
        event: event,
        action: action
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((item: any) => {
        if (!item) {
          return;
        }
        const fecha = moment(item.fecha).toDate();
        const start = new Date(fecha.setHours(1));
        const end = new Date(fecha.setHours(23));
        const editEvent = {
          id: item.id,
          start: start,
          end: end,
          title: item.nombre,
          draggable: false,
          allDay: false,
          meta: item,
          actions: this.actions,
        };
        this.events[eventIndex] = Object.assign(this.events[eventIndex], editEvent);
        this.refresh.next(true);

      });
  }

  /**
   * Add Event
   */
  addEvent(): void {
    this.dialogRef = this._matDialog.open(FormularioComponent, {
      panelClass: 'event-form-dialog',
      disableClose: true,
      data: {
        action: 'new',
        date: this.selectedDay.date
      }
    });
    this.dialogRef.afterClosed()
      .subscribe((item: any) => {
        if (!item) {
          return;
        }
        const fecha = moment(item.fecha).toDate();
        const start = new Date(fecha.setHours(1));
        const end = new Date(fecha.setHours(23));
        const newEvent = {
          id: item.id,
          start: start,
          end: end,
          title: item.nombre,
          draggable: false,
          allDay: false,
          meta: item,
          actions: this.actions,
        };
        this.events.push(newEvent);
        this.refresh.next(true);
      });
  }




}
