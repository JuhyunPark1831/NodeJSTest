const express = require('express');

const { isLoggedIn } = require('../middlewares');
const { follow, sendFriendRequest, makeFriendship, deleteFriendship, deleteFriend } = require('../controllers/user');

const router = express.Router();

// POST /user/:id/follow
router.post('/:id/follow', isLoggedIn, follow);

router.post('/friendship', isLoggedIn, sendFriendRequest);

router.post('/friendship/accept', isLoggedIn, makeFriendship);

router.post('/friendship/reject', isLoggedIn, deleteFriendship);

router.post('/friendship/delete', isLoggedIn, deleteFriend);

module.exports = router;