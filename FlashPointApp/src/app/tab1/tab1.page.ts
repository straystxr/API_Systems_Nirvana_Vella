import { AfterViewInit, Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
//importing leaflet library
import * as L from 'leaflet';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab1Page{

  //initializing the variable 
  map!: L.Map;

  constructor() {}

  ngAfterViewInit(){
    this.map = L.map('map',{
      //adding the coordinates of where the map should be
      center: [25.3791924, 55.4765436],
      zoom: 15, //amount of zoom
      renderer: L.canvas()
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

  //Marker for now no
  //   L.marker([51.5, -0.09]).addTo(map)
  //       .bindPopup('A pretty CSS popup.<br> Easily customizable.')
  //       .openPopup();
  }
}
