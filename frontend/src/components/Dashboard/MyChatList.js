import React from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Circle,
  Stack,
} from "@chakra-ui/react";
import { useState } from "react";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";

const scrollbarconfig = {
  "&::-webkit-scrollbar": {
    width: "5px",
    height: "5px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "gray.300",
    borderRadius: "5px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "gray.400",
  },
  "&::-webkit-scrollbar-track": {
    display: "none",
  },
};

const MyChatList = (props) => {
  // Static data for demonstration
  const staticChatList = [
    {
      _id: "1",
      members: [{ _id: "101", name: "Ashu Negi", profilePic: "" }],
      latestmessage: "Yes, absolutely. Looking forward to it!",
      updatedAt: new Date(),
      unreadCounts: [{ userId: "101", count: 2 }],
    },
    {
      _id: "2",
      members: [{ _id: "102", name: "Saksham Kumar", profilePic: "" }],
      latestmessage: "Let's catch up tomorrow.",
      updatedAt: new Date(),
      unreadCounts: [{ userId: "102", count: 0 }],
    },
    {
      _id: "3",
      members: [{ _id: "103", name: "Dhruv Tomar", profilePic: "" }],
      latestmessage: "Meeting at 3 PM.",
      updatedAt: new Date(),
      unreadCounts: [{ userId: "103", count: 1 }],
    },
    {
      _id: "4",
      members: [{ _id: "104", name: "Saqib", profilePic: "" }],
      latestmessage: "Did you send the email?",
      updatedAt: new Date(),
      unreadCounts: [{ userId: "103", count: 1 }],
    },
  ];

  const [chatlist, setMyChatList] = useState(staticChatList);
  const [squery, setsquery] = useState("");

  const handleUserSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setsquery(query);

    if (query !== "") {
      const filteredList = staticChatList.filter((chat) =>
        chat.members[0].name.toLowerCase().includes(query)
      );
      setMyChatList(filteredList);
    } else {
      setMyChatList(staticChatList);
    }
  };

  const handleChatOpen = (chatid, receiver) => {
    props.setActiveChatId(chatid); // Set the active chat ID
    props.setReceiver(receiver); // Pass the selected receiver to ChatArea
    console.log(`Chat opened with ID: ${chatid}, Receiver:`, receiver);
  };

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      flexDir={"column"}
      mt={1}
      h={"100%"}
    >
      <Flex zIndex={1} justify={"space-between"}>
        <Text mb={"10px"} fontWeight={"bold"} fontSize={"2xl"}>
          Chats
        </Text>

        <Flex>
          <InputGroup w={{ base: "fit-content", md: "fit-content" }} mx={2}>
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="search user"
              onChange={handleUserSearch}
              id="search-input"
            />
          </InputGroup>
        </Flex>
      </Flex>

      <Divider my={1} />

      <Button
        m={2}
        colorScheme="purple"
        onClick={() => props.setactiveTab(1)}
      >
        Add new Chat <AddIcon ml={2} fontSize={"12px"} />
      </Button>

      <Box h={"100%"} px={2} flex={1} overflowY={"auto"} sx={scrollbarconfig}>
        {chatlist.map((chat) => (
          <Flex
            key={chat._id}
            my={2}
            justify={"space-between"}
            align={"center"}
            w={"100%"}
            overflow={"hidden"}
          >
            <Button
              h={"4em"}
              w={"100%"}
              justifyContent={"space-between"}
              onClick={() => handleChatOpen(chat._id, chat.members[0])}
              colorScheme={props.activeChatId === chat._id ? "purple" : "gray"}
            >
              <Flex>
                <Box>
                  <img
                    src={
                      chat.members[0].profilePic ||
                      "https://res.cloudinary.com/dal1usete/image/upload/v1739604949/j7axztsa2kjehkmqvdg7.webp"
                    }
                    alt="profile"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                    }}
                  />
                </Box>
                <Box ml={3} w={"50%"} textAlign={"left"}>
                  <Text
                    textOverflow={"hidden"}
                    fontSize={"lg"}
                    fontWeight={"bold"}
                  >
                    {chat.members[0].name}
                  </Text>
                  <Text fontSize={"sm"} color={"gray.400"}>
                    {chat.latestmessage}
                  </Text>
                </Box>
              </Flex>

              <Stack direction={"row"} align={"center"}>
                <Box textAlign={"right"} fontSize={"x-small"}>
                  {new Date(chat.updatedAt).toLocaleDateString()}
                  {new Date(chat.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Box>

                {chat.unreadCounts[0].count > 0 && (
                  <Circle
                    backgroundColor={"black"}
                    color={"white"}
                    p={1}
                    borderRadius={40}
                    size={"20px"}
                  >
                    <Text fontSize={12} p={1} borderRadius={50}>
                      {chat.unreadCounts[0].count}
                    </Text>
                  </Circle>
                )}
              </Stack>
            </Button>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};

export default MyChatList;
