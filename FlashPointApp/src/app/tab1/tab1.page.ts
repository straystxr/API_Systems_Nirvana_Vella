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
export class Tab1Page implements AfterViewInit{

  //initializing the variable 
  map!: L.Map;

  constructor() {}

  ngAfterViewInit(){
    this.map = L.map('map',{
      //adding the coordinates of where the map should be
      center: [35.8983, 14.5126],
      zoom: 30, //amount of zoom
      renderer: L.canvas(),
      //removing the plus and minus buttons
      zoomControl: false
    });

  //utilising a map without the landmark icons etc to make it less busy 
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 15
    }).addTo(this.map);

  //Marker for now no
  //   L.marker([51.5, -0.09]).addTo(map)
  //       .bindPopup('A pretty CSS popup.<br> Easily customizable.')
  //       .openPopup();
  }
  //ionic uses dynamic layout which can break the leaflet plugin
  ionViewDidEnter() {
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);


    //bounding a map view to a specific geographical bounds
    //fitBounds() or setMaxBounds()
}
}
