
export type NodeType = 'main' | 'successor' | 'replica' | undefined;

export interface RemoteHost {

    /** Full host name like horse://localhost:12345 */
    host: string;

    /** IP Address or only host name without protocol and port information. Such as localhost or 127.0.0.1 */
    ip: string;
    
    /** Port number */
    port: number;

    /** Node type */
    type: NodeType;

    /** If true, connection is secured. */
    sll: boolean;
}