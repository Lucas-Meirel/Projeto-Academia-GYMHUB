import chatController from "../controller/chatController";
import express from "express";

export const routerChat = express.Router()

routerChat.post('/chat', chatController.handler)