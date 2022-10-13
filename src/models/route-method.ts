
export enum RouteMethod {

    /** Routes each message to all bindings */
    Distribute = 'distribute',

    /** Routes each message to only one binding */
    RoundRobin = 'round-robin',

    /** Routes message to only first binding.
    Useful when you need only one queue can received messages at same time guarantee.
     Messages are sent to only one active queue when it exists.
     When it's removed messages are sent to other queue while it's active.  */
    OnlyFirst = 'only-first'
}