import { FormularioRegistroProblemasService } from '../formulario-registro-problemas/services/formulario-registro-problemas.service';
import { ModalCotizacionComponent } from '../repuestos-asignados/modal-cotizacion/modal-cotizacion/modal-cotizacion.component';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MensajeriaTicketService } from './mensajeria-ticket/services/mensajeria-ticket.service';
import { ModalPreviewComponent } from '../../shared/modal-preview/modal-preview.component';
import { ImagecontrolService } from '../../shared/imagen-control/imagecontrol.service';
import { TablaHelpDeskService }from './services/tabla-help-desk.service';
import { HubConnection, HubConnectionBuilder }from '@microsoft/signalr';
import { EncryptService }from '../../shared/services/encrypt.service';
import { Environments }from 'src/app/environments/environments';
import { MatDialog } from '@angular/material/dialog';
import { jwtDecode } from "jwt-decode";
import { FechasRealesService } from './fecha-real/services/fechas-reales.service';
import { ModalEstadoColorComponent } from '../../shared/modal-estado-color/modal-estado-color.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

import Swal from 'sweetalert2';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
})

@Component({
  selector: 'app-tabla-help-desk',
  templateUrl: './tabla-help-desk.component.html',
  styleUrls: ['./tabla-help-desk.component.scss'],
   animations: [
    trigger('slidePanel', [
      state('visible', style({
        transform: 'translateX(0)',
        display: 'block'
      })),
      state('hidden', style({
        transform: 'translateX(100%)',
        display: 'none'
      })),
      transition('visible <=> hidden', [
        animate('300ms ease-in-out')
      ]),
    ])
  ]
})

export class TablaHelpDeskComponent implements OnInit, OnChanges {

  @ViewChild('audioPlayer') audioPlayer!: ElementRef;  
  @Output() dataUpdateTicketEmit: EventEmitter<any> = new EventEmitter();
  @Output() showFormPermission: EventEmitter<any> = new EventEmitter();
  @Output() ticketAlertEmit: EventEmitter<any> = new EventEmitter();
  @Output() codCliToPanelCliente:EventEmitter<any> = new EventEmitter();
  @Input() listenTicket:        any;
  @Input() listenCodCli:        any;
  @Input() listenTagTicket:     any;

  show_panel_cliente: boolean = false;
  panelState: 'visible' | 'hidden' = 'visible';
  panelHidden = false;
  show_files_cotiza:            boolean = false;
  getFileMediaListen:           any;
  getListaRepuRequer:           any;
  ticketSend:                   any = [];
  numberTicket:                 string = '';
  modelDataSend:                any = [];
  listaTicketPendientes:        any = [];
  _show_order_work:             boolean = true;
  _show_resumen_mantenimiento:  boolean = false;
  _show_file_media_ticket:      boolean = false;
  _show_fecha_real:             boolean = false;
  sub:                          any;
  _cli_view:                    boolean = false;
  nameidentifier:               any;
  name:                         any;
  role:                         any;
  authorizationdecision:        any;
  exp:                          any;
  iss:                          any;
  aud:                          any;
  codcli:                       any;
  head_agen:                    any = 'Agencia';
  actionButton:                 boolean = true;
  listaTickets:                 any = [];
  listaTicketsGhost:            any = [];
  _show_messenger:              boolean = false;
  activeTicketId:               number | null = null;
  icon_action:                  string = 'message';
  listaTicketsNoLeidos:         any = [];
  intervaloModel:               any = [];
  intervaloModelMsj:            any = [];
  idTicketEmit:                 number = 0;
  toggle_maxim:                 boolean  = false;
  widthMessenger:               string   = '40%';
  xcodcli:                      any;
  xccia:                        any;
  urlServer:                    any;
  modelCliente:                 any = [];
  mantenimientosAgregados:      any = [];
  listaTecnicosRecibidos:       any = [];
  listaRepuestosRecibidos:      any = [];
  _show_spinner:                boolean = false;
  showImg:                      boolean = true;
  modelSendRequer:              any = [];
  width_box:                    any = '100%'

  actionMenuTicket: any = [
    {
      description: "Orden de trabajo",
      icon: "receipt",
      codec: "000",
    },
    {
      description: "Fecha real",
      icon: "calendar_month",
      codec: "004"
    },
    {
      description: "Resumen de Mantenimiento",
      icon: "engineering",
      codec: "001"
    },
    {
      description: "Documentación media",
      icon: "perm_media",
      codec: "003"
    }

  ]

  private urlHub:               any = this.env.apiHelpDeskSytemh;
  private estadoTickets:        HubConnection;
  private tecnicoEnviado:       HubConnection;
  private ticketsSendAlertData: HubConnection;
  private cantFileHub:          HubConnection;
  private urlHubK:              any = this.env.apiUrlHub();
  private mensajesHub:          HubConnection;
  private eliminaTecinoSignal:  HubConnection;
  private eliminarFileSignal:   HubConnection;
  playAudio() { 
    this.audioPlayer.nativeElement.play();
  }  

togglePanel() {
    this.panelState = this.panelState === 'visible' ? 'hidden' : 'visible';
  }

  showPanel() {
    this.panelState = 'visible';
  }

  
  constructor(public  dialog: MatDialog,
    private helpdeskserv: TablaHelpDeskService, 
    private mensajeria: MensajeriaTicketService,
    private ncrypt:EncryptService,
    private env: Environments,
    private fileControlServ: ImagecontrolService,
    private form: FormularioRegistroProblemasService,
    private estadoTick:FechasRealesService
  ) {

    this.estadoTickets = new HubConnectionBuilder().withUrl(this.urlHub+'hubs/estadoTickets').build();
    this.estadoTickets.on("SendTicketRequerimiento", (message:any) => {
      this.ticketRequer( message );
    });
    
    this.tecnicoEnviado = new HubConnectionBuilder().withUrl(this.urlHub+'hubs/SendTecnicoAsignado').build();
    this.tecnicoEnviado.on("SendTecnicosHubAsign", (message:any) => {
      this.tecnicoRecibidoTunelHub( message );
    });

    this.mensajesHub = new HubConnectionBuilder().withUrl(this.urlHubK + 'msjHub').build();
    this.mensajesHub.on("SendMessageHub", (message: any, respuesta: any[]) => {
      this.msjTicketSend(message, respuesta);
    });

    this.ticketsSendAlertData = new HubConnectionBuilder().withUrl(this.urlHub+'hubs/SendTicketRequerimientoHub').build();
    this.ticketsSendAlertData.on("SendTicketRequerimientoAlertHub", ( message: any ) => {
      this.ticketsAlertSend( message );
    })

    this.cantFileHub = new HubConnectionBuilder().withUrl(this.urlHub+'hubs/SendfileAlertHubTunel').build();
    this.cantFileHub.on("ReceiveFileAlert", ( message: any ) => {
      this.fileSendHub( message );
    })

    this.eliminaTecinoSignal = new HubConnectionBuilder()
    // La URL del hub debe coincidir con la definida en Program.cs
    .withUrl(this.urlHub + 'hubs/EliminarTecnicoSignalRequer')
    .build();

    this.eliminaTecinoSignal
    // El nombre del método debe coincidir con el método de SignalR en el backend
    .on("EliminacionTecnicoSignal", (tecnico) => {
        this.eliminarTecinoSignal(tecnico);
    });

    this.eliminarFileSignal = new HubConnectionBuilder()
    // La URL del hub debe coincidir con la definida en Program.cs
    .withUrl(this.urlHub + 'hubs/EliminarArchivoRequer')
    .build();

    this.eliminarFileSignal
    // El nombre del método debe coincidir con el método de SignalR en el backend
    .on("FileDeleteSignalHub", (tecnico) => {
        this.eliminarFileSignalHub(tecnico);
    });

  }

  eliminarFileSignalHub(data: any) {  
    this.listaTickets.forEach((ticket: any) => {
      if (ticket.idTicket === data.idTicket) {

        // console.warn('ENCONTRADO!!!');
        // console.warn(ticket);

        if( data.tipo == 'REPTEC' ) {
          ticket.fileRepTec = ticket.fileRepTec - 1;
          if ( ticket.fileRepTec < 0 ) ticket.fileRepTec = 0;
        }

        if( data.tipo == 'COTIZA' ) {
          ticket.fileCotiza = ticket.fileCotiza - 1;
          if ( ticket.fileCotiza < 0 ) ticket.fileCotiza = 0;
        }

        if ( data.tipo == 'NOTENT' ) {
          ticket.fileNotEnt = ticket.fileNotEnt - 1;
          if ( ticket.fileNotEnt < 0 ) ticket.fileNotEnt = 0;
        }

      }
    });  
  }

  eliminarTecinoSignal(data: any) {
    // console.warn('Elimina técnico recibido:', data);
    // console.warn(this.listaTickets);
    this.listaTickets.forEach((ticket: any) => {
      if (ticket.idTicket === data.idTIcket) {
        // console.warn(ticket);
        ticket.tecnicos = ticket.tecnicos.filter((tec: any) => tec.coduser !== data.idTecnico);
      }
    });

  }

  ngOnInit(): void {
    this.xcodcli = sessionStorage.getItem('codcli');
    this.xccia = sessionStorage.getItem('ccia');
    this.getToken();
    this.urlServer = this.env.apiHelpDeskSytemh;
    // Solicitar permisos para notificaciones y suscribir al servicio push
    // this.obtenerTicketsRequerimientos( this.xcodcli );
    this.requestNotificationPermission();
    this.subscribeToPushNotifications();
    this.connectSignalR();
  }

  // En tabla-help-desk.component.ts
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listenCodCli'] && this.listenCodCli) {
      this.codCliToPanelCliente.emit(this.listenCodCli);
      this.obtenerTicketsRequerimientos(this.listenCodCli);

      // Forzar la detección de cambios en el componente de clientes
      setTimeout(() => {
        this.codCliToPanelCliente.emit(this.listenCodCli);
      });
    }

    if (changes['listenTagTicket'] && this.listenTagTicket) {
      this.obtenerTicketsRequerimientos(this.listenCodCli);
    }
  }

  connectSignalR() {

    this.estadoTickets.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DEL TICKET:', e);
    });

    this.ticketsSendAlertData.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DE LA ALERTA DEL TICKET:', e)
    });

    this.mensajesHub.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL MENSAJE DEL TICKET:', e);
    });

    this.tecnicoEnviado.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL TECNICO ASIGNADO:', e);
    });

    this.cantFileHub.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DE LA CANTIFILEHUB ASIGNADO:', e);
    });

    this.eliminaTecinoSignal.start().then(() => {
    // console.log('CONECTADO@! HUB DE ELIMINAR TECNICO')
    }).catch(e => {
        console.error('ALGO HA PASADO CON LA TRANSMISION DE ELIMINAR TECNICO:', e);
    })

    this.eliminarFileSignal.start().then(() => {
    // console.log('CONECTADO@! HUB DE ELIMINAR ARCHIVO')
    }).catch(e => {
        console.error('ALGO HA PASADO CON LA TRANSMISION DE ELIMINAR ARCHIVO:', e);
    })

  }

  fileSendHub( data: any ) {
    this.listaTickets.forEach( (x:any) => {
      if ( x.idTicket == data.idTicket ) {
        x.fileRepTec = x.fileRepTec + data.ffileRepTec;
        x.fileCotiza = x.fileCotiza + data.fileCotiza;
        x.fileNotEnt = x.fileNotEnt + data.fileNotEnt;
      }
    })
  }

  tecnicoRecibidoTunelHub( data: any ) {
    this.listaTickets.filter( (x:any) => {
      if ( x.idTicket == data.idTicket ) {
        x.tecnicos.unshift( data );
      }
    });
  }

  deleteRequer( idRequer: number, index: number ) {
    Swal.fire({
      title:              "Estás seguro?",
      text:               "Esta acción es irreversible!",
      icon:               "warning",
      showCancelButton:   true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor:  "#d33",
      confirmButtonText:  "Sí, elimar requerimiento!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.helpdeskserv.eliminarTicketsProceso( idRequer ).subscribe({
          next: (x) => {
            Swal.fire({
              title: "Eliminado!",
              text: "requerimiento ha sido eliminado.",
              icon: "success"
            });
          }, error: (e) => {
            console.error(e);
            Toast.fire({
              text: "No hemos podido eliminar este requerimiento.",
              icon: "error"
            });
          }, complete: () => this.listaTickets.splice( index, 1 ),
        })
      }
    });
  }

  openDataEstadosTicketsInformation(data:any) {
    const dialogRef = this.dialog.open( ModalEstadoColorComponent, {
      height: '500px',
      width:  '280px',
      data:   data
    });
    dialogRef.afterClosed().subscribe((result: any) => {});
  }
  
  openDataEquiposDialog(data:any) {
    const dialogRef = this.dialog.open( ModalPreviewComponent, {
      height: '100%',
      width:  'auto',
      data:   data
    });
    dialogRef.afterClosed().subscribe((result: any) => {});
  }
  
  openDataRepuestosDialog(idTicket: number, type: string) {
    const dialogRef = this.dialog.open( ModalCotizacionComponent, {
      height: '95%',
      width:  '70%',
      data:   {idRequerimiento:idTicket, type: type}  
    });
    dialogRef.afterClosed().subscribe((result: any) => {});
  }

  getDataCotizaFileMedia = (event:any) => this.getFileMediaListen = event;

  getDataCotizaRepuRequer = (event:any) => this.getDataCotizaRepuRequer = event;

  _expand_messenger() {
    if ( this.toggle_maxim ) {
      this.toggle_maxim = false;
      this.widthMessenger = '40%'
    } else {
      this.toggle_maxim = true;
      this.widthMessenger = '100%'
    }
  }

  getAppSearch( codec: string, data:any ) {
    if ( codec == '001' ) {
      this._show_order_work            = false;
      this._show_fecha_real            = false;
      this._show_resumen_mantenimiento = true;
      this.modelSendRequer             = data;
      this._show_file_media_ticket     = false;
      this.showImg = false;
    } else if ( codec == '002' ) {
      this._show_order_work            = false;
      this._show_fecha_real            = false;
      this._show_resumen_mantenimiento = false;
      this.modelSendRequer             = data;
      this._show_file_media_ticket     = false;
      this.showImg = false;
    } else if ( codec == '003' ) {
      this._show_order_work            = false;
      this._show_fecha_real            = false;
      this.modelSendRequer             = data;
      this._show_resumen_mantenimiento = false;
      this._show_file_media_ticket     = true;
      this.showImg = false;
    } else if ( codec == '004' ) {
      this._show_order_work            = false;
      this._show_fecha_real            = true;
      this.modelSendRequer             = data;
      this._show_resumen_mantenimiento = false;
      this._show_file_media_ticket     = false;
      this.showImg = false;
    } else if ( codec == '000' ) {
      this._show_fecha_real            = false;
      this._show_resumen_mantenimiento = false;
      this._show_order_work            = true;
      this.showImg = true;
      this.modelSendRequer             = data;
      this._show_file_media_ticket     = false;      
    }
  }

  getStatusFReal(event: any) {
    if ( event ) this.getAppSearch( '000', null );
  }
 
  subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(this.env.VAPID_PUBLIC_KEY)
          }
        ).then().catch( (error) => {
          console.error('Failed to subscribe to push notifications:', error);
        });
      });
    } 
  }

  // Método para convertir la clave VAPID a Uint8Array
  urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Solicitar permisos de notificación al usuario
  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // // console.log('Permiso para notificaciones concedido.');
        }
      });
    }
  }
  
  ticketsAlertSend(message: any) {
    this.listaTicketPendientes.unshift( message );
    this.listaTicketPendientes = this.listaTicketPendientes.filter( (m:any) => {
      m.codRequerimiento = m.idRequerimiento.toString().padStart(9, '0')
    })
    if ( 'Notification' in window && Notification.permission === 'granted' ) {
      this.showNotification(message);
    }
  }

  irTransmitirTicket = (data:any) => this.ticketAlertEmit.emit(data);

  // Método para mostrar notificaciones
  showNotification(data: any) {
    
    const options = {
      body: `Tipo: ${data.tipo}\nEstado: ${data.estado}\nMáquina: ${data.codMaquina}\nProblema: ${data.mensaje}`,
      icon: 'assets/icono-notificacion.png',  // Ruta a un ícono para la notificación
      data: { id: data.idRequerimiento } // Opcional, puedes pasar datos adicionales
    };

    // Enviar la notificación
    const notification = new Notification('Nuevo Ticket', options);
    notification.onclick = (event) => {
      event.preventDefault();
      window.open(`/tickets/${data.idRequerimiento}`, '_blank'); // Redirigir al usuario cuando hace clic en la notificación
    };

  }

  msjTicketSend(message: any, respuesta: any) {
    this.listaTickets.filter( (x:any) => {
      if ( x.idRequerimiento == respuesta.idRequerimiento ) {
        x.cantidadMensajes = x.cantidadMensajes + 1;
      }
    })
    this.listaTicketsNoLeidos.filter( (x:any) => {
      if ( x.idRequerimiento == respuesta.idRequerimiento ) {
        x.cantidadTotalMensajes = x.cantidadTotalMensajes + 1;
        x.cantidad = x.cantidad + 1;
      }
    })
  }

  formatearTiempo(tiempoString: string): string {
    if (!tiempoString) return '0s';

    const partes = tiempoString.split(' ');
    let minutos = 0;
    let segundos = 0;
    
    partes.forEach(parte => {
      if (parte.includes('m')) {
        minutos = parseInt(parte.replace('m', ''), 10);
      } else if (parte.includes('s')) {
        segundos = parseInt(parte.replace('s', ''), 10);
      }
    });
    
    const totalSegundos = minutos * 60 + segundos;
    const dias = Math.floor(totalSegundos / (3600 * 24));
    const horas = Math.floor((totalSegundos % (3600 * 24)) / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const segs = totalSegundos % 60;
    
    const resultado = [];
    if (dias > 0) resultado.push(`${dias}d`);
    if (horas > 0) resultado.push(`${horas}h`);
    if (mins > 0) resultado.push(`${mins}m`);
    if (segs > 0 || resultado.length === 0) resultado.push(`${segs}s`);
    
    return resultado.join(' ');
  }

  
  getNewMantenimiento(event:any) {
    if ( event ) this.mantenimientosAgregados = event;
  }

  
  getTecnicosMantenimiento( event:any ) {
    if ( event ) {
      this.listaTecnicosRecibidos = event;
      // console.log('lista', event, this.listaTecnicosRecibidos);
    } 
  }

  
getRepuestosMantenimiento( event:any ) {
  if (event) {
    this.listaRepuestosRecibidos = event;
    console.warn("Lista original con posibles duplicados:", this.listaRepuestosRecibidos);

    if ( this.listaRepuestosRecibidos.length > 0 ) {
      
      // --- VALIDACIÓN PARA ELIMINAR DUPLICADOS ---
      // Se utiliza 'codrep' como identificador único para cada repuesto.
      const repuestosUnicos = this.listaRepuestosRecibidos.filter((repuesto:any, index:any, self:any) =>
        index === self.findIndex((r:any) => (
          r.codrep === repuesto.codrep
        ))
      );

      // Se actualiza la lista original con los repuestos sin duplicados.
      this.listaRepuestosRecibidos = repuestosUnicos;
      console.warn("Lista final sin duplicados:", this.listaRepuestosRecibidos);
      // --- FIN DE LA VALIDACIÓN ---

      Swal.fire({
        title:  "¡Cotización generada!",
        text:   "Ahora puedes descargarla en la interfaz de la cotización.",
        footer: "Este menú lo puedes encontrar en la vista general de la orden de trabajo.",
        icon:   "warning"
      });
    }
  }
}

  guardarIntervaloTicketsRespuestas(type:any, time:any) {

    this._show_spinner = true;
    const xcli: any = sessionStorage.getItem('codcli');
    const xreq: any = localStorage.getItem('idRequerimientoShow');
    this.intervaloModel = {
      mintime:         time,
      fecrea:          new Date(),
      usercrea:        xcli,
      tipo:            type,
      idRequerimiento: xreq
    }

    this.mensajeria.guardarIntervalo( this.intervaloModel ).subscribe({
      next:  (x) => {},
      error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }, complete: () => {
        this._show_spinner = false;
      }
    })
  }

  showPermissionsEmit() {
    this.showFormPermission.emit( true );
  }

  tecnicoListen( data: any ) {
    console.table("TECNICO ENVIADO ");
    console.table(data);
  }

  ticketRequer( data:any ) {
    
    console.log('///////////////////////////////////////////////////////////////////////////');
    console.log('///////////////////////////////////////////////////////////////////////////');
    console.log('Nuevo ticket de requerimiento recibido:');
    console.log(data)
    console.log('///////////////////////////////////////////////////////////////////////////');
    console.log('///////////////////////////////////////////////////////////////////////////');

    this.playAudio();
    this.listaTickets.filter( ( j:any ) => {
      if( j.idTicket == data.idTicket ) {
        j.estado = data.estado;
        if( j.estado == 2 ) {
          j.colorEstado       = '#FFECA1';
          j.estadoSignificado = 'Requerimiento, asignado..';
        }
        if ( j.estado == 3 ) {
          j.colorEstado       = '#65ecc3';
          j.estadoSignificado = 'En proceso.';
        }
        if ( j.estado == 4 ) {
          j.colorEstado       = '#bbbbbb';
          j.estadoSignificado = 'Ticket cerrado.';
        }

        j.tiempoTotalExactoMinutos = data.tiempoTotalExactoMinutos;

      };
    })
  }

  inicializadorHubs() {
    this.estadoTickets.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DEL TICKET:', e);
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
      
      if ( this.role == 'C' || this.role == 'G' ) {
        this.obtenerTicketsRequerimientos( this.xcodcli );     
      }

      this.actionMenuTicket.filter( (x:any) => {
        if ( this.role == 'C' ) {  
          if ( x.codec == "003"  ) {
            x.permison = true;
          } 
          else if ( x.codec == '000') {
            x.permison = true;
          } 
          else {
            x.permison = false;            
          }
        }
        else if ( this.role == 'A' ) {
          x.permison = true;
        } else if ( this.role == 'G' ) {
          if ( x.codec == "003" ) {
            x.permison = true;
          } else if ( x.codec == '000') {
            x.permison = true;
          }         
          else {
            x.permison = false;
          }
        }
      })


      if(this.role == 'C') {
        this._cli_view    = false;
        this.actionButton = true;
        this.icon_action  = 'preview'; 
      }
      if(this.role == 'A') {
        this._cli_view    = true;
        this.actionButton = false;
        this.icon_action  = 'message';
      }
    } 
  }

  

  obtenerTicketsRequerimientos(codcli: string): void {
  this.listaTecnicosRecibidos = [];
  this._show_spinner = true;
  
  this.form.obtenerTicketsRequerimientos(codcli, this.xccia, 1).subscribe({
    next: (tickets: any) => {
      // Ordenar por fecha (fecrea) de más reciente a más antigua
      const ticketsOrdenados = [...tickets].sort((a, b) => {
        return new Date(b.fecrea).getTime() - new Date(a.fecrea).getTime();
      });

      // Agrupar por estado
      const ticketsAgrupadosPorEstado: { [key: string]: any[] } = {};
      ticketsOrdenados.forEach((ticket) => {
        if (!ticketsAgrupadosPorEstado[ticket.estado]) {
          ticketsAgrupadosPorEstado[ticket.estado] = [];
        }
        ticketsAgrupadosPorEstado[ticket.estado].push(ticket);
      });

      // Aplanar la lista manteniendo el orden de estados
      const estadosOrdenados = ['1', '2', '3', '5', '4'];
      this.listaTickets = estadosOrdenados.reduce((acc, estado) => {
        if (ticketsAgrupadosPorEstado[estado]) {
          acc.push(...ticketsAgrupadosPorEstado[estado]);
        }
        return acc;
      }, [] as any[]);

      // console.warn('TICKET REQUERIMIENTO ORDENADO Y AGRUPADO');
      // console.warn(this.listaTickets);
      this.listaTicketsGhost = [...this.listaTickets];

      this.listaTickets.forEach((ticket: any) => {
        // Control de vision de archivos por ROL
        if (this.role == 'G') {
          this.show_files_cotiza = true;
          if (ticket.fileCotiza > 1) ticket.fileCotiza = ticket.fileCotiza - 1;
        }
        if (this.role == 'A') this.show_files_cotiza = true;
        if (this.role == 'C') this.show_files_cotiza = false;

        ticket.collapseShow = 'accordion-collapse collapse';
        const requerimientoMap: any = {
          '001': 'MP',
          '002': 'MC',
          '003': 'ME'
        };
        ticket.tRequerTag = requerimientoMap[ticket.tipoRequerimiento] || '';
        ticket.idRequerimientoPad = `#${ticket.tRequerTag}-${ticket.idTicket.toString().padStart(9, '0')}`;
        
        const espacioSirveMap: any = {
          'BOB': 'BÓBEDA',
          'BOD': 'BÓBEDA',
          'CAJ': 'CAJA'
        };
        ticket.espacioSirveNombre = espacioSirveMap[ticket.espacioSirve] || 'DESCONOCIDO';
        
        const estadoMap: any = {
          '1': { color: '#B8DEF6', significado: 'Enviado pero no leído aún.' },
          '2': { color: '#FFECA1', significado: 'Requerimiento asignado.' },
          '3': { color: '#65ecc3', significado: 'En proceso.' },
          '4': { color: '#bbbbbb', significado: 'Ticket cerrado.' },
          '5': { color: '#F4E900', significado: 'En solución pero en espera de repuestos.' }
        };
        
        const estadoInfo: any = estadoMap[ticket.estado];
        ticket.colorEstado = estadoInfo?.color || '#FFFFFF';
        ticket.estadoSignificado = estadoInfo?.significado || 'Estado desconocido.';
      });
    },
    error: (error) => {
      this._show_spinner = false;
      
      // Silenciar específicamente el error 404
      if (error.status === 404) {
        // console.log('No se encontraron tickets para este cliente');
        this.listaTickets = [];
        this.listaTicketsGhost = [];
        return;
      }
      
      // Para otros errores, mostrar en consola pero no lanzar excepción
      console.error('Error al obtener tickets:', error);
      this.listaTickets = [];
      this.listaTicketsGhost = [];
    },
    complete: () => {
      if (this.listenTagTicket) {
        this.listaTickets.forEach((x: any) => {
          x.collapseShow = 'accordion-collapse collapse';
          if ('#' + this.listenTagTicket == x.idRequerimientoPad) {
            x.collapseShow = 'accordion-collapse collapse show';
          }
        });
      }
      this._show_spinner = false;
    }
    

  });
}
  

  
  sendIdTicket( idTicket: number ) {
    if( idTicket > 0 ) {
      this.idTicketEmit = idTicket;
      localStorage.setItem('idRequerimientoShow', idTicket.toString());
    }
  }

  obetenerModeloCliente(event:any) {
    this.modelCliente = event;
    this.obtenerTicketsRequerimientos(event.codcliente);
  }

  obtenerCantMensajes(event:any) {
    this.listaTickets.filter( (x:any) => {
      if ( x.idRequerimiento == event.idRequerimiento ) x.cantidadMensajes = x.cantidadMensajes - 1;
    })
    this.listaTicketsNoLeidos.filter( (x:any) => {
      if ( x.idRequerimiento == event.idRequerimiento ) x.cantidad = x.cantidad - 1;
    })
  }

  catchData( data:any ) {
    this.modelDataSend = {
      idRequerimiento: data.idRequerimiento,
      idAgencia: data.idagencia,
      urlA: data.urlA,
      urlB: data.urlB,
      estado: data.estado,
      mensajeDelProblema: data.mensajeDelProblema,
      obervacion: data.obervacion,
      codMaquina: data.codMaquina,
      fechacrea: data.fechacrea,
      tipo: data.tipo
    }
    this.dataUpdateTicketEmit.emit(this.modelDataSend);
  }

  obtenerDataFilter(event:any) {
    this.listaTickets = this.listaTicketsGhost.filter((item: any) =>
      item.idRequerimientoPad.toString().toLowerCase().includes(event.toLowerCase())  ||
      item.idTicket.toString().toLowerCase().includes(event.toLowerCase()) ||
      item.nombreAgencia.toString().toLowerCase().includes(event.toLowerCase()) ||
      item.descripcionProblema.toString().toLowerCase().includes(event.toLowerCase())
    )
  }



  obtenerCantMensajesUpdate(event:any) {
    this.listaTicketsNoLeidos.filter( (x:any) => {
      if ( x.idRequerimiento == event ) x.cantidad = 0;
    });
  }

  actualizarSoloEstadoTicket( id:number, estado:number, ticket: any  ) {
    this.estadoTick.actualizarFechaReal( id, estado, ticket ).subscribe({
      next: (x) => {
        this._show_spinner = false;
      },
      error: (e) => {
        this._show_spinner = false;
      }, complete: () => { }
    });
  }

  actualizarEstado( id:number, estado:number, idTicket:string, ticket:any ) {
    localStorage.setItem('idRequerimientoShow', id.toString());
    this.activeTicketId = id;
    this.ticketSend = ticket;
    this.numberTicket = idTicket;
    if ( ticket.estado == 1 ) {
      if(this.role == 'A') {
        this.helpdeskserv.updateTicketsEstado( id, estado ).subscribe({
          next: (x) => {}, 
          error: (e) => {
            Toast.fire({
              icon:  "error",
              title: "Algo ha ocurrido, al cambiar el estado del ticket"
            });
          }
        })
      }
    }
  }

  obtenerTicketAlert(event:any) { }

  truncarTexto = (requerimiento: any, limite: number): string => {
    let texto = requerimiento.nombreAgencia + ' (' + requerimiento.nombreProvincia + ')';
    return texto.length > limite ? texto.substring(0, limite) + '...' : texto;
  }

  getFileMedia = async (idTicket: any, type: any) => {
    let typeFile: any = '';
    let listaDocumentos: any = [];
    this.fileControlServ.obtenerFileMediaTicket(idTicket, type).subscribe({
      next: (x) => listaDocumentos = x,
      error: (e) => console.error(e), 
      complete: async () => {
        // console.log(listaDocumentos);
        if (listaDocumentos.length > 0) {
          if (type === 'REPTEC') typeFile = 'ReporteTecnico';
          if (type === 'COTIZA') typeFile = 'Cotizaciones';
          if (type === 'NOTENT') typeFile = 'Nota de Entrega';

          // Filtramos los archivos a descargar según rol y cantidad de elementos
          const filesToDownload = 
            (this.role === 'G' && type === 'COTIZA' && listaDocumentos.length > 1) 
              ? listaDocumentos.slice(1)  // Ignora el primer elemento si hay más de 1
              : listaDocumentos;          // Descarga todos en otros casos

          for (let file of filesToDownload) {
            await this.descargarArchivoMediaRTecnico(file.fileUrl, typeFile);
          }
        }
      }
    });
  };

  descargarArchivoMediaRTecnico = async (nombreArchivo: any, type: any) => {
    let idReq = nombreArchivo.split('-')[0] + '-' + nombreArchivo.split('-')[1];
    this.fileControlServ.descargarArchivoMediaRTecnico(idReq, nombreArchivo, type).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        Toast.fire({
          title: 'Archivos descargados',
          icon: "success"
        });
      },
      error: (e) => {
        Toast.fire({
          title: nombreArchivo + ', problemas con la descarga.',
          icon: "error"
        });
      }
    });
  }
}
