import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class FormularioRegistroProblemasService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, public router: Router, private env: Environments) { }

  obtenerMaquinaria( cci: string ) {
    return this.http.get( this.urlCms + 'Maquinaria/obtenerMaquinaria/' + cci )
  }

  obtenerAgencias( cci: string, filter: string, codprov: number ) {
    return this.http.get( this.urlCms + 'ClienteAgencia/obtenerAgencias/' + cci + '/' + filter + '/' + codprov );
  }  

  obtenerAsignacionMaquinAgencia(cagencia: string, codcia: string) {
    return this.http.get( this.urlCms + 'MaquinaAgencia/obtenerAsignacionmaquinacliente/' + cagencia + '/' + codcia );
  }

  guardarTicket( model:any [] ) {
    return this.http.post( this.urlHelpDesk + 'TicketResolucion/GuardarTickets', model );
  }

}
