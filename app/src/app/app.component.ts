import { Component, OnDestroy, OnInit } from '@angular/core';
import {DataService} from './data.services';
import { CommonModule } from "@angular/common";
import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DataService, HttpClient]
})
export class AppComponent  {
  title = 'WeatherApp';
  connection:any;
  message:any;
  messages:any[] =[];
  data:any = '1';
  chart:any ;
  barChartData:any;
 
  constructor(private chatService: DataService, private _http: HttpClient) { }

  public barChartType = 'bar';
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  allData() {
    return this._http.get("http://localhost:3000/chartdata"); //get all data from database
    
    }
  


  ngOnInit(){ // run on init

    this.connection = this.chatService.getLiveData().subscribe(message=>{  //init connection with observable
      this.data = message; //get value from message to update data
      this.messages.push(this.data); // get updated value and pass to messages of chart
    });
    this.allData().subscribe(res => {
      this.chart = res; // get all values
      for(let i in this.chart){
        this.barChartData.push(this.chart[i].main.temp);
      }
      
    });
  }


  ngOnDestroy () {
    this.connection.unsubcribe(); // finish connection to observable
  }



}

