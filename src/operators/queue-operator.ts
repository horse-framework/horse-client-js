import { filter, mergeMap, Observable, of, Subject, take } from 'rxjs';
import { ConsumeContext } from '../consume-context';
import { HorseClientStatus } from '../horse-client-status';
import { IHorseClient } from '../ihorse-client';
import { ClientInfo } from '../models/client-info';
import { PullContainer } from '../pull-container';
import { PullContext } from '../models/pull-context';
import { PullRequest } from '../models/pull-request';
import { QueueInfo } from '../models/queue-info';
import { QueueOptions } from '../options/queue-options';
import { QueueSubscriptionOptions } from '../options/queue-subscription-options';
import { HorseHeaders } from '../protocol/horse-headers';
import { HorseMessage } from '../protocol/horse-message';
import { HorseResult } from '../protocol/horse-result';
import { HorseResultCode } from '../protocol/horse-result-code';
import { KnownContentTypes } from '../protocol/known-content-types';
import { MessageHeader } from '../protocol/message-header';
import { MessageType } from '../protocol/message-type';
import { ClearDecision } from '../models/clear-decision';
import { MessageOrder } from '../models/message-order';

interface QueueSubscription {
    name: string;
    queueOptions?: QueueSubscriptionOptions;
    subject: Subject<ConsumeContext>;
}

export class QueueOperator {

    private _client: IHorseClient;
    private _subscriptions: Map<string, QueueSubscription[]> = new Map<string, QueueSubscription[]>();

    private _pullContainers: Map<string, PullContainer> = new Map<string, PullContainer>();

    constructor(client: IHorseClient) {
        this._client = client;

        this._client.onmessage
            .pipe(filter(msg => msg.type == MessageType.QueueMessage))
            .subscribe(this.processMessage.bind(this));

        this._client.onconnected
            .subscribe(() => {
                this._subscriptions.forEach(subs => {
                    if (subs.length > 0) {
                        let firstSubscription = subs[0];
                        this.sendSubscriptionMessage(firstSubscription.name, firstSubscription.queueOptions);
                    }
                });
            });
    }

    private processMessage(message: HorseMessage): void {

        //if message is response for pull request, process pull container
        if (this._pullContainers.size > 0 && message.headers.length > 0) {
            let requestId = message.findHeaderValue(HorseHeaders.REQUEST_ID);
            if (requestId) {
                let container = this._pullContainers.get(requestId);
                this.processPull(container, message);
                return;
            }
        }

        let subscriptions = this._subscriptions.get(message.target);
        if (subscriptions) {
            subscriptions.forEach(subscription => {
                subscription.subject.next({ client: this._client, message: message });
            });

            if (this._client.autoAcknowledge) {
                this._client.sendAcknowledge(message);
            }
        }
    }

    private processPull(container: PullContainer, message: HorseMessage) {

        if (message.content && message.content.length > 0) {
            container.addMessage(this._client, message);
        }

        let noContent = message.findHeaderValue(HorseHeaders.NO_CONTENT);

        if (noContent) {
            container.complete(noContent);
        }
    }

    subscribe(queueName: string, queueOptions?: QueueOptions): Observable<ConsumeContext> {

        if (this._client.status == HorseClientStatus.Connected) {
            return this.sendSubscriptionMessage(queueName, queueOptions)
                .pipe(
                    mergeMap(o => {
                        if (o.code == HorseResultCode.Ok) {
                            return this.createSubscription(queueName, queueOptions)
                        }
                        else {
                            return null;
                        }
                    })
                );
        }
        else {
            return this.createSubscription(queueName, queueOptions);
        }
    }

    private sendSubscriptionMessage(queueName: string, queueOptions?: QueueSubscriptionOptions): Observable<HorseResult> {

        let message = new HorseMessage();

        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.QueueSubscribe;
        message.setTarget(queueName);
        message.waitResponse = true;

        if (queueOptions) {

            if (queueOptions.type) {
                message.headers.push({ key: HorseHeaders.QUEUE_TYPE, value: queueOptions.type });
            }

            if (queueOptions.acknowledge) {
                message.headers.push({ key: HorseHeaders.ACKNOWLEDGE, value: queueOptions.acknowledge });
            }

            if (queueOptions.topic) {
                message.headers.push({ key: HorseHeaders.QUEUE_TOPIC, value: queueOptions.topic });
            }

            if (queueOptions.putBack) {
                message.headers.push({ key: HorseHeaders.PUT_BACK, value: queueOptions.putBack });
            }

            if (queueOptions.putBackDelay !== undefined) {
                message.headers.push({ key: HorseHeaders.PUT_BACK_DELAY, value: queueOptions.putBackDelay.toString() });
            }

            if (queueOptions.messageTimeout !== undefined) {
                message.headers.push({ key: HorseHeaders.MESSAGE_TIMEOUT, value: queueOptions.messageTimeout.toString() });
            }

            if (queueOptions.acknowledgeTimeout !== undefined) {
                message.headers.push({ key: HorseHeaders.ACK_TIMEOUT, value: queueOptions.acknowledgeTimeout.toString() });
            }

            if (queueOptions.delayBetweenMessages !== undefined) {
                message.headers.push({ key: HorseHeaders.DELAY_BETWEEN_MESSAGES, value: queueOptions.delayBetweenMessages.toString() });
            }
        }

        return this._client.send(message, true).pipe(take(1));
    }

    private createSubscription(queueName: string, queueOptions?: QueueSubscriptionOptions): Observable<ConsumeContext> {

        let subscriptions = this._subscriptions.get(queueName);
        if (!subscriptions) {
            subscriptions = [];
            this._subscriptions.set(queueName, subscriptions);
        }

        let subscription: QueueSubscription = {
            name: queueName,
            queueOptions: queueOptions,
            subject: new Subject<ConsumeContext>()
        };

        subscriptions.push(subscription);

        return subscription.subject;
    }

    unsubscribe(queueName: string): void {

        if (this._client.status == HorseClientStatus.Connected) {
            let message = new HorseMessage();
            message.type = MessageType.Server;
            message.contentType = KnownContentTypes.QueueUnsubscribe;
            message.setTarget(queueName);
            this._client.send(message);
        }

        let subscriptions = this._subscriptions.get(queueName);

        if (subscriptions) {
            this._subscriptions.delete(queueName);
            subscriptions.forEach(subs => {
                subs.subject.complete();
            });
        }
    }

    pushString(queueName: string, content: string, verifyCommit: boolean = true, headers: MessageHeader[] = null): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.QueueMessage;
        message.setTarget(queueName);
        message.setStringContent(content);

        if (headers) {
            headers.forEach(header => message.headers.push(header));
        }

        return this._client.send(message, verifyCommit);
    }

    pushBuffer(queueName: string, content: Buffer, verifyCommit: boolean = true, headers: MessageHeader[] = null): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.QueueMessage;
        message.setTarget(queueName);
        message.setContent(content);

        if (headers) {
            headers.forEach(header => message.headers.push(header));
        }

        return this._client.send(message, verifyCommit);
    }

    pull(request: PullRequest, actionForEachMessage?: (context: PullContext) => void): Observable<PullContainer> {

        let message = new HorseMessage();
        message.type = MessageType.QueuePullRequest;
        message.setTarget(request.queue);
        message.setId(this._client.generateUniqueId());
        message.headers.push({ key: HorseHeaders.COUNT, value: request.messageCount.toString() });

        if (request.clearAfter != ClearDecision.None) {
            message.headers.push({ key: HorseHeaders.CLEAR, value: request.clearAfter });
        }

        if (request.getQueueMessageCount) {
            message.headers.push({ key: HorseHeaders.INFO, value: 'yes' });
        }

        if (request.order == MessageOrder.LIFO) {
            message.headers.push({ key: HorseHeaders.ORDER, value: HorseHeaders.LIFO });
        }

        if (request.requestHeaders) {
            request.requestHeaders.forEach(header => message.headers.push({ key: header.key, value: header.value }));
        }

        let container = new PullContainer(message.messageId, request, this._client.messageTimeout, actionForEachMessage);
        this._pullContainers.set(message.messageId, container);

        container.oncompleted
            .pipe(take(1))
            .subscribe(() => this._pullContainers.delete(container.requestId));

        return this._client.send(message, true)
            .pipe(
                mergeMap(result => {
                    if (result.code != HorseResultCode.Ok) {
                        container.complete('Error');
                    }
                    return container.oncompleted;
                })
            );
    }


    create(queueName: string, options?: QueueOptions): Observable<HorseResult> {

        let message = new HorseMessage();

        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.CreateQueue;
        message.setTarget(queueName);
        message.waitResponse = true;
        message.headers.push({ key: HorseHeaders.QUEUE_NAME, value: queueName });

        if (options) {
            if (options.managerName) {
                message.headers.push({ key: HorseHeaders.QUEUE_MANAGER, value: options.managerName });
            }

            message.setStringContent(JSON.stringify(options));
        }

        return this._client.send(message, true);
    }

    setOptions(queueName: string, options?: QueueOptions): Observable<HorseResult> {

        let message = new HorseMessage();

        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.UpdateQueue;
        message.setTarget(queueName);
        message.waitResponse = true;
        message.headers.push({ key: HorseHeaders.QUEUE_NAME, value: queueName });

        if (options) {
            if (options.managerName) {
                message.headers.push({ key: HorseHeaders.QUEUE_MANAGER, value: options.managerName });
            }

            message.setStringContent(JSON.stringify(options));
        }

        return this._client.send(message, true);
    }

    delete(queueName: string): Observable<HorseResult> {

        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.RemoveQueue;
        message.setTarget(queueName);
        message.waitResponse = true;

        return this._client.send(message, true);
    }

    clearMessages(queueName: string, clearPriorityMessages: boolean, clearRegularMessages: boolean): Observable<HorseResult> {

        if (!clearPriorityMessages && !clearRegularMessages)
            return of(HorseResult.create(HorseResultCode.Failed, 'Filter not specified'));

        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.contentType = KnownContentTypes.ClearMessages;
        message.setTarget(queueName);
        message.waitResponse = true;
        message.headers.push({ key: HorseHeaders.QUEUE_NAME, value: queueName });

        if (clearPriorityMessages)
            message.headers.push({ key: HorseHeaders.PRIORITY_MESSAGES, value: 'yes' });

        if (clearRegularMessages)
            message.headers.push({ key: HorseHeaders.MESSAGES, value: 'yes' });

        return this._client.send(message, true);
    }

    getConsumers(queueName: string): Observable<ClientInfo[]> {

        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.setTarget(queueName);
        message.contentType = KnownContentTypes.QueueConsumers;
        message.waitResponse = true;
        message.headers.push({ key: HorseHeaders.QUEUE_NAME, value: queueName });

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

    list(listFilter: string = null): Observable<QueueInfo[]> {

        let message = new HorseMessage();
        message.type = MessageType.Server;
        message.waitResponse = true;
        message.contentType = KnownContentTypes.QueueList;

        if (listFilter) {
            message.headers.push({ key: HorseHeaders.FILTER, value: listFilter });
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
}