import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ClientesHelpDeskService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, private env: Environments) { }

  obtenerClientes( ccia:string, tp: any ) {
    return this.http.get( this.urlCms + 'ClienteAgencia/obtenerClientes/' + ccia + '/' + tp );
  }

}
