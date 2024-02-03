const passport = require('passport');
const local = require('./localStrategy');
const User = require('../models/user');

module.exports = () => {
  // 사용자 정보를 세션에 저장하는 메서드
  passport.serializeUser((user, done) => {
    console.log('serialize');
    done(null, user.id);
  });

  // 세션에 저장된 사용자 정보를 조회하는 메서드
  passport.deserializeUser((id, done) => {
    console.log('deserialize');
    User.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => {
        done(null, user);
      })
      .catch(err => done(err));
  });

  // 로컬 로그인 전략 설정
  local();
};