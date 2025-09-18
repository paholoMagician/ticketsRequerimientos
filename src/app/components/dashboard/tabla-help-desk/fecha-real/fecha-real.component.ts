import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FechasRealesService } from './services/fechas-reales.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalTecnicosComponent } from '../../modal-tecnicos/modal-tecnicos.component';
import { MantenimientoService } from '../mantenimiento/services/mantenimiento.service';
import Swal from 'sweetalert2'
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
  selector: 'app-fecha-real',
  templateUrl: './fecha-real.component.html',
  styleUrls: ['./fecha-real.component.scss']
})

export class FechaRealComponent implements OnInit, OnChanges {

  idAgencia: any;
  _show_spinner: boolean = false;
  @Input() requerimiento: any;
  @Output() emitTecnicosMantenimiento: EventEmitter<any> = new EventEmitter();
  @Output() showFormFechaReal: EventEmitter<any> = new EventEmitter();

  constructor( private fecReal: FechasRealesService, private mantServ: MantenimientoService,  public dialog: MatDialog ) {}

  dateTimeRegisterForm = new FormGroup ({
      fecreaRealIni:   new FormControl(null),
      fecreaRealFin:   new FormControl(null),
      horaInicialReal: new FormControl(null),
      horaFinalReal:   new FormControl(null),
      observacion:     new FormControl()
  })

  ngOnInit(): void { 
    this.inicializarHora();
  }
  
  ngOnChanges( changes: SimpleChanges ): void {
    if ( changes ) {
      this.catchData();
    }
  }

  catchData() {
    const x: any = this.requerimiento.fechainiPlanif.toString().split("T");
    const y: any = this.requerimiento.fechafinPlanif.toString().split("T");
    this.dateTimeRegisterForm.controls['fecreaRealIni']
                             .setValue(x[0]);
    this.dateTimeRegisterForm.controls['fecreaRealFin']
                             .setValue(y[0]);
    this.dateTimeRegisterForm.controls['horaInicialReal']
                             .setValue(this.requerimiento.horaInicialReal);
    this.dateTimeRegisterForm.controls['horaFinalReal']
                             .setValue(this.requerimiento.horaFinalReal);
    this.dateTimeRegisterForm.controls['observacion']
                             .setValue(this.requerimiento.observacion);
  }

  onSubmit() {
    this.actualizarFechaReal();
  }

  validateFecha() {
    let xFecIni: any = this.dateTimeRegisterForm.controls['fecreaRealIni'].value;    
    let xFecFin: any = this.dateTimeRegisterForm.controls['fecreaRealFin'].value;    
  
    let currentDate: any = new Date();
    
    // Convertir xFecIni y xFecFin a objetos Date y sumar un día
    let fechaInicio = xFecIni ? new Date(xFecIni) : null;
    let fechaFinal = xFecFin ? new Date(xFecFin) : null;
    
    // Nueva validación: igualar fecha final a fecha inicial si se selecciona fecha inicial
    if (xFecIni && !xFecFin) {
        this.dateTimeRegisterForm.controls['fecreaRealFin'].setValue(xFecIni);
        // Actualizamos la variable fechaFinal para las validaciones posteriores
        fechaFinal = new Date(xFecIni);
    }
    
    if (fechaInicio) {
        fechaInicio.setDate(fechaInicio.getDate() + 1);
        
        // Verificar si la fecha inicial es menor a la fecha actual
        if (fechaInicio < currentDate) {
            Swal.fire({
                title: "Algo anda mal!",
                text: "La fecha inicial no puede ser menor a la fecha actual. Se ajustará a la fecha actual.",
                icon: "warning"
            });
            // Establecer el valor de fecreaRealIni a la fecha actual
            const currentDateStr = currentDate.toISOString().split('T')[0];
            this.dateTimeRegisterForm.controls['fecreaRealIni'].setValue(currentDateStr);
            // Actualizar fechaInicio para validaciones posteriores
            fechaInicio = new Date(currentDateStr);
            fechaInicio.setDate(fechaInicio.getDate() + 1);
            
            // Como cambiamos la fecha inicial, también debemos actualizar la final si eran iguales
            if (xFecIni === xFecFin) {
                this.dateTimeRegisterForm.controls['fecreaRealFin'].setValue(currentDateStr);
                fechaFinal = new Date(currentDateStr);
            }
        }
    }
    
    if (fechaFinal) {
        fechaFinal.setDate(fechaFinal.getDate() + 1);
        
        // Verificar si la fecha final es menor a la fecha actual
        if (fechaFinal < currentDate) {
            Swal.fire({
                title: "Algo anda mal!",
                text: "La fecha final no puede ser menor a la fecha actual. Se ajustará a la fecha actual.",
                icon: "warning"
            });
            // Establecer el valor de fecreaRealFin a la fecha actual
            const currentDateStr = currentDate.toISOString().split('T')[0];
            this.dateTimeRegisterForm.controls['fecreaRealFin'].setValue(currentDateStr);
            // Actualizar fechaFinal para validaciones posteriores
            fechaFinal = new Date(currentDateStr);
            fechaFinal.setDate(fechaFinal.getDate() + 1);
        }
    }
    
    // Validación adicional: asegurar que fecha final no sea anterior a fecha inicial
    if (fechaInicio && fechaFinal && fechaFinal < fechaInicio) {
        Swal.fire({
            title: "Algo anda mal!",
            text: "La fecha final no puede ser anterior a la fecha inicial. Se ajustará a la fecha inicial.",
            icon: "warning"
        });
        this.dateTimeRegisterForm.controls['fecreaRealFin'].setValue(
            this.dateTimeRegisterForm.controls['fecreaRealIni'].value
        );
    }
}
  inicializarHora() { 
    // Definir los límites de las horas laborales
    let horaInicioLaboral: any = new Date();
    let horaFinLaboral: any = new Date();
    
    // Establecer 8AM y 5PM
    horaInicioLaboral.setHours(8, 0, 0); // 8:00 AM
    // horaInicioLaboral.setHours(horaInicioLaboral.getHours() + 1); // Sumar una hora

    horaFinLaboral.setHours(17, 0, 0); // 5:00 PM
    // horaFinLaboral.setHours(horaFinLaboral.getHours() + 1); // Sumar una hora
    
    this.dateTimeRegisterForm.controls['horaInicialReal'].setValue(horaInicioLaboral.toTimeString().slice(0, 5));
    this.dateTimeRegisterForm.controls['horaFinalReal'].setValue(horaFinLaboral.toTimeString().slice(0, 5));
  }
  
  validateHora() {
    let xHoraIni: any = this.dateTimeRegisterForm.controls['horaInicialReal'].value;
    let xHoraFin: any = this.dateTimeRegisterForm.controls['horaFinalReal'].value;
  
  
    // Definir los límites de las horas laborales
    let horaInicioLaboral: any = new Date();
    let horaFinLaboral: any = new Date();
    
    // Establecer 8AM y 5PM
    horaInicioLaboral.setHours(8, 0, 0); // 8:00 AM
    // horaInicioLaboral.setHours(horaInicioLaboral.getHours() + 1); // Sumar una hora

    horaFinLaboral.setHours(17, 0, 0); // 5:00 PM
    // horaFinLaboral.setHours(horaFinLaboral.getHours() + 1); // Sumar una hora
    
    // Convertir xHoraIni y xHoraFin a objetos Date para comparar
    let horaInicial: any = new Date(`1970-01-01T${xHoraIni}:00`);
    let horaFinal: any = new Date(`1970-01-01T${xHoraFin}:00`);
    
    // Verificar si la hora inicial es menor a las 8AM
    if (horaInicial >= horaInicioLaboral || horaInicial <= horaFinLaboral ) {

      // // console.warn(horaInicial)
      // // console.warn(horaInicioLaboral)
      // // console.warn(horaFinLaboral)

      Swal.fire({
        title: "Algo anda mal!",
        text: "La hora inicial no puede ser menor a las 8AM. Se ajustará a las 8AM.",
        icon: "warning"
      });
      // Establecer el valor de horaInicialReal a las 8AM
      this.dateTimeRegisterForm.controls['horaInicialReal'].setValue(horaInicioLaboral.toTimeString().slice(0, 5));
    }
    
    // Verificar si la hora inicial es mayor a las 5PM
    if (horaInicial > horaFinLaboral) {
      Swal.fire({
        title: "Algo anda mal!",
        text: "La hora inicial no puede ser mayor a las 5PM. Se ajustará a las 5PM.",
        icon: "warning"
      });
      // Establecer el valor de horaInicialReal a las 5PM
      this.dateTimeRegisterForm.controls['horaInicialReal'].setValue(horaFinLaboral.toTimeString().slice(0, 5));
    }
    
    // Verificar si la hora final es menor a las 8AM
    if (horaFinal < horaInicioLaboral) {
      Swal.fire({
        title: "Algo anda mal!",
        text: "La hora final no puede ser menor a las 8AM. Se ajustará a las 8AM.",
        icon: "warning"
      });
      // Establecer el valor de horaFinalReal a las 8AM
      this.dateTimeRegisterForm.controls['horaFinalReal'].setValue(horaInicioLaboral.toTimeString().slice(0, 5));
    }
    
    // Verificar si la hora final es mayor a las 5PM
    if (horaFinal > horaFinLaboral) {
      Swal.fire({
        title: "Algo anda mal!",
        text: "La hora final no puede ser mayor a las 5PM. Se ajustará a las 5PM.",
        icon: "warning"
      });
      // Establecer el valor de horaFinalReal a las 5PM
      this.dateTimeRegisterForm.controls['horaFinalReal'].setValue(horaFinLaboral.toTimeString().slice(0, 5));
    }
  }
 
  actualizarFechaReal() {
    // Validaciones básicas
    if (!this.dateTimeRegisterForm.controls['fecreaRealIni'].value) {
      Toast.fire({ icon: "warning", title: "Debes escoger una fecha real inicial" });
      return;
    }
    if (!this.dateTimeRegisterForm.controls['fecreaRealFin'].value) {
      Toast.fire({ icon: "warning", title: "Debes escoger una fecha real final" });
      return;
    }
    if (!this.dateTimeRegisterForm.controls['horaInicialReal'].value) {
      Toast.fire({ icon: "warning", title: "Debes escoger una hora real inicial" });
      return;
    }
    if (!this.dateTimeRegisterForm.controls['horaFinalReal'].value) {
      Toast.fire({ icon: "warning", title: "Debes escoger una hora real final" });
      return;
    }    
    const xuser: any = sessionStorage.getItem('codcli');
    const xccia: any = sessionStorage.getItem('ccia');
    // Preparar el modelo
    let model = {
      idTicket: this.requerimiento.idTicket,
      idAgencia: this.requerimiento.idAgencia,
      url: this.requerimiento.url,
      estado: this.requerimiento.estado,
      codprov: this.requerimiento.codprov,
      ciudad: this.requerimiento.ciudad,
      fecrea: this.requerimiento.fecrea,
      fechainiPlanif: this.requerimiento.fechainiPlanif,
      fechafinPlanif: this.requerimiento.fechafinPlanif,
      area: this.requerimiento.area,
      motivoTrabajo: this.requerimiento.motivoTrabajo,
      espacioSirve:           this.requerimiento.espacioSirve,
      descripcionProblema:    this.requerimiento.descripcionProblema,
      nserieEquipo:           this.requerimiento.nserieEquipo,
      beneficiario:           this.requerimiento.beneficiario,
      telefono:               this.requerimiento.telefono,
      email:                  this.requerimiento.email,
      fecreaRealIni:          this.dateTimeRegisterForm.controls['fecreaRealIni'].value,
      fecreaRealFin:          this.dateTimeRegisterForm.controls['fecreaRealFin'].value,
      codTipoEquipo:          this.requerimiento.codTipoEquipo,
      codMarca:               this.requerimiento.codMarca,
      codModelo:              this.requerimiento.codModelo,
      tipo:                   this.requerimiento.tipo,
      horaInicialReal:        this.dateTimeRegisterForm.controls['horaInicialReal'].value,
      horaFinalReal:          this.dateTimeRegisterForm.controls['horaFinalReal'].value,
      horaInicialPlanificada: this.requerimiento.horaInicialPlanificada,
      horaFinalPlanificada: this.requerimiento.horaFinalPlanificada,
      usercrea: this.requerimiento.usercrea,
      valor: this.requerimiento.valor,
      observacion: this.requerimiento.observacion,
      ccia: xccia,
      codUserAtencionTicket: xuser
    }

    this._show_spinner = true;
    this.fecReal.actualizarFechaReal(this.requerimiento.idTicket, 2, model,).subscribe({
      next: (x) => {
        Toast.fire({ icon: "success", title: "Fecha actualizada correctamente" });
        // console.log('Respuesta:', x);
      },
      error: (e) => {
        this._show_spinner = false;
        console.error('Error:', e);
        Toast.fire({ icon: "error", title: "Error al actualizar la fecha" });
      },
      complete: () => {
        this._show_spinner = false;
        this.showFormFechaReal.emit(true);
        this.emitTecnicosMantenimiento.emit(this.listaTecnicosRecibidos);
      }
    });
  }
  
  // Función auxiliar para formatear fecha a ISO string
  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString();
  }
  
  // Función auxiliar para convertir tiempo HH:mm:ss a ticks
  private timeToTicks(timeStr: string): { ticks: number } {
    if (!timeStr) return { ticks: 0 };
    
    // Asegurar formato HH:mm:ss
    const timeParts = timeStr.split(':');
    if (timeParts.length < 3) timeStr += ':00';
    
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const ticks = totalSeconds * 10000000; // 1 segundo = 10,000,000 ticks
    
    return { ticks };
  }

  listaTecnicosRecibidos: any = [];
  modelDataRequer: any = [];
  openDataTecnicosDialog() {
    
    this.modelDataRequer = {
      idTicket:        this.requerimiento.idTicket,
      idAgencia:       this.requerimiento.idAgencia,
      horaInicialReal: this.dateTimeRegisterForm.controls['horaInicialReal'].value,
      horaFinalReal:   this.dateTimeRegisterForm.controls['horaFinalReal'].value,
      codMarca:        this.requerimiento.codMarca,
      fecreaRealIni:   this.dateTimeRegisterForm.controls['fecreaRealIni'].value,
      fecreaRealFin:   this.dateTimeRegisterForm.controls['fecreaRealFin'].value,
      codfrecuencia:   this.requerimiento.codfrecuencia
    }

    const dialogRef = this.dialog.open( ModalTecnicosComponent, {
      height: '80vh',
      width: '80%',
      data: this.modelDataRequer
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {

        // console.warn('Lista de técnicos recibidos desde el modal:');
        console.table(result);

        this.listaTecnicosRecibidos = result;
      }
    });
    
  }

  deleteTecnicoAsign(tecnicos:any, index:number) {
    
    this.mantServ.eliminarTecnicoProcess( this.requerimiento.idTicket, tecnicos.coduser ).subscribe({
      next:(x) => {
        Toast.fire({
          icon: "success",
          title: "Eliminado correctamente."
        });
        this.listaTecnicosRecibidos.splice( index, 1 );
      }, error: (e) => console.error(e)
    })
  
  }


}
