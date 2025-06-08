const express = require('express');
const {getChats,getChat,createChat,deleteChat} = require('../controllers/chatController');
const authMiddleware = require('../middlerware/authMiddleware');



const router= express.Router();

//apply middleware
router.use(authMiddleware)

//get all chats
router.get('/',getChats);

//create new chat
router.post('/',createChat);

//get a specific chat
router.get('/:id',getChat)


//delete a specific chat
router.delete('/:id',deleteChat)

module.exports = router;