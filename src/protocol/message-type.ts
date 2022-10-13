
export enum MessageType {

    /** Unknown message, may be peer to peer */
    Other = 0x00,

    /** Connection close request */
    Terminate = 0x08,

    /** Ping message from server */
    Ping = 0x09,

    /** Pong message to server */
    Pong = 0x0A,

    /** A message to directly server. Server should deal with it directly. */
    Server = 0x10,

    /** A message to a queue */
    QueueMessage = 0x11,

    /** Direct message, by Id, @type or @name */
    DirectMessage = 0x12,

    /** A response message, point to a message received before. */
    Response = 0x14,

    /** Used for requesting to pull messages from the queue */
    QueuePullRequest = 0x15,

    /** Notifies events if it's from server to client. Subscribes or ubsubscribes events if it's from client to server.  */
    Event = 0x16,

    /** Message is routed to a custom exchange in server */
    Router = 0x17,

    /** Channel messages */
    Channel = 0x18,

    /** Cache operation messages */
    Cache = 0x19,

    /** Pipe messages */
    Pipe = 0x1A,

    /** Transaction messages */
    Transaction = 0x1B,

    /** Clustering and node messages */
    Cluster = 0x1C
}