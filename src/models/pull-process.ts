export enum PullProcess {
    /** Still receiving messages from server */
    Receiving,

    /** Server respond unacceptable request */
    Unacceptable,

    /** Unauthorized process */
    Unauthorized,

    /** Queue is empty */
    Empty,

    /** All messages are received, process completed. */
    Completed,

    /** Message receive operation timed out. */
    Timeout,

    /** Disconnected from server while receiving messages */
    NetworkError
}
