import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormularioRegistroProblemasService } from './services/formulario-registro-problemas.service';



@Component({
  selector: 'app-formulario-registro-problemas',
  templateUrl: './formulario-registro-problemas.component.html',
  styleUrls: ['./formulario-registro-problemas.component.scss']
})
export class FormularioRegistroProblemasComponent implements OnInit {

  codcli: any;

  registerTroubleForm = new FormGroup  (
    {
      mensajeDelProblema: new FormControl(''),
      contrasenia:        new FormControl('')
    }
  )


  constructor( private maquinaria: FormularioRegistroProblemasService ) {}

  onSubmit() {}

  ngOnInit(): void {
    this.obtenerMaquinas();
  }

  listaMaquinaria: any = [];
  obtenerMaquinas() {
    this.maquinaria.obtenerMaquinaria(this.codcli).subscribe({
      next: (x) => {
        this.listaMaquinaria = x;
        console.log(this.listaMaquinaria);
      }
    })
  }


}
