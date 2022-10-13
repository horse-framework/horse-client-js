import { HorseMessage } from "./horse-message";
import { Subject, Observable } from 'rxjs';
import { MessageType } from "./message-type";

export class ProtocolReader {

    private _onmessage: Subject<HorseMessage> = new Subject<HorseMessage>();
    get onmessage(): Observable<HorseMessage> { return this._onmessage; }

    private _buffer: Buffer | undefined;
    private _msg: HorseMessage | undefined = undefined;
    private _offset: number = -1;
    private _minMsgSize: number = 8;
    private _status: 'frame' | 'header' | 'content' | 'done' | undefined;
    private _headersLength: number = -1;
    private _hasHeader: boolean = false;
    private _msgLength: number = -1;

    clear(clearOffset: boolean = true): void {
        this._buffer = undefined;
        this._msg = undefined;
        this._headersLength = -1;
        this._hasHeader = false;
        this._status = 'done';
        this._msgLength = -1;

        if (clearOffset) {
            this._offset = -1;
        }
    }

    read(data: Buffer): void {

        if (this._buffer) {
            this._buffer = Buffer.concat([this._buffer, data]);
        }
        else {
            this._buffer = data;
            this._offset = 0;
        }

        let previous = this._status;

        this.readMessage();

        if (previous != 'done' && this._status == 'done') {
            this.readMessage();
        }
    }

    private readMessage(): void {

        if (!this._msg) {
            this._msg = new HorseMessage();
            this._status = 'frame';
        }

        if (!this._buffer || this._buffer.length < this._minMsgSize) {
            return;
        }

        if (this._status == 'frame') {
            this.readFrame();
        }

        if (this._status == 'header') {
            this.readHeaders();
        }

        if (this._status == 'done') {
            this.publishMessage();
        }

        if (this._status == 'content') {
            this.readContent();
        }
    }

    private readFrame(): void {

        if (this._offset < 7) {
            this.readProtocolFrame();
        }

        this._offset = 7;
        this.readLengthAndIds();
    }

    private readProtocolFrame(): void {

        let proto = this._buffer.at(0);

        if (proto >= 128) {
            this._msg.waitResponse = true;
            proto -= 128;
        }

        if (proto >= 64) {
            this._msg.highPriority = true;
            proto -= 64;
        }

        if (proto >= 32) {
            proto -= 32;
            this._msg.type = proto;

            if (this._msg.type != MessageType.Ping && this._msg.type != MessageType.Pong) {
                this._hasHeader = true;
            }
        }
        else
            this._msg.type = proto;

        this._msg.messageIdLength = this._buffer.at(2);
        this._msg.sourceLength = this._buffer.at(3);
        this._msg.targetLength = this._buffer.at(4);

        this._msg.contentType = this._buffer.readUInt16LE(5);
    }

    private readLengthAndIds(): void {

        if (this._msgLength < 0) {
            let length = this._buffer.at(7);
            this._offset = 8;

            if (length == 253) {
                let lengthBuffer = this.readCertainBytesFromBuffer(2);
                if (!lengthBuffer) {
                    return;
                }
                this._msgLength = lengthBuffer.readUInt16LE(0);
            }
            else if (length == 254) {
                let lengthBuffer = this.readCertainBytesFromBuffer(4);
                if (!lengthBuffer) {
                    return;
                }
                this._msgLength = lengthBuffer.readUInt32LE(0);
            }
            else if (length == 255) {
                let lengthBuffer = this.readCertainBytesFromBuffer(8);
                if (!lengthBuffer) {
                    return;
                }
                this._msgLength = Number(lengthBuffer.readBigUInt64LE(0));
            }
            else {
                this._msgLength = length;
            }

        }

        if (this._msg.messageIdLength > 0 && !this._msg.messageId) {

            let msgId = this.readCertainBytesFromBuffer(this._msg.messageIdLength);
            if (!msgId) {
                return;
            }
            this._msg.setId(msgId.toString('utf-8'));
        }

        if (this._msg.sourceLength > 0 && !this._msg.source) {
            let msgSource = this.readCertainBytesFromBuffer(this._msg.sourceLength);
            if (!msgSource) {
                return;
            }
            this._msg.setSource(msgSource.toString('utf-8'));
        }

        if (this._msg.targetLength > 0 && !this._msg.target) {
            let msgTarget = this.readCertainBytesFromBuffer(this._msg.targetLength);
            if (!msgTarget) {
                return;
            }
            this._msg.setTarget(msgTarget.toString('utf-8'));
        }

        if (this._hasHeader) {
            this._status = 'header';
        }
        else {
            this._status = this._msgLength > 0 ? 'content' : 'done';
        }
    }

    private readHeaders(): void {

        if (this._headersLength < 0) {
            let lengthBuffer = this.readCertainBytesFromBuffer(2);
            if (!lengthBuffer) {
                return;
            }

            this._headersLength = lengthBuffer.readUInt16LE(0);
        }

        let headersBuffer = this.readCertainBytesFromBuffer(this._headersLength);
        if (!headersBuffer) {
            return;
        }

        let str = headersBuffer.toString('utf-8');
        let lines = str.split(/\r?\n/);

        this._msg.headers = [];
        lines.forEach(line => {
            let i = line.indexOf(':');
            if (i > 0) {
                let key = line.substring(0, i);
                let value = line.substring(i + 1);
                this._msg.headers.push({ key: key, value: value });
            }
        });

        this._status = this._msgLength > 0 ? 'content' : 'done';
    }

    private readContent(): void {
        let content = this.readCertainBytesFromBuffer(this._msgLength);
        if (!content) {
            return;
        }

        this._msg.setContent(content);
        this.publishMessage();
    }

    private publishMessage(): void {
        // shrink buffer and reset offset
        if (this._buffer && this._offset > 0) {
            let newBufferLen = this._buffer.length - this._offset + 1;
            if (newBufferLen > 0) {
                let newBuffer = Buffer.allocUnsafe(newBufferLen);
                this._buffer.copy(newBuffer, 0, this._offset + 1);
                this._buffer = newBuffer;
            }
            else {
                this._buffer = undefined;
            }
            this._offset = 0;
        }

        if (this._msg) {
            this._onmessage.next(this._msg);
            this.clear(false);
        }
    }

    private readCertainBytesFromBuffer(length: number): Buffer {

        let available = this.getNextBufferLength();
        if (available < length) {
            return null;
        }

        let target: Buffer = Buffer.allocUnsafe(length);
        let readLength = this._buffer.copy(target, 0, this._offset, this._offset + length);
        if (readLength < length) {
            return null;
        }

        this._offset += length;
        return target;
    }

    private getNextBufferLength(): number {
        if (!this._buffer) {
            return 0;
        }
        return this._buffer.length - this._offset;
    }
}