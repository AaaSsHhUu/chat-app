import {Request, Response, NextFunction} from "express";
import admin from "../utils/firebase";
import ErrorHandler from "../utils/errorHandler";

export const firebaseAuth = async (req : Request, res : Response, next : NextFunction) => {
    const authHeader = req.headers.authorization;

    if(!authHeader?.startsWith("Bearer")){
        return next(new ErrorHandler("Token not found, Login first!!!", 400));
    }

    const idToken = authHeader.split(" ")[1];

    try{
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // console.log("decoded token : ", decodedToken);
        req.user = decodedToken;
        next();
    }catch(err){
        next(new ErrorHandler("Invalid Token", 500));
    }
}