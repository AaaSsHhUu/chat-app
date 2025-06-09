import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getStorage, getDownloadURL } from "firebase-admin/storage";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/errorHandler";
import SignupSchema from "../schema/auth";

// Save user in DB after successfull firebase authentication
export const saveUser = asyncHandler(async (req: Request, res: Response) => {
	let { uid, userEmail : email, username } = req.body; // has to take userEmail to differentiate b/w Signup.tsx two email fields

    // Zod validation
    const {success, error} = SignupSchema.safeParse({uid, email, username});

    if(!success){
        throw new ErrorHandler(error.message || "Invalid Inputs", 400);
    }

	if (!req.user) {
		throw new ErrorHandler("User not Authenticated, Login first", 400);
	}

	let existingUser = await prisma.user.findUnique({
		where: {
			id: uid,
		},
	});

	if (existingUser) {
		throw new ErrorHandler("User with email already exist", 400);
	}

	const newUser = await prisma.user.create({
		data: {
			id: uid,
			email,
			username
		},
	});

	return res.status(201).json({
		success: true,
		message: "User created successfully",
		newUser,
	});
});

export const getCurrUserProfile = asyncHandler(async (req : Request, res : Response) => {
	const {uid : id} = req.user;

	const user = await prisma.user.findUnique({
		where : {
			id
		},
		select : {
			email : true,
			id : true,
			username : true,
			profileImg : true,
			createdAt : true
		}
	})
})

export const uploadProfileImage = asyncHandler(
	async (req: Request, res: Response) => {
		const file = req.file;
		const { uid } = req.user;

		if (!file) {
			return res.status(400).json({
				error: "Please upload a file!!!",
			});
		}

		const filename = `profile-image/${uid}/${file.originalname}`;

		// Upload to firebase storage
		try {
			const bucket = getStorage().bucket(); // A big folder in the cloud to store the files
			const blob = bucket.file(filename); // Blob -> Binary large Object, represent a single file in the bucket

			await blob.save(file.buffer, {
				contentType: file.mimetype,
				public: true,
			});

			// Get public url
			const url = await getDownloadURL(blob);

			// Update user in DB
			await prisma.user.update({
				where: { id: uid },
				data: { profileImg: url },
			});

			return res.json({
				sucess: true,
				url,
			});
		} catch (error) {
			console.log("error in uploading profile image - ", error);
			throw new ErrorHandler("Something went wrong", 500);
		}
	}
);

export const deleteUser = asyncHandler(async (req : Request, res : Response) => {
	const userId = req.user.uid;

	await prisma.$transaction(async (txn) => {
		await txn.roomMembership.deleteMany({where : {userId} });
		
		// Replacing the createdById of the room with another users id TLDR -> replacing admin
		const rooms = await txn.room.findMany({
			where : {
				createdById : userId
			}
		})

		for(const room of rooms){
			const otherMember = await txn.roomMembership.findFirst({
				where : {
					roomId : room.id,
					userId : {not : userId}
				}
			})

			if(otherMember){
				await txn.room.update({
					where : {
						id : room.id
					},
					data : {
						createdById : otherMember.userId
					}
				})
			}
			else{
				// If no other member is there then delete the room
				await txn.room.delete({
					where : { id : room.id }
				})
			}
		}

		await txn.user.delete({where : {id : userId}});
	})
})