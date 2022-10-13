import { Observable } from "rxjs";
import { HorseClientStatus } from "./horse-client-status";
import { HorseMessage } from "./protocol/horse-message";
import { HorseResult } from "./protocol/horse-result";
import { MessageHeader } from "./protocol/message-header";

export interface IHorseClient {

    autoAcknowledge: boolean;
    messageTimeout: number;

    get status(): HorseClientStatus;

    get onmessage(): Observable<HorseMessage>;
    get onconnected(): Observable<IHorseClient>;
    get ondisconnected(): Observable<IHorseClient>;

    addRemoteHost: (host: string, port: number) => void;
    removeRemoteHost: (host: string, port: number) => void;

    connect: () => void;
    disconnect: () => void;

    generateUniqueId(): string;

    send: (message: HorseMessage, waitForAck?: boolean, additionalHeaders?: MessageHeader[]) => Observable<HorseResult>;
    sendAcknowledge: (original: HorseMessage, positive?: boolean, negativeReason?: string) => Observable<HorseResult>;

}