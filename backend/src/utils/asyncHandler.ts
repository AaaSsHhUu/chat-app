import { Request, Response, NextFunction } from "express"

const asyncHandler = (fn : any) => 
    (req : Request,res : Response, next : NextFunction) => 
        Promise.resolve(fn(req,res,next)).catch(err => next(err))
    
export default asyncHandler;