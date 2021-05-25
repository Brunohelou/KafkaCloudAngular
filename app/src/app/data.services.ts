
import { JsonPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

export class DataService {
    private url = 'http://localhost:8091'; // url where websocket is running 
    //####OBS###:
    // In order to acess the app from anywhere, localhost will not work, and url must be a valid url to be acessed outside the server location
    private socket:any;



    sendMessage(message:any) {
        this.socket.emit('add-message', message); // if wanna send any message to socket, can use this function, but it's not necessary for aplication

    }       


    getLiveData() { 
        let observable = new Observable(observer =>{ //define and observable that observers when socket changes value from 'message'
            this.socket = io(this.url);
            this.socket.on('message', (data:any) =>{
                let obj = JSON.parse(data);
                
                
                observer.next(obj);
                console.log(obj);
                
            });
            return () => {
                this.socket.disconnect();
            }
        })
        return observable;
    }
}