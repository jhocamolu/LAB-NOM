import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class DatosBasicosService implements Resolve<any>{

  id: number | null;
  item: any | null;
  onItemChanged: BehaviorSubject<any>;
  onAdvanceChanged: BehaviorSubject<any>;

  //
  onGenerosChanged: BehaviorSubject<any[]>;
  onEstadoCivilesChanged: BehaviorSubject<any[]>;
  onOcupacionesChanged: BehaviorSubject<any[]>;
  onPaisesChanged: BehaviorSubject<any[]>;

  onTipoDocumentosChanged: BehaviorSubject<any[]>;
  onClaseLibretaMilitaresChanged: BehaviorSubject<any[]>;
  onTipoViviendasChanged: BehaviorSubject<any[]>;
  onLicenciasAChanged: BehaviorSubject<any[]>;
  onLicenciasBChanged: BehaviorSubject<any[]>;
  onLicenciasCChanged: BehaviorSubject<any[]>;
  onTipoSangresChanged: BehaviorSubject<any[]>;


  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    public _httpClient: HttpClient
  ) {
    // Set the defaults
    this.onItemChanged = new BehaviorSubject(null);
    this.onAdvanceChanged = new BehaviorSubject(null);

    this.onGenerosChanged = new BehaviorSubject([]);
    this.onEstadoCivilesChanged = new BehaviorSubject([]);
    this.onOcupacionesChanged = new BehaviorSubject([]);
    this.onPaisesChanged = new BehaviorSubject([]);
    this.onTipoDocumentosChanged = new BehaviorSubject([]);
    this.onClaseLibretaMilitaresChanged = new BehaviorSubject([]);
    this.onTipoViviendasChanged = new BehaviorSubject([]);
    this.onClaseLibretaMilitaresChanged = new BehaviorSubject([]);
    this.onLicenciasAChanged = new BehaviorSubject([]);
    this.onLicenciasBChanged = new BehaviorSubject([]);
    this.onLicenciasCChanged = new BehaviorSubject([]);
    this.onTipoSangresChanged = new BehaviorSubject([]);


  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.id = null;
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    const promises = [
      this.getGeneros(),
      this.getEstadosCiviles(),
      this.getOcupaciones(),
      this.getPaises(),
      this.getTipoDocumentos(),
      this.getTipoViviendas(),
      this.getClaseLibretaMilitares(),
      this.getLicenciasA(),
      this.getLicenciasB(),
      this.getLicenciasC(),
      this.getTipoSangres(),
    ];
    if (route.params.id != null) {
      this.id = route.params.id;
      promises.push(this._getAspirante(this.id));
    }
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public _getAspirante(numerdoDocumento: number): Promise<any> {
    const params =
      // tslint:disable-next-line: max-line-length
      `?$expand=tipoDocumento,sexo,EstadoCivil,Ocupacion,divisionPoliticaNivel2Origen($expand=divisionPoliticaNivel1($expand=pais)),divisionPoliticaNivel2ExpedicionDocumento($expand=divisionPoliticaNivel1),divisionPoliticaNivel2Residencia($expand=divisionPoliticaNivel1($expand=pais)),TipoVivienda,ClaseLibretaMilitar,LicenciaConduccionA,LicenciaConduccionB,LicenciaConduccionC,TipoSangre`;
    const url = `${environmentAlcanos.portal}/odata/Custom/_HojaDeVidas/${params}&$filter= numeroDocumento  eq '${numerdoDocumento}'`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.onItemChanged.next(this.item);

        resolve(response);
      }, reject);
    });
  }

  public _getEstudios(data: any, sortOrder = 'fechaCreacion asc', pageNumber = 0, pageSize = 5): Observable<any[]> {
    const params =
      // tslint:disable-next-line: max-line-length
      `?$count=true&$expand=hojaDeVida,nivelEducativo,profesion`;
    const url = `${environmentAlcanos.portal}/odata/Custom/_HojadeVidaEstudios/${params}&$filter= hojaDeVida/numeroDocumento  eq '${data.numeroDocumento}'`;
    return this._httpClient.get<any[]>(url, {
      params: new HttpParams()
      .set('$orderBy', sortOrder)
      .set('$skip', pageNumber.toString())
      .set('$top', pageSize.toString())
    });
  }

  public _getExperiencias(data: any, sortOrder = 'fechaCreacion asc', pageNumber = 0, pageSize = 5): Observable<any[]> {
    const params =
      // tslint:disable-next-line: max-line-length
      `?$count=true&$expand=hojaDeVida`;
    const url = `${environmentAlcanos.portal}/odata/Custom/_HojaDeVidaExperienciaLaborales/${params}&$filter= hojaDeVida/numeroDocumento  eq '${data.numeroDocumento}'`;
    return this._httpClient.get<any[]>(url, {
      params: new HttpParams()
      .set('$orderBy', sortOrder)
      .set('$skip', pageNumber.toString())
      .set('$top', pageSize.toString())
    });
  }

  public _getDocumentos(data: any, sortOrder = 'fechaCreacion asc', pageNumber = 0, pageSize = 5): Observable<any[]> {
    const params =
      // tslint:disable-next-line: max-line-length
      `?$count=true&$expand=hojaDeVida,tipoSoporte`;
    const url = `${environmentAlcanos.portal}/odata/Custom/_HojadeVidaDocumentos/${params}&$filter= hojaDeVida/numeroDocumento  eq '${data.numeroDocumento}'`;
    return this._httpClient.get<any[]>(url, {
      params: new HttpParams()
      .set('$orderBy', sortOrder)
      .set('$skip', pageNumber.toString())
      .set('$top', pageSize.toString())
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getGeneros(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_Sexos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onGenerosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getEstadosCiviles(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_EstadoCiviles?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onEstadoCivilesChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  
  public getOcupaciones(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_Ocupaciones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onOcupacionesChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getPaises(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_Paises?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onPaisesChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @param paisId 
   * @returns {Promise<any>}
   */
  public getDepartamentos(paisId: number): Promise<any> {
    const params = encodeURI(`$filter=paisId eq ${paisId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_DivisionPoliticaNiveles1?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param departamentoId 
   * @returns {Promise<any>}
   */
  public getMunicipios(departamentoId: number): Promise<any> {
    const params = encodeURI(`$filter=divisionPoliticaNivel1Id eq ${departamentoId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_DivisionPoliticaNiveles2?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoDocumentos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_TipoDocumentos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoDocumentosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoViviendas(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_TipoViviendas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoViviendasChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getClaseLibretaMilitares(): Promise<any> {
    const url = `${environmentAlcanos.portal}/odata/Custom/_ClaseLibretaMilitares`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onClaseLibretaMilitaresChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getLicenciasA(): Promise<any> {
    const params = encodeURI(`$filter=clase eq 'A'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_LicenciaConducciones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onLicenciasAChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getLicenciasB(): Promise<any> {
    const params = encodeURI(`$filter=clase eq 'B'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_LicenciaConducciones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onLicenciasBChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getLicenciasC(): Promise<any> {
    const params = encodeURI(`$filter=clase eq 'C'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_LicenciaConducciones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onLicenciasCChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoSangres(): Promise<any> {
    const url = `${environmentAlcanos.portal}/odata/Custom/_TipoSangres`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoSangresChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  public getNivelEducativos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_NivelEducativos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  public getProfesiones(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_Profesiones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  public getTipoSoportes(): Promise<any> {
    const params = encodeURI(`$orderby=nombre`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_TipoSoportes?${params}`;
    return new Promise((resolve, reject) => {
        this._httpClient.get(url).subscribe((response: any) => {
            resolve(response);
        }, reject);
    });
}



  public _editar(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.portal}/reclutamiento/HojaDeVidas/${dato.id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  public _crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.portal}/api/HojaDeVidas`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  public upsert(dato: any): Promise<any> {
    if (dato != null && dato.id != null) {
      return this._editarExperiencia(dato);
    }
    return this._crearExperiencia(dato);
  }

  public upsertEstudios(dato: any): Promise<any> {
    if (dato != null && dato.id != null) {
      return this._editarEstudio(dato);
    }
    return this._crearEstudio(dato);
  }

  private _crearExperiencia(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.portal}/reclutamiento/HojaDeVidaExperienciaLaborales`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _editarExperiencia(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.portal}/reclutamiento/HojaDeVidaExperienciaLaborales/${dato.id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  public _deleteExperiencia(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.delete(`${environmentAlcanos.portal}/reclutamiento/HojaDeVidaExperienciaLaborales/${dato.id}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _crearEstudio(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.portal}/reclutamiento/HojaDeVidaEstudios`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _editarEstudio(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.portal}/reclutamiento/HojaDeVidaEstudios/${dato.id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  public _deleteEstudio(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.delete(`${environmentAlcanos.portal}/reclutamiento/HojaDeVidaEstudios/${dato.id}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  crearDocumento(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
        this._httpClient.post(`${environmentAlcanos.portal}/reclutamiento/HojadeVidaDocumentos`, dato)
            .subscribe((response: any) => {
                resolve(response);
            }, reject);
    });
}

  public _deleteDocumento(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.delete(`${environmentAlcanos.portal}/reclutamiento/HojadeVidaDocumentos/${dato.id}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  upload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environmentAlcanos.gestorArchivos}/bucket/upload`;
    return new Promise((resolve, reject) => {
        this._httpClient.post(url, formData)
            .subscribe((response: any) => {
                resolve(response);
            }, reject);
    });
}

public getAvances(id): Promise<any> {
  const url = `${environmentAlcanos.portal}/odata/Custom/DashboardPortal/${id}`;
  return new Promise((resolve, reject) => {
    this._httpClient.get(url).subscribe((response: any) => {
      this.onAdvanceChanged.next(response.value);
      resolve(response);
    }, reject);
  });
}


}
