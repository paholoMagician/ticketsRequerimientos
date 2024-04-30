import { Component } from '@angular/core';
import { TablaHelpDeskService } from '../../dashboard/tabla-help-desk/services/tabla-help-desk.service';
import { EncryptService } from '../services/encrypt.service';
import { Environments } from 'src/app/environments/environments';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-navside',
  templateUrl: './navside.component.html',
  styleUrls: ['./navside.component.scss']
})
export class NavsideComponent {

  sub: any;
  nameidentifier: any;
  name: any;
  role: any;
  authorizationdecision: any;
  exp: any;
  iss: any;
  aud: any;
  codcli: any;
  head_agen: any = 'Agencia';
  view_cli: boolean = true;
  actionButton: boolean = true;

  nombreUser:any;

  ngOnInit(): void {
    this.getToken();
  }

  constructor( private ncrypt: EncryptService, private env: Environments ) {}

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

      if(this.role == 'C') {
        this.view_cli = true;
        this.actionButton = false;
      }
      else if(this.role == 'A') {
        this.view_cli = false;
        this.actionButton = true;
      }

      this.nombreUser = this.name;

    } 
  }

}
