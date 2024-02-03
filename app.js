// express 및 기본 미들웨어 및 설정 가져오기
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const SocketIO = require('socket.io');

// .env 파일에서 환경 변수 로드
dotenv.config();

// 라우터 및 데이터베이스 모델 가져오기
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const roomRouter = require('./routes/room');
const { sequelize } = require('./models');

// 패스포트 및 웹 소켓 설정 가져오기
const passportConfig = require('./passport');
const webSocket = require('./socket');

// Express 앱 생성
const app = express();

// 패스포트 설정 함수 호출
passportConfig();

// 포트 및 뷰 엔진 설정
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'html');

// Nunjucks 설정
nunjucks.configure('views', {
  express: app,
  watch: true,
});

// 데이터베이스 연결
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

// 기본 미들웨어 설정
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// 소켓 IO 설정 및 서버 시작
const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
const io = SocketIO(server, { path: '/socket.io' });
app.set('io', io);

// 라우터 설정
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/chatroom', roomRouter);

// 404 처리 미들웨어
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// 웹 소켓 설정
webSocket(server, app, sessionMiddleware);