import React, { useState, useEffect, useContext } from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import Lottie from "react-lottie";
import animationdata from "../../typingAnimation.json";
import {
  Box,
  InputGroup,
  Input,
  Text,
  InputRightElement,
  Button,
  FormControl,
  InputLeftElement,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { FaFileUpload } from "react-icons/fa";
import { marked } from "marked";

import chatContext from "../../context/chatContext";
import ChatAreaTop from "./ChatAreaTop";
import FileUploadModal from "../miscellaneous/FileUploadModal";
import ChatLoadingSpinner from "../miscellaneous/ChatLoadingSpinner";
import axios from "axios";
import SingleMessage from "./SingleMessage";

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

const markdownToHtml = (markdownText) => {
  const html = marked(markdownText);
  return { __html: html };
};

export const ChatArea = ({ activeChatId, receiver }) => {
  const staticMessageList = [
    {
      _id: "1",
      senderId: "101",
      text: "Hey, how are you?",
      createdAt: new Date().toLocaleTimeString(),
    },
    {
      _id: "2",
      senderId: "102",
      text: "I'm good, thanks! How about you?",
      createdAt: new Date().toLocaleTimeString(),
    },
    {
      _id: "3",
      senderId: "101",
      text: "Doing great! Are we still on for the meeting tomorrow?",
      createdAt: new Date().toLocaleTimeString(),
    },
    {
      _id: "4",
      senderId: "102",
      text: "Yes, absolutely. Looking forward to it!",
      createdAt: new Date().toLocaleTimeString(),
    },
  ];

  const [messageList, setMessageList] = useState(staticMessageList);

  const handleSendMessage = (e, messageText) => {
    e.preventDefault();

    if (!messageText || messageText.trim() === "") {
      return;
    }

    const newMessage = {
      _id: Date.now().toString(),
      senderId: "101", // Assuming the current user has ID "101"
      text: messageText,
      createdAt: new Date().toLocaleTimeString(),
    };

    setMessageList((prev) => [...prev, newMessage]);

    const inputElem = document.getElementById("new-message");
    if (inputElem) {
      inputElem.value = "";
    }

    setTimeout(() => {
      document.getElementById("chat-box")?.scrollTo({
        top: document.getElementById("chat-box").scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <>
      {activeChatId !== "" ? (
        <Box
          justifyContent="space-between"
          h="100%"
          w={{
            base: "100vw",
            md: "100%",
          }}
        >
          <ChatAreaTop />

          <Text fontSize="xl" fontWeight="bold" textAlign="center" mb={4}>
            Chat with {receiver.name}
          </Text>

          <Box
            id="chat-box"
            h="85%"
            overflowY="auto"
            sx={scrollbarconfig}
            mt={1}
            mx={1}
          >
            {messageList.map((message) => (
              <Box
                key={message._id}
                textAlign={message.senderId === "101" ? "right" : "left"}
                mb={3}
              >
                <Text
                  display="inline-block"
                  bg={message.senderId === "101" ? "purple.100" : "gray.100"}
                  p={2}
                  borderRadius="md"
                  maxW="70%"
                >
                  {message.text}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {message.createdAt}
                </Text>
              </Box>
            ))}
          </Box>

          <Box
            py={2}
            position="fixed"
            w={{
              base: "100%",
              md: "70%",
            }}
            bottom={{
              base: 1,
              md: 3,
            }}
            backgroundColor={
              localStorage.getItem("chakra-ui-color-mode") === "dark"
                ? "#1a202c"
                : "white"
            }
          >
            <FormControl>
              <InputGroup
                w={{
                  base: "95%",
                  md: "98%",
                }}
                m="auto"
              >
                <Input
                  placeholder="Type a message"
                  id="new-message"
                  borderRadius="10px"
                />
                <InputRightElement>
                  <Button
                    onClick={(e) =>
                      handleSendMessage(
                        e,
                        document.getElementById("new-message")?.value
                      )
                    }
                    size="sm"
                    mx={2}
                    borderRadius="10px"
                  >
                    <ArrowForwardIcon />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
        </Box>
      ) : (
        <Text textAlign="center" mt={5}>
          Select a chat to start messaging
        </Text>
      )}
    </>
  );
};
