import { filter, interval, Observable, Subject, take, takeWhile } from "rxjs";
import { IHorseClient } from "./ihorse-client";
import { PullContext } from "./models/pull-context";
import { PullProcess } from "./models/pull-process";
import { PullRequest } from "./models/pull-request";
import { HorseHeaders } from "./protocol/horse-headers";
import { HorseMessage } from "./protocol/horse-message";

export class PullContainer {

    /** Request message */
    readonly request: PullRequest;

    /**Pull Request Message Id */
    readonly requestId: string;

    /** Pull request timeout in milliseconds. Timeout is not for whole pull process. It's reset when each message is received. */
    readonly timeoutMilliseconds: number = 15000;

    /// Total received message count
    receivedCount: number;

    /** Requested message count */
    requestCount: number;

    /** Pull container status  */
    get status(): PullProcess { return this._status; }
    private _status: PullProcess;

    /** Unix milliseconds last message received. */
    lastReceived: number = 0;

    /** Received messages */
    receivedMessages: PullContext[] = [];

    private _oncompleted: Subject<PullContainer> = new Subject<PullContainer>();
    get oncompleted(): Observable<PullContainer> { return this._oncompleted; }

    private _actionForEachMessage: (context: PullContext) => void;

    constructor(requestId: string, request: PullRequest, timeoutMilliseconds: number, actionForEachMessage?: (context: PullContext) => void) {
        this.requestId = requestId;
        this.request = request;
        this._actionForEachMessage = actionForEachMessage;
        this._status = PullProcess.Receiving;
        this.lastReceived = new Date().getTime();

        interval(500)
            .pipe(
                takeWhile(() => !this._oncompleted.closed),
                filter(() => new Date().getTime() - this.lastReceived > timeoutMilliseconds),
                take(1)
            )
            .subscribe(() => {
                this.complete(null)
            });
    }

    addMessage(client: IHorseClient, message: HorseMessage): void {
        this.lastReceived = new Date().getTime();
        let context: PullContext = {
            message: message,
            messageIndex: this.receivedMessages.length,
            client: client
        }

        this.receivedMessages.push(context)
        this.receivedCount = this.receivedMessages.length;

        if (this._actionForEachMessage)
            this._actionForEachMessage(context);
    }

    complete(noContentReason: string) {

        if (!noContentReason || noContentReason.length == 0) {
            this._status = PullProcess.Timeout;
        }
        else if (noContentReason == HorseHeaders.END) {
            this._status = PullProcess.Completed;
        }
        else if (noContentReason == HorseHeaders.EMPTY) {
            this._status = PullProcess.Empty;
        }
        else if (noContentReason == 'Error') {
            this._status = PullProcess.NetworkError;
        }
        else if (noContentReason == HorseHeaders.UNACCEPTABLE) {
            this._status = PullProcess.Unacceptable;
        }
        else if (noContentReason == HorseHeaders.UNAUTHORIZED) {
            this._status = PullProcess.Unauthorized;
        }
        else {
            this._status = PullProcess.Completed;
        }

        this._oncompleted.next(this);
        this._oncompleted.complete();
    }

}