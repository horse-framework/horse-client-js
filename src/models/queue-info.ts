
export interface QueueInfo {

    /** Queue name */
    name: string;

    /** Queue topic */
    topic: string;

    /** Pending high priority messages in the queue */
    priorityMessages: number;

    /** Actively processing message count by consumers. These messages are not in queue, just pending for acknowledge. */
    processingMessages: number;

    /** Count of the messages that are tracking by delivery tracker. These messages are being tracked because acknowledge is pending from their consumers. */
    deliveryTrackingMessages: number;

    /** Pending regular messages in the queue */
    messages: number;

    /** Queue current status */
    status: string;

    /** Queue acknowledge type */
    acknowledge: string;

    /** When acknowledge is required, maximum duration for waiting acknowledge message */
    acknowledgeTimeout: number;

    /** When message queuing is active, maximum time for a message wait */
    messageTimeout: number;

    /** Total messages received from producers */
    receivedMessages: number;

    /** Total messages sent to consumers */
    sentMessages: number;

    /** Total unacknowledged messages */
    negativeAcks: number;

    /** Total acknowledged messages */
    acks: number;

    /** Total timed out messages */
    timeoutMessages: number;

    /** Total saved messages */
    savedMessages: number;

    /** Total removed messages */
    removedMessages: number;

    /** Total error count */
    errors: number;

    /** Last message receive date in UNIX milliseconds */
    lastMessageReceived: number;

    /** Last message send date in UNIX milliseconds */
    lastMessageSent: number;

    /** Maximum message limit of the queue (zero is unlimited) */
    messageLimit: number;

    /** Message limit exceeded strategy */
    limitExceededStrategy: string;

    /** Maximum message size limit (zero is unlimited) */
    messageSizeLimit: number;

    /** Delay in milliseconds between messages */
    delayBetweenMessages: number;
}