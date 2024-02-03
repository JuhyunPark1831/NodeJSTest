const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const db = {};
const sequelize = new Sequelize(
  config.database, process.env.USER_NAME, process.env.PASSWORD, config,
);

db.sequelize = sequelize;

const basename = path.basename(__filename);
fs
  .readdirSync(__dirname)
  .filter(file => {
    // 파일명이 '.'으로 시작하지 않고, 현재 파일(index.js)이 아니며, 확장자가 '.js'인 파일 필터링
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    // 파일 불러오기 및 모델 초기화
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
    model.initiate(sequelize);
  });

Object.keys(db).forEach(modelName => {
  // associate 함수 호출
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;