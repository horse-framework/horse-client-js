import { map, Observable } from 'rxjs';
import { IHorseClient } from '../ihorse-client';
import { CacheInfo } from '../models/cache-info';
import { HorseHeaders } from '../protocol/horse-headers';
import { HorseMessage } from '../protocol/horse-message';
import { HorseResult } from '../protocol/horse-result';
import { HorseResultCode } from '../protocol/horse-result-code';
import { KnownContentTypes } from '../protocol/known-content-types';
import { MessageType } from '../protocol/message-type';

export class CacheOperator {

    private _client: IHorseClient;

    constructor(client: IHorseClient) {
        this._client = client;
    }

    getString(key: string): Observable<string> {
        let message = new HorseMessage();
        message.type = MessageType.Cache;
        message.setTarget(key);
        message.waitResponse = true;
        message.contentType = KnownContentTypes.GetCache;
        return this._client.send(message, true)
            .pipe(
                map(result => {
                    if (result.code == HorseResultCode.Ok) {
                        return result.message.getStringContent();
                    }
                    return null;
                })
            );
    }

    getBuffer(key: string): Observable<Buffer> {
        let message = new HorseMessage();
        message.type = MessageType.Cache;
        message.setTarget(key);
        message.waitResponse = true;
        message.contentType = KnownContentTypes.GetCache;
        return this._client.send(message, true)
            .pipe(
                map(result => {
                    if (result.code == HorseResultCode.Ok) {
                        return result.message.content;
                    }
                    return null;
                })
            );
    }

    list(keyFilter: string = null): Observable<CacheInfo[]> {
        let message = new HorseMessage();
        message.type = MessageType.Cache;
        message.waitResponse = true;
        message.contentType = KnownContentTypes.GetCacheList;

        if (keyFilter) {
            message.headers.push({ key: HorseHeaders.FILTER, value: keyFilter });
        }

        return this._client.send(message, true)
            .pipe(
                map(result => {
                    if (result.code == HorseResultCode.Ok) {
                        return JSON.parse(result.message.getStringContent());
                    }
                    return null;
                })
            );
    }

    setString(key: string, value: string, durationInSeconds?: number): Observable<HorseResult> {
        let message = new HorseMessage();
        message.type = MessageType.Cache;
        message.setTarget(key);
        message.waitResponse = true;
        message.contentType = KnownContentTypes.SetCache;
        message.setStringContent(value);

        if (durationInSeconds !== undefined) {
            message.headers.push({ key: HorseHeaders.MESSAGE_TIMEOUT, value: durationInSeconds.toString() });
        }

        return this._client.send(message, true);
    }

    setBuffer(key: string, value: Buffer, durationInSeconds?: number): Observable<HorseResult> {
        let message = new HorseMessage();
        message.type = MessageType.Cache;
        message.setTarget(key);
        message.waitResponse = true;
        message.contentType = KnownContentTypes.SetCache;
        message.setContent(value);

        if (durationInSeconds !== undefined) {
            message.headers.push({ key: HorseHeaders.MESSAGE_TIMEOUT, value: durationInSeconds.toString() });
        }

        return this._client.send(message, true);
    }

    delete(key: string): Observable<HorseResult> {
        let message = new HorseMessage();
        message.type = MessageType.Cache;
        message.setTarget(key);
        message.waitResponse = true;
        message.contentType = KnownContentTypes.RemoveCache;
        return this._client.send(message, true);
    }

    purge(): Observable<HorseResult> {
        let message = new HorseMessage();
        message.type = MessageType.Cache;
        message.waitResponse = true;
        message.contentType = KnownContentTypes.PurgeCache;
        return this._client.send(message, true);
    }
}