import {SocketService} from './socket.service';
import {RoomService} from './room.service';
import {Component, Input} from '@angular/core';

@Component({
    selector: 'chat',
    styles: [`
      .messages {
        display: flex; flex-direction: column;border-radius: 5px; background: #f0f0f5;
        border: solid 1px #b3b3cc; height: 450px; margin: 10px 0;  overflow: scroll;
      }
      .message {
        background: white; border-radius: 5px; border: solid 1px #b3b3cc;
        padding: 10px; margin: 5px; width: 50%;
      }
      .author { font-style: italic; }
      .time { font-size: 12px; }
      .my-message { align-self: flex-end; background: #A8EB7D}
    `],
    template: `
        <h2>Bienvenue {{user.nickname}}</h2>
        <div *ngIf="!roomId">
          <label>
            Entrez un nom de room :
            <input [(ngModel)]="roomName" />
          </label>
          <button (click)="findOrCreateRoom()">Créer ou rejoindre la room</button>
        </div>
        <div *ngIf="roomId">
          <div>Room {{roomName}}, Chatteurs présents : {{roomUsers}}</div>
          <div class="messages" *ngIf="messages">
              <div class="message" *ngFor="let message of messages" [ngClass]="{'my-message': message.user.nickname === user.nickname}">
                <span class="author" *ngIf="message.user"> {{ message.user.nickname }} : </span>
                <span> {{ message.content }} </span>
                <div class="time"> {{ message.date | date:'hh:mm:ss'}}</div>
              </div>
          </div>
          <div>
            <label>
              Ecrire un message :
              <input [(ngModel)]="message" />
            </label>
            <button (click)="sendMessage()">Envoyer</button>
          </div>
        </div>
    `,
    providers: [SocketService, RoomService]
})
export class Chat {
    private messages: any[] = new Array();
    private roomUsers: string[] = new Array();
    message: string;
    roomId: number;
    roomName: string;
    @Input() user: any;

    constructor(private roomService: RoomService, private socketService: SocketService) {}

    sendMessage() {
      const message = {
        content: this.message,
        userId: this.user.id,
        roomId: this.roomId
      };
      this.socketService.sendMessage(message);
    }

    initChatRoom(roomId: number) {
      this.roomId = roomId;
      this.socketService.joinRoom(this.roomId, this.user.nickname);
      this.socketService
        .getMessages(this.roomId)
        .subscribe(message => {
          if(message) {
            this.messages.push(message);
            if (this.messages.length > 10)
              this.messages.shift();
          }
        });
      this.socketService
        .getRoomUsers(this.roomId)
        .subscribe(userEvent => {
          if(userEvent.action === 'create') {
            this.roomUsers.push(userEvent.user);
          }
          else {
            let index = this.roomUsers.findIndex(user => user === userEvent.user);
            this.roomUsers.splice(index, index);
          }
        });
    }

    findOrCreateRoom() {
      this.roomService.findRoom(this.roomName)
      .then( room => {
        this.initChatRoom(room.json().id);
      })
      .catch(() => {
        this.roomService.createRoom(this.roomName, this.user.id)
        .then( room => {
          this.initChatRoom(room.json().id);
        });
      })
    }
}
