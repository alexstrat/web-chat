import {Component, Output, EventEmitter} from '@angular/core';
import {LoginService} from './login.service';

@Component({
    selector: 'login',
    template: `
      <div>
        <div>
          <label> Pseudo: <input [(ngModel)]="user.nickname"/></label>
        </div>
        <div>
          <label> Mot de passe: <input type="password" [(ngModel)]="user.password"/></label>
        </div>
        <div>
          <button (click)="signin()">Se connecter</button>
          <button (click)="signup()">S'inscrire</button>
        </div>
        <div class="error" *ngIf="error">{{error}}</div>
        <div class="message" *ngIf="message">{{message}}</div>
      </div>
    `,
    styles: [ '.error { color: red }', '.message { color: green }'],
    providers: [LoginService]
})
export class Login {
    user: any = {};
    error: string;
    message: string;
    @Output() login = new EventEmitter();

    constructor(private loginService: LoginService) {}

    signup() {
      this.message = null;
      this.loginService
        .createUser(this.user)
        .then( user => {
          this.error = null;
          this.message = 'Signup successful!'
        })
        .catch( error => {this.error = 'An error occured during signup.';});
    }

    signin() {
      this.message = null;
      this.loginService
        .findUser(this.user)
        .then( user => {
          this.error = null;
          localStorage.setItem('user', JSON.stringify(user.json()));
          this.login.emit();
        })
        .catch( error => {this.error = 'No user was found';});
    }
}
