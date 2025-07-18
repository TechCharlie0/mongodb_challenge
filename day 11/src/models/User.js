
const db = require('../config/db');

class User {
    static async create(userData) {
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, gender, interested_in, dob, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userData.username, userData.email, userData.password, userData.gender, userData.interested_in, userData.dob, userData.location]
        );
        return { id: result.insertId, ...userData };
    }

    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, userData) {
        const fields = [];
        const values = [];
        for (const key in userData) {
            if (userData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(userData[key]);
            }
        }
        if (fields.length === 0) return null;

        values.push(id);
        const [result] = await db.execute(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    static async findPotentialMatches(userId, gender, interestedIn) {
        let query = `
            SELECT id, username, bio, profile_picture_url, gender, location, dob
            FROM users
            WHERE id != ?
            AND id NOT IN (SELECT liked_id FROM likes WHERE liker_id = ?)
            AND id NOT IN (SELECT user1_id FROM matches WHERE user2_id = ?)
            AND id NOT IN (SELECT user2_id FROM matches WHERE user1_id = ?)
        `;
        const params = [userId, userId, userId, userId];

        if (interestedIn === 'Male') {
            query += ` AND gender = 'Male'`;
        } else if (interestedIn === 'Female') {
            query += ` AND gender = 'Female'`;
        } else if (interestedIn === 'Non-binary') {
            query += ` AND gender = 'Non-binary'`;
        }
        // If interestedIn is 'Anyone', no gender filter needed

        // Optional: Filter by mutual interest (e.g., if A is interested in B, B must be interested in A)
        // This makes the matching stricter
        query += ` AND (
            (gender = ? AND interested_in IN (?, 'Anyone')) OR
            (gender != ? AND interested_in = 'Anyone')
        )`;
        params.push(gender, interestedIn, gender);


        const [rows] = await db.execute(query, params);
        return rows;
    }
}

module.exports = User;