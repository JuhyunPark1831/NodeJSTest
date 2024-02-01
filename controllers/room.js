const { User, Post, Hashtag, Room, Chat } = require('../models');


exports.renderMain = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({});
    res.render('rooms', { rooms, title: 'GIF 채팅방' });
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
    console.log("reqbody: ", req.body);
    console.log("reqbody: ", req.body);
    console.log("reqbody: ", req.body);
    console.log("reqbody: ", req.body);
    console.log("reqbody: ", req.body);
    const newRoom = await Room.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.body.User,
      password: req.body.password,
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

exports.removeRoom = async (req, res, next) => {
  try {
    await removeRoomService(req.params.id);
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
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
      user: req.user.id,
      chat: req.body.chat,
    });
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.sendGif = async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      gif: req.file.filename,
    });
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
};