import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ClientesHelpDeskService } from './services/clientes-help-desk.service';
import { Environments } from 'src/app/environments/environments';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-clientes-help-desk',
  templateUrl: './clientes-help-desk.component.html',
  styleUrls: ['./clientes-help-desk.component.scss']
})
export class ClientesHelpDeskComponent implements OnInit {

  listaClientes: any = [];
  listaClientesGhost: any = [];

  @Output() codcli: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor( private clihelp: ClientesHelpDeskService, private env: Environments ) {}

  ngOnInit(): void {
    this.obtenerClientes();
  }

  public filterForm = new FormGroup({
    filterCli:   new FormControl('')
  })

  obtenerClientes() {
    this.clihelp.obtenerClientes( this.env.codcia, 1 ).subscribe({
      next: (x) => {
        this.listaClientes = x;
        this.listaClientesGhost = x;
        console.log(this.listaClientes);
      }
    })
  }

  emitCli(model:any[]) {
    this.codcli.emit( model );
  }
 
  filterCliente () {
    let filter: any = this.filterForm.controls['filterCli'].value;
    this.listaClientes = this.listaClientesGhost.filter( (item:any) => item.nombre.toLowerCase().includes(filter.toLowerCase()) );
  }


}
