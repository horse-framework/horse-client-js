
export enum KnownContentTypes {

    /** "500" Process failed */
    Failed = 1,

    /** "101" After procotol handshake completed, first message is the hello message */
    Hello = 101,

    /** "202" Message is accepted */
    Accepted = 202,

    /** "204" Reset content */
    ResetContent = 205,

    /** "204" No content */
    NoContent = 204,

    /** "302" Found */
    Found = 302,

    /** "400" Message has invalid content */
    BadRequest = 400,

    /** "401" Permission denied for client */
    Unauthorized = 401,

    /** "404" Requested data not found */
    NotFound = 404,

    /** "406" Message is unacceptable */
    Unacceptable = 406,

    /** "481" Duplicate record, such as, you might send create queue operation when client is already created */
    Duplicate = 481,

    /** "482" Limit exceeded, such as, maximum queue limit of the server */
    LimitExceeded = 482,

    /** "503" Server is too busy to handle the message */
    Busy = 503,

    /** "601" Subscribe to a queue */
    QueueSubscribe = 601,

    /** "602" Unsubscribe from a queue */
    QueueUnsubscribe = 602,

    /** "607" Gets all consumers of a queue */
    QueueConsumers = 607,

    /** "610" Creates new queue */
    CreateQueue = 610,

    /** "611" Deletes the queue with it's messages */
    RemoveQueue = 611,

    /** "612" Changes queue properties and/or status */
    UpdateQueue = 612,

    /** "613" Clears messages in queue */
    ClearMessages = 613,

    /** "616" Gets queue information list */
    QueueList = 616,

    /** "621" Gets active node list */
    NodeList = 621,

    /** "631" Gets all connected clients */
    ClientList = 631,

    /** "651" Gets all rouuters */
    ListRouters = 651,

    /** "652" Creates new router */
    CreateRouter = 652,

    /** "653" Removes a router with it's bindings */
    RemoveRouter = 653,

    /** "661" List all bindings of a router */
    ListBindings = 661,

    /** "662" Creates new binding in a router */
    AddBinding = 662,

    /** "663" Removes a binding from a router */
    RemoveBinding = 663,

    /** "671" Gets a cache value */
    GetCache = 671,

    /** "672" Adds or sets a cache */
    SetCache = 672,

    /** "673" Removes a cache */
    RemoveCache = 673,

    /** "674" Purges all cache keys */
    PurgeCache = 674,

    /** "675" Get Cache List */
    GetCacheList = 675,

    /** "681" Pushes a message to channel */
    ChannelPush = 681,

    /** "682" Creates new channel */
    ChannelCreate = 682,

    /** "683" Updates a channel options */
    ChannelUpdate = 683,

    /** "684" Removes a channel */
    ChannelRemove = 684,

    /** "685" Gets channel list */
    ChannelList = 685,

    /** "686" Subscribes to a channel */
    ChannelSubscribe = 686,

    /** "686" Unsubscribes from a channel */
    ChannelUnsubscribe = 687,

    /** "688" Gets Subscribers of a channel */
    ChannelSubscribers = 688,

    /** "691" Create and begin new transaction */
    TransactionBegin = 691,

    /** "692" Commit a transaction */
    TransactionCommit = 692,

    /** "693" rollback a transaction */
    TransactionRollback = 693,

    /** "700" Node information */
    NodeInformation = 700,

    /** "701" Main node announcement */
    MainNodeAnnouncement = 701,

    /** "702" Main announcement answer */
    MainAnnouncementAnswer = 702,

    /** "703" Ask for Main permission */
    AskForMainPermission = 703,

    /** "704" Prod for main announcement */
    ProdForMainAnnouncement = 704,

    /** "705" Who is main node */
    WhoIsMainNode = 705,

    /** "711" Node queue list request */
    NodeQueueListRequest = 711,

    /** "712" Node queue list response */
    NodeQueueListResponse = 712,

    /** "713" Node queue sync request */
    NodeQueueSyncRequest = 713,

    /** "714" Node queue message id list */
    NodeQueueMessageIdList = 714,

    /** "715" Node queue message request */
    NodeQueueMessageRequest = 715,

    /** "716" Node queue message response */
    NodeQueueMessageResponse = 716,

    /** "717" Node queue sync completion */
    NodeQueueSyncCompletion = 717,

    /** "720" Cluster node acknowledge */
    ClusterNodeAcknowledge = 720,

    /** "715" Node push queue message */
    NodePushQueueMessage = 721,

    /** "716" Node put back queue message */
    NodePutBackQueueMessage = 722,

    /** "717" Node remove queue message */
    NodeRemoveQueueMessage = 723,
}