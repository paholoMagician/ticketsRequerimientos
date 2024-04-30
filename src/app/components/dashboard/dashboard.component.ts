import { Component, OnInit } from '@angular/core';
import { EncryptService } from '../shared/services/encrypt.service';
import { jwtDecode } from "jwt-decode";
import { Environments } from 'src/app/environments/environments';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  view_cli: boolean = true;
  form_view: boolean = false;
  nameidentifier:any;
  sub:    any;
  name:   any;
  role:   any;
  authorizationdecision:any;
  exp:    any;
  iss:    any;
  aud:    any;
  codcli: any;

  constructor( private ncrypt: EncryptService, private env: Environments ) {}

  ngOnInit(): void {
    this.getToken();  
  }

  getToken() {
    let xtoken:any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
    if (xtokenDecript != null || xtokenDecript != undefined) {
        var decoded:any = jwtDecode(xtokenDecript);
      this.sub                   = decoded["sub"];
      this.nameidentifier        = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.name                  = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      this.role                  = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      this.authorizationdecision = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/authorizationdecision"];
      this.exp                   = decoded["exp"];
      this.iss                   = decoded["iss"];
      this.aud                   = decoded["aud"];
      this.codcli                = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country"];
      const rolEncrypt: any = this.ncrypt.encryptWithAsciiSeed(this.role, this.env.es, this.env.hash);
      sessionStorage.setItem('PR', rolEncrypt);
      sessionStorage.setItem('ID', this.nameidentifier);
      sessionStorage.setItem('codcli', this.codcli)

      if(this.role == 'C') this.view_cli = true;
      else if(this.role == 'A') this.view_cli = false;

    } 
  }

  getti:any;
  getTicket(event:any) {
    console.warn(event);
    if(event) {
      this.getti = event;
    }
  }

  showFormPermission(event:any) {
    this.form_view = event;
  }
 
  closeFormularioTicket(event:any) {
    this.form_view = event;
  }

  listenTicket(event:any) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log(event);
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  }

}
