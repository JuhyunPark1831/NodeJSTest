const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const {
  renderMain, renderJoin, renderUsers, renderRooms, renderFriendsRequest, renderFollow
} = require('../controllers/page');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user?.Followers?.length || 0;
  res.locals.followingCount = req.user?.Followings?.length || 0;
  res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || [];
  next();
});

router.get('/', renderMain);

router.get('/follow', isLoggedIn, renderFollow);

router.get('/friends', isLoggedIn, renderFriendsRequest);

router.get('/join', isNotLoggedIn, renderJoin);

router.get('/users', isLoggedIn, renderUsers);

router.get('/rooms', isLoggedIn, renderRooms);


module.exports = router;