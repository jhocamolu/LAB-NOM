import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  socket;

  constructor() { }

  setupSocketConnection(): void {
    this.socket = io(environmentAlcanos.portal);
  }
}
