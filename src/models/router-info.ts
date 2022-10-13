import { RouteMethod } from "./route-method";

export interface RouterInfo {

    /** Route name. Must be unique. Can't include " ", "*" or ";" */
    name: string;

    /** If true, messages are routed to bindings. If false, messages are not routed. */
    isEnabled: boolean;

    /** Route method. Defines how messages will be routed. */
    method: RouteMethod;
}