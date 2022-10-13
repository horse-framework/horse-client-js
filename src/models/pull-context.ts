import { IHorseClient } from "../ihorse-client";
import { HorseMessage } from "../protocol/horse-message";

export interface PullContext {

    /** Message index of pull request. zero based. */
    messageIndex: number;

    /** Received message */
    message: HorseMessage;

    /** Horse client object */
    client: IHorseClient;
}