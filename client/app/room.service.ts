import { Injectable } from "@angular/core";
import {Headers, Http} from "@angular/http";

@Injectable()
export class RoomService {
    roomAPIEndpoint: string = `${window.location.href}api/Rooms`
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) {}

    findRoom(roomName: string) {
      const filter = JSON.stringify({where: {name: roomName}});
      return this.http
        .get(`${this.roomAPIEndpoint}/findOne?filter=${filter}`)
        .toPromise()
    }

    createRoom(roomName: string, ownerId: number) {
      const room = {
        name: roomName,
        ownerId: ownerId
      }
      return this.http
        .post(`${this.roomAPIEndpoint}`, JSON.stringify(room), {headers: this.headers})
        .toPromise()
    }
}
