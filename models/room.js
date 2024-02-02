const Sequelize = require('sequelize');

class Room extends Sequelize.Model {
  static initiate(sequelize) {
    Room.init({
      title: {
        type: Sequelize.STRING(40),
        allowNull: true,
        unique: true,
      },
      max: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      owner: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(40),
        allowNull: false,
        defaultValue: 'local',
      },
      roomType: {
        type: Sequelize.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public',
      },
      createdAt: {
        type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          allowNull: false,
      },
    }, {
        sequelize,
        modelName: 'Room',
        tableName: 'rooms', // 테이블 이름 설정
        timestamps: false, 
    });
  }
  static associate(db) {
    db.Room.hasMany(db.Chat, { foreignKey: 'roomId', as: 'chats' });
    db.User.hasMany(db.ChatRoomMember, { foreignKey: 'roomId', as: 'roomChatRoomMembers'});
  }
};

module.exports = Room;