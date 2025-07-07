const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err))
    }
}
    


export {asyncHandler}


// const asyncHandler = () => {}
// const asyncHandler = (fn) => {() => {}}
// const asyncHandler = (fn) => async() => {}

/*
const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req, res, next);
        // If the function resolves, it will continue to the next middleware or route handler
    }
    catch(error){
        res.status(error.code || 404).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}
*/