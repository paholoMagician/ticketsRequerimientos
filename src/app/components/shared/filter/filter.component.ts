import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Output() datafilter: EventEmitter<any[]> = new EventEmitter<any[]>();
  
  public exportdataform = new FormGroup({
    filter:              new FormControl('')
  })

  constructor() { }

  ngOnInit(): void { }

  onSubmitData() {
    
  }

}
