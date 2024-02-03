const express = require('express');

const { isLoggedIn } = require('../middlewares');
const { follow, sendFriendRequest, makeFriendship, deleteFriendship, deleteFriend } = require('../controllers/user');

const router = express.Router();

// POST /user/:id/follow
router.post('/:id/follow', isLoggedIn, follow);

// POST /user/friendship
router.post('/friendship', isLoggedIn, sendFriendRequest);

// POST /user/friendship/accept
router.post('/friendship/accept', isLoggedIn, makeFriendship);

// POST /user/friendship/reject
router.post('/friendship/reject', isLoggedIn, deleteFriendship);

// POST /user/friendship/delete
router.post('/friendship/delete', isLoggedIn, deleteFriend);

module.exports = router;