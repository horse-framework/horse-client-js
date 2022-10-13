import { map, Observable } from 'rxjs';
import { IHorseClient } from '../ihorse-client';
import { BindingInfo } from '../models/binding-info';
import { BindingInteraction } from '../models/binding-interaction';
import { RouteMethod } from '../models/route-method';
import { RouterInfo } from '../models/router-info';
import { HorseHeaders } from '../protocol/horse-headers';
import { HorseMessage } from '../protocol/horse-message';
import { HorseResult } from '../protocol/horse-result';
import { HorseResultCode } from '../protocol/horse-result-code';
import { KnownContentTypes } from '../protocol/known-content-types';
import { MessageHeader } from '../protocol/message-header';
import { MessageType } from '../protocol/message-type';

export class RouterOperator {

    private _client: IHorseClient;

    constructor(client: IHorseClient) {
        this._client = client;
    }

    create(name: string, method: RouteMethod): Observable<HorseResult> {
        let message = new HorseMessage();
        message.type = MessageType.Router;
        message.setTarget(name);
        message.contentType = KnownContentTypes.CreateRouter;
        message.headers.push({ key: HorseHeaders.ROUTE_METHOD, value: method });
        return this._client.send(message, true);
    }

    list(): Observable<RouterInfo[]> {
        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.ListRouters;
        return this._client.send(message, true)
            .pipe(
                map(result => {
                    if (result.code == HorseResultCode.Ok) {
                        return JSON.parse(result.message.getStringContent());
                    }
                    return null;
                }));
    }

    delete(name: string): Observable<HorseResult> {
        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.RemoveRouter;
        message.setTarget(name);
        return this._client.send(message, true);
    }

    addBinding(routerName: string, type: string, name: string, target: string,
        interaction: BindingInteraction,
        bindingMethod: RouteMethod = RouteMethod.Distribute,
        contentType: number = 0,
        priority: number = 1): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.AddBinding;
        message.setTarget(routerName);

        let model = {
            name: name,
            target: target,
            interaction: interaction,
            contentType: contentType,
            priority: priority,
            bindingType: type,
            method: bindingMethod
        };

        message.setStringContent(JSON.stringify(model));

        return this._client.send(message, true);
    }

    getBindings(routerName: string): Observable<BindingInfo[]> {
        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.ListBindings;
        message.setTarget(routerName);
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

    removeBinding(routerName: string, bindingName: string): Observable<HorseResult> {
        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.RemoveBinding;
        message.setTarget(routerName);
        message.headers.push({ key: HorseHeaders.BINDING_NAME, value: bindingName });
        return this._client.send(message, true);
    }

    publishString(routerName: string, content: string, waitResponse: boolean, contentType?: number, headers?: MessageHeader[]): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.Router;
        message.setTarget(routerName);
        message.setStringContent(content);

        if (contentType) {
            message.contentType = contentType;
        }

        if (headers) {
            headers.forEach(header => message.headers.push({ key: header.key, value: header.value }));
        }

        return this._client.send(message, waitResponse);
    }

    publishBuffer(routerName: string, content: Buffer, waitResponse: boolean, contentType?: number, headers?: MessageHeader[]): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.Router;
        message.setTarget(routerName);
        message.setContent(content);

        if (contentType) {
            message.contentType = contentType;
        }

        if (headers) {
            headers.forEach(header => message.headers.push({ key: header.key, value: header.value }));
        }

        return this._client.send(message, waitResponse);
    }
}