import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';
import { AsignacionListarComponent } from '../asignacion/listar/listar.component';
import { PrenominaListarComponent } from '../prenomina/listar/listar.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'liquidacion-nomina-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  // Permisos
  arrayPermisosFuncionarios: any;
  arrayPermisosNovedades: any;

  @Input()
  item: any;
  
  estadoLiquidacion = estadoNominaAlcanos;

  @Input()
  asignacionListar: AsignacionListarComponent;

  @Input()
  prenominaListar: PrenominaListarComponent;

  @Input()
  nuevoEstado: any;

  constructor(
    private _router: Router,
    private _permisos: PermisosrService,
  ) { 
    // tslint:disable-next-line: max-line-length
    this.arrayPermisosFuncionarios = this._permisos.permisosStorage('NominaFuncionarios_', null, 'NominaFuncionarios_CrearListado', 'NominaFuncionarios_Iniciar', 'NominaFuncionarios_Finalizar', 'NominaFuncionarios_EliminarUno', 'NominaFuncionarios_EliminarFuncionarios', 'NominaFuncionarios_LimpiarNomina');
    this.arrayPermisosNovedades = this._permisos.permisosStorage('NominaFuenteNovedades_');
  }

  ngOnInit(): void {
  }


  seleccionarFuncionarioHandle(event): void {
    if (this.asignacionListar) {
      this.asignacionListar.agregarHandle(event);
    } else {
      this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/asignacion`],
        {
          queryParams: {
            action: 'add'
          },
          queryParamsHandling: 'merge',
        });

    }
  }

  limpiarFuncionarioHandle(event): void {
    if (this.asignacionListar) {
      this.asignacionListar.limpiarNominaHandle(event);
    } else {
      this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/asignacion`],
        {
          queryParams: {
            action: 'clear'
          },
          queryParamsHandling: 'merge',
        });
    }
  }


  calcularNominaHandle(event): void {
    if (this.prenominaListar) {
      this.prenominaListar.calcularHandle(event);
    } else {
      this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/prenomina`],
        {
          queryParams: {
            action: 'calculate'
          },
          queryParamsHandling: 'merge',
        });

    }
  }

  finalizarRegistroHandle(event): void {
    if (this.prenominaListar) {
      this.prenominaListar.finalizarHandle(event);
    } else {
      this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/prenomina`],
        {
          queryParams: {
            action: 'finish'
          },
          queryParamsHandling: 'merge',
        });

    }
  }
}
