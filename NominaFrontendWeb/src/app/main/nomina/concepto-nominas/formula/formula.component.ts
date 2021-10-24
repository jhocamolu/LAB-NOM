import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, Input, AfterViewInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { FuncionComponent } from './funcion/funcion.component';
import { ConceptoComponent } from './concepto/concepto.component';
import { CondicionComponent } from './condicion/condicion.component';
import { FormulaService } from './formula.service';
import { AyudaComponent } from './ayuda/ayuda.component';
import { NumeroComponent } from './numero/numero.component';
import { ProbarComponent } from './probar/probar.component';

@Component({
  selector: 'concepto-nomina-formula',
  templateUrl: './formula.component.html',
  styleUrls: ['./formula.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormulaComponent implements OnInit, AfterViewInit {

  // tslint:disable-next-line: no-input-rename
  @Input('concepto-nomina') concentoNomina: any;
  @ViewChild('editor', { static: true }) editor: ElementRef;
  submit: boolean;

  numeros = '1234567890.';
  operadores = '+-*/%';
  agrupador = '()';

  esNumero = false;

  constructor(
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _service: FormulaService,
  ) {
    this.submit = false;
  }

  ngOnInit(): void {
    this._service.init(this.concentoNomina);
  }

  ngAfterViewInit(): void {

    if (this.hasFormula) {
      const htmlObject = document.createElement('div');
      htmlObject.innerHTML = this.concentoNomina.formula;
      const root: any = htmlObject.firstChild;
      this.editor.nativeElement.innerHTML = root.innerHTML;

      this.editor.nativeElement.childNodes.forEach(element => {
        element.addEventListener('click', () => { this.clickElement(element); });
      });

    }

  }


  get hasFormula(): boolean {
    return this.concentoNomina.formula != null &&
      this.concentoNomina.formula.trim().length > 0;
  }

  ayudaHandle(event): void {
    const dialogRef = this._matDialog.open(AyudaComponent, {
      disableClose: false,
      panelClass: 'ayuda-formula-dialog',
      data: null
    });
    dialogRef.afterClosed().subscribe(element => {
    });

  }


  probarHandle(event): void {
    const formValue = {
      id: this.concentoNomina.id,
      formula: `<div>${this.editor.nativeElement.innerHTML}</div>`
    };
    this._service.verificar(this.concentoNomina.id, formValue)
      .then(resp => {
        this._probar(this.editor.nativeElement.innerHTML);
      })
      .catch(resp => {
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400 && 'errors' in resp.error) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
          if ('formula' in resp.error.errors) {
            mensaje = resp.error.errors.formula;
          }
        }
        this._matSnackBar.open(mensaje, 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      });
  }


  private _probar(html: string): void {
    const dialogRef = this._matDialog.open(ProbarComponent, {
      disableClose: false,
      panelClass: 'probar-formula-dialog',
      data: html
    });
    dialogRef.afterClosed().subscribe(element => {
    });

  }

  guardarHandle(event): void {
    const formValue = {
      id: this.concentoNomina.id,
      formula: `<div>${this.editor.nativeElement.innerHTML}</div>`
    };
    this.submit = true;
    this._service.editar(this.concentoNomina.id, formValue)
      .then(resp => {
        this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
        this.submit = false;
      })
      .catch(resp => {
        this.submit = false;
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400 && 'errors' in resp.error) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
          if ('formula' in resp.error.errors) {
            mensaje = resp.error.errors.formula;
          }
        }

        this._matSnackBar.open(mensaje, 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['error-snackbar'],
        });

      });
  }


  private _numeroHandle(element: HTMLElement): void {

    const dialogRef = this._matDialog.open(NumeroComponent, {
      disableClose: false,
      panelClass: 'numero-dialog',
      data: element.getAttribute('valor')
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        const root = this.editor.nativeElement;
        const f = [];
        for (let index = 0; index < root.childNodes.length; index++) {
          const child = root.childNodes.item(index);
          if (child.getAttribute('id') === element.getAttribute('id')) {
            child.setAttribute('valor', value);
            child.innerText = value;
          }
          f.push(child);
        }
        this.editor.nativeElement.innerHTML = '';
        for (let index = 0; index < f.length; index++) {
          this.editor.nativeElement.appendChild(f[index]);
        }
        this._setEndOfContenteditable(this.editor.nativeElement);

      }
    });


  }

  conceptoHandle(event): void {
    if (window.getSelection() && window.getSelection().rangeCount > 0) {
      const range = window.getSelection().getRangeAt(0);
      const dialogRef = this._matDialog.open(ConceptoComponent, {
        disableClose: false,
        panelClass: 'concepto-dialog',
        data: null
      });
      dialogRef.afterClosed().subscribe(element => {
        if (element) {
          const child = this._createElement('concepto', element.id, element.nombre);
          this._insertNodeOverSelection(child, this.editor.nativeElement, range);
          this._setEndOfContenteditable(this.editor.nativeElement);
        }
      });
    }

  }

  funcionHandle(event): void {
    if (window.getSelection() && window.getSelection().rangeCount > 0) {
      const range = window.getSelection().getRangeAt(0);
      const dialogRef = this._matDialog.open(FuncionComponent, {
        disableClose: false,
        panelClass: 'funcion-dialog',
        data: null
      });

      dialogRef.afterClosed().subscribe(element => {
        if (element) {
          const child = this._createElement('funcion', element.id, element.nombre);
          this._insertNodeOverSelection(child, this.editor.nativeElement, range);
          this._setEndOfContenteditable(this.editor.nativeElement);
        }
      });
    }

  }

  condicionHandle(event): void {
    if (window.getSelection() && window.getSelection().rangeCount > 0) {
      const range = window.getSelection().getRangeAt(0);
      const dialogRef = this._matDialog.open(CondicionComponent, {
        disableClose: false,
        panelClass: 'condicion-dialog',
        data: null
      });
      dialogRef.afterClosed().subscribe(value => {
        if (value) {
          // condicion
          const condicion = document.createElement('span');
          condicion.innerHTML = value.condicion.nativeElement.innerHTML;
          condicion.setAttribute('data', 'condicion');
          // valor verdadero
          const verdadero = document.createElement('span');
          verdadero.innerHTML = value.verdadero.nativeElement.innerHTML;
          verdadero.setAttribute('data', 'verdadero');
          // valor falso
          const falso = document.createElement('span');
          falso.innerHTML = value.falso.nativeElement.innerHTML;
          falso.setAttribute('data', 'falso');
          // contenedor
          const contenedor = document.createElement('span');
          contenedor.id = `${new Date().getTime()}`;
          contenedor.className = 'condicional';
          contenedor.contentEditable = 'false';
          contenedor.setAttribute('data', 'condicional');
          contenedor.addEventListener('click', () => { this.clickElement(contenedor); });
          contenedor.appendChild(document.createTextNode('SI['));
          contenedor.appendChild(condicion);
          contenedor.appendChild(document.createTextNode(';'));
          contenedor.appendChild(verdadero);
          contenedor.appendChild(document.createTextNode(';'));
          contenedor.appendChild(falso);
          contenedor.appendChild(document.createTextNode(']'));
          this._insertNodeOverSelection(contenedor, this.editor.nativeElement, range);
          this._setEndOfContenteditable(this.editor.nativeElement);
        }
      });
    }
  }

  private _condicionHandle(element: HTMLElement): void {
    const dialogRef = this._matDialog.open(CondicionComponent, {
      disableClose: false,
      panelClass: 'condicion-dialog',
      data: {
        condicion: element.querySelector('span[data="condicion"]').innerHTML,
        verdadero: element.querySelector('span[data="verdadero"]').innerHTML,
        falso: element.querySelector('span[data="falso"]').innerHTML,
      }
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        const root = this.editor.nativeElement;
        const f = [];
        for (let index = 0; index < root.childNodes.length; index++) {
          const child = root.childNodes.item(index);
          if (child.getAttribute('id') === element.getAttribute('id')) {
            // condicion
            const condicion = document.createElement('span');
            condicion.innerHTML = value.condicion.nativeElement.innerHTML;
            condicion.setAttribute('data', 'condicion');
            // valor verdadero
            const verdadero = document.createElement('span');
            verdadero.innerHTML = value.verdadero.nativeElement.innerHTML;
            verdadero.setAttribute('data', 'verdadero');
            // valor falso
            const falso = document.createElement('span');
            falso.innerHTML = value.falso.nativeElement.innerHTML;
            falso.setAttribute('data', 'falso');
            // contenedor
            child.innerHTML = '';
            child.appendChild(document.createTextNode('SI['));
            child.appendChild(condicion);
            child.appendChild(document.createTextNode(';'));
            child.appendChild(verdadero);
            child.appendChild(document.createTextNode(';'));
            child.appendChild(falso);
            child.appendChild(document.createTextNode(']'));
          }
          f.push(child);
        }
        this.editor.nativeElement.innerHTML = '';
        for (let index = 0; index < f.length; index++) {
          this.editor.nativeElement.appendChild(f[index]);
        }
        this._setEndOfContenteditable(this.editor.nativeElement);

      }
    });

  }

  clickElement = (element: HTMLElement) => {

    if (element.getAttribute('data') === 'numero') {
      this._numeroHandle(element);
    }

    if (element.getAttribute('data') === 'condicional') {
      this._condicionHandle(element);
    }

  }

  private _createElement(clase: string, valor: string, texto: string, editable: 'true' | 'false' = 'false'): HTMLElement {
    const child = document.createElement('span');
    child.id = `${new Date().getTime()}`;
    child.className = clase;
    child.innerText = texto;
    child.contentEditable = editable;
    child.setAttribute('data', clase);
    child.setAttribute('valor', valor);

    child.addEventListener('click', () => { this.clickElement(child); });
    return child;
  }

  private _setEndOfContenteditable(contentEditableElement): void {
    if (document.createRange) {
      const range = document.createRange();
      range.selectNodeContents(contentEditableElement);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  private _isOrContainsNode(ancestor, descendant): boolean {
    let node = descendant;
    while (node) {
      if (node === ancestor) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  private _insertNodeOverSelection(node, containerNode, range: Range): void {
    if (this._isOrContainsNode(containerNode, range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(node);
    } else {
      containerNode.appendChild(node);
    }
  }


  keydownHandle(event: KeyboardEvent): void {
    if (window.getSelection() && window.getSelection().rangeCount > 0) {
      if ('Ff'.includes(event.key)) {
        this.funcionHandle(null);
        return;
      }
      if ('Cc'.includes(event.key)) {
        this.conceptoHandle(null);
        return;
      }
      if ('Ii'.includes(event.key)) {
        this.condicionHandle(null);
        return;
      }


      const range = window.getSelection().getRangeAt(0);

      if (this.operadores.includes(event.key)) {
        const child = this._createElement('operador', event.key, event.key);
        this.editor.nativeElement.focus();
        this._insertNodeOverSelection(child, this.editor.nativeElement, range);
        this._setEndOfContenteditable(this.editor.nativeElement);
        event.preventDefault();

      }
      if (this.agrupador.includes(event.key)) {
        const child = this._createElement('agrupador', event.key, event.key);
        this.editor.nativeElement.focus();
        this._insertNodeOverSelection(child, this.editor.nativeElement, range);
        this._setEndOfContenteditable(this.editor.nativeElement);
        event.preventDefault();
      }



      if (event.key === 'Backspace'
        || event.key === 'ArrowLeft'
        || event.key === 'ArrowRight'
        || event.key === 'Shift') {
      } else {

        if (this.numeros.includes(event.key)) {
          this.esNumero = true;
        } else {
          this.esNumero = false;
        }

        if (this.esNumero === false) {
          // debugger;
          const root = this.editor.nativeElement;
          const f = [];
          for (let index = 0; index < root.childNodes.length; index++) {
            let element = root.childNodes.item(index);
            if (element.nodeType === Node.TEXT_NODE) {
              if (element.data.trim().length > 0) {
                if (new RegExp(`^[0-9]+([.][0-9]+)?$`).test(element.data)) {
                  const child = this._createElement('numero', element.data, element.data);
                  element = child;
                } else {
                  this._matSnackBar.open('No es un numero valido.', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 3000,
                    panelClass: ['error-snackbar'],
                  });
                }
              } else {
                element = null;
              }
            }
            if (element) {
              f.push(element);
            }

          }
          this.editor.nativeElement.innerHTML = '';
          for (let index = 0; index < f.length; index++) {
            this.editor.nativeElement.appendChild(f[index]);
          }
          this._setEndOfContenteditable(this.editor.nativeElement);
          event.preventDefault();
        }
      }

    } else {
      event.preventDefault();
    }

  }




}
