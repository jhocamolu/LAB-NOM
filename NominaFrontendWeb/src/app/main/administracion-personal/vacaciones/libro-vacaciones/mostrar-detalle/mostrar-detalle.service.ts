import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MostrarDetalleService {

  id: number;

  constructor(
    private _httpClient: HttpClient
  ) {

  }

}
