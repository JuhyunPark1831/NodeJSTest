const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  renderMain, renderRoom, createRoom, enterRoom, sendChat, enterPrivateRoom,
} = require('../controllers/room');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user?.Followers?.length || 0;
  res.locals.followingCount = req.user?.Followings?.length || 0;
  res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || [];
  next();
});

router.get('/', renderMain);

router.get('/room', renderRoom);

router.post('/room', createRoom);

router.get('/room/:id', enterRoom);

router.post('/room/:id/chat', sendChat);

router.post('/room/private/enter', enterPrivateRoom);


module.exports = router;