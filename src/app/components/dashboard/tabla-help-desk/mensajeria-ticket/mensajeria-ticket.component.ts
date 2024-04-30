import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MensajeriaTicketService } from './services/mensajeria-ticket.service';

@Component({
  selector: 'app-mensajeria-ticket',
  templateUrl: './mensajeria-ticket.component.html',
  styleUrls: ['./mensajeria-ticket.component.scss']
})
export class MensajeriaTicketComponent implements OnInit, OnChanges {
  
  @Input() listenTicketCliente: any;
  modelSendMsj: any = [];
  listaMensajes: any = [];

  messengerForm = new FormGroup  ({
    msj:          new FormControl(''),
  })

  idRequerimiento: number = 0;

  constructor( private mensajeria: MensajeriaTicketService ) {}

  ngOnInit(): void {    
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes) {
        // console.log('this.listenTicketCliente!!!!!!!!!!!');
        // console.log(this.listenTicketCliente);
        this.idRequerimiento = this.listenTicketCliente.idRequerimiento;
        console.log('this.idRequerimiento: ', this.idRequerimiento);
        console.warn('//////////////////////////////////////////////////////////')
        setTimeout(() => {
          
            console.log('*****************************************')
            console.log(this.idRequerimiento)
            this.obtenerMensajes(this.idRequerimiento, 50);
          
        }, 1000);
      }
  }

  onSubmit() {
    this.enviarMensaje();
  }

  enviarMensaje() {

    const xcli: any = sessionStorage.getItem('codcli');
    this.modelSendMsj = {
      idRequerimiento: this.idRequerimiento,
      fechaemit:       new Date(),
      mensaje:         this.messengerForm.controls['msj'].value,
      coduser:         xcli,
      active:          'A'
    }

    this.mensajeria.enviarMensaje( this.modelSendMsj ).subscribe( {
      next: ( x ) => {
        console.log('Enviado');
      }, error: (e) => {
        console.error(e);
      }
    })

  }

  obtenerMensajes(idRequerimiento: number, top: number) {
    this.mensajeria.obtenerMensaje( idRequerimiento, top ).subscribe(
      {
      next: (x) => {
        this.listaMensajes = x;
        console.table(this.listaMensajes)
      }, error: (e) => {
        console.error(e);
      }, complete: () => {

      }
      }) 
  }


}
