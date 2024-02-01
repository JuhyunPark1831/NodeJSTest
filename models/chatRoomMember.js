const Sequelize = require('sequelize');

class ChatRoomMember extends Sequelize.Model {
  static initiate(sequelize) {
    ChatRoomMember.init({
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
          },
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
    });
  }
  static associate(db) {
    db.ChatRoomMember.belongsTo(db.User, { foreignKey: 'userId', as: 'user'});
    db.ChatRoomMember.belongsTo(db.Room, { foreignKey: 'roomId', as: 'room'});
  }
};

module.exports = ChatRoomMember;