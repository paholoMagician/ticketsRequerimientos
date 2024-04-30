import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormularioRegistroProblemasService } from './services/formulario-registro-problemas.service';
import { Environments } from 'src/app/environments/environments';
import { ImagecontrolService } from '../../shared/imagen-control/imagecontrol.service';

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
  selector: 'app-formulario-registro-problemas',
  templateUrl: './formulario-registro-problemas.component.html',
  styleUrls: ['./formulario-registro-problemas.component.scss']
})
export class FormularioRegistroProblemasComponent implements OnInit {
  _show_spinner: boolean = false;
  listaEquipos: any = [];
  @Output() showFormView: EventEmitter<any> = new EventEmitter();
  @Output() GetTickets: EventEmitter<any> = new EventEmitter();

  maquinarias_show: boolean = false;
  listaAgencias: any    = [];
  _dis_btn: boolean = false;
  _data_label:   string = 'agencia';
  codcli: any;
  listaMaquinaria: any = [];
  modelTicket: any = [];

  nameFile: string = '';
  nameFileB: string = '';
  _IMGE:any;
  _IMGEB:any;
  public file!: File;
  public fileB!: File;
  public fileId: any;
  public fileIdB: any;

  registerTroubleForm = new FormGroup  ({
      agencia:            new FormControl(''),
      mensajeDelProblema: new FormControl(''),
      equipo:             new FormControl(''),
      fileA:              new FormControl(''),
      fileB:              new FormControl(''),
      tipo:               new FormControl(''),
      observacion:        new FormControl('')
  })


  constructor( private maquinaria: FormularioRegistroProblemasService, private env: Environments, private fileserv: ImagecontrolService ) {}

  onSubmit() {
    this.guardarTicket();
  }

  ngOnInit(): void {
    const xcli: any = sessionStorage.getItem('codcli');
    this.obtenerAgenciaCliente(this.env.codcia, xcli);
    this.validateTipoData();
  }

  obtenerAgenciaCliente(cci:string, filter:string) {
    this.maquinaria.obtenerAgencias( cci, filter, 777 ).subscribe({
        next: ( x ) => {
          this.listaAgencias = x;
        }, error: (e) => {
          console.error(e);
        }, complete: () => { }
      }
    )
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

  cancelBtn() {
    this.showFormView.emit( false );
  }

  guardarTicket() {

    this.modelTicket = {

      idAgencia:          this.registerTroubleForm.controls['agencia'].value,
      urlA:               this.nameFile,
      urlB:               '- sf -',
      estado: 1,
      mensajeDelProblema: this.registerTroubleForm.controls['mensajeDelProblema'].value,
      obervacion:         this.registerTroubleForm.controls['observacion'].value,
      codMaquina:         this.registerTroubleForm.controls['equipo'].value || 'Problema de software',
      fechacrea: new Date(),
      tipo:               this.registerTroubleForm.controls['tipo'].value

    }

    this.maquinaria.guardarTicket(this.modelTicket).subscribe({
      next: (x) => {
        Toast.fire({
          icon: "success",
          title: "Estado cambiado a leido"
        });
      }, error: (e) => {
        Toast.fire({
          icon: "error",
          title: "Algo ha pasado"
        });
        // alert('Error');
        console.error(e);
      }, complete: () => {
        this.uploadServerFile();   
        this.GetTickets.emit( true );
        this.limpiar();
      }
    })
  }

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
    this.registerTroubleForm.controls['tipo'].enable();
    this.registerTroubleForm.controls['agencia'].disable();
    this.registerTroubleForm.controls['fileA'].disable();
    this.registerTroubleForm.controls['fileB'].disable();
    this.registerTroubleForm.controls['mensajeDelProblema'].disable();
    this.registerTroubleForm.controls['observacion'].disable();
    this.registerTroubleForm.controls['tipo'].enable();
    this.maquinarias_show = false;
  }

  encodeImageFileAsURL(id:any) {
    this._show_spinner = true;
    const filesSelected: any = document.getElementById(id) as HTMLInputElement;
    this.fileId = filesSelected.files;
    let s = this.fileId[0].name.split('.');
    this.nameFile = s[0].toString().replace(' ', '_');
    console.warn('this.nameFile');
    console.warn(this.nameFile);
    let base;
    if (this.fileId.length > 0) {
      const fileToLoad: any = filesSelected[0];
      const fileReader: any = new FileReader();
      fileReader.onload = () => {
        base = fileReader.result;
      };
      fileReader.onloadend = () => {
        this._IMGE = fileReader.result;
        // this.validacionHayImagen();
      };
      fileReader.readAsDataURL(this.fileId[0]);
      this._show_spinner = false;
    }

  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  uploadServerFile() {
    // this.guardarImgFileDB();
    this.fileserv.uploadFile(this.file, this.nameFile).subscribe({
      next: (x) => {
        console.log(x);
      }, error: (e) => {
        console.error(e);
      }, complete: () => {
      }
    })  
  }



}
