const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/:otherUserId', authMiddleware, messageController.getMessages);
router.put('/:messageId/read', authMiddleware, messageController.markMessageAsRead);

module.exports = router;