// Higher Order Functions in JavaScript 
// const asyncHandler = () => {}
// const asyncHandler = (function) => { () => {} }
// const asyncHandler = (function) => () => {}
// const asyncHandler = (function) => async () => {}


// .then wala method
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }


//         // try catch wala method
// const asyncHandler = (fu) => async (req, res, next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.send(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }

// }