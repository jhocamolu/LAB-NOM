import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { ListarService } from './listar.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'parametros-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ListarComponent implements OnInit {

  form: FormGroup;
  annovigentes: any[];
  colors: string[] = [
    '#B72974',
    '#FFA124',
    '#066F77',
    '#6232CC',
    '#004693',
    '#EE564C',
    '#602411',
    '#EF6100',
    '#FF7D43',
    '#8822A0',
    '#3DBDD3',
    '#CE7459',
    '#9B193E',
    '#3FD195',
    '#FF7D7D',
    '#9ABF00',
  ];

  // Permisos
  arrayPermisos: any;


  items: any[];
  constructor(
    private _service: ListarService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _permisos: PermisosrService,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {

    this.form = this._formBuilder.group({
      annoVigente: [null, [Validators.required]],
    });

    this.items = this._service.onItemsChanged.value;
    this.arrayPermisos = this._permisos.permisosStorage('ParametroGenerales_');
  }

  ngOnInit(): void {
    this.form.get('annoVigente').disable;

    this._service.getAnnoVigentes().then(resp => {
      this.annovigentes = resp;
      resp.forEach(element => {
        if (element.estado == 'Vigente') {
          this.form.patchValue({
            annoVigente: element.id
          });
          this.form.get('annoVigente').enable;
        }
      });
    });
  }

  navigate(event, item): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    if (this.arrayPermisos.obtener) {
      this._router.navigate([`/configuracion/parametros/${item}/mostrar`], {
        queryParams: {
          $anno: toUrlEncoded(this.form.value),
        }
      });
    } else {
      this._alcanosSnackBar.snackbar({
        clase: 'informativo',
        mensaje: 'No autorizado: sin permisos para realizar esta acción.',
      });
    }
  }

  color(i: number): string {
    return this.colors[i % this.colors.length];
  }

  abrevia(nombre: string): string {
    return nombre.substring(0, 2);
  }
}
