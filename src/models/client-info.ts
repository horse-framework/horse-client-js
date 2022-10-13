
export interface ClientInfo {
    
    /** Client Unique Id */
    id: string;

    /** Client name */
    name: string;

    /** Client type */
    type: string;

    /** Total online duration of client in milliseconds */
    online: number;

    /** If true, client authenticated by server's IClientAuthenticator implementation */
    isAuthenticated: boolean;
}