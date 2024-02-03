const Sequelize = require('sequelize');

//친구 관계 모델
class Friendship extends Sequelize.Model {
  static initiate(sequelize) {
    // 친구 관계 모델 초기화
    Friendship.init(
      {
        //친구 관계 상태 (pending: 친구 신청을 보낸 상태, accepted: 친구 상태, 이 모델에 데이터가 존재하지 않으면 친구 신청도 없고 친구도 아닌 상태)
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
    // User 모델과의 관계 설정 (친구 요청 1:1 관계)
    db.Friendship.belongsTo(db.User, { foreignKey: 'userAId', as: 'Requesting', onDelete: 'CASCADE' });
    db.Friendship.belongsTo(db.User, { foreignKey: 'userBId', as: 'Requested', onDelete: 'CASCADE' });
  }
}

module.exports = Friendship;