const User = require('../models/User');
const Like = require('../models/Like');
const Match = require('../models/Match');

exports.getPotentialMatches = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'Current user not found' });
        }

        const potentialMatches = await User.findPotentialMatches(
            currentUser.id,
            currentUser.gender,
            currentUser.interested_in
        );
        res.json(potentialMatches);
    } catch (err) {
        next(err);
    }
};

exports.likeProfile = async (req, res, next) => {
    const { likedUserId } = req.body;
    const likerId = req.user.id;

    if (!likedUserId) {
        return res.status(400).json({ msg: 'Liked user ID is required' });
    }

    if (parseInt(likedUserId) === likerId) {
        return res.status(400).json({ msg: 'Cannot like yourself' });
    }

    try {
        // Record the like
        await Like.create(likerId, likedUserId, 'like');

        // Check if the liked user has also liked the current user
        const likedUserLikedBack = await Like.hasLiked(likedUserId, likerId);

        if (likedUserLikedBack) {
            // It's a match!
            await Match.create(likerId, likedUserId);
            return res.json({ msg: 'It\'s a match!', matched: true });
        } else {
            return res.json({ msg: 'Profile liked', matched: false });
        }
    } catch (err) {
        next(err);
    }
};

exports.dislikeProfile = async (req, res, next) => {
    const { dislikedUserId } = req.body;
    const dislikerId = req.user.id;

    if (!dislikedUserId) {
        return res.status(400).json({ msg: 'Disliked user ID is required' });
    }

    if (parseInt(dislikedUserId) === dislikerId) {
        return res.status(400).json({ msg: 'Cannot dislike yourself' });
    }

    try {
        await Like.create(dislikerId, dislikedUserId, 'dislike');
        res.json({ msg: 'Profile disliked' });
    } catch (err) {
        next(err);
    }
};

exports.getMatches = async (req, res, next) => {
    try {
        const matches = await Match.findMatchesForUser(req.user.id);
        res.json(matches);
    } catch (err) {
        next(err);
    }
};