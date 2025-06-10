import {Request, Response} from "express";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/errorHandler";
import { prisma } from "../utils/prisma";

export const getAllRooms = asyncHandler(async (req : Request, res : Response) => {
    const user = req.user;

    if(!user){
        throw new ErrorHandler("Unauthenticated, Please Login", 403);
    }

    const allRooms = await prisma.roomMembership.findMany({
        where : {
            userId : user.id
        },
        select : {
            room : {
                select : {
                    id : true,
                    name : true,
                    createdAt : true,
                    messages : {
                        orderBy : {createdAt : "desc"},
                        take : 1,
                        select : {
                            id : true,
                            content : true,
                            createdAt : true,
                            sender : {
                                select : {
                                    id : true,
                                    username : true,
                                    profileImg : true
                                }
                            }
                        }
                    }
                }
            },
            lastReadAt : true
        },
    })


    if(!allRooms){
        throw new ErrorHandler("Some error occured in fetching all rooms",  500);
    }

    const rooms = await Promise.all(allRooms.map(async (rm) => {
        const unreadCount = await prisma.message.count({
            where : {
                roomId : rm.room.id,
                createdAt : rm.lastReadAt ? {gt : rm.lastReadAt} : undefined,
                senderId : {not : user.id}
            }
        })

        return {
            ...rm.room,
            lastMessage : rm.room.messages[0] || null,
            unreadCount
        }
    }))

    console.log("all rooms : ", allRooms);

    return res.status(200).json({
        success : true,
        rooms
    })

})