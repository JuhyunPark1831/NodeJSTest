const Sequelize = require('sequelize');


// 채팅방 모델
class Room extends Sequelize.Model {
  static initiate(sequelize) {
    // 채팅방 모델 초기화
    Room.init(
      {
        // 방 타입 (DM: private, 공개 채팅방: public)
        roomType: {
          type: Sequelize.ENUM('public', 'private'),
          allowNull: false,
          defaultValue: 'public',
        },
        // 방이 생성된 날짜 및 시간
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Room',
        tableName: 'rooms', // 테이블 이름 설정
        timestamps: false, 
      }
    );
  }
  
  static associate(db) {
    // 채팅 모델과의 관계 설정
    db.Room.hasMany(db.Chat, { foreignKey: 'roomId', as: 'chats' });
    // 유저 모델과의 관계 설정
    db.User.hasMany(db.ChatRoomMember, { foreignKey: 'roomId', as: 'roomChatRoomMembers' });
  }
}

module.exports = Room;