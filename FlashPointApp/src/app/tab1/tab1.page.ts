import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, ModalController, ToastController } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { ArticleModalComponent } from '../components/article-modal/article-modal.component';
import { ArticleService, Article } from '../services/article';
//preventing memory leaks when unsubsribing to an Observable
import { Subscription } from 'rxjs';
//importing leaflet library
import * as L from 'leaflet';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent
  ],
})
export class Tab1Page implements AfterViewInit, OnDestroy{
  //initializing the variable 
  //! means the map variable will be assigned immediately
  map!: L.Map;

  //adding the Leaflet markers
  private markers = new Map<string, L.Marker>();

  //stores articles list 
  private articleSub!: Subscription;

  //ionic controllers with inject() in standalone components
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);


  constructor(
    //ArticleService is our in-memory data store
    private articleService: ArticleService,
  ) {}

  ngAfterViewInit() {
    this.initMap();
  }

  //ionic uses dynamic layout which can break the leaflet plugin
  //fires everytime the user interacts with the map as well
  ionViewDidEnter() {
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }
  //needed for the OnDestroy Class
  ngOnDestroy() {
    if (this.articleSub) this.articleSub.unsubscribe();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [35.9375, 14.3754], //centering the map view onto malta
      zoom: 11, //the amount of zoom
      renderer: L.canvas(), //loading the leaflet map 
      zoomControl: false, 
      minZoom: 10, //minimum zoom amount
      maxZoom: 20, //maximum zoom amount
    });

    //changing the tile layer to a cleaner map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(this.map);

    //moving the zoom controls to the top right
    L.control.zoom({position: 'topright'}).addTo(this.map);

    //map click listener so tapping the map opens the article form
    this.enablePinDrop();

    //listening to the article store so pins stay in sync
    this.watchArticles();
  }

    private enablePinDrop(): void {
    // fires every time the user taps the map
    // e.latlng contains the exact coordinates of the tap
    this.map.on('click', async (e: L.LeafletMouseEvent) => {
      await this.openArticleModal(e.latlng.lat, e.latlng.lng);
    });
  }

  private async openArticleModal(lat: number, lng: number): Promise<void> {
    //create the modal and pass in the coordinates from the map tap
    const modal = await this.modalCtrl.create({
      component: ArticleModalComponent,
      componentProps: { lat, lng },
      //slides up from the bottom
      breakpoints: [0, 0.92],
      initialBreakpoint: 0.92,
    });

    await modal.present();

    // role === 'confirm' means user tapped Publish
    // role === 'cancel' means user tapped Cancel
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      // save the article to the in-memory store
      this.articleService.addArticle({
        title:      data.title,
        body:       data.body,
        category:   data.category,
        authorName: data.authorName,
        lat,
        lng,
        url: '',
        source: '',
        status: 'pending',
        verification_status: 'unverified', 
      });

      await this.showToast(`"${data.title}" published!`);
    }
  }

  private watchArticles(): void {

    //runs immediately with current articles and again whenever a new one is added
    this.articleSub = this.articleService.getArticles().subscribe(articles => {
      articles.forEach(article => {
        //only add a marker if one doesn't already exist for this article
        //prevents duplicate pins when the list updates
        if (!this.markers.has(article.id)) {
          this.addMarker(article);
        }
      });
    });
  }

  private addMarker(article: Article): void {
    //custom HTML pin icon instead of the default Leaflet blue marker
    const icon = L.divIcon({
      className: '', //empty prevents Leaflet adding its own default styles
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: #E24B4A;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
        </div>
      `,
      iconSize: [36, 36],
      // bottom centre of the diamond sits exactly on the tapped coordinate
      iconAnchor: [18, 36],
      // popup opens directly above the pin
      popupAnchor: [0, -36],
    });

    const marker = L.marker([article.lat, article.lng], { icon })
      .addTo(this.map);

    //popup content shown when the user taps the pin
    marker.bindPopup(`
      <div style="min-width: 180px; font-family: sans-serif;">
        <p style="margin: 0 0 4px; font-size: 11px; color: #888;">
          ${article.category}
        </p>
        <strong style="font-size: 14px;">${article.title}</strong>
        <p style="margin: 6px 0 4px; font-size: 12px; color: #555;">
          By ${article.authorName}
        </p>
        <p style="margin: 0; font-size: 12px;">
          ${article.body.substring(0, 100)}${article.body.length > 100 ? '...' : ''}
        </p>
      </div>
    `);

    //store the marker using the article id as the key
    //this is what watchArticles() checks to prevent duplicates
    this.markers.set(article.id, marker);
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,   //auto dismisses after 3 seconds
      position: 'top',  //appears below the header
      color: 'success', //green to signal success
    });
    await toast.present();
  }
}