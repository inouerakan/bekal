const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedAdmin() {
  try {
    const connection = await db.getConnection();
    
    const [existing] = await connection.query(
      'SELECT id FROM bekal_db_users WHERE email = ?',
      ['admin@bekalopati.com']
    );

    if (existing.length > 0) {
      console.log('Admin account already exists.');
      connection.release();
      return;
    }

    const passwordHash = await bcrypt.hash('admin123', 10);

    await connection.query(
      `INSERT INTO bekal_db_users 
       (full_name, email, password_hash, role, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      ['Super Admin', 'admin@bekalopati.com', passwordHash, 'admin', 1]
    );

    console.log('Admin account seeded successfully.');
    connection.release();
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  } finally {
    process.exit(0);
  }
}

seedAdmin();