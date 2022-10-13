import { filter, mergeMap, Observable, of, Subject } from 'rxjs';
import { ConsumeContext } from '../consume-context';
import { HorseClientStatus } from '../horse-client-status';
import { IHorseClient } from '../ihorse-client';
import { HorseEventType } from '../models/horse-event-type';
import { HorseHeaders } from '../protocol/horse-headers';
import { HorseMessage } from '../protocol/horse-message';
import { HorseResultCode } from '../protocol/horse-result-code';
import { MessageType } from '../protocol/message-type';

interface EventSubscription {
    type: HorseEventType;
    target: string;
    subject: Subject<ConsumeContext>;
}

export class EventOperator {

    private _client: IHorseClient;
    private _subscriptions: Map<string, EventSubscription[]> = new Map<string, EventSubscription[]>();

    constructor(client: IHorseClient) {
        this._client = client;

        this._client.onmessage
            .pipe(filter(msg => msg.type == MessageType.Event))
            .subscribe(this.processMessage.bind(this));

        this._client.onconnected
            .subscribe(() => {
                this._subscriptions.forEach(subs => {
                    if (subs.length > 0) {
                        let message = new HorseMessage();
                        message.type = MessageType.Event;
                        message.contentType = subs[0].type;
                        message.setTarget(subs[0].target);
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

    private createSubscription(type: HorseEventType, target: string): Observable<ConsumeContext> {

        let key = target + '-' + type;
        let subscriptions = this._subscriptions.get(key);
        if (!subscriptions) {
            subscriptions = [];
            this._subscriptions.set(key, subscriptions);
        }

        let subscription: EventSubscription = {
            type: type,
            target: target,
            subject: new Subject<ConsumeContext>()
        };

        subscriptions.push(subscription);

        return subscription.subject;
    }

    subscribe(eventType: HorseEventType, target: string): Observable<ConsumeContext> {
        if (this._client.status == HorseClientStatus.Connected) {
            return of(this)
                .pipe(
                    mergeMap(() => {
                        let message = new HorseMessage();
                        message.type = MessageType.Event;
                        message.contentType = eventType;
                        message.setTarget(target);
                        return this._client.send(message, true);
                    }),
                    mergeMap(o => {
                        if (o.code == HorseResultCode.Ok) {
                            return this.createSubscription(eventType, target);
                        }
                        else {
                            return null;
                        }
                    })
                );
        }
        else {
            return this.createSubscription(eventType, target);
        }
    }

    unsubscribe(eventType: HorseEventType, target: string): void {

        if (this._client.status == HorseClientStatus.Connected) {
            let message = new HorseMessage();
            message.type = MessageType.Event;
            message.contentType = eventType;
            message.setTarget(target);
            message.headers.push({ key: HorseHeaders.SUBSCRIBE, value: 'No' });
            this._client.send(message, true);
        }

        let key = target + '-' + eventType;
        let subscriptions = this._subscriptions.get(key);

        if (subscriptions) {
            this._subscriptions.delete(key);
            subscriptions.forEach(subs => {
                subs.subject.complete();
            });
        }
    }

}