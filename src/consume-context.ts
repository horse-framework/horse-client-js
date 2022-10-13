import { IHorseClient } from "./ihorse-client";
import { HorseMessage } from "./protocol/horse-message";

export interface ConsumeContext {

    /** Consume client */
    client: IHorseClient;

    /** Consumed message */
    message: HorseMessage;
}