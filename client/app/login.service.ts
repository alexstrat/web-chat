import { Injectable } from "@angular/core";
import {Headers, Http} from "@angular/http";

@Injectable()
export class LoginService {
    userAPIEndpoint: string = `${window.location.href}api/WebChatUsers`
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) {}

    findUser(userData: any) {
      const filter = JSON.stringify({where: userData});
      return this.http
        .get(`${this.userAPIEndpoint}/findOne?filter=${filter}`)
        .toPromise()
    }

    createUser(user: any) {
      return this.http
        .post(`${this.userAPIEndpoint}`, JSON.stringify(user), {headers: this.headers})
        .toPromise()
    }
}
