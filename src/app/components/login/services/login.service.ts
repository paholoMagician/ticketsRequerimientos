import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public url: string = this.env.apiHelpDeskSytem;

  constructor( private http: HttpClient, public router: Router, private env: Environments ) { }

  login( model: any[] ) {
    return this.http.post( 'http://localhost:5075/api/Login/InicioSesion', model )
  }

  validate() {

    console.log('Tratando de validar')

    let token: any = sessionStorage.getItem('token');
    if( token == undefined || token == null || token == '' ) {
      console.log('No hay token')
      this.router.navigate(['login']);
    } else {
      console.log('Si hay token')
      this.router.navigate(['home']);
    }
  }

  closeSession() {
    sessionStorage.removeItem('UserCod');
    sessionStorage.removeItem('UserName');
    sessionStorage.removeItem('cedula');
    sessionStorage.removeItem('tipo');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('imagen');
    sessionStorage.removeItem('email');
    localStorage.removeItem('imgperfil');
    localStorage.removeItem('codcia');
    this.validate();
  }
  
}
