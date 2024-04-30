import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MasterTableService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, private env: Environments) { }

  obtenerDatosMasterTable( master:string ) {
    this.http.get( this.urlHelpDesk + 'Master/ObtenerMasterTable/' + master );
  }

}
