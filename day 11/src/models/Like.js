const db = require('../config/db');

class Like {
    static async create(liker_id, liked_id, status) {
        const [result] = await db.execute(
            'INSERT INTO likes (liker_id, liked_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), created_at = CURRENT_TIMESTAMP',
            [liker_id, liked_id, status]
        );
        return result.affectedRows > 0;
    }

    static async findLikeStatus(liker_id, liked_id) {
        const [rows] = await db.execute(
            'SELECT status FROM likes WHERE liker_id = ? AND liked_id = ?',
            [liker_id, liked_id]
        );
        return rows[0] ? rows[0].status : null;
    }

    static async hasLiked(liker_id, liked_id) {
        const [rows] = await db.execute(
            'SELECT 1 FROM likes WHERE liker_id = ? AND liked_id = ? AND status = "like"',
            [liker_id, liked_id]
        );
        return rows.length > 0;
    }
}

module.exports = Like;