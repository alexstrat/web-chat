import {ChatService} from './chat.service';
import {RoomService} from './room.service';
import {Component, Input} from '@angular/core';

@Component({
    selector: 'chat',
    styles: [`
      .messages {
        border-radius: 5px;
        background: #f0f0f5;
        border: solid 1px #b3b3cc;
        height: 450px;
        margin: 10px 0;
        overflow: scroll;
      }

      .message {
        background: white;
        border-radius: 5px;
        border: solid 1px #b3b3cc;
        padding: 10px;
        margin: 5px;
        width: 50%;
      }

      .author {
        font-style: italic;
      }

      .time {
        font-size: 12px;
      }
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
          <div> Chatteurs présents : </div>
          <div class="messages" *ngIf="messages">
              <div class="message" *ngFor="let message of messages">
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
    providers: [ChatService, RoomService]
})
export class Chat {
    private messages: any[] = new Array();
    message: string;
    roomId: number;
    roomName: string;
    @Input() user: any;

    constructor(private roomService: RoomService, private chatService: ChatService) {}

    sendMessage() {
      const message = {
        content: this.message,
        userId: this.user.id,
        roomId: this.roomId
      };
      this.chatService.sendMessage(message);
    }

    initChat(roomId: number) {
      this.roomId = roomId;
      this.chatService
        .getMessages(this.roomId)
        .subscribe(message => {
          if(message) {
            this.messages.push(message);
            if (this.messages.length > 10)
              this.messages.shift();
          }
        });
    }

    findOrCreateRoom() {
      this.roomService.findRoom(this.roomName)
      .then( room => {
        this.initChat(room.json().id);
      })
      .catch(() => {
        this.roomService.createRoom(this.roomName, this.user.id)
        .then( room => {
          this.initChat(room.json().id);
        });
      })
    }
}
