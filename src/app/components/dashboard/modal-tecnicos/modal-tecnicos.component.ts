import { Component, Inject, OnInit } from '@angular/core';
import { MantenimientoComponent } from '../tabla-help-desk/mantenimiento/mantenimiento.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MantenimientoService } from '../tabla-help-desk/mantenimiento/services/mantenimiento.service';
import { Environments } from 'src/app/environments/environments';
import { FormControl, FormGroup } from '@angular/forms';

import Swal from 'sweetalert2'
import { FechaRealComponent } from '../tabla-help-desk/fecha-real/fecha-real.component';
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
  selector: 'app-modal-tecnicos',
  templateUrl: './modal-tecnicos.component.html',
  styleUrls: ['./modal-tecnicos.component.scss']
})
export class ModalTecnicosComponent implements OnInit {
  
  _show_spinner: boolean = false;
  listaTecElegidos: any[] = []; 
  listaTecnicos: any = [];
  listaTecnicosGhost: any = [];
  modelCrono: any = [];
  modelMantenimiento: any = [];
  idAgencia: any;
  tecnicosSearchForm = new FormGroup ({
    localidad: new FormControl(),
    filter:    new FormControl()
 })

  constructor( public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private env: Environments,
    private mant: MantenimientoService,
    public dialogRef: MatDialogRef<FechaRealComponent>) {}

    asignacionFechaInicial: any;
    asignacionFechaFinal: any;
    asignacionHoraInicial: any;
    asignacionHoraFina: any;

    ngOnInit(): void {
      this.asignacionFechaInicial = this.data.horaInicialReal;
      this.asignacionFechaFinal = this.data.horaFinalReal;

      this.idAgencia = this.data.idAgencia;
      this.obtenerLocalidades();
      this.obtenerTecnicosRecomendadosCMS(this.idAgencia);
    }

    obtenerTecnicosRecomendadosCMS(id:any) {
      this._show_spinner = true;
      this.listaTecnicos = [];
      this.listaTecnicosGhost = [];
      this.mant.obtenerLocalidadesAgencia(id).subscribe({
        next: (x) => {
          this.listaTecnicos = x;
          this.listaTecnicosGhost = x;
          this._show_spinner = false;
        }, error: (e) => {
          this._show_spinner = false;
          console.error(e);
        }
      })
    }

    obtenerTecnicos(id:any) {
      this._show_spinner = true;
      this.listaTecnicos = [];
      this.listaTecnicosGhost = [];
      this.mant.obtenerUsuariosCronos(id).subscribe({
        next: (x) => {
          this.listaTecnicos = x;
          this.listaTecnicosGhost = x;
          this._show_spinner = false;
        } ,error: (e) => {
          this._show_spinner = false;
          console.error(e);
        }
      })
    }

    filtrotTecnicos() {
      let filter: any = this.tecnicosSearchForm.controls['filter'].value;
      this.listaTecnicos = this.listaTecnicosGhost.filter((item: any) =>
        item.nombre.toString().toLowerCase().includes(filter.toLowerCase()) ||
        item.apellido.toString().toLowerCase().includes(filter.toLowerCase()) ||
        item.nombreEstado.toString().toLowerCase().includes(filter.toLowerCase()) ||
        item.nombreProvincia.toString().toLowerCase().includes(filter.toLowerCase()) ||
        item.telf.toString().toLowerCase().includes(filter.toLowerCase()) ||
        item.nombreLicencia.toString().toLowerCase().includes(filter.toLowerCase())
      )
    }

    selectRow(tecnico: any) {
      tecnico.selected = !tecnico.selected;

      if (tecnico.selected) {
        // Verificar si el técnico ya existe en la lista (comparando por coduser)
        const existe = this.listaTecElegidos.some(t => t.coduser === tecnico.coduser);
        if (!existe) {
          this.listaTecElegidos.push(tecnico);
        } else {
          // console.warn('El técnico ya está seleccionado');
          tecnico.selected = true; // Mantener el estado seleccionado
        }
      } else {
        // Eliminar por coduser en lugar de por referencia directa
        const index = this.listaTecElegidos.findIndex(t => t.coduser === tecnico.coduser);
        if (index > -1) {
          this.listaTecElegidos.splice(index, 1);
        }
      }
      console.table(this.listaTecElegidos);
    }

    onCheckboxChange(filter: any, tecnico: any) {
      if (filter.target.checked) {
        // Verificar si el técnico ya existe en la lista
        const existe = this.listaTecElegidos.some(t => t.coduser === tecnico.coduser);
        if (!existe) {
          this.listaTecElegidos.push(tecnico);
        } else {
          // console.warn('El técnico ya está seleccionado');
          filter.target.checked = true; // Mantener el checkbox marcado
        }
      } else {
        // Eliminar por coduser
        const index = this.listaTecElegidos.findIndex(t => t.coduser === tecnico.coduser);
        if (index > -1) {
          this.listaTecElegidos.splice(index, 1);
        }
      }
      console.table(this.listaTecElegidos);
    }

  listaLocalidades: any = [];
  obtenerLocalidades() {
    this.mant.obtenerLocalidades().subscribe({
        next: (x) => {
          this.listaLocalidades = x;
          // // console.warn('Estas son las localidades');
          // // console.warn(this.listaLocalidades);
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
       }
      }
    )
  }

  closeDialog() {
    this.dialogRef.close(this.listaTecElegidos);
  }

guardarProcedimientos() {
  let xuser: any = sessionStorage.getItem('codcli');
  
  // Primero eliminamos técnicos repetidos (basado en algún campo único como coduser)
  const tecnicosUnicos = this.eliminarTecnicosRepetidos(this.listaTecElegidos);
  
  if (tecnicosUnicos.length > 0) {
    tecnicosUnicos.filter((x: any) => {
      let aniox = new Date().getFullYear();
      let mesx = new Date().getMonth();
      let codigoCrono = 'CRONO-' + this.mant.generateRandomString(15) + '-' + mesx.toString() + aniox.toString();
      let fechaRealIni = this.data.fecreaRealIni;
      let dateRequerReal = new Date(fechaRealIni);
      let diaReal = dateRequerReal.getDate();
      let mesReal = dateRequerReal.getMonth();
      let anioReal = dateRequerReal.getFullYear();
      let nombreTecnic = x.nombre + ' ' + x.apellido;
      x.ImagenTecnico = x.imagenPerfil;
      x.NombreTecnico = x.nombre;
      x.ApellidoTecnico = x.apellido;

      // Convertir fecha a objeto Date
      let fechaMantenimientoStr = diaReal + '-' + (mesReal + 1) + '-' + anioReal;
      let [dia, mes, anio] = fechaMantenimientoStr.split('-').map(Number);
      let fechaMantenimiento = new Date(anio, mes - 1, dia);

      this.modelCrono = {
        "codcrono": codigoCrono,
        "codusertecnic": x.coduser,
        "codagencia": this.data.idAgencia,
        "observacion": '',
        "feccrea": new Date(),
        "codusercreacrono": xuser,
        "semanainicio": 0,
        "dia": dia,
        "mes": mes,
        "anio": anio,
        "fechamantenimiento": fechaMantenimiento,
        "maquinasmanuales": 1,
        "Codlocalidad": this.tecnicosSearchForm.controls['localidad'].value,
        "Estado": 0,
        "idRequer": this.data.idTicket
      }

      x.IdTicket = this.data.idTicket;
      this._show_spinner = true;

      this.guardarCrono(this.modelCrono, nombreTecnic)
      this.guardarMantenimiento(
        codigoCrono,
        x.coduser,
        this.data.horaInicialReal,
        this.data.horaFinalReal,
        this.data.codMarca,
        this.data.fecreaRealIni,
        this.data.fecreaRealFin
      );

      this.guardarAsignacionTecnicoTicket(x, this.data.horaInicialReal, this.data.horaFinalReal, this.data.fecreaRealIni, this.data.fecreaRealFin);
      this.mant.guardarCronoInteligente(this.data.codfrecuencia, codigoCrono).subscribe({
        next: (x) => {
          this._show_spinner = false;
        },
        error: (e) => {
          this._show_spinner = false;
          console.error(e);
        },
        complete: () => {
          this.closeDialog();
        }
      })
    });
  }
}

// Función para eliminar técnicos repetidos
eliminarTecnicosRepetidos(tecnicos: any[]): any[] {
  // Usamos un objeto para almacenar técnicos únicos (usando coduser como clave)
  const tecnicosUnicos: { [key: string]: any } = {};
  
  tecnicos.forEach(tecnico => {
    if (!tecnicosUnicos[tecnico.coduser]) {
      tecnicosUnicos[tecnico.coduser] = tecnico;
    }
  });
  
  // Convertimos el objeto de vuelta a array
  return Object.values(tecnicosUnicos);
}

    guardarCrono( modelCrono:any, tecnico:string ) {
      this._show_spinner = true;
      this.mant.guardarCronos(modelCrono).subscribe (
        {
          next: (x) => {
            this._show_spinner = false;
            Toast.fire({ icon: 'success',
                         title: 'Trabajo asignado al técnico: ' + tecnico+'.',
                         text: 'Esperando la confirmación del trabajo para cambiar de estado.',
                         timer: 2500  });
          }, error: (e) => {
            this._show_spinner = false;
            Toast.fire({ icon: 'error',
                         title: 'No se ha podido agregar este trabajo al ' + tecnico+'.' });
          }, complete: () => { 
            // this.obtenerCrono(modelCrono.mes, 'void', 3)
            // this.actualizarEstadoAgencia(2, this.modelCrono.codagencia);
            this._show_spinner = false;
          }
        })
    }

    modelSendAsignacionTecnicoTicket: any = [];
    // guardarAsignacionTecnicoTicket( data: any ) {        
    //     this.modelSendAsignacionTecnicoTicket = {
    //       idRequerimiento: this.data.idTicket,
    //       resTecnico: '',
    //       urlA: '',
    //       urlB: '',
    //       codTenicUser: data.coduser,
    //       fechacrea: new Date(),
    //       fechares: new Date()
    //     }

    //     this.mant.guardarAsignacionTecnicoTicket( this.modelSendAsignacionTecnicoTicket, data ).subscribe({
    //       next: (x) => {
    //           // // console.log('Se completo la asignacion del  tecnico al requerimiento');
    //         }, error: (e) => console.error(e)
    //     })
    // }


    guardarAsignacionTecnicoTicket(data: any, horaIni: any, horafin: any, fechaIni: any, fechaFin: any) {        
    
        this.modelSendAsignacionTecnicoTicket = {
          idRequerimiento: this.data.idTicket,
          resTecnico: '',
          urlA: '',
          urlB: '',
          codTenicUser: data.coduser,
          fechacrea:    new Date(),
          fechares:     new Date(),
          horaIni:      horaIni,
          horafin:      horafin,
          fechaIni:     fechaIni,
          fechaFin:     fechaFin
        }
      
        // console.warn('<<<<<<<<<<<<this.modelSendAsignacionTecnicoTicket>>>>>>>>>>>>');
        // console.warn('<<<<<<<<<<<<this.modelSendAsignacionTecnicoTicket>>>>>>>>>>>>');
        // console.warn(this.modelSendAsignacionTecnicoTicket);
        // console.warn('<<<<<<<<<<<<this.modelSendAsignacionTecnicoTicket>>>>>>>>>>>>');
        // console.warn('<<<<<<<<<<<<this.modelSendAsignacionTecnicoTicket>>>>>>>>>>>>');

        this.mant.guardarAsignacionTecnicoTicket(
          this.modelSendAsignacionTecnicoTicket, 
          data
        ).subscribe({
          next: (response) => {
            // console.log('Asignación completada', response);
            // Puedes acceder a response.tecnico si necesitas los datos del técnico
          }, 
          error: (e) => console.error('Error en asignación', e)
        });
    }

    guardarMantenimiento(codCrono: any, codusertecnic: any, hi:any, hf:any, codprod: any, feciniciomante: any, fecfinmant: any) {

      let xuser: any = sessionStorage.getItem('codcli');
      this.modelMantenimiento = {
        codcrono:       codCrono,
        codtecnico:     codusertecnic,
        feciniciomante: feciniciomante,
        fecfinmant:     fecfinmant,
        feccrea:        new Date(),
        horainit:       hi,
        horafin:        hf,
        usercrea:       xuser,
        codprod:        codprod,
        estado:         1,
        idRequer:       this.data.idTicket
      }

      this.mant.guardarMantenimiento(this.modelMantenimiento).subscribe ({
        next:(x) => {
          Toast.fire({
            icon: 'success',
            title: 'Asignación ha sido completada'
          })
          // // console.log(x);
        }, error: (e) => {
          // console.log(e);
          Toast.fire({
            icon: 'error',
            title: 'No se ha podido completar la asignación'
          })
        }, complete: () => {}
      })

    }
  
    }


