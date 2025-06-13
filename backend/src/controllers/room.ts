import {Request, Response} from "express";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/errorHandler";
import { prisma } from "../utils/prisma";

export const createOneToOneChatRoom = asyncHandler(async (req : Request, res : Response) => {
    const {creatorEmail, userEmail} = req.body;

    if(!creatorEmail || !userEmail){
        throw new ErrorHandler("Emails not provided", 400);
    }

    const creator = await prisma.user.findUnique({
        where : {
            email : creatorEmail
        }
    })
    if(!creator){
        throw new ErrorHandler("Invalid creator email", 400);
    }

    const user = await prisma.user.findUnique({
        where : {
            email : userEmail
        }
    })
    if(!user){
        throw new ErrorHandler("Invalid user email", 400);
    }

    // Finding all the rooms in which the given two email users are present
    const existingRoom = await prisma.room.findFirst({
        where : {
            memberships : {
                every : {
                    OR : [
                        {userId : creator.id},
                        {userId : user.id}
                    ]
                }
            }
        },
        include : {
            memberships : true
        }
    })

    // Check whether the founded rooms has exactly 2 members
    let roomAlreadyExist = null;
    if(existingRoom && existingRoom.memberships.length === 2){
        const userIds = existingRoom.memberships.map(member => member.userId);
        if(userIds.includes(creator.id) && userIds.includes(user.id)){
            roomAlreadyExist = existingRoom;
        }
    }

    if(roomAlreadyExist){
        throw new ErrorHandler("Room already exist", 400);
    }

    // If no room is found then create a new one
    const newRoom = await prisma.room.create({
        data : {
            name : `${creatorEmail} + ${userEmail}`,
            createdById : creator.id,
        }
    })

    // Add the user in the new room 
    await prisma.roomMembership.createMany({
        data : [
            {
                userId : creator.id,
                roomId : newRoom.id,
                displayName : user.username
            },
            {
                userId : user.id,
                roomId : newRoom.id,
                displayName : creator.username
            }
        ]
    })

    return res.status(201).json({
        success : true,
        roomId : newRoom.id
    })
})

export const createOneToManyChatRoom = asyncHandler(async(req : Request, res : Response) => {
    const {groupName, creatorEmail, userEmails} = req.body;

    if(!groupName){
        throw new ErrorHandler("Groupname not provided", 400);
    }

    if(!creatorEmail || !Array.isArray(userEmails) ||  userEmails.length === 0){
        throw new ErrorHandler("Required emails not provided", 400);
    }

    const creator = await prisma.user.findUnique({
        where : {
            email : creatorEmail
        }
    })

    if(!creator){
        throw new ErrorHandler("Invalid creator email", 400);
    }

    const users = await Promise.all(userEmails.map(
        (email : string) => prisma.user.findUnique({
            where : {email}
        })
    ))

    // Filter out any not found users
    const validUsers = users.filter(Boolean);

    if(validUsers.length !== userEmails.length){
        throw new ErrorHandler("One or more user emails are invalid", 400);
    }

    // creating new room
    const room = await prisma.room.create({
        data : {
            name : groupName,
            createdById : creator.id
        }
    })

    // Adding every user and creator in the room
    const membershipData = [
        {userId : creator.id, roomId : room.id},
        ...validUsers.map((user : any) => ({
            userId : user.id,
            roomId : room.id
        }))
    ]
    await prisma.roomMembership.createMany({
        data : membershipData
    })

    return res.status(201).json({
        success : true,
        roomId : room.id
    })

})