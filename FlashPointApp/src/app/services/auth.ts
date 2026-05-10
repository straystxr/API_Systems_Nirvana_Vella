import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  //still having issues for some reason
  private apiUrl = 'http://localhost:8888/API_Systems_Nirvana_Vella/flashpoint-api/api/auth';
  
  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<any> {

    return await firstValueFrom(
      //this.http.post(`${this.apiUrl}/login` this.apiUrl is calling the path and login is calling the function/method
      this.http.post(`${this.apiUrl}/login`, {
        email,
        password
      })
    );
  }
}