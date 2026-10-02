const db = require('../config/db');

const ensurePartnerForUser = async (userId, verified, executor = db) => {
  const [users] = await executor.query(
    'SELECT id, full_name, email, phone FROM bekal_db_users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) return null;

  const user = users[0];
  const flag = verified ? 1 : 0;

  const [partners] = await executor.query(
    'SELECT id FROM bekal_db_partners WHERE user_id = ? ORDER BY id ASC',
    [userId]
  );

  if (partners.length > 0) {
    await executor.query(
      'UPDATE bekal_db_partners SET is_verified_partner = ? WHERE user_id = ?',
      [flag, userId]
    );
    return partners[0].id;
  }

  const [result] = await executor.query(
    `INSERT INTO bekal_db_partners
       (user_id, organization_name, partner_type, contact_email, contact_phone, is_verified_partner)
     VALUES (?, ?, 'Lainnya', ?, ?, ?)`,
    [userId, user.full_name, user.email, user.phone || null, flag]
  );

  return result.insertId;
};

module.exports = { ensurePartnerForUser };