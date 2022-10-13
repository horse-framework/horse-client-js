import { HorseMessage } from "./horse-message";
import { MessageHeader } from "./message-header";

export class ProtocolWriter {

    write(message: HorseMessage, additionalHeaders: MessageHeader[] = null): Buffer {

        if (additionalHeaders) {
            additionalHeaders.forEach(h => message.headers.push(h));
        }

        let frame = this.createFrameBuffer(message);
        let header = this.createHeaderBuffer(message);

        if (header && message.content) {
            return Buffer.concat([frame, header, message.content]);
        }
        else if (header) {
            return Buffer.concat([frame, header]);
        }
        else if (message.content) {
            return Buffer.concat([frame, message.content])
        }

        return frame;
    }

    private createFrameBuffer(message: HorseMessage): Buffer {

        let array = new Uint8Array(8);
        let additionalBuffers: Buffer[] = [];

        let proto = message.type;

        if (message.waitResponse) {
            proto += 128;
        }

        if (message.highPriority) {
            proto += 64;
        }

        if (message.headers.length > 0) {
            proto += 32;
        }

        array[0] = proto;
        array[1] = 0;
        array[2] = message.messageIdLength;
        array[3] = message.sourceLength;
        array[4] = message.targetLength;

        this.writeUInt16(array, 5, message.contentType);

        if (message.content) {

            if (message.content.length < 253) {
                array[7] = message.content.length;
            }
            else if (message.content.length <= 65535) {
                array[7] = 253;
                let buffer = Buffer.allocUnsafe(2);
                buffer.writeUInt16LE(message.content.length);
                additionalBuffers.push(buffer);
            }
            else {
                array[7] = 254;
                let buffer = Buffer.allocUnsafe(4);
                buffer.writeUInt32LE(message.content.length);
                additionalBuffers.push(buffer);
            }
        }
        else {
            array[7] = 0;
        }

        if (message.messageIdLength > 0) {
            additionalBuffers.push(Buffer.from(message.messageId, 'utf-8'));
        }

        if (message.sourceLength > 0) {
            additionalBuffers.push(Buffer.from(message.source, 'utf-8'));
        }

        if (message.targetLength > 0) {
            additionalBuffers.push(Buffer.from(message.target, 'utf-8'));
        }

        let result: Buffer = Buffer.from(array);
        additionalBuffers.forEach(buf => {
            result = Buffer.concat([result, buf]);
        });

        return result;
    }

    private createHeaderBuffer(message: HorseMessage): Buffer {

        if (message.headers.length == 0) {
            return null;
        }

        let str = '';
        message.headers.forEach(header => {
            str += header.key + ':' + header.value + '\r\n';
        });

        let buffer = Buffer.from(str, 'utf-8');

        let lengthBuffer = Buffer.allocUnsafe(2);
        lengthBuffer.writeUInt16LE(buffer.length);

        return Buffer.concat([buffer, lengthBuffer]);
    }

    private writeUInt16(target: Uint8Array, targetOffset: number, value: number) {
        let buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16LE(value);
        target[targetOffset] = buffer.at(0);
        target[targetOffset + 1] = buffer.at(1);
    }
}