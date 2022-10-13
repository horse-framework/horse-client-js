import { filter, mergeMap, Observable, of, Subject } from 'rxjs';
import { ConsumeContext } from '../consume-context';
import { HorseClientStatus } from '../horse-client-status';
import { IHorseClient } from '../ihorse-client';
import { ChannelInfo } from '../models/channel-info';
import { ClientInfo } from '../models/client-info';
import { ChannelOptions } from '../options/channel-options';
import { HorseHeaders } from '../protocol/horse-headers';
import { HorseMessage } from '../protocol/horse-message';
import { HorseResult } from '../protocol/horse-result';
import { HorseResultCode } from '../protocol/horse-result-code';
import { KnownContentTypes } from '../protocol/known-content-types';
import { MessageHeader } from '../protocol/message-header';
import { MessageType } from '../protocol/message-type';

interface ChannelSubscription {
    name: string;
    subject: Subject<ConsumeContext>;
}

export class ChannelOperator {

    private _client: IHorseClient;
    private _subscriptions: Map<string, ChannelSubscription[]> = new Map<string, ChannelSubscription[]>();

    constructor(client: IHorseClient) {
        this._client = client;
        this._client.onmessage
            .pipe(filter(msg => msg.type == MessageType.Channel))
            .subscribe(this.processMessage.bind(this));

        this._client.onconnected
            .subscribe(() => {
                this._subscriptions.forEach(subs => {
                    if (subs.length > 0) {
                        let firstSubscription = subs[0];
                        let message = new HorseMessage();
                        message.type = MessageType.Channel;
                        message.contentType = KnownContentTypes.ChannelSubscribe;
                        message.setTarget(firstSubscription.name);
                        this._client.send(message, false);
                    }
                });
            });
    }

    private processMessage(message: HorseMessage): void {
        let subscriptions = this._subscriptions.get(message.target);
        if (subscriptions) {
            subscriptions.forEach(subscription => {
                subscription.subject.next({ client: this._client, message: message });
            });
        }
    }

    private createSubscription(queueName: string): Observable<ConsumeContext> {

        let subscriptions = this._subscriptions.get(queueName);
        if (!subscriptions) {
            subscriptions = [];
            this._subscriptions.set(queueName, subscriptions);
        }

        let subscription: ChannelSubscription = {
            name: queueName,
            subject: new Subject<ConsumeContext>()
        };

        subscriptions.push(subscription);

        return subscription.subject;
    }

    join(channelName: string): Observable<ConsumeContext> {
        if (this._client.status == HorseClientStatus.Connected) {
            return of(this)
                .pipe(
                    mergeMap(() => {
                        let message = new HorseMessage();
                        message.type = MessageType.Channel;
                        message.contentType = KnownContentTypes.ChannelSubscribe;
                        message.setTarget(channelName);
                        message.waitResponse = true;
                        return this._client.send(message, true);
                    }),
                    mergeMap(o => {
                        if (o.code == HorseResultCode.Ok) {
                            return this.createSubscription(channelName)
                        }
                        else {
                            return null;
                        }
                    })
                );
        }
        else {
            return this.createSubscription(channelName);
        }
    }

    leave(channelName: string): void {

        if (this._client.status == HorseClientStatus.Connected) {
            let message = new HorseMessage();
            message.type = MessageType.Channel;
            message.contentType = KnownContentTypes.ChannelUnsubscribe;
            message.setTarget(channelName);
            message.waitResponse = true;

            this._client.send(message, true);
        }

        let subscriptions = this._subscriptions.get(channelName);

        if (subscriptions) {
            this._subscriptions.delete(channelName);
            subscriptions.forEach(subs => {
                subs.subject.complete();
            });
        }
    }

    create(channelName: string, options?: ChannelOptions): Observable<HorseResult> {

        let message = new HorseMessage();

        message.type = MessageType.Channel;
        message.contentType = KnownContentTypes.ChannelCreate;
        message.setTarget(channelName);
        message.waitResponse = true;

        if (options != null) {

            if (options.autoDestroy)
                message.headers.push({ key: HorseHeaders.AUTO_DESTROY, value: options.autoDestroy ? 'true' : 'false' });

            if (options.clientLimit !== undefined)
                message.headers.push({ key: HorseHeaders.CLIENT_LIMIT, value: options.clientLimit.toString() });

            if (options.messageSizeLimit !== undefined)
                message.headers.push({ key: HorseHeaders.MESSAGE_SIZE_LIMIT, value: options.messageSizeLimit.toString() });
        }

        return this._client.send(message, true);
    }

    delete(channelName: string): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.Channel;
        message.contentType = KnownContentTypes.ChannelRemove;
        message.setTarget(channelName);
        message.waitResponse = true;

        return this._client.send(message, true);
    }

    list(channelFilter: string = null): Observable<ChannelInfo[]> {

        let message = new HorseMessage();
        message.type = MessageType.Channel;
        message.contentType = KnownContentTypes.ChannelList;
        message.waitResponse = true;

        if (channelFilter) {
            message.headers.push({ key: HorseHeaders.FILTER, value: channelFilter })
        }

        return this._client.send(message, true)
            .pipe(
                mergeMap(result => {
                    if (result.code == HorseResultCode.Ok) {
                        return of(JSON.parse(result.message.getStringContent()));
                    }
                    else {
                        return of(null);
                    }
                })
            );
    }

    getClients(channelName: string): Observable<ClientInfo[]> {

        let message = new HorseMessage();
        message.type = MessageType.Channel;
        message.setTarget(channelName);
        message.contentType = KnownContentTypes.ChannelSubscribers;
        message.waitResponse = true;
        message.headers.push({ key: HorseHeaders.CHANNEL_NAME, value: channelName });

        return this._client.send(message, true)
            .pipe(
                mergeMap(result => {
                    if (result.code == HorseResultCode.Ok) {
                        return of(JSON.parse(result.message.getStringContent()));
                    }
                    else {
                        return of(null);
                    }
                })
            );
    }

    pushString(channelName: string, content: string, verifyCommit: boolean = true, headers: MessageHeader[] = null): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.Channel;
        message.contentType = KnownContentTypes.ChannelPush;
        message.setTarget(channelName);
        message.setStringContent(content);

        if (headers) {
            headers.forEach(header => message.headers.push(header));
        }

        return this._client.send(message, verifyCommit);
    }

    pushBuffer(channelName: string, content: Buffer, verifyCommit: boolean = true, headers: MessageHeader[] = null): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.QueueMessage;
        message.contentType = KnownContentTypes.ChannelPush;
        message.setTarget(channelName);
        message.setContent(content);

        if (headers) {
            headers.forEach(header => message.headers.push(header));
        }

        return this._client.send(message, verifyCommit);
    }
}