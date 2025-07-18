const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const matchController = require('../controllers/matchController');

router.get('/potential', authMiddleware, matchController.getPotentialMatches);
router.post('/like', authMiddleware, matchController.likeProfile);
router.post('/dislike', authMiddleware, matchController.dislikeProfile);
router.get('/', authMiddleware, matchController.getMatches);

module.exports = router;