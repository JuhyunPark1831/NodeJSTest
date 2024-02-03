const Sequelize = require('sequelize');

// 채팅 내용 모델
class Chat extends Sequelize.Model {
  static initiate(sequelize) {
    // 채팅 내용 모델 초기화
    Chat.init(
      {
        // 채팅이 발생한 방의 Id
        roomId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'rooms',
            key: 'id',
          },
        },
        // 채팅을 발생시킨 사용자
        user: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        // 채팅 내용
        chat: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        // 채팅이 발생된 날짜 및 시간
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Chat',
        tableName: 'chats',
        timestamps: false,
      }
    );
  }

  static associate(db) {
    // Room 모델과의 관계 설정
    db.Chat.belongsTo(db.Room, { foreignKey: 'roomId', as: 'room' });
  }
}

module.exports = Chat;