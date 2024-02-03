const Sequelize = require('sequelize');

//채팅방 멤버 모델
class ChatRoomMember extends Sequelize.Model {
  static initiate(sequelize) {
    // 채팅방 멤버 모델 초기화
    ChatRoomMember.init(
      {
        // 사용자 Id
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        // 사용자가 포함되는 방 Id
        roomId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'rooms',
            key: 'id',
          },
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'ChatRoomMember',
        tableName: 'chat_room_members',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }

  static associate(db) {
    // User 모델과의 관계 설정
    db.ChatRoomMember.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
    // Room 모델과의 관계 설정
    db.ChatRoomMember.belongsTo(db.Room, { foreignKey: 'roomId', as: 'room' });
  }
}

module.exports = ChatRoomMember;