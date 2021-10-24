import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { GrupoDocumentoService } from './grupo-documento.service';

@Component({
  selector: 'firma-grupo-documento',
  templateUrl: './grupo-documento.component.html',
  styleUrls: ['./grupo-documento.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class GrupoDocumentoComponent implements OnInit {


  // tslint:disable-next-line: no-input-rename
  @Input('slug') slug: any;
  item: any | null;

  constructor(
    private _service: GrupoDocumentoService,
  ) { }

  ngOnInit(): void {
    if (this.slug != null) {
      this._service.getGrupoDocumentos(this.slug).then(
        resp => {
          this.item = resp;
        }
      );
    }
  }

}
