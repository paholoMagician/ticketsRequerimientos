import { Component, OnInit, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RepuestosAsignadosComponent } from '../repuestos-asignados.component';
import { FormControl, FormGroup, Validators } from '@angular/forms'; // Añadido Validators
import { MantenimientoService } from '../../tabla-help-desk/mantenimiento/services/mantenimiento.service';
import Swal from 'sweetalert2';
import { CotizacionService } from '../modal-cotizacion/modal-cotizacion/services/cotizacion.service';

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
});

@Component({
  selector: 'app-modal-down-cotizacion',
  templateUrl: './modal-down-cotizacion.component.html',
  styleUrls: ['./modal-down-cotizacion.component.scss']
})
export class ModalDownCotizacionComponent implements OnInit {
 
  modelSend:            any = [];
  idRequer:             number = 0;
  @Output() delResMant: any;

  constructor(
    public dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public dialogRef: MatDialogRef<RepuestosAsignadosComponent>, 
    private rep: MantenimientoService,
    private cotServ: CotizacionService
  ) { }
  
  // FormGroup con validación requerida
  public modalForm = new FormGroup({
    observacion: new FormControl('', [Validators.required, Validators.minLength(5)]) // Mínimo 5 caracteres
  });

  
  ngOnInit(): void {
    this.idRequer = this.data[0].idRequer;
    // console.warn('this.data MODAL DOWN COTIZA!');
    // console.warn(this.data);
  }

  darDeBajaItems() {


    // Verificar si el formulario es válido
    if (this.modalForm.invalid) {
      Toast.fire({
        icon: 'error',
        title: 'Debe ingresar una observación válida (mínimo 5 caracteres)'
      });
      return;
    }

    this.data.forEach((item: any) => {
      this.rep.ActualizarStockRepuestosDarDeBaja(item.codRep, item.cantidad).subscribe({
        next: (x) => {
          item.icon = 'done';
        }, 
        error: (e) => {
          console.error(e);
        }, 
        complete: () => {
          // this._show_spinner = false;
        }
      });
    });

    this.eliminarCabCotiza(this.idRequer);
    this.guardarAuditoriaCotizacionDeBaja(this.idRequer);

  }

  guardarAuditoriaCotizacionDeBaja(idRequer: number) {

    const xuser: any = sessionStorage.getItem('codcli');
    this.modelSend = {
      nombre:      '---',
      idRequer:    idRequer,
      usercrea:    xuser,
      observacion: this.modalForm.controls['observacion'].value
    };

    this.rep.GuardarAuditoriaCotizacionDeBaja(this.modelSend).subscribe({
      next: (x) => {
        Swal.fire({
          title: "Cotización dada de baja",
          text: "Proceso de cotización de repuestos se ha dado de baja, los items regresaron al stock",
          icon: "success"
        }); 

        this.closeDialog( idRequer );

      },
      error: (e) => {
        if ( e.status == 200 ) this.closeDialog( idRequer );
        else {
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error al guardar la auditoría",
            icon: "error"
          });
          console.error(e);
          this.closeDialog( null );
        }
      }
    });
  }
  
  // Método helper para acceder fácilmente a los controles en la plantilla
  get f() {
    return this.modalForm.controls;
  }

  closeDialog( type:any ) {
    this.dialogRef.close( type );
  }

  eliminarCabCotiza(idRequer: any) {
    this.cotServ.eliminarCotizacion( idRequer ).subscribe({
      next: (x) => {
        // console.log('Eliminada la cabecera de cotizacion');
      }, error: (e) => {
        if ( e.status == 200 ) {
          return
        }
        console.error(e)
      }
    })
  }

}