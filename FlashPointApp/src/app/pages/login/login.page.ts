import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent
  ]
})
export class LoginPage implements OnInit {
  public errorMessage: string = '';
  public username: string = '';
  public password: string = '';

  constructor(
    private authService: Auth,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    if (window.location.hash) {
      const loadingIndicator = await this.showLoadingIndicator();
      try {
        await this.authService.handleLoginCallback(window.location.href);
        this.router.navigate(['/tabs']);
      } catch (e: any) {
        this.errorMessage = e.message;
      } finally {
        loadingIndicator.dismiss();
      }
    }
  }

  async login() {
    const loadingIndicator = await this.showLoadingIndicator();
    try {
      await this.authService.login();
      this.router.navigate(['/tabs']);
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