import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MensajeriaTicketService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, private env: Environments) { }

  enviarMensaje( model:any [] ) {
    return this.http.post( this.urlHelpDesk + 'MensajeriaTicket/GuardarMensajesTicket', model );
  }

  obtenerMensaje( idrequerimineto: number, top: number ) {
    return this.http.get( this.urlHelpDesk + 'MensajeriaTicket/ObtenerMensajesTicket/'+idrequerimineto+'/'+top );
  }

}
