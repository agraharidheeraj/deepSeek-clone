const Chat = require("../models/Chat");
const Conversation = require("../models/Conversation");

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({
      updateAt: -1,
    });
    if (!chats) {
      return res.status(401).json({ error: "chats not found" });
    }
    return res.json({ chats, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;
    const chat = new Chat({
      userId: userId,
      title: title || "New Chat",
      description,
    });

    await chat.save();
    return res
      .status(201)
      .json({ chat, message: "Chat created successfully", success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChat = async (req, res) => {
  try {
    const id = req.params.id;
    const chat = await Chat.findOne({ _id: id, userId: req.user.id });
    if (!chat) {
      return res.status(401).json({ error: "chats not found" });
    }
    const conversation = await Conversation.findOne({ chatId: id });

    //filter out system message
    const messages = conversation
      ? conversation.messages.filter((msg) => msg.role !== "system")
      : [];

    return res.json({
      chat,
      messages,
      message: "Conserstion get successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const id = req.params.id;
    const chat = await Chat.findOne({ _id: id, userId: req.user.id });

    if (!chat) {
      return res.status(401).json({ error: "chats not found" });
    }

    await Chat.deleteOne({ _id: id });
    await Conversation.deleteOne({ chatId: id });

    res.json({ success: true, message: "chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
