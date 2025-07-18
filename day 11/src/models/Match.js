const db = require('../config/db');

class Match {
    static async create(user1_id, user2_id) {
        // Ensure user1_id is always less than user2_id for consistent storage
        const [id1, id2] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];

        const [result] = await db.execute(
            'INSERT IGNORE INTO matches (user1_id, user2_id) VALUES (?, ?)',
            [id1, id2]
        );
        return result.affectedRows > 0; // Returns true if a new match was created, false if it already existed
    }

    static async findMatchesForUser(userId) {
        const [rows] = await db.execute(
            `SELECT
                CASE
                    WHEN user1_id = ? THEN user2_id
                    ELSE user1_id
                END AS matched_user_id,
                users.username,
                users.profile_picture_url,
                matches.matched_at
            FROM matches
            JOIN users ON (
                (matches.user1_id = users.id AND matches.user2_id = ?) OR
                (matches.user2_id = users.id AND matches.user1_id = ?)
            )
            WHERE matches.user1_id = ? OR matches.user2_id = ?`,
            [userId, userId, userId, userId, userId]
        );
        return rows;
    }

    static async isMatch(user1_id, user2_id) {
        const [id1, id2] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];
        const [rows] = await db.execute(
            'SELECT 1 FROM matches WHERE user1_id = ? AND user2_id = ?',
            [id1, id2]
        );
        return rows.length > 0;
    }
}

module.exports = Match;