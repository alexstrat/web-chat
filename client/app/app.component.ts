import { Component } from '@angular/core';

@Component({
  selector: 'web-chat-app',
  template: `
  <h1>ChatX</h1>
  <login *ngIf="!isLoggedIn" (login)="onLogin()"></login>
  <chat *ngIf="isLoggedIn" [user]="user"></chat>
  `
})


export class AppComponent  {
  isLoggedIn: boolean;
  user: any;

  constructor() {
    this.setIsLoggedIn()
  }

  setIsLoggedIn() {
    const user = localStorage.getItem('user');
    this.isLoggedIn = user != null;
    if (user)
      this.user = JSON.parse(user);
  }

  onLogin() {
    this.setIsLoggedIn()
  }
}
