const Sequelize = require('sequelize');

class Friendship extends Sequelize.Model {
    static initiate(sequelize) {
      Friendship.init(
        {
          status: {
            type: Sequelize.ENUM('pending', 'accepted'),
            defaultValue: 'pending',
          },
        },
        {
          sequelize,
          timestamps: true,
          underscored: false,
          modelName: 'Friendship',
          tableName: 'friendships',
          charset: 'utf8',
          collate: 'utf8_general_ci',
        }
      );
    }
  
    static associate(db) {
      // 친구 모델과 사용자 모델 간의 관계 설정
      db.Friendship.belongsTo(db.User, { foreignKey: 'userAId', as: 'Requesting', onDelete: 'CASCADE' });
      db.Friendship.belongsTo(db.User, { foreignKey: 'userBId', as: 'Requested', onDelete: 'CASCADE' });
    }
  }
  
  module.exports = Friendship;