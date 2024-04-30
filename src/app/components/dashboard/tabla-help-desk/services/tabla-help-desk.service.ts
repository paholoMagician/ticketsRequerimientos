import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class TablaHelpDeskService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, public router: Router, private env: Environments) { }

  obtenerTickets( codcli: any ) {
    return this.http.get( this.urlHelpDesk + 'TicketResolucion/ObtenerTicket/' + codcli );
  }

  updateTicketsEstado( id:number, estado: number) {
    return this.http.get( this.urlHelpDesk + 'TicketResolucion/ActualizarTicketEstado/' + id + '/' + estado );
  }

}
