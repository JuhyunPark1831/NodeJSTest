const User = require('../models/user');
const Friendship = require('../models/friendship');

exports.follow = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) { // req.user.id가 followerId, req.params.id가 followingId
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

exports.sendFriendRequest = async (req, res, next) => {
  try {
    if (!req.body.requestedId || !req.body.requestingId) {
      return res.status(404).send('User not found');
    }

    const friendship = await Friendship.create({
      status: 'pending',
      userAId: req.body.requestingId,
      userBId: req.body.requestedId,
    });

    return res.status(200).json({ message: 'Friend request sent successfully', friendship });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.makeFriendship = async (req, res, next) => {
  try {
    if (!req.body.requestedId || !req.body.requestingId) {
      return res.status(404).send('User not found');
    }

    const updatedFriendship = await Friendship.update(
      {status: 'accepted'},
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

    return res.status(200).json({ message: 'Friend accepted successfully', updatedFriendshipData });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteFriendship = async (req, res, next) => {
  try {
    if (!req.body.requestedId || !req.body.requestingId) {
      return res.status(404).send('User not found');
    }

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

    return res.status(200).json({ message: 'Friend accepted successfully'});
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteFriend = async (req, res, next) => {
  try {
    if (!req.body.requestedId || !req.body.requestingId) {
      return res.status(404).send('User not found');
    }

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

    return res.status(200).json({ message: 'Friend accepted successfully'});
  } catch (error) {
    console.error(error);
    next(error);
  }
};