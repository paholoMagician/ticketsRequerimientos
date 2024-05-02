import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MensajeriaTicketService } from './services/mensajeria-ticket.service';
import { Environments } from 'src/app/environments/environments';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Component({
  selector: 'app-mensajeria-ticket',
  templateUrl: './mensajeria-ticket.component.html',
  styleUrls: ['./mensajeria-ticket.component.scss'],
})
export class MensajeriaTicketComponent implements OnInit, OnChanges {
  @Input() listenTicketCliente: any;
  messengerForm = new FormGroup({
    msj: new FormControl(''),
  });

  dataMsj: any = []
  idRequerimiento: number = 0;
  modelSendMsj: any = [];
  modelAdicional: any = [];
  listaMensajes: any = [];
  userLog: any = "";
  nameUserLog: any = "";
  private urlHub: any = this.env.apiHelpDeskSytemh;
  private mensajeTickets: HubConnection;

  constructor(
    private mensajeria: MensajeriaTicketService,
    private env: Environments
  ) {
    this.mensajeTickets = new HubConnectionBuilder()
      .withUrl(this.urlHub + 'hubs/msjHub')
      .build();
    this.mensajeTickets.on('SendMessageHub', (message: any, usuario: any) => {
      if(usuario!= null){
        message.usuario = usuario.usuario;
      }
      this.addMessage(message);
    });
  }

  ngOnInit(): void {
    this.mensajeTickets
      .start()
      .then(() => {
        this.userLog = sessionStorage.getItem('codcli');
        this.nameUserLog = sessionStorage.getItem('usuario');
        console.log('CONECTADO A MENSAJERIA!');
      })
      .catch((e) => {
        console.error('ALGO HA PASADO CON LA TRANSMISION DEL MENSAJE:', e);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.idRequerimiento = this.listenTicketCliente.idRequerimiento;
      this.obtenerMensajes(this.idRequerimiento, 50);
    }
  }

  onSubmit() {
    this.enviarMensaje();
  }

  enviarMensajePressBotton(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.onSubmit();
    const textarea = document.getElementById('msj') as HTMLTextAreaElement;
    textarea.value = '';
    console.log('Enviado');
  }

  enviarMensaje() {
    this.modelSendMsj = {
      idRequerimiento: this.idRequerimiento,
      fechaemit: new Date(),
      mensaje: this.messengerForm.controls['msj'].value,
      coduser: this.userLog,
      active: 'A',
    };
    this.mensajeria.enviarMensaje(this.modelSendMsj).subscribe({
      next: (x) => {
        console.log('Enviado');
        const textarea = document.getElementById('msj') as HTMLTextAreaElement;
        textarea.value = '';
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  obtenerMensajes(idRequerimiento: number, top: number) {
    this.mensajeria.obtenerMensaje(idRequerimiento, top).subscribe({
      next: (x) => {
        this.listaMensajes = x;
      },
      error: (e) => {
        console.error(e);
      },
      complete: () => {},
    });
  }

  addMessage(data: any) {
    this.listaMensajes.unshift(data);
  }
}
