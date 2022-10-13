export enum ClearDecision {

    /** Do nothing. Do not delete any message. */
    None = 'none',

    /** Clear all messages in queue */
    AllMessages = 'all',

    /** Clear high priority messages in queue */
    PriorityMessages = 'high-priority',

    /** Clear default priority messages in queue */
    Messages = 'default-priority'
}
