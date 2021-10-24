import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermisosrService {

  // Se declaran las variables en false, en caso de que no encuentre el permiso
  obtenerPermisos: any = '';
  permisoCrear: boolean = false;
  permisoObtener: boolean = false;
  permisoListar: boolean = false;
  permisoActualizar: boolean = false;
  permisoCambiarEstadoRegistro: boolean = false;
  permisoCambiar: boolean = false;
  permisoEliminar: boolean = false;
  permisoEstado: boolean = false;

  permisoCambiarEstado: boolean = false;
  permisoOperacion1: boolean = false;
  permisoOperacion2: boolean = false;
  permisoOperacion3: boolean = false;
  permisoOperacion4: boolean = false;
  permisoOperacion5: boolean = false;
  permisoOperacion6: boolean = false;
  constructor() { }

  //Se declara el permiso principal como obligatorio y las demas operaciones como opcionales
  public permisosStorage(permiso, estado?, op1?, op2?, op3?, op4?, op5?, op6?) {
    this.obtenerPermisos = '';
    this.permisoCrear = false;
    this.permisoObtener = false;
    this.permisoListar = false;
    this.permisoActualizar = false;
    this.permisoCambiarEstadoRegistro = false;
    this.permisoEliminar = false;
    this.permisoCambiarEstado = false;
    this.permisoEstado = false;
    this.permisoOperacion1 = false;
    this.permisoOperacion2 = false;
    this.permisoOperacion3 = false;
    this.permisoOperacion4 = false;
    this.permisoOperacion5 = false;
    this.permisoOperacion6 = false;
    this.obtenerPermisos = JSON.parse(localStorage.getItem('Permisos')).filter(x => x.includes(permiso));
    if (this.obtenerPermisos.find(x => x === permiso + 'Crear')) {
      this.permisoCrear = true;
    }
    if (this.obtenerPermisos.find(x => x === permiso + 'Obtener')) {
      this.permisoObtener = true;
    }
    if (this.obtenerPermisos.find(x => x === permiso + 'Listar')) {
      this.permisoListar = true;
    }
    if (this.obtenerPermisos.find(x => x === permiso + 'Actualizar')) {
      this.permisoActualizar = true;
    }
    if (this.obtenerPermisos.find(x => x === permiso + 'CambiarEstadoRegistro')) {
      this.permisoCambiarEstadoRegistro = true;
    }
    if (this.obtenerPermisos.find(x => x === permiso + 'Eliminar')) {
      this.permisoEliminar = true;
    }

    if (this.obtenerPermisos.find(x => x === permiso + 'CambiarEstado')) {
      this.permisoCambiarEstado = true;
    }
    
    // Otros permisos --> dejo abierto el contenido a ingresar por si el nombre del estado es abierto
    if (estado && this.obtenerPermisos.find(x => x === estado)) {
      this.permisoCambiarEstado = true;
    }
    if (op1 && this.obtenerPermisos.find(x => x === op1)) {
      this.permisoOperacion1 = true;
    }
    if (op2 && this.obtenerPermisos.find(x => x === op2)) {
      this.permisoOperacion2 = true;
    }
    if (op3 && this.obtenerPermisos.find(x => x === op3)) {
      this.permisoOperacion3 = true;
    }
    if (op4 && this.obtenerPermisos.find(x => x === op4)) {
      this.permisoOperacion4 = true;
    }
    if (op5 && this.obtenerPermisos.find(x => x === op5)) {
      this.permisoOperacion5 = true;
    }
    if (op6 && this.obtenerPermisos.find(x => x === op6)) {
      this.permisoOperacion6 = true;
    }

    const permission = {
      crear: this.permisoCrear,
      obtener: this.permisoObtener,
      listar: this.permisoListar,
      actualizar: this.permisoActualizar,
      estadoRegistro: this.permisoCambiarEstadoRegistro,
      eliminar: this.permisoEliminar,
      cambiarEstado: this.permisoCambiarEstado,
      estado: this.permisoEstado,
      op1: this.permisoOperacion1,
      op2: this.permisoOperacion2,
      op3: this.permisoOperacion3,
      op4: this.permisoOperacion4,
      op5: this.permisoOperacion5,
      op6: this.permisoOperacion6
    };

    return permission;
  }
}
