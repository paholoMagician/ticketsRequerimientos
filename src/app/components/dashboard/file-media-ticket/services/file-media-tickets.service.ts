import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class FileMediaTicketsService {

  public urlHelpDesk: string = this.env.api_server_nodejs;
  constructor( private http: HttpClient, private env: Environments ) { }
  
  getAuthorizationFileMediaTicket( id: any ) {
    return this.http.get( this.urlHelpDesk + "obtener-autorizacion/" + id);
  }

}
