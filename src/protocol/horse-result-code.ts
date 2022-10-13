
export enum HorseResultCode {

    /** Operation succeeded */
    Ok = 0,

    /** Unknown failed response */
    Failed = 1,

    /**Request successfull but response has no content */
    NoContent = 204,

    /**Request is not recognized or verified by the server */
    BadRequest = 400,

    /**Access denied for the operation */
    Unauthorized = 401,

    /**PaymentRequired = 402 */
    PaymentRequired = 402,

    /**Forbidden = 403 */
    Forbidden = 403,

    /**Target could not be found */
    NotFound = 404,

    /**MethodNotAllowed = 405 */
    MethodNotAllowed = 405,

    /**Request is not acceptable. Eg, queue status does not support the operation */
    Unacceptable = 406,

    /**RequestTimeout = 408 */
    RequestTimeout = 408,

    /**Conflict = 409 */
    Conflict = 409,

    /**Gone = 410 */
    Gone = 410,

    /**LengthRequired = 411 */
    LengthRequired = 411,

    /**PreconditionFailed = 412 */
    PreconditionFailed = 412,

    /**RequestEntityTooLarge = 413 */
    RequestEntityTooLarge = 413,

    /**RequestUriTooLong = 414 */
    RequestUriTooLong = 414,

    /**UnsupportedMediaType = 415 */
    UnsupportedMediaType = 415,

    /**RequestedRangeNotSatisfiable = 416 */
    RequestedRangeNotSatisfiable = 416,

    /**ExpectationFailed = 417 */
    ExpectationFailed = 417,

    /**MisdirectedRequest = 421 */
    MisdirectedRequest = 421,

    /**UnprocessableEntity = 422 */
    UnprocessableEntity = 422,

    /**Locked = 423 */
    Locked = 423,

    /**FailedDependency = 424 */
    FailedDependency = 424,

    /**UpgradeRequired = 426 */
    UpgradeRequired = 426,

    /**PreconditionRequired = 428 */
    PreconditionRequired = 428,

    /**TooManyRequests = 429 */
    TooManyRequests = 429,

    /**RequestHeaderFieldsTooLarge = 431 */
    RequestHeaderFieldsTooLarge = 431,

    /**UnavailableForLegalReasons = 451 */
    UnavailableForLegalReasons = 451,

    /**Requested data is already exists */
    Duplicate = 481,

    /**Client, consumer, queue or message limit is exceeded */
    LimitExceeded = 482,

    /**InternalServerError = 500 */
    InternalServerError = 500,

    /**NotImplemented = 501 */
    NotImplemented = 501,

    /**BadGateway = 502 */
    BadGateway = 502,

    /**Target is busy to complete the process */
    Busy = 503,

    /**GatewayTimeout = 504 */
    GatewayTimeout = 504,

    /**HttpVersionNotSupported = 505 */
    HttpVersionNotSupported = 505,

    /**VariantAlsoNegotiates = 506 */
    VariantAlsoNegotiates = 506,

    /**InsufficientStorage = 507 */
    InsufficientStorage = 507,

    /**LoopDetected = 508 */
    LoopDetected = 508,

    /**NotExtended = 510 */
    NotExtended = 510,

    /**NetworkAuthenticationRequired = 511 */
    NetworkAuthenticationRequired = 511,

    /**Message could not be sent to the server */
    SendError = 581,

    /**Key or name size limit for cache key, queue name etc */
    NameSizeLimit = 701,

    /**Value size limit for message length etc */
    ValueSizeLimit = 702
}