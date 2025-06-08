const express = require('express');
const {sendMessage,getConverstion} = require('../controllers/conversationController');
const authMiddleware = require('../middlerware/authMiddleware');



const router= express.Router();

//apply middleware
router.use(authMiddleware)


//send a message to get ai response in stream
router.post('/:chatId/messages',sendMessage);

//Get Converstions
router.get('/:chatId',getConverstion);


module.exports = router;