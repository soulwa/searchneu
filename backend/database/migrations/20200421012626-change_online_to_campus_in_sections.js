module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Sections', 'campus', Sequelize.STRING),
      queryInterface.removeColumn('Sections', 'online'),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Sections', 'campus'),
      queryInterface.addColumn('Sections', 'online', Sequelize.BOOLEAN),
    ]);
  }
};
