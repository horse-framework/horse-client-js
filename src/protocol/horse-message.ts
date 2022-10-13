import { HorseHeaders } from "./horse-headers";
import { HorseResultCode } from "./horse-result-code";
import { KnownContentTypes } from "./known-content-types";
import { MessageHeader } from "./message-header";
import { MessageType } from "./message-type";

export class HorseMessage {

    /** True means, client is waiting for response (or acknowledge). Sending response is not mandatory but it SHOULD sent. */
    waitResponse: boolean = false;

    /** If true, message should be at first element in the queue */
    highPriority: boolean = false;

    /** Message type */
    type: MessageType = MessageType.Other;

    /** Message Id length */
    messageIdLength: number = 0;

    /** Unique message id */
    get messageId(): string | undefined { return this._messageId; }
    private _messageId: string | undefined;

    /** Message target id length */
    targetLength: number = 0;

    /** Message target (queue name, client name or server) */
    get target(): string | undefined { return this._target; }
    private _target: string | undefined;

    /** Message source length */
    sourceLength: number = 0;

    /** Message source client unique id, queue unique id or server */
    get source(): string | undefined { return this._source; }
    private _source: string | undefined;

    /** Content type code. May be useful to know how content should be read, convert, serialize/deserialize */
    contentType: number = 0;

    /** Message content */
    content: Buffer | undefined;

    /** Message headers */
    headers: MessageHeader[] = [];

    setId(value: string | undefined): void {
        if (value) {
            this._messageId = value;
            this.messageIdLength = Buffer.from(value, 'utf-8').length;
        }
        else {
            this._messageId = undefined;
            this.messageIdLength = 0;
        }
    }

    setSource(value: string | undefined): void {
        if (value) {
            this._source = value;
            this.sourceLength = Buffer.from(value, 'utf-8').length;
        }
        else {
            this._source = undefined;
            this.sourceLength = 0;
        }
    }

    setTarget(value: string | undefined): void {
        if (value) {
            this._target = value;
            this.targetLength = Buffer.from(value, 'utf-8').length;
        }
        else {
            this._target = undefined;
            this.targetLength = 0;
        }
    }

    setStringContent(value: string | undefined): void {
        if (value) {
            this.content = Buffer.from(value, 'utf-8');
        }
        else {
            this.content = undefined;
        }
    }

    setContent(data: Buffer): void {
        this.content = data;
    }

    addContent(data: Buffer): void {

        if (!this.content) {
            this.setContent(data);
        }
        else {
            this.content = Buffer.concat([this.content, data]);
        }
    }

    addStringContent(data: string): void {
        let buffer = Buffer.from(data, 'utf-8');
        if (!this.content) {
            this.setContent(buffer);
        }
        else {
            this.content = Buffer.concat([this.content, buffer]);
        }
    }

    addStringLine(data: string): void {
        let buffer = Buffer.from(data + '\r\n', 'utf-8');
        if (!this.content) {
            this.setContent(buffer);
        }
        else {
            this.content = Buffer.concat([this.content, buffer]);
        }
    }

    getStringContent(): string | undefined {
        if (this.content) {
            return this.content.toString('utf-8');
        }
        else {
            return undefined;
        }
    }

    findHeaderValue(key: string): string | undefined {
        return this.headers.find(x => x.key == key)?.value;
    }

    createAcknowledge(positive: boolean = true, reason: string | undefined = undefined): HorseMessage {
        let message = new HorseMessage();

        message.setId(this.messageId);
        message.type = MessageType.Response;

        if (this.type == MessageType.DirectMessage) {
            message.highPriority = true;
            message.setSource(this.target);
            message.setTarget(this.source);
        }
        else {
            message.highPriority = false;
            message.setTarget(this.target);
        }

        if (positive) {
            message.contentType = HorseResultCode.Ok;
        }
        else {
            message.contentType = KnownContentTypes.Failed;

            this.headers.forEach(kv => {
                message.headers.push({ key: kv.key, value: kv.value });
            });

            if (reason) {
                message.headers.push({ key: HorseHeaders.NEGATIVE_ACKNOWLEDGE_REASON, value: reason })
            }
        }

        return message;
    }

    createResponse(resultCode: HorseResultCode): HorseMessage {
        let message = new HorseMessage();

        message.highPriority = this.type == MessageType.DirectMessage;
        message.type = MessageType.Response;
        message.contentType = resultCode;
        message.setId(this.messageId);
        message.setTarget(this.type == MessageType.QueueMessage ? this.target : this.source);

        return message;
    }
}