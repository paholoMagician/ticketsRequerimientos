// clientes-help-desk.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ClientesHelpDeskService } from './services/clientes-help-desk.service';
import { Environments } from 'src/app/environments/environments';
import { FormControl, FormGroup } from '@angular/forms';

import Swal from 'sweetalert2';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
})

@Component({
  selector: 'app-clientes-help-desk',
  templateUrl: './clientes-help-desk.component.html',
  styleUrls: ['./clientes-help-desk.component.scss']
})
export class ClientesHelpDeskComponent implements OnInit, OnChanges {

  listaClientes: any = [];
  listaClientesGhost: any = [];
  selectedCliente: any = null; 
  
  @Input() codCliTikenAlert: any;
  @Output() codcli: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor( private clihelp: ClientesHelpDeskService, private env: Environments ) {}

  ngOnInit(): void {
    this.obtenerClientes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['codCliTikenAlert'] && this.codCliTikenAlert) {
      // Buscar el cliente en la lista
      const cliente = this.listaClientes.find((x: any) => 
        this.codCliTikenAlert == x.codcliente
      );
      
      if (cliente) {
        this.emitCliStyle(cliente);
        this.emitCli(cliente);
      } else {
        // Si no se encuentra, intentar después de obtener clientes
        setTimeout(() => {
          const clienteEncontrado = this.listaClientes.find((x: any) => 
            this.codCliTikenAlert == x.codcliente
          );
          if (clienteEncontrado) {
            this.emitCliStyle(clienteEncontrado);
            this.emitCli(clienteEncontrado);
          }
        }, 500);
      }
    }
  }

  public filterForm = new FormGroup({
    filterCli:   new FormControl('')
  })

  emitCliStyle(clientes: any) {
    this.selectedCliente = clientes;
  }

  obtenerClientes() {
    this.clihelp.obtenerClientes( this.env.codcia, 1 ).subscribe({
      next: (x) => {
        this.listaClientes = x;
        this.listaClientesGhost = x;
        // Si hay un codCliTikenAlert, buscar y emitir el cliente
        // if (this.codCliTikenAlert) {
        //   const cliente = this.listaClientes.find((item: any) => 
        //     item.codcliente === this.codCliTikenAlert
        //   );
          
        //   if (cliente) {
        //     this.emitCliStyle(cliente);
        //     this.emitCli(cliente);
        //   }
        // }
      }, error: (e) => {
        console.error('Error al obtener clientes:', e);
      }
    })
  }

  emitCli(model:any) {
    if ( model.cantidadRequerimientos == 0 ) {
    
      Swal.fire({
                    title: "Sin datos!",
                    text: "Este cliente no tiene tickets.",
                    icon: "info"
                  });
    
      return;
    }
    this.codcli.emit(model);
    localStorage.setItem('id-cliente-escogido', model.codcliente);
    localStorage.setItem('nombre-cliente-escogido', model.nombre);
    localStorage.setItem('imagen-cli', model.imagen);
  }
 
  filterCliente () {
    let filter: any = this.filterForm.controls['filterCli'].value;
    this.listaClientes = this.listaClientesGhost.filter((item:any) => 
      item.nombre.toLowerCase().includes(filter.toLowerCase())
    );
  }
}