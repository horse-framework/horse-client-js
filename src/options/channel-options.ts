
export interface ChannelOptions {

    /** If true, the channel is destroyed automatically when channel is inactive (no subscribers, no new published messages). Set null for server defaults. */
    autoDestroy?: boolean;

    /** Maximum message size limit. Zero is unlimited. */
    messageSizeLimit?: number;

    /** Maximum client limit of the queue. Zero is unlimited. */
    clientLimit?: number;
}