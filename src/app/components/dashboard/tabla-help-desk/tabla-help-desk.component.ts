import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { HubConnection, HubConnectionBuilder }         from '@microsoft/signalr';
import { TablaHelpDeskService }                        from './services/tabla-help-desk.service';
import { EncryptService }                              from '../../shared/services/encrypt.service';
import { Environments }                                from 'src/app/environments/environments';
import { jwtDecode }                                   from "jwt-decode";

import Swal from 'sweetalert2'
import { tick } from '@angular/core/testing';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
})

@Component({
  selector: 'app-tabla-help-desk',
  templateUrl: './tabla-help-desk.component.html',
  styleUrls: ['./tabla-help-desk.component.scss']
})

export class TablaHelpDeskComponent implements OnInit, OnChanges {

  @Output() showFormPermission: EventEmitter<any> = new EventEmitter();
  // @Output() emitTicket: EventEmitter<any[]> = new EventEmitter();
  @Input() listenTicket: any;

  
  numberTicket: string = '';
  sub:                   any;
  _cli_view:             boolean = false;
  nameidentifier:        any;
  name:                  any;
  role:                  any;
  authorizationdecision: any;
  exp:                   any;
  iss:                   any;
  aud:                   any;
  codcli:                any;
  head_agen:             any = 'Agencia';
  actionButton:          boolean = true;
  listaTickets:          any = [];

  icon_action: string = 'message';

  private urlHub:        any = this.env.apiHelpDeskSytemh;
  private estadoTickets: HubConnection;

  constructor( private helpdeskserv: TablaHelpDeskService, 
               private ncrypt: EncryptService,
               private env: Environments ) {
    
    this.estadoTickets = new HubConnectionBuilder()
        .withUrl(this.urlHub+'hubs/estadoTickets')
        .build();
        this.estadoTickets.on("SendTicketRequerimiento", (message:any) => {
          this.ticketRequer( message );
        });

  }

  ngOnInit(): void {
    
    this.getToken();
    const xcodcli:any = sessionStorage.getItem('codcli');
    this.obtenerTickets(xcodcli);

    this.estadoTickets.start().then( ()=> {   
      console.log('CONECTADO@!@')
    }).catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DEL TICKET:',e);
    })

  }

  

  ngOnChanges(changes: SimpleChanges): void {
      if(changes) {
        if (this.listenTicket) {
          const xcodcli:any = sessionStorage.getItem('codcli');
          this.obtenerTickets(xcodcli);
        }
      }
  }

  showPermissionsEmit() {
    this.showFormPermission.emit( true );
  } 

  ticketRequer( data:any ) {
    this.listaTickets.filter( (j:any) => {
      if( j.idRequerimiento == data.id ) {
        j.estado = data.estado
        j.colorEstado       = '#5D88F9';
        j.estadoSignificado = 'Leído y esperando respuesta.';
        if(this.role == 'C') {
          j.mssageEstado = 'Atendiendo Ticket...';
        }
      };
    })

  }

  inicializadorHubs() {
    this.estadoTickets.start().then( ()=> {   
    }).catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DEL TICKET:',e);
    })
  }

  getToken() {
    let xtoken:any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
    if (xtokenDecript != null || xtokenDecript != undefined) {
        var decoded:any = jwtDecode(xtokenDecript);
      this.sub                   = decoded["sub"];
      this.nameidentifier        = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.name                  = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      this.role                  = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      this.authorizationdecision = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/authorizationdecision"];
      this.exp                   = decoded["exp"];
      this.iss                   = decoded["iss"];
      this.aud                   = decoded["aud"];
      this.codcli                = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country"];

      if(this.role == 'C') {
        this._cli_view    = false;
        this.actionButton = true;
        this.icon_action  = 'preview';
      }

      else if(this.role == 'A') {
        this._cli_view    = true;
        this.actionButton = false;
        this.icon_action  = 'message';
      }

    } 
  }



  obtenerTickets( xcodcli: string ) {

    this.helpdeskserv.obtenerTickets(xcodcli).subscribe({
      next: (x) => {
        this.listaTickets = x;
        console.table(this.listaTickets);
      }, complete: () => {
        this.listaTickets.filter( (x:any) => {
          x.idRequerimientoPad = '#'+x.tipo +'-'+ x.idRequerimiento.toString().padStart(9,'0');
          if( x.estado == 1 )
          {
            x.colorEstado       = '#B8DEF6';
            x.estadoSignificado = 'Enviado pero no leido aún.';
          }
          else if ( x.estado == 2 )
          {
            x.colorEstado       = '#5D88F9';
            x.estadoSignificado = 'Leído y esperando respuesta.';
          }
          else if ( x.estado == 3 )
          {
            x.colorEstado       = '#31D11B';
            x.estadoSignificado = 'Respondido esperando solución.';
          }
          else if ( x.estado == 4 )
          {
            x.colorEstado       = '#B1F400';
            x.estadoSignificado = 'Solucionado.';
          }
          else if ( x.estado == 5 )
          {
            x.colorEstado       = '#F4E900';
            x.estadoSignificado = 'En solución pero en espera repuestos.';
          }
        })
      }
    })
  }

  obetenerModeloCliente(event:any) {
    this.obtenerTickets(event.codcliente);
  }

  ticketSend:any = [];
  actualizarEstado( id:number, estado:number, idTicket:string, ticket:any ) {
    console.log('*/**/*/***/*/*/*/*/*/*/*/*/*/*/*/*/')
    console.log(ticket)
    console.log('*/**/*/***/*/*/*/*/*/*/*/*/*/*/*/*/')
    this.ticketSend = ticket;
    this.numberTicket = idTicket;
    if ( ticket.estado == 1 ) {
      if(this.role == 'A') {
        this.helpdeskserv.updateTicketsEstado( id, estado ).subscribe({
          next: (x) => {
            Toast.fire({
              icon: "success",
              title: "Estado cambiado a leido"
            });
          }, error: (e) => {
            console.error(e);
            Toast.fire({
              icon:  "error",
              title: "Algo ha ocurrido"
            });
          }
        })
      } else if ( this.role == 'C' ) {
        // this.numberTicket = idTicket;
        /** Para hacer algo mijin */
      }
    }
     
  }

}
