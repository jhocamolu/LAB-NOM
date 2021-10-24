import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'annos-trabajo-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      anno: [this.element.anno, [AlcanosValidators.numerico, Validators.min(1000), Validators.max(5000)]]
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  get anno(): AbstractControl {
    return this.form.get('anno');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/annos-trabajo'],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this._router.navigate(
      ['/configuracion/annos-trabajo'],
      {
        queryParams: {
          $filter: toUrlEncoded(this.form.value),
          $top: 5,
          $skip: 0,
        },
        queryParamsHandling: 'merge',
      });
    this.dialogRef.close(this.form.value);

  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }
}
