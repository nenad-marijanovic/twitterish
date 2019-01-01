'use strict';

module.exports = (sequelize, DataTypes) => {
  var Session = sequelize.define('Session', {
    session_id: {
      type: DataTypes.STRING,
      primaryKey: true
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
    tableName: 'sessions',
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });

  return Session;
};
