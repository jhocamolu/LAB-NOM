import { Component, OnInit, ViewEncapsulation, Inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { MostrarPrenominaService } from './mostrar.service';
import { ClaseConceptoAlcanos } from '@alcanos/constantes/clase-concepto-nomina';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');


@Component({
  selector: 'liquidacion-prenomina-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MostrarPrenominaComponent implements OnInit, OnDestroy {

  detalleFuncionario: any;
  detalleFuncionarioCount: any;
  detalleFuncionarioAgrupados: any;

  totalDevengo: number;
  totalDeducido: number;

  total: number;
  constructor(
    public dialogRef: MatDialogRef<MostrarPrenominaComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    public _service: MostrarPrenominaService
  ) {
    this.totalDevengo = 0;
    this.totalDeducido = 0;
  }

  ngOnInit(): void {
    this._service.getPrenominaDetalle(this.element.nominaFuncionarioId).then((resp) => {
      //ordeno desc los datos por codigo
      let data = resp.value.sort(function (a, b) {
        if (a.conceptoNomina.codigo < b.conceptoNomina.codigo) { return 1; }
        if (a.conceptoNomina.codigo > b.conceptoNomina.codigo) { return -1; }
        return 0;
      });
      
      var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
      // luego ordeno alfabeticamente y luego numericamente 
      data.sort(function(a, b) {
        if(b.conceptoNomina.codigo.includes('DEV') && a.conceptoNomina.codigo.includes('DEV')){
          return collator.compare(a.conceptoNomina.codigo, b.conceptoNomina.codigo)
        }

        if(b.conceptoNomina.codigo.includes('DED') && a.conceptoNomina.codigo.includes('DED')){
          return collator.compare(a.conceptoNomina.codigo, b.conceptoNomina.codigo)
        }

        if(b.conceptoNomina.codigo.includes('CAL') && a.conceptoNomina.codigo.includes('CAL')){
          return collator.compare(a.conceptoNomina.codigo, b.conceptoNomina.codigo)
        }
        
      });


      this.detalleFuncionarioCount = resp['@odata.count'];
      this.detalleFuncionario = data.filter(x => x.valor !== 0 && x.conceptoNomina.conceptoAgrupador === false);
      
      this.detalleFuncionarioAgrupados = data.filter(x => x.valor === 0 || x.conceptoNomina.conceptoAgrupador === true);

      this.detalleFuncionario.forEach(item => {
        const vDevengo = this.devengo(item);
        const vDeducido = this.deducido(item);
        this.totalDeducido += vDeducido ? vDeducido : 0;
        this.totalDevengo += vDevengo ? vDevengo : 0;
        if (Math.abs(this.totalDevengo - this.totalDeducido) === 0) {
          this.total = this.element.netoPagar
        } else {
          this.total = Math.abs(this.totalDevengo - this.totalDeducido)
        }
      });
      this.detalleFuncionarioAgrupados.forEach(item => {
        const vDevengo = this.devengo(item);
        const vDeducido = this.deducido(item);
        this.totalDeducido += vDeducido ? vDeducido : 0;
        this.totalDevengo += vDevengo ? vDevengo : 0;
        if (Math.abs(this.totalDevengo - this.totalDeducido) === 0) {
          this.total = this.element.netoPagar
        } else {
          this.total = Math.abs(this.totalDevengo - this.totalDeducido)
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.detalleFuncionario = null;
    this.detalleFuncionarioCount = 0;
    this.totalDevengo = 0;
    this.totalDeducido = 0;
  }


  devengo(item): number | null {
    if (item.conceptoNomina.claseConceptoNomina == ClaseConceptoAlcanos.devengo) {
      const valor = item.valor;
      return valor;
    }

    return null;
  }

  deducido(item): number | null {
    if (item.conceptoNomina.claseConceptoNomina == ClaseConceptoAlcanos.deduccion) {
      const valor = item.valor;
      return valor;
    }
    return null;
  }

}
