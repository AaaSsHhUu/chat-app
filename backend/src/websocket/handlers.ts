// Functions for handling events (message, join, leave, etc.)

import { WebSocket } from "ws";
import { WSMessage } from "./types";
import { prisma } from "../utils/prisma";
import admin from "../utils/firebase";
import { sendSocketError } from "./utils";

export type AuthenticatedSocket = WebSocket & { userId?: string };

export const authenticatedUsers = new Map<string, WebSocket>(); // userId -> socket

export const roomMembers: Record<string, Map<string, WebSocket>> = {}; // {roomId : {userId, socket}}

export async function handleMessage(
	socket: AuthenticatedSocket,
	data: WSMessage
) {
	switch (data.type) {
		case "auth":
			await handleAuth(socket, data.payload);
			break;
		case "create-one-to-one-room":
			await createOneToOneChatRoom(socket, data.payload);
			break;

		case "create-one-to-many-room":
			await createOneToManyChatRoom(socket, data.payload);
			break;
		case "chat":
			await handleSendMessage(socket, data.payload);
			break;

		case "join":
			await handleJoinRoom(socket, data.payload);
			break;

		case "leave":
			await handleLeaveRoom(socket, data.payload);
			break;
		case "typing":
			await handleShowTyping(socket, data.payload);
			break;
		default:
			socket.send(
				JSON.stringify({ type: "error", message: "Unknown type" })
			);
	}
}

export async function handleAuth(
	socket: AuthenticatedSocket,
	data: { token: string }
) {
	try {
		const decoded = await admin.auth().verifyIdToken(data.token);
		socket.userId = decoded.uid;
		authenticatedUsers.set(decoded.uid, socket);

		socket.send(
			JSON.stringify({
				type: "auth-success",
				payload: {
					userId: decoded.uid,
				},
			})
		);
	} catch (error) {
		socket.send(
			JSON.stringify({
				type: "auth-failed",
			})
		);
		socket.close();
	}
}

export async function createOneToOneChatRoom(
	socket: AuthenticatedSocket,
	data: { creatorEmail: string; userEmail: string }
) {
	const { creatorEmail, userEmail } = data;

	if (!creatorEmail || !userEmail) {
		socket.send(
			JSON.stringify({
				type: "error",
				message: "Emails not provided",
			})
		);
	}

	const [creator, user] = await Promise.all([
		prisma.user.findUnique({ where: { email: creatorEmail } }),
		prisma.user.findUnique({ where: { email: userEmail } }),
	]);

	if (!creator) {
		return socket.send(
			JSON.stringify({ type: "error", message: "Invalid creator email" })
		);
	}
	if (!user) {
		return socket.send(
			JSON.stringify({ type: "error", message: "Invalid user email" })
		);
	}

	// Check if room already exists
	const existingRooms = await prisma.room.findMany({
		where: {
			memberships: {
				some: {
					userId: { in: [user.id, creator.id] },
				},
			},
		},
		include: {
			memberships: true,
		},
	});

	// Check whether the founded rooms have exactly two members
	const exactExistingRoom = existingRooms.find((room) => {
		const memberIds = room.memberships.map((member) => member.userId);
		return (
			memberIds.length === 2 &&
			memberIds.includes(user.id) &&
			memberIds.includes(creator.id)
		);
	});

	if (exactExistingRoom) {
		return socket.send(
			JSON.stringify({
				type: "error",
				message: "Room already exist",
			})
		);
	}

	// If no existing room then create a new one
	const newRoom = await prisma.room.create({
		data: {
			name: "",
			createdById: creator.id,
		},
	});

	// Add both the user and the creator in the created room
	await prisma.roomMembership.createMany({
		data: [
			{
				userId: creator.id,
				roomId: newRoom.id,
				displayName: user.username,
			},
			{
				userId: user.id,
				roomId: newRoom.id,
				displayName: creator.username,
			},
		],
	});

	socket.send(
		JSON.stringify({
			type: "room-created",
			payload: { roomId: newRoom.id },
		})
	);
}

export async function createOneToManyChatRoom(
	socket: WebSocket,
	data: { groupName: string; userEmails: string[]; creatorEmail: string }
) {
	const { groupName, userEmails, creatorEmail } = data;

	if (
		!groupName ||
		!Array.isArray(userEmails) ||
		userEmails.length === 0 ||
		!creatorEmail
	) {
		return socket.send(
			JSON.stringify({
				type: "error",
				message: "Invalid inputs provided",
			})
		);
	}

	const creator = await prisma.user.findUnique({
		where: { email: creatorEmail },
	});
	const users = await Promise.all(
		userEmails.map((email) => prisma.user.findUnique({ where: { email } }))
	);

	if (!creator) {
		return socket.send(
			JSON.stringify({
				type: "error",
				message: "Invalid creator email",
			})
		);
	}

	const validUsers = users.filter(
		(user): user is NonNullable<typeof user> => !!user
	); // Same a Boolean(user) but with type safety

	if (validUsers.length !== userEmails.length) {
		return socket.send(
			JSON.stringify({
				type: "error",
				message: "One or more user emails are invalid",
			})
		);
	}

	// Prevent duplicate group name by creator
	const existingGroupName = await prisma.room.findFirst({
		where: {
			createdById: creator?.id,
			name: groupName,
		},
	});

	if (existingGroupName) {
		return socket.send(
			JSON.stringify({
				type: "error",
				message: "You already have group with this name",
			})
		);
	}

	// Create new room for the group
	const newRoom = await prisma.room.create({
		data: {
			createdById: creator.id,
			name: groupName,
		},
	});

	// Add the creator and all the users in the new room
	const membershipData = [
		{ userId: creator.id, roomId: newRoom.id },
		...validUsers.map((user) => ({
			userId: user.id,
			roomId: newRoom.id,
		})),
	];

	await prisma.roomMembership.createMany({
		data: membershipData,
	});

	socket.send(
		JSON.stringify({
			type: "room-created",
			payload: { roomId: newRoom.id },
		})
	);
}

export async function handleSendMessage(
	socket: AuthenticatedSocket,
	data: { roomId: string; message: string }
) {
	try {
		if (!socket.userId) {
			sendSocketError(socket, "Unauthorized");
			return;
		}

		if (data.message.length > 1000 || data.message.length <= 0) {
			sendSocketError(socket, "Invalid message length");
			return;
		}

		// Check whether the roomId is valid of not
		const roomExist = await prisma.room.findUnique({
			where: {
				id: data.roomId,
			},
		});

		if (!roomExist) {
			sendSocketError(socket, "Invalid room ID");
			return;
		}

		// Save message in DB
		const newMsg = await prisma.message.create({
			data: {
				roomId: data.roomId,
				senderId: socket.userId,
				content: data.message,
			},
		});

		// Broadcast the msg to all the room members
		const members = roomMembers[data.roomId];
		members?.forEach((memberSocket) => {
			memberSocket.send(
				JSON.stringify({
					type: "chat",
					payload: { message: newMsg },
				})
			);
		});
	} catch (error) {
		sendSocketError(socket, "Failed to send message");
	}
}

export async function handleJoinRoom(
	socket: AuthenticatedSocket,
	data: { roomId: string }
) {
	try {
		if (!socket.userId) {
			sendSocketError(socket, "Unauthorized");
			return;
		}

		// Add user to room in memory
		if (!roomMembers[data.roomId]) {
			roomMembers[data.roomId] = new Map();
		}
		roomMembers[data.roomId].set(socket.userId, socket);

		// Fetch last N messages
		const messages = await prisma.message.findMany({
			where: {
				roomId: data.roomId,
			},
			orderBy: {
				createdAt: "asc",
			},
			take: 50,
			select: {
				id: true,
				content: true,
				createdAt: true,
				senderId: true,
			},
		});

		socket.send(
			JSON.stringify({
				type: "joined",
				payload: {
					roomId: data.roomId,
					messages,
				},
			})
		);
	} catch (error) {
		sendSocketError(socket, "Failed to join the room");
	}
}

export async function handleLeaveRoom(
	socket: AuthenticatedSocket,
	data: { roomId: string }
) {
	try {
		if (!socket.userId) {
			sendSocketError(socket, "Unauthorized");
			return;
		}

		const members = roomMembers[data.roomId];
		if (members) {
			members.delete(socket.userId);
			// If no member in a room then delete that room
			if (members.size === 0) {
				delete roomMembers[data.roomId];
			}
		}

		socket.send(
			JSON.stringify({
				type: "left",
				payload: {
					roomId: data.roomId,
				},
			})
		);
	} catch (error) {
		sendSocketError(socket, "Failed to leave the room");
	}
}

export async function handleShowTyping(
	socket: AuthenticatedSocket,
	data: { userId: string; roomId: string; typing: boolean }
) {
	try {
		const members = roomMembers[data.roomId];
		if (!members) return;

		members.forEach((memberSocket, memberId) => {
			if (memberId !== socket.userId) {
				memberSocket.send(
					JSON.stringify({
						type: "typing",
						payload: {
							typing: true,
							userId: data.userId,
							roomId: data.roomId,
						},
					})
				);
			}
		});
	} catch (error) {
		sendSocketError(socket, "Show typing err - Something went wrong");
	}
}
