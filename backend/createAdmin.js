
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, connectDB } = require('./config/db');

async function createAdmin() {
  await connectDB();

  const password = 'admin123';
  const hashed   = await bcrypt.hash(password, 10);

  // Delete old admin if exists (clean slate)
  await sequelize.query(`DELETE FROM users WHERE email = 'admin@smartpark.com'`);

  // Insert fresh admin with correct hash
  await sequelize.query(
    `INSERT INTO users (name, email, password, phone, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    {
      replacements: [
        'Admin',
        'admin@smartpark.com',
        hashed,
        '9999999999',
        'admin',
      ],
    }
  );

  // Also create a test user
  const userHash = await bcrypt.hash('user123', 10);
  await sequelize.query(`DELETE FROM users WHERE email = 'test@smartpark.com'`);
  await sequelize.query(
    `INSERT INTO users (name, email, password, phone, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    {
      replacements: [
        'Test User',
        'test@smartpark.com',
        userHash,
        '9876543210',
        'user',
      ],
    }
  );

  // Verify
  const [rows] = await sequelize.query(
    `SELECT id, name, email, role FROM users WHERE email IN ('admin@smartpark.com', 'test@smartpark.com')`
  );

  console.log('\n✓ Users created successfully:\n');
  console.table(rows);
  console.log('\nLogin credentials:');
  console.log('  Admin → admin@smartpark.com / admin123');
  console.log('  User  → test@smartpark.com  / user123\n');

  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
