import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MantenimientoService } from '../tabla-help-desk/mantenimiento/services/mantenimiento.service';
import { EncryptService } from '../../shared/services/encrypt.service';
import { jwtDecode } from 'jwt-decode';
import { Environments } from 'src/app/environments/environments';
import { ModalCotizacionComponent } from './modal-cotizacion/modal-cotizacion/modal-cotizacion.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalDownCotizacionComponent } from './modal-down-cotizacion/modal-down-cotizacion.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-repuestos-asignados',
  templateUrl: './repuestos-asignados.component.html',
  styleUrls: ['./repuestos-asignados.component.scss']
})
export class RepuestosAsignadosComponent implements OnInit, OnChanges {

  @Input() idRequerimiento:     any;
  @Input() repuestosEscuchados: any;

  role:                         any;
  _cli_view:                    boolean = true;
  actionButton:                 boolean = false;
  icon_action:                  string  = "preview";
  listaRepuestoRequerimientos:  any     = [];
  calculoTotalFactur:           number  = 0.0;
  analisisCodRep:               any     = []
  
  constructor( private ncrypt: EncryptService, 
               private mant: MantenimientoService, 
               private env: Environments, 
               public  dialog: MatDialog ) {}

  ngOnInit(): void {
      this.obtenerRepuestosRequerimientos();
      this.getToken()
  }

  ngOnChanges(changes: SimpleChanges) {
      if(changes) {
        this.obtenerRepuestosRequerimientos();
        this.getToken();
        // alert(this.idRequerimiento)
      }
  }

  obtenerRepuestosRequerimientos() {
    let data: any;
    const idTicket: any = localStorage.getItem('idRequerimientoShow');
    // console.log(idTicket);
    this.mant.obtenerRepuestosRequerimientos(idTicket).subscribe({
      next: (x) => {
        this.listaRepuestoRequerimientos = x;
        // // console.warn('this.listaRepuestoRequerimientos');
        //// console.warn(this.listaRepuestoRequerimientos);
        data = x;
      }, error: (e) => {
        if ( e.status != 200 ) console.error(e);
      }, complete: () => {
        this.calcularTotalFactur(data);
        // let arrPVP: any[] = [];
        // this.listaRepuestoRequerimientos.filter( (x:any) => {
        //   arrPVP.push( x.valorFinal );
        // })
        // this.calculoTotalFactur = arrPVP.reduce((acc, curr) => acc + curr, 0);
      }
    })
  }

  calcularTotalFactur(data: any) {
    let arrPVP: any[] = [];
    data.filter( (x:any) => {
      arrPVP.push( x.valorFinal );
    })
    this.calculoTotalFactur = arrPVP.reduce((acc, curr) => acc + curr, 0);
  }

  darDeBajaCotizacion() {
    this. analisisCodRep = [];
    this.listaRepuestoRequerimientos.forEach( (x:any) => {
      // console.warn (x);
      this.analisisCodRep.push( 
        { 
          cantidad: x.cantidad, 
          codRep: x.codrep, 
          name: x.nombreRep, 
          icon: 'hourglass_top', 
          colorState: 'orange',
          idRequer: x.idRequer
        }
      )
    })
  }

  openDataProcessDownCotizModal() {
    this.darDeBajaCotizacion();
    // console.log('this.analisisCodRep')
    // console.log(this.analisisCodRep)
    const dialogRef = this.dialog.open( ModalDownCotizacionComponent, {
        height: '95%',
        width:  '70%',
        data:   this.analisisCodRep
    }); 

    dialogRef.afterClosed().subscribe( (result: any) => {
      if (result) { 
        // alert( result )
        if ( result != null ) {
          // alert(result)
          this.elimianarAsignRepuTicket(result);
        }
      }
    });
    
  }


  elimianarAsignRepuTicket(idRequerimiento: any) {
    this.mant.eliminarAsignacionRepuTicket( idRequerimiento ).subscribe({
      next: (x) => {
        // // console.log('ASIGNACIONES ELIMINADAS');
        this.listaRepuestoRequerimientos = [];
      }, error: (e) => {
        console.error(e);
      }
    })
  }

  openDataRepuestosDialog(type: string) {
    const idTicket: any = localStorage.getItem('idRequerimientoShow');
    const dialogRef = this.dialog.open( ModalCotizacionComponent, {
        height: '95%',
        width:  '70%',
        data:   {idRequerimiento:idTicket, type: type}
    });

    dialogRef.afterClosed().subscribe( (result: any) => {
      if (result) { }
    });
    
  }

  getToken() {
    let xtoken:any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
    if (xtokenDecript != null || xtokenDecript != undefined) {      
      var decoded:any = jwtDecode(xtokenDecript);
      this.role                  = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];      
      // alert(this.role)
      if( this.role == 'C' || this.role == 'G' ) {
        this._cli_view    = false;
        this.actionButton = true;
      }
      else if(this.role == 'A') {
        this._cli_view    = true;
        this.actionButton = false;
      }
    }

  }

}
