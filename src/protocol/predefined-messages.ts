export class PredefinedMessages {

    private static _pingBuffer: Uint8Array = null;
    private static _pongBuffer: Uint8Array = null;

    static getProtocolBuffer(): Buffer {
        return Buffer.from('HORSE/30', 'ascii');
    }

    static getPingBuffer(): Uint8Array {
        if (!this._pingBuffer) {

            let array = new Uint8Array(8);
            for (let i = 0; i < 8; i++) {
                array[i] = 0x00;
            }
            array[0] = 0x89;
            array[1] = 0xFF;
            this._pingBuffer = array;
        }

        return this._pingBuffer;
    }

    static getPongBuffer(): Uint8Array {
        if (!this._pongBuffer) {

            let array = new Uint8Array(8);
            for (let i = 0; i < 8; i++) {
                array[i] = 0x00;
            }
            array[0] = 0x8A;
            array[1] = 0xFF;
            this._pongBuffer = array;
        }

        return this._pongBuffer;
    }
}