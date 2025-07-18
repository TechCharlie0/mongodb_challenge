const db = require('../config/db');

class Message {
    static async create(sender_id, receiver_id, message_text) {
        const [result] = await db.execute(
            'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)',
            [sender_id, receiver_id, message_text]
        );
        return { id: result.insertId, sender_id, receiver_id, message_text, sent_at: new Date(), read_status: false };
    }

    static async getMessagesBetweenUsers(user1_id, user2_id) {
        const [rows] = await db.execute(
            `SELECT m.id, m.sender_id, m.receiver_id, m.message_text, m.sent_at, m.read_status,
                    s.username AS sender_username, r.username AS receiver_username
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?)
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.sent_at ASC`,
            [user1_id, user2_id, user2_id, user1_id]
        );
        return rows;
    }

    static async markAsRead(messageId, userId) {
        // Only mark as read if the current user is the receiver
        const [result] = await db.execute(
            'UPDATE messages SET read_status = TRUE WHERE id = ? AND receiver_id = ?',
            [messageId, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Message;