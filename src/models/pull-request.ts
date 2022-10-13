import { MessageHeader } from "../protocol/message-header";
import { ClearDecision } from "./clear-decision";
import { MessageOrder } from "./message-order";

export interface PullRequest {

    /** Queue name */
    queue: string;

    /** Totally requested message count */
    messageCount: number;

    /** Message counsume order */
    order?: MessageOrder;

    /** Clearing options in queue after pull request options */
    clearAfter: ClearDecision;

    /** If true, queue messages count information is sent */
    getQueueMessageCount?: boolean;

    /** Additional message headers for pull request */
    requestHeaders?: MessageHeader[];
}