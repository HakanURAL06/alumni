/**
 * User (Alumni) Model
 * In-memory data store with complete CRUD functions (no database connection).
 */
class UserModel {
  constructor() {
    this.users = [
      { id: 1, name: 'Hakan Ural', department: 'Computer Engineering', graduationYear: 2024, email: 'hakan@alumni.edu' },
      { id: 2, name: 'Ayşe Yılmaz', department: 'Industrial Engineering', graduationYear: 2023, email: 'ayse@alumni.edu' },
      { id: 3, name: 'Mehmet Demir', department: 'Electrical & Electronics Engineering', graduationYear: 2022, email: 'mehmet@alumni.edu' }
    ];
  }

  /**
   * CREATE: Adds a new user to the in-memory collection
   * @param {Object} userData - User details (name, department, graduationYear, email)
   * @returns {Object} The created user with auto-generated ID
   */
  create(userData = {}) {
    const nextId = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const name = userData.name || 'Yeni Mezun';

    const newUser = {
      id: nextId,
      name,
      department: userData.department || 'Computer Engineering',
      graduationYear: userData.graduationYear ? Number(userData.graduationYear) : 2024,
      email: userData.email || `${name.toLowerCase().replace(/\s+/g, '')}@alumni.edu`
    };

    this.users.push(newUser);
    return newUser;
  }

  /**
   * READ: Returns all users
   * @returns {Array<Object>} List of all users
   */
  findAll() {
    return [...this.users];
  }

  /**
   * READ: Finds a single user by ID
   * @param {number|string} id - User ID
   * @returns {Object|null} The user object or null if not found
   */
  findById(id) {
    const numericId = Number(id);
    return this.users.find(u => u.id === numericId) || null;
  }

  /**
   * UPDATE: Updates user fields (supports both full PUT and partial PATCH)
   * @param {number|string} id - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Object|null} The updated user or null if not found
   */
  update(id, updateData = {}) {
    const user = this.findById(id);
    if (!user) return null;

    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.department !== undefined) user.department = updateData.department;
    if (updateData.graduationYear !== undefined) user.graduationYear = Number(updateData.graduationYear);
    if (updateData.email !== undefined) user.email = updateData.email;

    return user;
  }

  /**
   * DELETE: Removes a user by ID
   * @param {number|string} id - User ID
   * @returns {Object|null} The deleted user or null if not found
   */
  delete(id) {
    const numericId = Number(id);
    const index = this.users.findIndex(u => u.id === numericId);
    if (index === -1) return null;

    const [deletedUser] = this.users.splice(index, 1);
    return deletedUser;
  }
}

// Export singleton instance of User model
const User = new UserModel();
module.exports = User;
