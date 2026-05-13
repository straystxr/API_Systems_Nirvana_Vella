import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline, mailOutline, shieldCheckmarkOutline,
  logOutOutline, cameraOutline, arrowUpCircleOutline,
  arrowDownCircleOutline, closeCircleOutline,
  checkmarkCircle, closeCircle
} from 'ionicons/icons';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon]
})
export class Tab3Page implements OnInit {
  @ViewChild('photoInput') photoInput!: ElementRef;

  private apiUrl = 'http://localhost/API_Systems_Nirvana_Vella/flashpoint-api/api';

  public user: any = null;
  public membership: any = null;
  public showUpgrade: boolean = false;
  public showConfirm: boolean = false;
  public selectedTier: number | null = null;
  public confirmTierId: number | null = null;
  public errorMessage: string = '';
  public successMessage: string = '';

  constructor(
    private authService: Auth,
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({
      personCircleOutline, mailOutline, shieldCheckmarkOutline,
      logOutOutline, cameraOutline, arrowUpCircleOutline,
      arrowDownCircleOutline, closeCircleOutline,
      checkmarkCircle, closeCircle
    });
  }

  async ngOnInit() {
    this.user = this.authService.getUser();
    if (this.user) await this.loadMembership();
  }

  // ─── LOAD MEMBERSHIP ────────────────────────────────────────────────────────
  async loadMembership() {
    try {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + this.authService.getToken()
      });
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/users/${this.user.id}/membership`, { headers })
      );
      this.membership = res.membership;
    } catch (e: any) {
      this.errorMessage = 'Could not load membership info.';
    }
  }

  // ─── UPGRADE OPTIONS ────────────────────────────────────────────────────────
  showUpgradeOptions() {
    this.showUpgrade = true;
    this.selectedTier = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  selectTier(tierId: number) {
    this.selectedTier = tierId;
  }

  async upgradeMembership() {
    if (!this.selectedTier) return;
    await this.changePlan(this.selectedTier);
    this.showUpgrade = false;
  }

  // ─── CONFIRM CHANGE (downgrade / cancel) ────────────────────────────────────
  confirmChange(tierId: number) {
    this.confirmTierId = tierId;
    this.showConfirm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  async applyChange() {
    if (!this.confirmTierId) return;
    await this.changePlan(this.confirmTierId);
    this.showConfirm = false;
  }

  // ─── SHARED PLAN CHANGE ─────────────────────────────────────────────────────
  async changePlan(tierId: number) {
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + this.authService.getToken(),
        'Content-Type': 'application/json'
      });
      const res: any = await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/users/${this.user.id}/membership`,
          { tier_id: tierId },
          { headers }
        )
      );
      this.successMessage = res.message;
      await this.loadMembership();
    } catch (e: any) {
      this.errorMessage = e?.error?.error || 'Failed. Please try again.';
    }
  }

  // ─── PHOTO UPLOAD ───────────────────────────────────────────────────────────
  pickPhoto() {
    this.photoInput.nativeElement.click();
  }

  async onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + this.authService.getToken()
      });
      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/users/${this.user.id}/photo`, formData, { headers })
      );
      this.user.profile_photo = res.photo_url;
      const updatedUser = { ...this.authService.getUser(), profile_photo: res.photo_url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.successMessage = 'Profile photo updated!';
    } catch (e: any) {
      this.errorMessage = 'Photo upload failed. Please try again.';
    }
  }

  // ─── LOGOUT ─────────────────────────────────────────────────────────────────
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}