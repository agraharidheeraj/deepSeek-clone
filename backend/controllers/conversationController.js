const { generateStreamResponse } = require("../aiProvider/deepseek-ai");
const Chat = require("../models/Chat");
const Conversation = require("../models/Conversation");

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    if (!message || !message.content) {
      return res.status(400).json({ error: "Message content is required" });
    }
    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(401).json({ error: "chats not found" });
    }

    let conversation = await Conversation.findOne({ chatId });

    if (!conversation) {
      conversation = new Conversation({
        chatId,
        messages: [],
      });
    }

    //add user message to converstion
    const userMessages = {
      role: "user",
      content: message.content,
    };
    conversation.messages.push(userMessages);

    chat.updatedAt = Date.now();
    await chat.save();

    //save conversatiuon
    await conversation.save();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    //generate assistante response

    let assistantResponse = "";
    try {
      assistantResponse = await generateStreamResponse(
        conversation.messages,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      );

      const titleMatch = assistantResponse.match(/\[TITLE:\s*(.*?)\]/i);
      const cleanResponse = assistantResponse
        .replace(/\[TITLE:\s*(.*?)\]/i, "")
        .trim();

      conversation.messages.push({
        role: "assistant",
        content: cleanResponse,
      });

      await conversation.save();
      //if its the first assiatnt respibnse , extract title
      if ((chat.title = "New Chat")) {
        const assistantMessages = conversation.messages.filter(
          (msg) => msg.role === "assistant"
        );
        if (assistantMessages.length === 1) {
          if (titleMatch) {
            chat.title = titleMatch[1].trim();
            await chat.save();
          }
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Error generating response:", error);
      res.write(
        `data: ${JSON.stringify({ error: "failed to generate response" })}\n\n`
      );
    }
  } catch (error) {
    console.log("Error in converstion api", error);
    res.status(500).json({ error: error.message });
  }
};

 exports.getConverstion = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(401).json({ error: "chats not found" });
    }
    const conversation = await Conversation.findOne({ chatId });
    if (!conversation) {
      return res.status(404).json({ error: "Converstion not found" });
    }

    const messages = conversation.messages.filter(
      (msg) => msg.role !== "system"
    );
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


