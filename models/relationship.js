'use strict';
module.exports = (sequelize, DataTypes) => {
  var Relationship = sequelize.define('Relationship', {

    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    target: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    follower: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    }
  }, {
    underscored: true,
    freezeTableName: true,
    tableName: 'relationships'
  });
  Relationship.associate = function (models) {
    // associations can be defined here
  };
  return Relationship;
};
