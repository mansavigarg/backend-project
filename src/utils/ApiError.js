class ApiError extends Error {
    constructor(
        statuscode,
        message = "Something when wrong",
        errors = [],
        statch = ""
    ){
        super(message)
        this.statuscode = statuscode,
        this.data = null,
        this.message = message,
        this.success = false,
        this.errors = errors

        if (statch) {
            this.stack = statch
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export { ApiError }