import { HorseMessage } from "./horse-message";
import { HorseResultCode } from "./horse-result-code";

export class HorseResult {

    code: HorseResultCode;
    reason?: string;
    message?: HorseMessage;

    static success(message: HorseMessage = null): HorseResult {
        let result = new HorseResult();
        result.code = HorseResultCode.Ok;
        result.message = message;
        return result;
    }

    static create(code: HorseResultCode, reason: string, message: HorseMessage = null): HorseResult {
        let result = new HorseResult();
        result.code = code;
        result.reason = reason;
        result.message = message;
        return result;
    }
}