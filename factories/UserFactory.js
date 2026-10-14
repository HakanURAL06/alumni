/**
 * User Factory
 * Generates realistic dummy/seed data for User (Alumni) records.
 * Supports single and bulk generation for unit tests, seeding, and database reset.
 */

class UserFactory {
  static defaultDepartments = [
    'Computer Engineering',
    'Industrial Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Software Engineering',
    'Chemical Engineering'
  ];

  static sampleNames = [
    'Hakan Ural',
    'Ayşe Yılmaz',
    'Mehmet Demir',
    'Zeynep Kaya',
    'Burak Şahin',
    'Elif Çelik',
    'Emre Yıldız',
    'Selin Öztürk',
    'Can Arslan',
    'Deniz Aydın'
  ];

  static counter = 1;

  /**
   * Generates a single mock user object
   * @param {Object} overrides - Specific fields to override
   * @returns {Object} User data object
   */
  static create(overrides = {}) {
    const id = overrides.id !== undefined ? overrides.id : this.counter++;
    const nameIndex = (id - 1) % this.sampleNames.length;
    const name = overrides.name || (id <= this.sampleNames.length ? this.sampleNames[nameIndex] : `Alumni User ${id}`);
    const departmentIndex = (id - 1) % this.defaultDepartments.length;
    const department = overrides.department || this.defaultDepartments[departmentIndex];
    const graduationYear = overrides.graduationYear || (2020 + (id % 5));
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = overrides.email || `${slug}${id > this.sampleNames.length ? id : ''}@alumni.edu`;

    return {
      id,
      name,
      department,
      graduationYear,
      email,
      ...overrides
    };
  }

  /**
   * Generates multiple mock user objects
   * @param {number} count - Number of users to generate
   * @param {Object} overrides - Shared overrides
   * @returns {Array<Object>} List of generated user objects
   */
  static createMany(count = 3, overrides = {}) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(this.create(overrides));
    }
    return list;
  }

  /**
   * Resets internal auto-increment counter
   * @param {number} start - Starting counter value
   */
  static resetCounter(start = 1) {
    this.counter = start;
  }

  /**
   * Persists a factory-generated user directly into PostgreSQL database
   * @param {Object} client - Connected pg Client/Pool
   * @param {Object} overrides - Specific fields to override
   * @returns {Promise<Object>} Inserted database row
   */
  static async createInDb(client, overrides = {}) {
    const data = this.create(overrides);
    const query = `
      INSERT INTO users (name, department, graduation_year, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET 
        name = EXCLUDED.name,
        department = EXCLUDED.department,
        graduation_year = EXCLUDED.graduation_year
      RETURNING id, name, department, graduation_year, email, created_at, updated_at;
    `;
    const values = [data.name, data.department, data.graduationYear, data.email];
    const res = await client.query(query, values);
    return res.rows[0];
  }
}

module.exports = UserFactory;
