import { PrismaClient } from "@prisma/client";
// globalThis is a standard JavaScript global property that provides a universal way to access the global object, regardless of the environment (e.g., window in browsers, global in Node.js, self in Web Workers). It makes your code more portable.

const globalForPrisma = globalThis as unknown as {prisma : PrismaClient};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


/* 
    > When you try to directly assert globalThis as { prisma: PrismaClient }, TypeScript will usually complain. Why? Because TypeScript's type checker is smart enough to know that the globalThis object by default does not have a prisma property of type PrismaClient. It sees this as a potential type mismatch.

    # By asserting as unknown, you are telling TypeScript: "Hey, I know globalThis is of some type, but for a moment, just treat it as a type we know nothing about (unknown). Trust me, I'm about to give you more specific information."

    > unknown is a type-safe counterpart to any. You can assign anything to unknown, but you cannot perform any operations on a value of type unknown until you narrow its type. This forces you to be explicit about what you're doing next.

    # as { prisma: PrismaClient } -> This is the second type assertion.


    > After as unknown, TypeScript now sees globalThis as unknown.

    Now, by asserting as { prisma: PrismaClient }, you are telling TypeScript: "Okay, that unknown thing? I'm now asserting that, in this specific context for what I'm about to do, it actually behaves like an object that has a property named prisma whose type is PrismaClient." 
*/