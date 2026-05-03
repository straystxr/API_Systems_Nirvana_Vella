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
export class Tab1Page implements AfterViewInit {
  //initializing the variable 
  //! means the map variable will be assigned immediately
  map!: L.Map;

  constructor() {}

  ngAfterViewInit() {
    this.initMap();
  }

  //ionic uses dynamic layout which can break the leaflet plugin
  ionViewDidEnter() {
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [35.9375, 14.3754],
      zoom: 11,
      renderer: L.canvas(),
      zoomControl: false,
      minZoom: 10,
      maxZoom: 20,
    });

    //changing the tile layer to a cleaner map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(this.map);

    //moving the zoom controls to the top right
    L.control.zoom({position: 'topright'}).addTo(this.map);
  }
}