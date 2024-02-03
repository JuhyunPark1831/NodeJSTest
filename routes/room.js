const express = require('express');
const { isLoggedIn } = require('../middlewares');

const {
  renderRoom, createRoom, enterRoom, sendChat, enterPrivateRoom,
} = require('../controllers/room');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user?.Followers?.length || 0;
  res.locals.followingCount = req.user?.Followings?.length || 0;
  res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || [];
  next();
});

// GET /chatroom
router.get('/', isLoggedIn, renderRoom);

// POST /chatroom/room
router.post('/room', isLoggedIn, createRoom);

// GET /chatroom/room/:id
router.get('/room/:id', isLoggedIn, enterRoom);

// POST /chatroom/room/id/chat
router.post('/room/:id/chat', isLoggedIn, sendChat);

// POST /chatroom/room/private/enter
router.post('/room/private/enter', isLoggedIn, enterPrivateRoom);


module.exports = router;