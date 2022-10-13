
export enum HorseEventType {

    /** Triggered when a client is connected to the server */
    ClientConnect = 101,

    /** Triggered when a client is disconnected from the server */
    ClientDisconnect = 102,

    /** Triggered when the server connects to remote node */
    ConnectedToRemoteNode = 111,

    /** Triggered when the server disconnects from remote node */
    DisconnectedFromRemoteNode = 112,

    /** Triggered when a remote node is connected to the server */
    RemoteNodeConnect = 113,

    /** Triggered when a remote node is disconnected from the server */
    RemoteNodeDisconnect = 114,

    /** Triggered when new queue is created */
    QueueCreate = 201,

    /** Triggered when a queue is removed */
    QueueRemove = 202,

    /** Triggered when a queue status is changed */
    QueueStatusChange = 203,

    /** Triggered when a client is subscribed to a queue */
    QueueSubscription = 204,

    /** Triggered when a client is unsubscribed from a queue */
    QueueUnsubscription = 205,

    /** Triggered when a new message is pushed to a queue */
    QueuePush = 206,

    /** Triggered when a queue message is acknowledged by it's consumer */
    QueueMessageAck = 207,

    /** Triggered when a queue message is negatice acknowledged by it's consumer */
    QueueMessageNack = 208,

    /** Triggered when a queue message acknowledge is timed out */
    QueueMessageUnack = 209,

    /** Triggered when a message is timed out and dequeued from a queue */
    QueueMessageTimeout = 210,

    /** Triggered when new router is created */
    RouterCreate = 301,

    /** Triggered when a router is removed */
    RouterRemove = 302,

    /** Triggered when a router binding is created */
    RouterBindingAdd = 303,

    /** Triggered when a router binding is removed */
    RouterBindingRemove = 304,

    /** Triggered when a message is published to a router */
    RouterPublish = 305,

    /** Triggered when a direct message is received */
    DirectMessage = 401,

    /** Triggered when a direct message is respond */
    DirectMessageResponse = 402,

    /** Triggered when a client requested to get a cache */
    CacheGet = 501,

    /** Triggered when a client sets a cache */
    CacheSet = 502,

    /** Triggered when a client is removed a cache */
    CacheRemove = 503,

    /** Triggered when a client is purged all cache values */
    CachePurge = 504,

    /** Triggered when a channel is created */
    ChannelCreate = 601,

    /** Triggered when a channel is removed */
    ChannelRemove = 602,

    /** Triggered when a client is subscribed to a channel */
    ChannelSubscribe = 603,

    /** Triggered when a client is unsubscribed from a channel */
    ChannelUnsubscribe = 604,

    /** Triggered when a new message is published to a channel */
    ChannelPublish = 605

}