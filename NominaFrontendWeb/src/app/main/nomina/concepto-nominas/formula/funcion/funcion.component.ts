import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormulaService } from '../formula.service';

@Component({
  selector: 'formula-funcion',
  templateUrl: './funcion.component.html',
  styleUrls: ['./funcion.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FuncionComponent implements OnInit {


  busquedaItems: any[];

  form: FormGroup;
  items: any[];
  @ViewChild('descripcion', { static: true }) descripcion: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<FuncionComponent>,
    private _formBuilder: FormBuilder,
    private _service: FormulaService
  ) {
    this.form = this._formBuilder.group({
      buscador: [null],
      funcion: [null, Validators.required]
    });
    this.items = [];
    this.busquedaItems = [];
  }

  ngOnInit(): void {
    this._service.onFuncionesChange.subscribe(resp => { this.items = resp; this.busquedaItems = [...this.items]; });
    this.form.get('funcion').valueChanges.subscribe(
      value => {
        const titulo = `<div class="titulo">${value.nombre}</div>`;
        const descripcion = `<div>${value.ayuda}</div>`;
        this.descripcion.nativeElement.innerHTML = titulo + descripcion;
      }
    );
    this.form.get('buscador').valueChanges.subscribe(
      value => {
        if (value !== null) {
          const array = [];
          this.items.forEach(element => {
            const nombre = element.nombre.toUpperCase();
            if (nombre.includes(value.toUpperCase())) {
              array.push(element);
            }
          });
          this.busquedaItems = [...array];
        }
      }
    );
  }


  limpiarHandle(event): void {
    this.form.get('buscador').setValue(null);
    this.busquedaItems = [...this.items];
  }

  agregarHandle(event): void {
    this.dialogRef.close(this.form.value.funcion);
  }


}
