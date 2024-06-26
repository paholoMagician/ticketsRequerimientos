import { Injectable } from "@angular/core";
import { EncryptService } from "../components/shared/services/encrypt.service";

@Injectable({
    providedIn: 'root'
})

export class Environments {

    constructor( private encrypt: EncryptService ) { }
        
    // apiHelpDeskSytem: any = 'http://181.188.224.4:5208';
    // apiHelpDeskSytem: any = 'http://localhost:5075/api/';
    apiHelpDeskSytem:  any = 'http://192.168.55.66/:5075/api/';
    apiHelpDeskSytemh: any = 'http://192.168.55.66/:5075/';
    apiCMS:            any = 'http://192.168.55.66/:5130/api/';
    // apiHelpDeskSytem: any = 'http://localhost:9998/api/';
    // apiCMS:            any = 'http://192.168.100.12:1131/api/';
    

    version: string = '1.0.1';
    es:      number = 5;
    hash:    number = 10;
    encode:  number = 99;
    codcia:  string = 'CMS-001-2023';

    apiurl(): string {
        const  env: string      = this.apiHelpDeskSytem+'api/';
        return env;
    }

    apiUrlHub(): string {
        const  envHub: string   = this.apiHelpDeskSytem+'hubs/';
        // const  envHub: string   = this.apiCMS+'hubs/';
        return envHub;
    }

    apiUrlStorage(): string {
        const  envstorage:string = this.apiHelpDeskSytem;
        return envstorage;
    }

    apiUrlIcon(): string {
        const  envicon           = this.apiHelpDeskSytem+'iconsApp/';
        return envicon;
    }

    TokenJWT():string {
        let xtoken: any = sessionStorage.getItem('token');
        let x: any = this.encrypt.decryptWithAsciiSeed(xtoken, this.es, this.hash);
        return x;
    }

    appTheme: appTheme = {
        colorPrimary:     '#0f5499',
        colorSecondary:   '#A5CF61',
        colorSecondary_A: '#6F9B3C',
        colorSecondary_B: '#558257',
        colorSecondary_C: '#1B456F',
    };

    getAppTheme(): appTheme {
        return this.appTheme;
    }

}



export interface  appTheme {
    colorPrimary:     string,
    colorSecondary:   string,
    colorSecondary_A: string,
    colorSecondary_B: string,
    colorSecondary_C: string
}






