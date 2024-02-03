const { User, Friendship } = require('../models');
const { Op } = require('sequelize');

exports.renderMain = async (req, res, next) => {
  try {
    // 메인 페이지 렌더링
    res.render('main');
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderFollow = (req, res) => {
  // 팔로우 페이지 렌더링
  res.render('follow', { title: '내 정보' });
};

exports.renderRooms = (req, res) => {
  // 채팅방 목록 페이지 렌더링
  res.render('rooms', { title: '채팅방 목록' });
};

exports.renderJoin = (req, res) => {
  // 회원가입 페이지 렌더링
  res.render('join', { title: '회원가입' });
};

exports.renderUsers = async (req, res, next) => {
  try {
    // 전체 유저 목록 페이지 렌더링

    // 현재 사용자 ID
    const currentUserId = req.user.id;

    // 전체 유저 목록 조회
    const allUsers = await User.findAll({ attributes: ['id', 'nick'] });

    // 친구 관계 확인을 위한 친구 요청 목록 조회
    const pendingFriendRequests = await Friendship.findAll({
      where: {
        [Op.or]: [
          { userBId: currentUserId },
          { userAId: currentUserId },
        ],
      },
      attributes: ['userAId', 'userBId'],
    });

    // 유저가 친구인지 여부를 판단하여 isFriendArray 배열 생성
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
        isFriend: !!friendRequest,
      };
    });

    res.render('users', {
      title: '전체 유저 목록',
      users: isFriendArray,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderFriendsRequest = async (req, res, next) => {
  try {
    // 친구 요청 목록 페이지 렌더링

    // 현재 사용자 ID
    const currentUserId = req.user.id;

    // 친구 요청 중인 목록 조회
    const pendingFriendRequests = await Friendship.findAll({
      where: {
        status: 'pending',
        userBId: currentUserId,
      },
      attributes: ['userAId'],
    });

    // 친구 요청을 보낸 사용자들의 ID 목록
    const requestingUserIds = pendingFriendRequests.map((friendship) => friendship.userAId);

    // 친구 요청을 보낸 사용자들의 상세 정보 조회
    const requestingUserDetails = await User.findAll({
      where: {
        id: requestingUserIds,
      },
      attributes: ['id', 'nick'],
    });

    // 수락된 친구 목록 조회
    const friendshipList = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userBId: currentUserId },
          { userAId: currentUserId },
        ],
      },
      attributes: ['userAId', 'userBId'],
    });

    // 수락된 친구들의 ID 목록
    const friendArray = friendshipList.map((friendship) => {
      if (friendship.userBId === currentUserId) {
        return friendship.userAId;
      } else {
        return friendship.userBId;
      }
    });

    // 수락된 친구들의 상세 정보 조회
    const friendDetails = await User.findAll({
      where: {
        id: friendArray,
      },
      attributes: ['id', 'nick'],
    });

    res.render('friendsRequest', {
      title: '친구 목록',
      friendsRequest: requestingUserDetails,
      friends: friendDetails,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};


exports.renderFriends = async (req, res, next) => {
  try {
    // 친구 요청 목록 페이지 렌더링

    // 현재 사용자 ID
    const currentUserId = req.user.id;

    // 수락된 친구 목록 조회
    const friendshipList = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userBId: currentUserId },
          { userAId: currentUserId },
        ],
      },
      attributes: ['userAId', 'userBId'],
    });

    // 수락된 친구들의 ID 목록
    const friendArray = friendshipList.map((friendship) => {
      if (friendship.userBId === currentUserId) {
        return friendship.userAId;
      } else {
        return friendship.userBId;
      }
    });

    // 수락된 친구들의 상세 정보 조회
    const friendDetails = await User.findAll({
      where: {
        id: friendArray,
      },
      attributes: ['id', 'nick'],
    });

    res.render('friends', {
      title: '친구 목록',
      friends: friendDetails,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};