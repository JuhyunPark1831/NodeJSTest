const Sequelize = require('sequelize');

// 사용자 모델
class User extends Sequelize.Model {
  static initiate(sequelize) {
    // 사용자 모델 초기화
    User.init(
      {
        // 이메일 주소
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        // 사용자 별칭
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        // 비밀번호
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }

  static associate(db) {
    // 채팅방 멤버 모델과의 관계 설정
    db.User.hasMany(db.ChatRoomMember, { foreignKey: 'userId', as: 'userChatRoomMembers' });
    
    // 다른 멤버 모델과의 관계 설정 (친구 관계)
    db.User.belongsToMany(db.User, {
      foreignKey: 'userAId',
      as: 'UserAFriends',
      through: 'Friendship',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'userBId',
      as: 'UserBFriends',
      through: 'Friendship',
    });

    // 다른 멤버 모델과의 관계 설정 (팔로우 관계)
    db.User.belongsToMany(db.User, {
      foreignKey: 'followingId',
      as: 'Followers',
      through: 'Follow',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followings',
      through: 'Follow',
    });
  }
}

module.exports = User;