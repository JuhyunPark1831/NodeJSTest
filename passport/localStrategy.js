const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
  // 로컬 전략 설정
  passport.use(new LocalStrategy({
    // 사용자의 로그인 정보 필드 설정
    usernameField: 'email',
    passwordField: 'password',
    // HTTP 요청 객체를 콜백 함수로 전달할지 여부
    passReqToCallback: false,
  }, async (email, password, done) => {
    try {
      // 입력된 이메일로 사용자 조회
      const exUser = await User.findOne({ where: { email } });
      if (exUser) {
        // 비밀번호 비교
        const result = await bcrypt.compare(password, exUser.password);
        if (result) {
          // 로그인 성공
          done(null, exUser);
        } else {
          // 비밀번호 불일치
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        // 가입되지 않은 회원
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};