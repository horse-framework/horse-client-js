
export interface ChannelInfo {

    /** Channel name */
    name: string;

    /** Channel topic */
    topic: string;

    /** Channel status: paused, running, destroyed */
    status: string;

    /** Total published message count */
    published: number;

    /** Total received message (by subscribers) count */
    received: number;

    /** Online subscriber count */
    subscriberCount: number;
}