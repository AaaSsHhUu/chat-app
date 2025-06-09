import {Request, Response, NextFunction, ErrorRequestHandler} from "express";

const errorMiddleware : ErrorRequestHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";

    console.log("err - ", err.stack || err)
    res.status(statusCode).json({
        success : false,
        message
    })
}

export default errorMiddleware;