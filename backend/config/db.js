const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:    process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool:    { max: 5, min: 0, acquire: 30000, idle: 10000 },

    dialectOptions: {
      // Windows MySQL strict mode fix
      dateStrings: true,
      typeCast:    true,
    },

    define: {
      // Sequelize will use createdAt / updatedAt automatically
      timestamps:  true,
      underscored: true,   // createdAt → created_at in DB
      freezeTableName: true,
    },
  }
);

const connectDB = async () => {
  try {
    // Disable strict mode for this session
    await sequelize.authenticate();
    await sequelize.query(`SET SESSION sql_mode = ''`);
    console.log('MySQL connected successfully');

    await sequelize.sync({ alter: true });
    console.log('All models synced');
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };