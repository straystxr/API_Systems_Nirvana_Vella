import { AfterViewInit, Component, OnDestroy, ViewChild, inject, ElementRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, ModalController, ToastController } from '@ionic/angular/standalone';
import { ArticleModalComponent } from '../components/article-modal/article-modal.component';
import { ArticleService, Article } from '../services/article';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  standalone: true,
})
export class Tab1Page implements AfterViewInit, OnDestroy {
  @ViewChild(IonContent, {read : ElementRef}) mapRef!: ElementRef<HTMLDivElement>;

  map!: L.Map;
  private markers = new Map<string, L.Marker>();
  private articleSub!: Subscription;
  private mapInitialized = false;

  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  constructor(private articleService: ArticleService) {}

  ngAfterViewInit() {
    requestAnimationFrame(() => {this.initMap()});
  }

  ionViewDidEnter() {
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
      }
    }, 200);
  }

  ngOnDestroy() {
    if (this.articleSub) this.articleSub.unsubscribe();
    
    //destroying the map when the user leaves the page
    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }
  }

  private initMap(): void {
    if (!this.mapRef || !this.mapRef.nativeElement) {
      console.error('Map container reference not found');
      return;
    }

    const container = this.mapRef.nativeElement;

    // Clean existing content
    container.innerHTML = '';

    // Create map using the actual DOM element reference
    this.map = L.map(container, {
      center: [35.9375, 14.3754],
      zoom: 11,
      renderer: L.canvas(),
      zoomControl: false,
      attributionControl: false,
      minZoom: 10,
      maxZoom: 20,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(this.map);

    L.control.zoom({
      position: 'topright',
      zoomInTitle: 'Zoom in',
      zoomOutTitle: 'Zoom out'
    }).addTo(this.map);

    this.enablePinDrop();
    this.watchArticles();
  }

   private enablePinDrop(): void {
    this.map.on('click', async (e: L.LeafletMouseEvent) => {
      console.log('Map clicked at:', e.latlng.lat, e.latlng.lng);
      await this.openArticleModal(e.latlng.lat, e.latlng.lng);
    });
  }

  private async openArticleModal(lat: number, lng: number): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ArticleModalComponent,
      componentProps: { lat, lng },
      breakpoints: [0, 0.92],
      initialBreakpoint: 0.92,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.articleService.addArticle({
        title: data.title,
        body: data.body,
        category: data.category,
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
    this.articleSub = this.articleService.getArticles().subscribe(articles => {
      articles.forEach(article => {
        if (!this.markers.has(article.id)) {
          this.addMarker(article);
        }
      });
    });
  }

  private addMarker(article: Article): void {
    const icon = L.divIcon({
      className: '',
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
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    const marker = L.marker([article.lat, article.lng], { icon }).addTo(this.map);

    marker.bindPopup(`
      <div style="min-width: 180px; font-family: sans-serif;">
        <p style="margin: 0 0 4px; font-size: 11px; color: #888;">${article.category}</p>
        <strong style="font-size: 14px;">${article.title}</strong>
        <p style="margin: 6px 0 4px; font-size: 12px; color: #555;">By ${article.authorName}</p>
        <p style="margin: 0; font-size: 12px;">${article.body.substring(0, 100)}${article.body.length > 100 ? '...' : ''}</p>
      </div>
    `);

    this.markers.set(article.id, marker);
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success',
    });
    await toast.present();
  }
}