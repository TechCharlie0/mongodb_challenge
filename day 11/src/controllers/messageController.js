const Message = require('../models/Message');
const Match = require('../models/Match');

exports.sendMessage = async (req, res, next) => {
    const senderId = req.user.id;
    const { receiverId, messageText } = req.body;

    if (!receiverId || !messageText) {
        return res.status(400).json({ msg: 'Receiver ID and message text are required' });
    }

    if (senderId === parseInt(receiverId)) {
        return res.status(400).json({ msg: 'Cannot send message to yourself' });
    }

    try {
        // Optional: Ensure they are matched before sending a message
        const isMatched = await Match.isMatch(senderId, receiverId);
        if (!isMatched) {
            return res.status(403).json({ msg: 'You can only send messages to your matches.' });
        }

        const message = await Message.create(senderId, receiverId, messageText);
        res.status(201).json(message);
    } catch (err) {
        next(err);
    }
};

exports.getMessages = async (req, res, next) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    try {
        // Optional: Ensure they are matched before retrieving messages
        const isMatched = await Match.isMatch(userId, otherUserId);
        if (!isMatched) {
            return res.status(403).json({ msg: 'You can only view messages with your matches.' });
        }

        const messages = await Message.getMessagesBetweenUsers(userId, otherUserId);
        res.json(messages);
    } catch (err) {
        next(err);
    }
};

exports.markMessageAsRead = async (req, res, next) => {
    const { messageId } = req.params;
    const userId = req.user.id; // Current user must be the receiver of the message

    try {
        const success = await Message.markAsRead(messageId, userId);
        if (!success) {
            return res.status(404).json({ msg: 'Message not found or you are not the receiver.' });
        }
        res.json({ msg: 'Message marked as read' });
    } catch (err) {
        next(err);
    }
};