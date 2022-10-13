
export enum MessageOrder {

    /** Does not send any order information. Uses default */
    Default = 0,

    /** Requests messages with first in first out order (as queue) */
    FIFO = 1,

    /** Requests messages with last in first out order (as stack) */
    LIFO = 2
}
