const Sequelize = require('sequelize');

class Chat extends Sequelize.Model {
  static initiate(sequelize) {
    Chat.init({
        roomId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'rooms',
              key: 'id',
            },
          },
          user: {
            type: Sequelize.STRING(50),
            allowNull: false,
          },
          chat: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false,
          },
    }, {
        sequelize,
        modelName: 'Chat',
        tableName: 'chats', // 테이블 이름 설정
        timestamps: false, 
    });
  }
  static associate(db) {
    db.Chat.belongsTo(db.Room, { foreignKey: 'roomId', as: 'room' });
  }
};

module.exports = Chat;