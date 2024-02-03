const User = require('../models/user');
const Friendship = require('../models/friendship');

//사용자 팔로우
exports.follow = async (req, res, next) => {
  try {
    // 현재 로그인한 유저 조회
    const user = await User.findOne({ where: { id: req.user.id } });

    // 유저가 존재하는 경우 팔로우 추가
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//친구 요청 전송
exports.sendFriendRequest = async (req, res, next) => {
  try {
    // 요청된 유저 ID가 없는 경우 에러 응답
    if (!req.body.requestedId || !req.body.requestingId) {
      return res.status(404).send('User not found');
    }

    // Friendship 모델을 통해 친구 요청 생성
    const friendship = await Friendship.create({
      status: 'pending',
      userAId: req.body.requestingId,
      userBId: req.body.requestedId,
    });

    // 응답
    return res.status(200).json({ message: 'Friend request sent successfully', friendship });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//친구 요청 수락
exports.makeFriendship = async (req, res, next) => {
  try {
    // 요청된 유저 ID가 없는 경우 에러 응답
    if (!req.body.requestedId || !req.body.requestingId) {
      return res.status(404).send('User not found');
    }

    // Friendship 모델을 통해 친구 요청 업데이트 (수락)
    const updatedFriendship = await Friendship.update(
      { status: 'accepted' },
      {
        where: {
          userAId: req.body.requestingId,
          userBId: req.body.requestedId,
          status: 'pending',
        },
        returning: true,
      }
    );
    const updatedFriendshipData = updatedFriendship[1][0];

    // 응답
    return res.status(200).json({ message: 'Friend accepted successfully', updatedFriendshipData });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//친구 요청 거절/삭제
exports.deleteFriendship = async (req, res, next) => {
  try {
    // 요청된 유저 ID가 없는 경우 에러 응답
    if (!req.body.requestedId || !req.body.requestingId) {
      return res.status(404).send('User not found');
    }

    // Friendship 모델을 통해 친구 요청 삭제
    const updatedFriendship = await Friendship.destroy(
      {
        where: {
          userAId: req.body.requestingId,
          userBId: req.body.requestedId,
          status: 'pending',
        },
        returning: true,
      }
    );

    // 응답
    return res.status(200).json({ message: 'Friend request deleted successfully' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//친구 삭제
exports.deleteFriend = async (req, res, next) => {
  try {
    // 요청된 유저 ID가 없는 경우 에러 응답
    if (!req.body.requestedId || !req.body.requestingId) {
      return res.status(404).send('User not found');
    }

    // Friendship 모델을 통해 친구 삭제 (양쪽에서 삭제해야 함)
    const deleteFriend1 = await Friendship.destroy(
      {
        where: {
          status: 'accepted',
          userAId: req.body.requestingId,
          userBId: req.body.requestedId,
        },
        returning: true,
      }
    );
    const deleteFriend2 = await Friendship.destroy(
      {
        where: {
          status: 'accepted',
          userBId: req.body.requestingId,
          userAId: req.body.requestedId,
        },
        returning: true,
      }
    );

    // 응답
    return res.status(200).json({ message: 'Friend deleted successfully' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};