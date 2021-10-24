import { Component, OnInit, Inject, Optional, ViewEncapsulation, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { FuncionComponent } from '../funcion/funcion.component';
import { NumeroComponent } from '../numero/numero.component';
import { ConceptoComponent } from '../concepto/concepto.component';
import { element } from 'protractor';

@Component({
  selector: 'formula-condicion',
  templateUrl: './condicion.component.html',
  styleUrls: ['./condicion.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CondicionComponent implements OnInit, AfterViewInit {


  @ViewChild('condicion', { static: true }) condicion: ElementRef;
  @ViewChild('verdadero', { static: true }) verdadero: ElementRef;
  @ViewChild('falso', { static: true }) falso: ElementRef;

  numeros: string = '1234567890.';
  operadores: string = '+-*/%';
  agrupador: string = '()';

  logicos: string[] = ['<>', '=', '>', '>=', '<', '<=', 'y', 'o', 'Y', 'O'];

  esNumero = false;
  esLogico = false;

  constructor(
    public dialogRef: MatDialogRef<CondicionComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.element != null) {
        this.condicion.nativeElement.innerHTML = this.element.condicion;
        this.verdadero.nativeElement.innerHTML = this.element.verdadero;
        this.falso.nativeElement.innerHTML = this.element.falso;

        this.condicion.nativeElement.childNodes.forEach(element => {
          element.addEventListener('click', () => { this.clickElement(element, this.condicion.nativeElement); });
        });

        this.verdadero.nativeElement.childNodes.forEach(element => {
          element.addEventListener('click', () => { this.clickElement(element, this.verdadero.nativeElement); });
        });

        this.falso.nativeElement.childNodes.forEach(element => {
          element.addEventListener('click', () => { this.clickElement(element, this.falso.nativeElement); });
        });
      }
    });

  }
  agregarHandle(event): void {
    this.dialogRef.close({
      condicion: this.condicion,
      verdadero: this.verdadero,
      falso: this.falso
    });
  }

  isInvalid(): boolean {

    const cNodes = this.condicion.nativeElement.childNodes;
    const vNodes = this.verdadero.nativeElement.childNodes;
    const fNodes = this.falso.nativeElement.childNodes;
    if (cNodes.length > 0 && vNodes.length > 0 && fNodes.length > 0) {
      let c = true; let v = true; let f = true;
      cNodes.forEach(element => {
        if (element.nodeType !== Node.TEXT_NODE) {
          if (this.logicos.includes(element.data)) {
            c = false;
          }
        }
      });
      vNodes.forEach(element => {
        if (element.nodeType !== Node.TEXT_NODE) {
          v = false;
        }
      });
      fNodes.forEach(element => {
        if (element.nodeType !== Node.TEXT_NODE) {
          f = false;
        }
      });
      return (c && v && f);
    }
    return true;
  }

  private _numeroHandle(element: HTMLElement, editor: any): void {

    const dialogRef = this._matDialog.open(NumeroComponent, {
      disableClose: false,
      panelClass: 'numero-dialog',
      data: element.getAttribute('valor')
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        const root = editor;
        const f = [];
        for (let index = 0; index < root.childNodes.length; index++) {
          const child = root.childNodes.item(index);
          if (child.getAttribute('id') === element.getAttribute('id')) {
            child.setAttribute('valor', value);
            child.innerText = value;
          }
          f.push(child);
        }
        editor.innerHTML = '';
        for (let index = 0; index < f.length; index++) {
          editor.appendChild(f[index]);
        }
        this._setEndOfContenteditable(editor);

      }
    });


  }

  conceptoHandle(event, editor: any): void {
    if (window.getSelection() && window.getSelection().rangeCount > 0) {
      const range = window.getSelection().getRangeAt(0);
      const dialogRef = this._matDialog.open(ConceptoComponent, {
        disableClose: false,
        panelClass: 'concepto-dialog',
        data: null
      });
      dialogRef.afterClosed().subscribe(element => {
        if (element) {
          const child = this._createElement(editor, 'concepto', element.id, element.nombre);
          this._insertNodeOverSelection(child, editor, range);
          this._setEndOfContenteditable(editor);
        }
      });
    }

  }

  funcionHandle(event, editor: any): void {
    if (window.getSelection() && window.getSelection().rangeCount > 0) {
      const range = window.getSelection().getRangeAt(0);
      const dialogRef = this._matDialog.open(FuncionComponent, {
        disableClose: false,
        panelClass: 'funcion-dialog',
        data: null
      });

      dialogRef.afterClosed().subscribe(element => {
        if (element) {
          const child = this._createElement(editor, 'funcion', element.id, element.nombre);
          this._insertNodeOverSelection(child, editor, range);
          this._setEndOfContenteditable(editor);
        }
      });
    }

  }

  clickElement = (element: HTMLElement, editor: any) => {
    if (element.getAttribute('data') === 'numero') {
      this._numeroHandle(element, editor);
    }

  }


  private _createElement(editor: any, clase: string, valor: string, texto: string, editable: 'true' | 'false' = 'false'): HTMLElement {
    const child = document.createElement('span');
    child.id = `${new Date().getTime()}`;
    child.className = clase;
    child.innerText = texto;
    child.contentEditable = editable;
    child.setAttribute('data', clase);
    child.setAttribute('valor', valor);
    child.addEventListener('click', () => { this.clickElement(child, editor); });
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


  keydownHandle(event: KeyboardEvent, editor: any): void {

    if (window.getSelection() && window.getSelection().rangeCount > 0) {

      if ('Ff'.includes(event.key)) {
        this.funcionHandle(null, editor);
        return;
      }
      if ('Cc'.includes(event.key)) {
        this.conceptoHandle(null, editor);
        return;
      }


      const range = window.getSelection().getRangeAt(0);


      if (this.operadores.includes(event.key)) {
        const child = this._createElement(editor, 'operador', event.key, event.key);
        editor.focus();
        this._insertNodeOverSelection(child, editor, range);
        this._setEndOfContenteditable(editor);
        event.preventDefault();

      }
      if (this.agrupador.includes(event.key)) {
        const child = this._createElement(editor, 'agrupador', event.key, event.key);
        editor.focus();
        this._insertNodeOverSelection(child, editor, range);
        this._setEndOfContenteditable(editor);
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


        if (editor === this.condicion.nativeElement) {

          if (this.logicos.includes(event.key)) {
            this.esLogico = true;
          } else {
            this.esLogico = false;
          }
        }


        if (this.esNumero === false && this.esLogico === false) {
          const root = editor;
          const f = [];
          for (let index = 0; index < root.childNodes.length; index++) {
            let element = root.childNodes.item(index);
            if (element.nodeType === Node.TEXT_NODE) {
              if (element.data.trim().length > 0) {
                if (new RegExp(`^[0-9]+([.][0-9]+)?$`).test(element.data)) {
                  const child = this._createElement(editor, 'numero', element.data, element.data);
                  element = child;
                } else if (this.logicos.includes(element.data)) {
                  const child = this._createElement(editor, 'operador', element.data.toUpperCase(), element.data.toUpperCase());
                  element = child;
                } else {
                  this._matSnackBar.open('No es un valor válido.', 'Aceptar', {
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
          editor.innerHTML = '';
          for (let index = 0; index < f.length; index++) {
            editor.appendChild(f[index]);
          }
          this._setEndOfContenteditable(editor);
          event.preventDefault();
        }
      }

    } else {
      event.preventDefault();
    }

  }


}
