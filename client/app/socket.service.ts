import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import {Headers, Http} from "@angular/http";
import * as io from "socket.io-client";

@Injectable()
export class SocketService {
    private socketUrl: string = 'http://0.0.0.0:3000';
    private messageAPIEndpoint: string = `${this.socketUrl}/api/Messages`;
    private headers = new Headers({'Content-Type': 'application/json'});
    socket: SocketIOClient.Socket;

    constructor(private http: Http) {
      this.socket = io.connect(this.socketUrl);
      this.socket.on('error', (error: string) => {
        console.error(`An error occured: ${error}`);
      });
    }

    getMessages(roomId: number): Observable<any> {
      this.socket.emit('list', {roomId: roomId});
      return Observable.create((observer: any) => {
        this.socket.on('message', (message: any) => observer.next(message));
        return () => this.socket.close();
      });
    }

    sendMessage(message: any) {
      return this.http
        .post(`${this.messageAPIEndpoint}/send-message`, JSON.stringify(message), {headers: this.headers})
        .toPromise()
    }

    joinRoom(roomId: number, nickname: string) {
      this.socket.emit('joinRoom', {roomId: roomId, nickname: nickname});
    }

    getRoomUsers(roomId: number): Observable<any> {
      this.socket.emit('roomUsersList', {roomId: roomId});
      return Observable.create((observer: any) => {
        this.socket.on('user', (user: any) => observer.next({action: 'create', user: user}));
        this.socket.on('user-deleted', (user: any) => observer.next({action: 'delete', user: user}));
        return () => this.socket.close();
      });
    }
}
