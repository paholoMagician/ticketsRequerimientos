import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class FormularioRegistroProblemasService {

  public url: string = this.env.apiCMS;

  constructor(private http: HttpClient, public router: Router, private env: Environments) { }

  obtenerMaquinaria( cci: string ) {
    return this.http.get( this.url + 'Maquinaria/obtenerMaquinaria/' + cci );
  }

}
