import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
  ]
})
export class LoginPage implements OnInit {
  public errorMessage: string = '';
  public username: string = '';
  public password: string = '';
  public showPassword: boolean = false;

  constructor(
    private authService: Auth,
    private loadingController: LoadingController,
    private router: Router
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  async ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tabs/tab1']);
    }
  }

  async login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter your username and password.';
      return;
    }

    const loadingIndicator = await this.showLoadingIndicator();
    try {
      await this.authService.login(this.username, this.password);
      this.router.navigate(['/tabs/tab1']);
    } catch (e: any) {
      console.error(e.message);
      this.errorMessage = e.message;
    } finally {
      loadingIndicator.dismiss();
    }
  }

  private async showLoadingIndicator() {
    const loadingIndicator = await this.loadingController.create({
      message: 'Logging in...',
    });
    await loadingIndicator.present();
    return loadingIndicator;
  }
}