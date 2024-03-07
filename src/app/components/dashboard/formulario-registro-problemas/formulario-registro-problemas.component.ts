import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormularioRegistroProblemasService } from './services/formulario-registro-problemas.service';
import { Environments } from 'src/app/environments/environments';



@Component({
  selector: 'app-formulario-registro-problemas',
  templateUrl: './formulario-registro-problemas.component.html',
  styleUrls: ['./formulario-registro-problemas.component.scss']
})
export class FormularioRegistroProblemasComponent implements OnInit {

  listaAgencias: any    = [];
  _dis_btn: boolean = false;
  _data_label:   string = 'agencia';
  codcli: any;
  listaMaquinaria: any = [];
  registerTroubleForm = new FormGroup  ({
      agencia:            new FormControl(''),
      mensajeDelProblema: new FormControl(''),
      equipo:             new FormControl(''),
      fileA:              new FormControl(''),
      fileB:              new FormControl(''),
      tipo:               new FormControl(''),
      observacion:        new FormControl('')
  })


  constructor( private maquinaria: FormularioRegistroProblemasService, private env: Environments ) {}

  onSubmit() {
    this.guardarTicket();
  }

  ngOnInit(): void {
    const xcli: any = sessionStorage.getItem('codcli');
    this.obtenerAgenciaCliente(this.env.codcia, xcli);
    this.validateTipoData();
  }

  obtenerAgenciaCliente(cci:string, filter:string) {
    this.maquinaria.obtenerAgencias( cci, filter, 777 ).subscribe(
      {
        next: ( x ) => {
          this.listaAgencias = x;
        }, error: (e) => {
          console.error(e);
        }, complete: () => {}
      }
    )
  }

  obtenerMaquinas() {
    this.maquinaria.obtenerMaquinaria(this.codcli).subscribe({
      next: (x) => {
        this.listaMaquinaria = x;
        console.log(this.listaMaquinaria);
      }
    })
  }


  validateTipoData() {
    if ( this.registerTroubleForm.controls['tipo'].value == undefined || 
         this.registerTroubleForm.controls['tipo'].value == null || 
         this.registerTroubleForm.controls['tipo'].value == '' ) {
         this.registerTroubleForm.controls['agencia'].disable();
         this.registerTroubleForm.controls['mensajeDelProblema'].disable();
         this.registerTroubleForm.controls['equipo'].disable();
         this.registerTroubleForm.controls['fileA'].disable();
         this.registerTroubleForm.controls['fileB'].disable();
         this.registerTroubleForm.controls['observacion'].disable();
         this._dis_btn = true;
    } else if ( this.registerTroubleForm.controls['tipo'].value != undefined || 
         this.registerTroubleForm.controls['tipo'].value != null || 
         this.registerTroubleForm.controls['tipo'].value != '' ) {
         this.registerTroubleForm.controls['agencia'].enable();
         this._dis_btn = false;
    }
    this.tipoRequerimiento();
  }

  validateAgencia() {

    console.log('=======================================================');
    console.log('verificando');
    console.log(this.registerTroubleForm.controls['agencia'].value);
    console.log('=======================================================');

    if ( this.registerTroubleForm.controls['agencia'].value == undefined || 
        this.registerTroubleForm.controls['agencia'].value == null || 
        this.registerTroubleForm.controls['agencia'].value == '' ) {
        this.registerTroubleForm.controls['mensajeDelProblema'].disable();
        this.registerTroubleForm.controls['equipo'].disable();
        this.registerTroubleForm.controls['fileA'].disable();
        this.registerTroubleForm.controls['fileB'].disable();
        this.registerTroubleForm.controls['tipo'].disable();
        this.registerTroubleForm.controls['agencia'].enable();
        this.registerTroubleForm.controls['observacion'].disable();
    } else if ( this.registerTroubleForm.controls['agencia'].value != undefined || 
                this.registerTroubleForm.controls['agencia'].value != null || 
                this.registerTroubleForm.controls['agencia'].value != '' ) {
                this.registerTroubleForm.controls['mensajeDelProblema'].enable();
                this.registerTroubleForm.controls['equipo'].enable();
                this.registerTroubleForm.controls['fileA'].enable();
                this.registerTroubleForm.controls['fileB'].enable();
                this.registerTroubleForm.controls['tipo'].disable();
                this.registerTroubleForm.controls['agencia'].disable();
                this.registerTroubleForm.controls['observacion'].enable();
    }
  }

  listaEquipos: any = [];
  obtenerAsignacionMaquinariaAgencia() {

    const codAgencia: any = this.registerTroubleForm.controls['agencia'].value;
    this.maquinaria.obtenerAsignacionMaquinAgencia( codAgencia, this.env.codcia ).subscribe({
      next: (x) => {
        this.listaEquipos = x;
        console.log(this.listaEquipos);
      }
    })
  }  


  listaTipos: any = [

    {
      nombre: 'Bugs en el software CFI',
      codigo: 'BS'
    },{
      nombre: 'Mantenimiento o daño en los equipos CFI',
      codigo: 'EM'
    }

  ]

  modelTicket: any = [];
  guardarTicket() {

    this.modelTicket = {

      idAgencia:          this.registerTroubleForm.controls['agencia'].value,
      urlA:               this.registerTroubleForm.controls['fileA'].value,
      urlB:               this.registerTroubleForm.controls['fileB'].value,
      estado: 1,
      mensajeDelProblema: this.registerTroubleForm.controls['mensajeDelProblema'].value,
      obervacion:         this.registerTroubleForm.controls['observacion'].value,
      codMaquina:         this.registerTroubleForm.controls['equipo'].value || 'Problema de software',
      fechacrea: new Date(),
      tipo:               this.registerTroubleForm.controls['tipo'].value

    }

    console.warn(this.modelTicket);

    this.maquinaria.guardarTicket(this.modelTicket).subscribe({
      next: (x) => {
        alert('Guardado');
      }, error: (e) => {
        alert('Error');
        console.error(e);
      }, complete: () => {
        this.limpiar();
      }
    })
  }

  maquinarias_show: boolean = false;
  tipoRequerimiento() {
    if( this.registerTroubleForm.controls['tipo'].value == 'BS' ) {
      this.maquinarias_show = false;
    } else if ( this.registerTroubleForm.controls['tipo'].value == 'EM' ) {
      this.maquinarias_show = true;
    }
  }

  limpiar() {

    this.registerTroubleForm.controls['agencia'].setValue('');
    this.registerTroubleForm.controls['fileA'].setValue('');
    this.registerTroubleForm.controls['fileB'].setValue('');
    this.registerTroubleForm.controls['mensajeDelProblema'].setValue('');
    this.registerTroubleForm.controls['observacion'].setValue('');
    this.registerTroubleForm.controls['equipo'].setValue('');
    this.registerTroubleForm.controls['tipo'].setValue('');
    // this.validateAgencia();
    this.registerTroubleForm.controls['tipo'].enable();
    this.registerTroubleForm.controls['agencia'].disable();
    this.registerTroubleForm.controls['fileA'].disable();
    this.registerTroubleForm.controls['fileB'].disable();
    this.registerTroubleForm.controls['mensajeDelProblema'].disable();
    this.registerTroubleForm.controls['observacion'].disable();
    this.registerTroubleForm.controls['tipo'].enable();
    this.maquinarias_show = false;
  }

}
