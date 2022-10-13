import { BindingInteraction } from "./binding-interaction";
import { RouteMethod } from "./route-method";

export interface BindingInfo {

    /** Unique name of the binding */
    name: string;

    /** Binding target name. For queue bindings, queue name. For direct bindings client id, type or name. */
    target: string;

    /** Binding content type. Null, passes same content type from producer to receiver */
    contentType: number;

    /** Binding priority */
    priority: number;

    /** Binding interaction type */
    interaction: BindingInteraction;

    /** Binding type */
    bindingType: string;

    /** Routing method in binding */
    method: RouteMethod;
}