const { Room, Chat, ChatRoomMember } = require('../models');


//채팅방 목록 페이지 렌더링
exports.renderRoom = async (req, res, next) => {
  try {
    // public 타입의 채팅방 목록을 가져옴
    const rooms = await Room.findAll({
      where: {
        roomType: 'public',
      },
    });

    // 채팅방별 현재 유저 수를 계산하여 객체에 저장
    const userCounts = {};
    const io = req.app.get('io');
    rooms.forEach((room) => {
      const roomId = room.id.toString();
      const userCount = io.of('/chat').adapter.rooms.get(roomId)?.size || 0;
      userCounts[roomId] = userCount;
    });

    // 렌더링
    res.render('rooms', { rooms, userCounts, title: 'GIF 채팅방' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//새로운 채팅방 생성
exports.createRoom = async (req, res, next) => {
  try {
    // 새로운 채팅방 생성
    const newRoom = await Room.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.body.User,
      password: req.body.password,
      roomType: 'public',
    });

    // 소켓 통신을 통해 새로운 채팅방 정보를 클라이언트에게 전달
    const io = req.app.get('io');
    io.of('/room').emit('newRoom', newRoom);

    // 생성된 채팅방으로 리다이렉션
    if (req.body.password) {
      res.redirect(`/chatroom/room/${newRoom.id}?password=${req.body.password}`);
    } else {
      res.redirect(`/chatroom/room/${newRoom.id}`);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//채팅방 입장
exports.enterRoom = async (req, res, next) => {
  try {
    // 채팅방 정보 조회
    const room = await Room.findOne({ where: { id: req.params.id } });
    if (!room) {
      return res.redirect('/?error=존재하지 않는 방입니다.');
    }

    // 비밀번호가 설정되어 있고, 입력된 비밀번호가 일치하지 않을 경우 리다이렉션
    if (room.password && room.password !== req.query.password) {
      return res.redirect('/?error=비밀번호가 틀렸습니다.');
    }

    const io = req.app.get('io');
    const { rooms } = io.of('/chat').adapter;

    // 채팅방의 최대 인원을 초과했을 경우 리다이렉션
    if (room.max <= rooms.get(req.params.id)?.size) {
      return res.redirect('/?error=허용 인원이 초과하였습니다.');
    }

    // 채팅 목록 조회
    const chats = await Chat.findAll({
      where: { roomId: room.id },
      order: [['createdAt', 'ASC']],
    });

    // 렌더링
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

//개인 채팅방 입장
exports.enterPrivateRoom = async (req, res, next) => {
  try {
    // 개인 채팅방에 속한 사용자들의 채팅방 ID 조회
    const user1room = await ChatRoomMember.findAll({ 
      where: { userId: req.body.requestedId },
      attributes: ['roomId'],
    });
    const user2room = await ChatRoomMember.findAll({ 
      where: { userid: req.body.requestingId },
      attributes: ['roomId'],
    });

    // 배열로 변환
    const user1roomIds = user1room.map(({ roomId }) => roomId);
    const user2roomIds = user2room.map(({ roomId }) => roomId);

    // 두 사용자가 공통적으로 속한 채팅방 ID 필터링
    const roomId = user1roomIds.filter(roomId => user2roomIds.includes(roomId));
    
    const io = req.app.get('io');

    // 공통 채팅방이 없을 경우 새로운 개인 채팅방 생성
    if (!roomId.length) {
      const newRoom = await Room.create({
        title: null,
        max: 2,
        owner: null,
        password: "",
        roomType: 'private'
      });

      // 새로운 채팅방 정보를 클라이언트에게 전달
      io.of('/room').emit('newRoom', newRoom);

      // 두 사용자를 해당 채팅방에 추가
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
      // 공통 채팅방이 있을 경우 해당 채팅방 정보 조회
      const room = await Room.findOne({ where: { id: roomId } });

      // 채팅 목록 조회
      const chats = await Chat.findAll({
        where: { roomId: room.id },
        order: [['createdAt', 'ASC']],
      });
    }

    // 생성된 개인 채팅방의 ID를 클라이언트에게 응답
    res.send(roomId);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

//채팅 전송
exports.sendChat = async (req, res, next) => {
  try {
    // 채팅 생성
    const chat = await Chat.create({
      roomId: req.params.id,
      user: req.user.nick,
      chat: req.body.chat,
    });

    // 소켓 통신을 통해 해당 채팅방에 새로운 채팅을 전송
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);

    // 응답
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
};