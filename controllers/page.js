const { User, Post, Hashtag, Friendship } = require('../models');
const { Op } = require('sequelize');

exports.renderProfile = (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
};

exports.renderUsers = async (req, res, next) => {
  try {
    currentUserId = req.user.id;
    const allUsers = await User.findAll({ attributes: ['id', 'nick'] });
    const pendingFriendRequests = await Friendship.findAll({
      where: {
        [Op.or]: [
          {userBId: currentUserId },
          {userAId: currentUserId },
        ],
      },
      attributes: ['userAId', 'userBId'],
    });
    // 친구 신청자의 ID 목록 가져오기
    const isFriendArray = allUsers.map((user) => {
      const friendRequest = pendingFriendRequests.find((request) => {
          return (
              (request.userBId === currentUserId && request.userAId === user.id) ||
              (request.userAId === currentUserId && request.userBId === user.id)
          );
      });
      return {
          id: user.id,
          nick: user.nick,
          isFriend: !!friendRequest, // Check if there's a friend request
      };
  });

    res.render('users', {
      title: '전체 유저 목록 - NodeBird',
      users: isFriendArray,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderRooms = (req, res) => {
  res.render('rooms', { title: '전체 채팅방 목록 - NodeBird'});
};

exports.renderJoin = (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
};

exports.renderMain = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
}

exports.renderHashtag = async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.renderFriendsRequest = async (req, res, next) => {
  try {
    currentUserId = req.user.id;
    const pendingFriendRequests = await Friendship.findAll({
      where: {
        status: 'pending',
        userBId: currentUserId,
      },
      attributes: ['userAId'],
    });
    // 친구 신청자의 ID 목록 가져오기
    const requestingUserIds = pendingFriendRequests.map((friendship) => friendship.userAId);

    const requestingUserDetails = await User.findAll({
      where: {
        id: requestingUserIds,
      },
      attributes: ['id', 'nick'],
    });

    const friendshipList = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          {userBId: currentUserId },
          {userAId: currentUserId },
        ],
      },
      attributes: ['userAId', 'userBId'],
    });
    const friendArray = friendshipList.map((friendship) => {
      if (friendship.userBId === currentUserId) {
        return friendship.userAId;
      } else {
        return friendship.userBId;
      }
    });
    const friendDetails = await User.findAll({
      where: {
        id: friendArray,
      },
      attributes: ['id', 'nick'],
    });

    

    res.render('friends', {
      title: '친구 목록 - NodeBird',
      friendsRequest: requestingUserDetails,
      friends: friendDetails,
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};