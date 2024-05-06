import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LoginService } from './services/login.service';
import { Environments } from 'src/app/environments/environments';
import { EncryptService } from '../shared/services/encrypt.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  selector:    'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})

export class LoginComponent implements OnInit {

  hide                    = true;
  _show:          boolean = false;
  _show_spinner:  boolean = false;
  versionamiento: string  = this.env.version;

  public user: any = [];
  
  public loginForm = new FormGroup({
    email:       new FormControl(''),
    contrasenia: new FormControl('')
  });

  constructor( private log: LoginService, private env: Environments, private router: Router, private ncrypt: EncryptService  ) { }

  ngOnInit(): void {
      this.log.validate();
  }

  onSubmit() {
    this.logins();
  }

  loginModel:any = [];
  logins() {
    this._show_spinner = true;
    this.loginModel = {
      "usuario":  this.loginForm.controls['email'].value,
      "password": this.loginForm.controls['contrasenia'].value
    }

    this.log.login( this.loginModel ).subscribe({
      next: (x:any) => {
        console.log(x.token);
        Toast.fire({
          icon: 'success',
          title: 'Te has logeado con éxito'
        })
        const tokenEn:any = this.ncrypt.encryptWithAsciiSeed(x.token, 5, 10);
        sessionStorage.setItem('token', tokenEn);
        let xuser: any = this.loginForm.controls['email'].value;
        sessionStorage.setItem('usuario', xuser);
        setTimeout(() => {
          this.router.navigate(['home']);
        }, 2000);
        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
      }, complete: () => {
      }
    })
  }
}
