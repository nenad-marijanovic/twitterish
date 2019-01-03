'use strict';
module.exports = (sequelize, DataTypes) => {
  var UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    /* user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    }, */
    session_id: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    underscored: true,
    freezeTableName: true,
    tableName: 'user_session',
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });
  UserSession.associate = function (models) {
    models.UserSession.belongsTo(models.User, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    });
    models.UserSession.hasMany(models.Session, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    });
  };

  return UserSession;
};
