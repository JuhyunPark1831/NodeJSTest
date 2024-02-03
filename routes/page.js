const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const {
  renderMain, renderJoin, renderUsers, renderRooms, renderFriendsRequest, renderFollow, renderFriends
} = require('../controllers/page');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user?.Followers?.length || 0;
  res.locals.followingCount = req.user?.Followings?.length || 0;
  res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || [];
  next();
});

// GET /
router.get('/', renderMain);

// GET /rooms
router.get('/rooms', isLoggedIn, renderRooms);

// GET /users
router.get('/users', isLoggedIn, renderUsers);

// GET /friends
router.get('/friends', isLoggedIn, renderFriends);

// GET /friends/request
router.get('/friends/request', isLoggedIn, renderFriendsRequest);

// GET /follow
router.get('/follow', isLoggedIn, renderFollow);

// GET /join
router.get('/join', isNotLoggedIn, renderJoin);


module.exports = router;