import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private apiUrl = 'http://localhost:8888/API_Systems_Nirvana_Vella/flashpoint-api/api/auth';
  
  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<any> {

    return await firstValueFrom(
      this.http.post(`${this.apiUrl}/login.page.ts`, {
        email,
        password
      })
    );
  }
}