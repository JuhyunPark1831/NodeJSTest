const SocketIO = require('socket.io');

// 소켓 IO 설정 함수
module.exports = (server, app, sessionMiddleware) => {
  // Socket.IO 서버 생성 및 네임스페이스 설정
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  const room = io.of('/room');
  const chat = io.of('/chat');

  // 미들웨어 래핑 함수
  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
  chat.use(wrap(sessionMiddleware));

  // room 네임스페이스에 대한 연결 이벤트
  room.on('connection', (socket) => {
    console.log('room 네임스페이스에 접속');

    // 연결 해제 이벤트
    socket.on('disconnect', () => {
      console.log('room 네임스페이스 접속 해제');
    });
  });

  // chat 네임스페이스에 대한 연결 이벤트
  chat.on('connection', (socket) => {
    console.log('chat 네임스페이스에 접속');
    let userNickName = '';

    // 입장 이벤트
    socket.on('join', (roomId, nick) => {
      socket.join(roomId);
      userNickName = nick;
      socket.to(roomId).emit('join', {
        user: 'system',
        chat: `${userNickName}님이 입장하셨습니다.`,
      });
    });

    // 연결 해제 이벤트
    socket.on('disconnect', async () => {
      console.log('chat 네임스페이스 접속 해제');
      const { referer } = socket.request.headers; // 브라우저 주소가 들어있음
      const roomId = new URL(referer).pathname.split('/').at(-1);
      const currentRoom = chat.adapter.rooms.get(roomId);
      socket.to(roomId).emit('exit', {
        user: 'system',
        chat: `${userNickName}님이 퇴장하셨습니다.`,
      });
    });
  });
};