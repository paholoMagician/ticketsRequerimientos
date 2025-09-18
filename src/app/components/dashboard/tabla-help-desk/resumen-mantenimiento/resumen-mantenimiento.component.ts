import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MantenimientoService } from '../mantenimiento/services/mantenimiento.service';

@Component({
  selector: 'app-resumen-mantenimiento',
  templateUrl: './resumen-mantenimiento.component.html',
  styleUrls: ['./resumen-mantenimiento.component.scss']
})
export class ResumenMantenimientoComponent implements OnInit, OnChanges {
  
  _show_spinner: boolean = false;
  @Input() idRequerimiento:any;
  @Input() manetenimientoEsuchado: any;

  listaMantenimientosAgregados: any = [];
  constructor( private mant: MantenimientoService ) {}
  
  ngOnInit(): void { 
    this.obtenerMantenimientosAgregados();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if( changes ) {
        this.obtenerMantenimientosAgregados();
      }
  }

  obtenerMantenimientosAgregados() {
    this._show_spinner = true;
    const idTicket: any = localStorage.getItem('idRequerimientoShow');
    this.mant.obtenerResumenMantenimiento( idTicket ).subscribe({
      next: (x) => {
        this.listaMantenimientosAgregados = x;
      }, 
      error: (e) => {
        this._show_spinner = false;
        console.error(e);
      },
      complete: () => {
        this._show_spinner = false;
      }
    })
  }

}
