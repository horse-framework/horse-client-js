
export interface QueueSubscriptionOptions {

    topic?: string;
    acknowledge?: 'none' | 'request' | 'wait';
    acknowledgeTimeout?: number;
    messageTimeout?: number;
    type?: 'push' | 'round-robin' | 'pull';
    delayBetweenMessages?: number;
    putBack?: 'no' | 'regular' | 'priority';
    putBackDelay?: number;
}