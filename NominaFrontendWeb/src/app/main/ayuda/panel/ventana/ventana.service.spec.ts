import { TestBed } from '@angular/core/testing';

import { VentanaService } from './ventana.service';

describe('VentanaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VentanaService = TestBed.get(VentanaService);
    expect(service).toBeTruthy();
  });
});
