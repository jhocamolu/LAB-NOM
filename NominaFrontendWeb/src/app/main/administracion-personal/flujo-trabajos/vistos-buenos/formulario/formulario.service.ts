import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

  tab: number;
  id: number;
  onItemChanged: BehaviorSubject<any>;

  // Creao un behavior para la comunicacion de las tabs, en los demas formularios
  tabIndexChanged$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(
    private _httpClient: HttpClient,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {
    this.onItemChanged = new BehaviorSubject(null);
    this.tab = 0;
  }

  //Aqui agrego el numero de tab en la que quiero estar
  setTabSelected(tabIndex : number){
    this.tabIndexChanged$.next(tabIndex);
   } 
   
   // Me devuelve la tab en la que estoy
   getTabSelected() {
    return this.tabIndexChanged$.asObservable();
   }


  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.id = route.params.id ? route.params.id : null;
    this.tab = route.queryParams.tab != null ? route.queryParams.tab : 0;

    this.onItemChanged.next(null);
    const promises = [
    ];
    if (this.id) {
      promises.push(this._getAplicacionExterna(this.id));
    }
    return new Promise((resolve, reject) => {
      Promise.all([
        promises
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private _getAplicacionExterna(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/AplicacionExternas/${id}`)
        .subscribe((response: any) => {
          this.onItemChanged.next(response);
          resolve();
        }, reject);
    });
  }

  /**
   * 
   * @param dato 
   */
  public upsert(dato: any): Promise<any> {
    if (this.id) {
      return this._editar(this.id, dato);
    }
    return this._crear(dato);
  }

  /**      
   * @param dato 
   * @returns {Promise<any>}
   */
  private _crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/AplicacionExternas`,
        dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * @param id 
   * @param dato 
   * @returns {Promise<any>}
   */
  private _editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.nomina}/api/AplicacionExternas/${id}`,
        dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  // Creo esto en servicios, debido a que si cambio algun dato en informacion, pero no le doy guardar y paso a otra pestaña
  // lo que realice aqui no se pierda y se guarde junto a los datos de la otra pestaña
  // guardarHandleService(event,element?): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const formValue = element;      
  //     this.upsert(formValue)
  //     .then((resp) => {
  //       this._alcanosSnackBar.snackbar({ clase: 'exito' })
  //       resolve(resp)
  //     }
  //     ).catch((resp: HttpErrorResponse) => {
  //       this._alcanosSnackBar.snackbar({
  //         clase: 'error',
  //         mensaje: resp.status === 400 ? 'Se ha presentado un error al procesar el formulario.' : null,
  //       });
  //       let error = resp.error;
  //       if (typeof resp.error === 'string') {
  //         error = JSON.parse(resp.error);
  //       }

  //       if (resp.status === 400 && 'errors' in error) {
  //         console.log('nombre' in error.errors)
  //         if ('nombre' in error.errors) {
  //           console.log(0)
  //           const errores = {};
  //           error.errors.nombre.forEach(element => {
  //             errores[element] = true;
  //           });
  //           element.get('nombre').setErrors(errores);
  //         }

  //         if ('codigo' in error.errors) {
  //           const errores = {};
  //           error.errors.codigo.forEach(element => {
  //             errores[element] = true;
  //           });
  //           element.get('codigo').setErrors(errores);
  //         }

  //         if ('revisa' in error.errors) {
  //           const errores = {};
  //           error.errors.revisa.forEach(element => {
  //             errores[element] = true;
  //           });
  //           element.get('revisa').setErrors(errores);
  //         }

  //         if ('aprueba' in error.errors) {
  //           const errores = {};
  //           error.errors.aprueba.forEach(element => {
  //             errores[element] = true;
  //           });
  //           element.get('aprueba').setErrors(errores);
  //         }

  //         if ('autoriza' in error.errors) {
  //           const errores = {};
  //           error.errors.autoriza.forEach(element => {
  //             errores[element] = true;
  //           });
  //           element.get('autoriza').setErrors(errores);
  //         }

  //         if ('descripcion' in error.errors) {
  //           const errores = {};
  //           error.errors.descripcion.forEach(element => {
  //             errores[element] = true;
  //           });
  //           element.get('descripcion').setErrors(errores);
  //         }

  //         if ('snack' in error.errors) {
  //           let msg = '';
  //           error.errors.snack.forEach(element => {
  //             msg = element;
  //           });
  //           this._alcanosSnackBar.snackbar({
  //             clase: 'error',
  //             mensaje: msg,
  //             time: 3000
  //           });
  //         }

  //       }
  //     });
  //   });
  // }
  guardarHandle(event,element?): void {
    const formValue = element.value;

    this.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
      }
      ).catch((resp: HttpErrorResponse) => {
        this.setTabSelected(0)
        this._alcanosSnackBar.snackbar({
          clase: 'error',
          mensaje: resp.status === 400 ? 'Se ha presentado un error al procesar el formulario.' : null,
        });
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        }

        if (resp.status === 400 && 'errors' in error) {

          if ('nombre' in error.errors) {
            const errores = {};
            error.errors.nombre.forEach(element => {
              errores[element] = true;
            });
            element.get('nombre').setErrors(errores);
          }

          if ('codigo' in error.errors) {
            const errores = {};
            error.errors.codigo.forEach(element => {
              errores[element] = true;
            });
            element.get('codigo').setErrors(errores);
          }

          if ('revisa' in error.errors) {
            const errores = {};
            error.errors.revisa.forEach(element => {
              errores[element] = true;
            });
            element.get('revisa').setErrors(errores);
          }

          if ('aprueba' in error.errors) {
            const errores = {};
            error.errors.aprueba.forEach(element => {
              errores[element] = true;
            });
            element.get('aprueba').setErrors(errores);
          }

          if ('autoriza' in error.errors) {
            const errores = {};
            error.errors.autoriza.forEach(element => {
              errores[element] = true;
            });
            element.get('autoriza').setErrors(errores);
          }

          if ('descripcion' in error.errors) {
            const errores = {};
            error.errors.descripcion.forEach(element => {
              errores[element] = true;
            });
            element.get('descripcion').setErrors(errores);
          }

          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 3000
            });
          }

        }
      });
  }


}
