const { Room, Chat, ChatRoomMember } = require('../models');


exports.renderMain = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      where: {
        roomType: 'public',
      },
    });
    userCounts = {};
    const io = req.app.get('io');
    rooms.forEach((room) => {
      const roomId = room.id.toString(); // 방의 ID를 문자열로 변환
      const userCount = io.of('/chat').adapter.rooms.get(roomId)?.size || 0;
      userCounts[roomId] = userCount;
    });
    res.render('rooms', { rooms, userCounts, title: 'GIF 채팅방' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderRoom = (req, res) => {
  res.render('room', { title: 'GIF 채팅방 생성' });
};

exports.createRoom = async (req, res, next) => {
  try {
    const newRoom = await Room.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.body.User,
      password: req.body.password,
      roomType: 'public',
    });
    const io = req.app.get('io');
    io.of('/room').emit('newRoom', newRoom);
    if (req.body.password) { // 비밀번호가 있는 방이면
      res.redirect(`/chatroom/room/${newRoom.id}?password=${req.body.password}`);
    } else {
      res.redirect(`/chatroom/room/${newRoom.id}`);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.enterRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ where: { id: req.params.id } });
    if (!room) {
      return res.redirect('/?error=존재하지 않는 방입니다.');
    }
    if (room.password && room.password !== req.query.password) {
      return res.redirect('/?error=비밀번호가 틀렸습니다.');
    }
    const io = req.app.get('io');
    const { rooms } = io.of('/chat').adapter;
    console.log(rooms, rooms.get(req.params.id), rooms.get(req.params.id));
    if (room.max <= rooms.get(req.params.id)?.size) {
      return res.redirect('/?error=허용 인원이 초과하였습니다.');
    }
    const chats = await Chat.findAll({
      where: { roomId: room.id }, // room._id가 아닌 room.id를 사용
      order: [['createdAt', 'ASC']], // 'ASC' 또는 'DESC'로 정렬 순서 설정
    });
    return res.render('chat', {
      room,
      title: room.title,
      chats,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.enterPrivateRoom = async (req, res, next) => {
  try {
    const user1room = await ChatRoomMember.findAll({ 
      where: { userId: req.body.requestedId },
      attributes: ['roomId'],
     });
    const user2room = await ChatRoomMember.findAll({ 
      where: { userid: req.body.requestingId },
      attributes: ['roomId'],
     });
     const user1roomIds = user1room.map(({ roomId }) => roomId);
     const user2roomIds = user2room.map(({ roomId }) => roomId);

     const roomId = user1roomIds.filter(roomId => user2roomIds.includes(roomId));
     
    const io = req.app.get('io');
    if (!roomId.length) {
      const newRoom = await Room.create({
        title: null,
        max: 2,
        owner: null,
        password: "",
        roomType: 'private'
      });
      io.of('/room').emit('newRoom', newRoom);
      await ChatRoomMember.create({
        userId: req.body.requestedId,
        roomId: newRoom.id,
      })
      await ChatRoomMember.create({
        userId: req.body.requestingId,
        roomId: newRoom.id,
      })
      roomId[0] = newRoom.id;
    }
    else {
      const room = await Room.findOne({ where: { id: roomId } });
     const chats = await Chat.findAll({
      where: { roomId: room.id }, // room._id가 아닌 room.id를 사용
      order: [['createdAt', 'ASC']], // 'ASC' 또는 'DESC'로 정렬 순서 설정
    });
    }
    console.log(roomId);
    console.log(roomId);
    console.log(roomId);
    console.log(roomId);
    console.log(roomId);
    res.send(roomId);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.sendChat = async (req, res, next) => {
  try {
    console.log(req.user.id);
    console.log(req.user.id);
    console.log(req.user.id);
    console.log(req.user.id);
    const chat = await Chat.create({
      roomId: req.params.id,
      user: req.user.nick,
      chat: req.body.chat,
    });
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
};
