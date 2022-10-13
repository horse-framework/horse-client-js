
export interface QueueOptions {

    /** Queue manager name. There are 2 manager names predefined: default and persistent */
    managerName?: string;

    /** Queue message acknowledge method */
    acknowledge?: 'none' | 'request' | 'wait';

    /** Acknowledge timeout in milliseconds for each consume operation */
    acknowledgeTimeout?: number;

    /** Message timeout in seconds. Message is lost when it's expired. */
    messageTimeout?: number;

    /** Queue operation type */
    type?: 'push' | 'round-robin' | 'pull';

    /** Message limit for the queue */
    messageLimit?: number;
    
    /** Message limit exceeded strategy, rejects newly pushed message or deletes oldest messages. */
    limitExceededStrategy?: 'reject-new' | 'delete-oldest',

    /** Subscriber client limit */
    clientLimit?: number;

    /** When a message ack is failed (negative of timeout) putting message back into the queue strategy */
    putBack?: 'no' | 'regular' | 'priority';

    /** Queue auto destroy options */
    autoDestroy?: 'disabled' | 'no-messages' | 'no-consumers' | 'empty';

    /** If you want to slow down consume operations, you can put delay in milliseconds between each consume operations */
    delayBetweenMessages?: number;

    /** Delay in milliseconds before putting message back into the queue */
    putBackDelay?: number;
}