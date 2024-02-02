const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

// 사용자 등록을 위한 컨트롤러 함수
exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    // 데이터베이스에서 이메일이 이미 존재하는지 확인
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      // 이미 존재하는 경우, 오류 메시지와 함께 리다이렉트
      return res.redirect('/join?error=exist');
    }
    // 비밀번호를 해시하여 사용자 생성
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    // 등록 성공 시 홈페이지로 리다이렉트
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

// 사용자 로그인을 위한 컨트롤러 함수
exports.login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      // 인증 에러가 발생한 경우 에러 출력 및 넥스트 호출
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // 사용자가 없는 경우 에러 메시지와 함께 리다이렉트
      return res.redirect(`/?error=${info.message}`);
    }
    // 사용자 로그인 성공 시 세션에 사용자 정보 저장 및 홈페이지로 리다이렉트
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next);
};

// 사용자 로그아웃을 처리하는 컨트롤러 함수
exports.logout = (req, res) => {
  // 로그아웃 후 홈페이지로 리다이렉트
  req.logout(() => {
    res.redirect('/');
  });
};