import { Observable } from 'rxjs';
import { IHorseClient } from '../ihorse-client';
import { HorseMessage } from '../protocol/horse-message';
import { HorseResult } from '../protocol/horse-result';
import { MessageHeader } from '../protocol/message-header';
import { MessageType } from '../protocol/message-type';

export class DirectOperator {

    private _client: IHorseClient;

    constructor(client: IHorseClient) {
        this._client = client;
    }

    sendStringById(id: string, contentType: number, content: string, waitResponse: boolean, headers: MessageHeader[] = null): Observable<HorseResult> {
        return this.send(id, contentType, Buffer.from(content, 'utf-8'), waitResponse, headers);
    }

    sendStringByName(name: string, contentType: number, content: string, waitResponse: boolean, headers: MessageHeader[] = null): Observable<HorseResult> {
        return this.send('@name:' + name, contentType, Buffer.from(content, 'utf-8'), waitResponse, headers);
    }

    sendStringByType(type: string, contentType: number, content: string, waitResponse: boolean, headers: MessageHeader[] = null): Observable<HorseResult> {
        return this.send('@type:' + type, contentType, Buffer.from(content, 'utf-8'), waitResponse, headers);
    }

    sendBufferById(id: string, contentType: number, content: Buffer, waitResponse: boolean, headers: MessageHeader[] = null): Observable<HorseResult> {
        return this.send(id, contentType, content, waitResponse, headers);
    }

    sendBufferByName(name: string, contentType: number, content: Buffer, waitResponse: boolean, headers: MessageHeader[] = null): Observable<HorseResult> {
        return this.send('@name:' + name, contentType, content, waitResponse, headers);
    }

    sendBufferByType(type: string, contentType: number, content: Buffer, waitResponse: boolean, headers: MessageHeader[] = null): Observable<HorseResult> {
        return this.send('@type:' + type, contentType, content, waitResponse, headers);
    }

    private send(target: string, contentType: number, content: Buffer, waitResponse: boolean, headers: MessageHeader[] = null): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.DirectMessage;
        message.setTarget(target);
        message.contentType = contentType;
        message.setContent(content);

        if (headers) {
            headers.forEach(header => message.headers.push({ key: header.key, value: header.value }));
        }

        return this._client.send(message, waitResponse);
    }

}