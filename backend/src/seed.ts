import { PrismaClient } from "@prisma/client";
import { prisma } from "./utils/prisma";
import { sendSocketError } from "./websocket/utils";

async function main(){
    // Create users
    const alice = await prisma.user.create({
        data : {
            id : "alice1234",
            username : "Alice",
            email : "ashh9406@gmail.com",
        }
    });

    const bob = await prisma.user.create({
        data : {
            id : "bob1234",
            username : "Bob",
            email : "bob@gmail.com"
        }
    });

    // Create a room
    const room = await prisma.room.create({
        data : {
            name : "Friends",
            createdById : alice.id,
            memberships : {
                create : [
                    {userId : alice.id},
                    {userId : bob.id}
                ]
            }
        }
    })

    // Add Messages
    await prisma.message.createMany({
        data : [
            {
                roomId : room.id,
                senderId : alice.id,
                content : "Hi Bob!"
            },            
            {
                roomId : room.id,
                senderId : bob.id,
                content : "Hello Alice!"
            }            
        ]
    })
}

main()
    .catch(e => {
        console.log(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })