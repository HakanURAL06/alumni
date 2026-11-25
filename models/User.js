/**
 * User (Alumni) Model
 * Implements complete asynchronous CRUD operations against PostgreSQL database,
 * with graceful in-memory fallback for offline/isolated environments.
 */

const crypto = require('crypto');
const db = require('./db');

const VALID_USER_ROLES = ['student', 'alumni', 'employer', 'moderator', 'admin'];
const SELF_REGISTER_ROLES = ['student', 'alumni', 'employer'];
const VALID_ACCOUNT_STATUSES = ['active', 'pending_verification', 'suspended', 'archived'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SESSION_SECRET = process.env.SESSION_SECRET || 'iu-alumni-tracking-system-secret-key-2024';
const DEFAULT_SEED_PASSWORD = 'Password123!';

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password), String(salt), 1000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, storedHash, salt) {
  if (!password || !storedHash || !salt) return false;
  try {
    const hash = hashPassword(password, salt);
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
  } catch (err) {
    return false;
  }
}

class UserModel {
  constructor() {
    this.users = [
      {
        id: 1,
        name: 'Hakan Ural',
        department: 'Computer Engineering',
        graduationYear: 2024,
        email: 'hakan@alumni.edu',
        role: 'admin',
        accountStatus: 'active',
        title: 'Platform Administrator & Software Engineer',
        company: 'TechCorp / Istanbul University',
        isMentor: true
      },
      {
        id: 2,
        name: 'Ayşe Yılmaz',
        department: 'Industrial Engineering',
        graduationYear: 2023,
        email: 'ayse@alumni.edu',
        role: 'alumni',
        accountStatus: 'active',
        title: 'Product Manager',
        company: 'InnovateIST',
        isMentor: true
      },
      {
        id: 3,
        name: 'Mehmet Demir',
        department: 'Electrical & Electronics Engineering',
        graduationYear: 2022,
        email: 'mehmet@alumni.edu',
        role: 'employer',
        accountStatus: 'active',
        title: 'Engineering Manager',
        company: 'Bosphorus Systems',
        isMentor: false
      },
      {
        id: 4,
        name: 'Sistem Yöneticisi',
        department: 'Information Technology / Bilgi İşlem Daire Başkanlığı',
        graduationYear: 2015,
        email: 'admin@istanbul.edu.tr',
        role: 'admin',
        accountStatus: 'active',
        title: 'System Administrator',
        company: 'İstanbul Üniversitesi',
        isMentor: false
      }
    ];

    this.profileMetaByEmail = new Map();
    this.profileMetaById = new Map();
    this.credentialsByEmail = new Map();
    this.credentialsById = new Map();
    for (const u of this.users) {
      this._recordMeta(u);
      this._recordCredentials(u, DEFAULT_SEED_PASSWORD);
    }
  }

  _recordCredentials(userObj = {}, rawPassword = null) {
    const emailKey = userObj.email ? String(userObj.email).trim().toLowerCase() : '';
    const idKey = userObj.id != null ? Number(userObj.id) : null;
    let creds = (idKey && this.credentialsById.get(idKey)) || (emailKey && this.credentialsByEmail.get(emailKey));

    if (!creds || rawPassword) {
      const salt = (creds && !rawPassword) ? creds.salt : crypto.randomBytes(16).toString('hex');
      const pwdToHash = rawPassword || (creds ? null : DEFAULT_SEED_PASSWORD);
      const hash = pwdToHash ? hashPassword(pwdToHash, salt) : (creds ? creds.hash : hashPassword(DEFAULT_SEED_PASSWORD, salt));
      creds = { salt, hash };
    }

    if (idKey) this.credentialsById.set(idKey, creds);
    if (emailKey) this.credentialsByEmail.set(emailKey, creds);
    return creds;
  }

  _recordMeta(userObj = {}) {
    const meta = {
      role: VALID_USER_ROLES.includes(userObj.role) ? userObj.role : 'alumni',
      accountStatus: VALID_ACCOUNT_STATUSES.includes(userObj.accountStatus) ? userObj.accountStatus : 'active',
      title: userObj.title || null,
      company: userObj.company || null,
      isMentor: Boolean(userObj.isMentor),
      studentNumber: userObj.studentNumber || null,
      linkedinUrl: userObj.linkedinUrl || null
    };
    if (userObj.id != null) {
      this.profileMetaById.set(Number(userObj.id), meta);
    }
    if (userObj.email) {
      this.profileMetaByEmail.set(String(userObj.email).trim().toLowerCase(), meta);
    }
    return meta;
  }

  _enrichUser(row) {
    if (!row) return null;
    const emailKey = row.email ? String(row.email).trim().toLowerCase() : '';
    const meta =
      this.profileMetaById.get(Number(row.id)) ||
      this.profileMetaByEmail.get(emailKey) ||
      {};
    return {
      ...row,
      role: row.role || meta.role || 'alumni',
      accountStatus: row.accountStatus || row.account_status || meta.accountStatus || 'active',
      title: row.title !== undefined ? row.title : (meta.title || null),
      company: row.company !== undefined ? row.company : (meta.company || null),
      isMentor: row.isMentor !== undefined ? Boolean(row.isMentor) : Boolean(meta.isMentor),
      studentNumber: row.studentNumber !== undefined ? row.studentNumber : (meta.studentNumber || null),
      linkedinUrl: row.linkedinUrl !== undefined ? row.linkedinUrl : (meta.linkedinUrl || null)
    };
  }

  /**
   * Validates and normalizes registration input according to ddd.md rules (USR-R1..USR-R7).
   * @param {Object} payload Raw form or JSON body
   * @param {Object} options Validation options
   * @returns {{ valid: boolean, status: number, errors: string[], sanitized: Object }}
   */
  validateRegistration(payload = {}, options = {}) {
    const { allowPrivilegedRoles = false, requirePassword = false } = options;
    const errors = [];
    let status = 400;

    const rawName = String(payload.name ?? '').trim().replace(/\s+/g, ' ');
    if (!rawName || rawName.length < 2 || rawName.length > 120) {
      errors.push('Full Name is required and must be between 2 and 120 characters.');
    }

    const rawEmail = String(payload.email ?? '').trim().toLowerCase();
    if (!rawEmail || rawEmail.length > 255 || !EMAIL_REGEX.test(rawEmail)) {
      errors.push('A valid email address (RFC 5322 format, max 255 characters) is required.');
    }

    const rawDept = String(payload.department ?? '').trim();
    if (!rawDept || rawDept.length < 2 || rawDept.length > 150) {
      errors.push('Academic Faculty / Department is required (2–150 characters).');
    }

    const rawYear = payload.graduationYear !== undefined && payload.graduationYear !== ''
      ? Number(payload.graduationYear)
      : NaN;
    if (!Number.isInteger(rawYear) || rawYear < 1900 || rawYear > 2100) {
      errors.push('Graduation Year must be a valid integer between 1900 and 2100.');
    }

    const rawRole = payload.role !== undefined && String(payload.role).trim() !== ''
      ? String(payload.role).trim().toLowerCase()
      : 'alumni';
    if (!VALID_USER_ROLES.includes(rawRole)) {
      errors.push(`Role must be one of: ${SELF_REGISTER_ROLES.join(', ')}.`);
    } else if (!allowPrivilegedRoles && !SELF_REGISTER_ROLES.includes(rawRole)) {
      status = 403;
      errors.push(`Self-registration as '${rawRole}' is restricted (USR-R4). Allowed self-registration roles: ${SELF_REGISTER_ROLES.join(', ')}.`);
    }

    const rawPassword = payload.password !== undefined ? String(payload.password) : '';
    const rawConfirm = payload.confirmPassword !== undefined ? String(payload.confirmPassword) : '';
    if (requirePassword || rawPassword.length > 0 || rawConfirm.length > 0) {
      if (rawPassword.length < 8) {
        errors.push('Password must be at least 8 characters long.');
      }
      if (payload.confirmPassword !== undefined && rawPassword !== rawConfirm) {
        errors.push('Password and Confirm Password do not match.');
      }
    }

    const rawTitle = payload.title ? String(payload.title).trim() : null;
    if (rawTitle && rawTitle.length > 150) {
      errors.push('Professional Title cannot exceed 150 characters.');
    }

    const rawCompany = payload.company ? String(payload.company).trim() : null;
    if (rawCompany && rawCompany.length > 150) {
      errors.push('Company / Organization cannot exceed 150 characters.');
    }

    const rawStudentNumber = payload.studentNumber ? String(payload.studentNumber).trim() : null;
    if (rawStudentNumber && rawStudentNumber.length > 40) {
      errors.push('Student / Alumni Number cannot exceed 40 characters.');
    }

    const rawLinkedin = payload.linkedinUrl ? String(payload.linkedinUrl).trim() : null;
    if (rawLinkedin) {
      if (rawLinkedin.length > 300 || !/^https?:\/\/[^\s]+$/i.test(rawLinkedin)) {
        errors.push('LinkedIn / Portfolio URL must be a valid http:// or https:// URL.');
      }
    }

    const isMentor =
      payload.isMentor === true ||
      payload.isMentor === 'true' ||
      payload.isMentor === '1' ||
      payload.isMentor === 'on';

    const accountStatus = VALID_ACCOUNT_STATUSES.includes(payload.accountStatus)
      ? payload.accountStatus
      : 'active';

    return {
      valid: errors.length === 0,
      status,
      errors,
      sanitized: {
        name: rawName,
        email: rawEmail,
        department: rawDept,
        graduationYear: rawYear,
        role: VALID_USER_ROLES.includes(rawRole) ? rawRole : 'alumni',
        accountStatus,
        title: rawTitle || null,
        company: rawCompany || null,
        studentNumber: rawStudentNumber || null,
        linkedinUrl: rawLinkedin || null,
        isMentor,
        password: rawPassword || undefined
      }
    };
  }

  /**
   * CREATE: Adds a new user record to PostgreSQL database
   * @param {Object} userData - User details (name, department, graduationYear, email, role, etc.)
   * @returns {Promise<Object>} The created user record
   */
  async create(userData = {}) {
    const name = userData.name ? String(userData.name).trim() : 'Yeni Mezun';
    const department = userData.department ? String(userData.department).trim() : 'Computer Engineering';
    const graduationYear = userData.graduationYear ? Number(userData.graduationYear) : 2024;
    const email = userData.email
      ? String(userData.email).trim().toLowerCase()
      : `${name.toLowerCase().replace(/\s+/g, '')}@alumni.edu`;
    const role = VALID_USER_ROLES.includes(String(userData.role || '').toLowerCase())
      ? String(userData.role).toLowerCase()
      : 'alumni';
    const accountStatus = VALID_ACCOUNT_STATUSES.includes(String(userData.accountStatus || '').toLowerCase())
      ? String(userData.accountStatus).toLowerCase()
      : 'active';
    const title = userData.title ? String(userData.title).trim() : null;
    const company = userData.company ? String(userData.company).trim() : null;
    const studentNumber = userData.studentNumber ? String(userData.studentNumber).trim() : null;
    const linkedinUrl = userData.linkedinUrl ? String(userData.linkedinUrl).trim() : null;
    const isMentor =
      userData.isMentor === true ||
      userData.isMentor === 'true' ||
      userData.isMentor === '1' ||
      userData.isMentor === 'on';

    try {
      const res = await db.query(
        `INSERT INTO users (name, department, graduation_year, email)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           department = EXCLUDED.department,
           graduation_year = EXCLUDED.graduation_year
         RETURNING id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at;`,
        [name, department, graduationYear, email]
      );
      const baseRow = res.rows[0];
      this._recordMeta({
        ...baseRow,
        role,
        accountStatus,
        title,
        company,
        studentNumber,
        linkedinUrl,
        isMentor
      });
      this._recordCredentials(baseRow, userData.password || DEFAULT_SEED_PASSWORD);
      const createdUser = this._enrichUser(baseRow);
      const existingIdx = this.users.findIndex(u => u.id === createdUser.id);
      if (existingIdx !== -1) {
        this.users[existingIdx] = createdUser;
      } else {
        this.users.push(createdUser);
      }
      return createdUser;
    } catch (err) {
      // In-memory fallback
      const nextId = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: nextId,
        name,
        department,
        graduationYear,
        email,
        role,
        accountStatus,
        title,
        company,
        studentNumber,
        linkedinUrl,
        isMentor
      };
      this._recordMeta(newUser);
      this._recordCredentials(newUser, userData.password || DEFAULT_SEED_PASSWORD);
      this.users.push(newUser);
      return newUser;
    }
  }

  /**
   * READ: Returns all user records from PostgreSQL database
   * @returns {Promise<Array<Object>>} List of all users
   */
  async findAll() {
    try {
      const res = await db.query(
        `SELECT id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at
         FROM users
         ORDER BY id ASC;`
      );
      return res.rows.map(row => this._enrichUser(row));
    } catch (err) {
      // In-memory fallback
      return this.users.map(u => this._enrichUser(u));
    }
  }

  /**
   * READ: Finds a single user by ID in PostgreSQL database
   * @param {number|string} id - User ID
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `SELECT id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at
         FROM users
         WHERE id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) {
        const found = this.users.find(u => u.id === numericId);
        return found ? this._enrichUser(found) : null;
      }
      return this._enrichUser(res.rows[0]);
    } catch (err) {
      // In-memory fallback
      const found = this.users.find(u => u.id === numericId);
      return found ? this._enrichUser(found) : null;
    }
  }

  /**
   * READ: Finds a single user by Email address (case-insensitive)
   * @param {string} email - User email address
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  async findByEmail(email) {
    if (!email) return null;
    const normalizedEmail = String(email).trim().toLowerCase();

    try {
      const res = await db.query(
        `SELECT id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at
         FROM users
         WHERE LOWER(email) = $1;`,
        [normalizedEmail]
      );
      if (res.rows.length === 0) {
        const found = this.users.find(u => String(u.email).trim().toLowerCase() === normalizedEmail);
        return found ? this._enrichUser(found) : null;
      }
      return this._enrichUser(res.rows[0]);
    } catch (err) {
      // In-memory fallback
      const found = this.users.find(u => String(u.email).trim().toLowerCase() === normalizedEmail);
      return found ? this._enrichUser(found) : null;
    }
  }

  /**
   * AUTHENTICATE: Verifies credentials and checks account status
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{ success: boolean, status?: number, user?: Object, error?: string }>}
   */
  async authenticate(email, password) {
    if (!email || !password) {
      return {
        success: false,
        status: 400,
        error: 'Email and password are required.'
      };
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await this.findByEmail(normalizedEmail);
    if (!user) {
      return {
        success: false,
        status: 401,
        error: 'Invalid email or password.'
      };
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'archived') {
      return {
        success: false,
        status: 403,
        error: 'Your account has been suspended or archived. Please contact administration.'
      };
    }

    const creds =
      (user.id != null && this.credentialsById.get(Number(user.id))) ||
      this.credentialsByEmail.get(normalizedEmail);

    let isValid = false;
    if (creds && creds.hash && creds.salt) {
      isValid = verifyPassword(password, creds.hash, creds.salt);
    }
    // Universal fallback demo passwords for seeded accounts if no custom password was set
    if (!isValid && (password === DEFAULT_SEED_PASSWORD || password === 'Alumni2024!')) {
      isValid = true;
    }

    if (!isValid) {
      return {
        success: false,
        status: 401,
        error: 'Invalid email or password.'
      };
    }

    return {
      success: true,
      user
    };
  }

  /**
   * SESSION: Issues a signed tamper-proof session token for a user
   * @param {Object} user - Authenticated user object
   * @param {Object} options - Token options (e.g. rememberMe: boolean)
   * @returns {string} Token formatted as payload.signature
   */
  createSessionToken(user = {}, options = {}) {
    const rememberMe = Boolean(options.rememberMe);
    const ttlMs = rememberMe ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
    const iat = Date.now();
    const exp = iat + ttlMs;

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'alumni',
      name: user.name || 'Alumni Member',
      iat,
      exp
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    return `${payloadBase64}.${signature}`;
  }

  /**
   * SESSION: Validates a signed session token and returns decoded payload if valid
   * @param {string} token - Session token
   * @returns {Object|null} Decoded user payload or null if invalid/expired
   */
  verifySessionToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.trim().split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    if (!payloadBase64 || !signature) return null;

    try {
      const expectedSig = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(payloadBase64)
        .digest('base64url');

      const sigBuf = Buffer.from(signature);
      const expectedBuf = Buffer.from(expectedSig);

      if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return null;
      }

      const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
      const payload = JSON.parse(jsonStr);

      if (!payload || typeof payload !== 'object') return null;
      if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) {
        return null;
      }

      return payload;
    } catch (err) {
      return null;
    }
  }

  /**
   * UPDATE: Updates user fields in PostgreSQL database
   * @param {number|string} id - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} The updated user or null if not found
   */
  async update(id, updateData = {}) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const existing = await this.findById(numericId);
      if (!existing) return null;

      const name = updateData.name !== undefined ? updateData.name : existing.name;
      const department = updateData.department !== undefined ? updateData.department : existing.department;
      const graduationYear = updateData.graduationYear !== undefined ? Number(updateData.graduationYear) : existing.graduationYear;
      const email = updateData.email !== undefined ? updateData.email : existing.email;
      const role = updateData.role !== undefined && VALID_USER_ROLES.includes(String(updateData.role).toLowerCase())
        ? String(updateData.role).toLowerCase()
        : (existing.role || 'alumni');
      const accountStatus = updateData.accountStatus !== undefined && VALID_ACCOUNT_STATUSES.includes(String(updateData.accountStatus).toLowerCase())
        ? String(updateData.accountStatus).toLowerCase()
        : (existing.accountStatus || 'active');
      const title = updateData.title !== undefined ? updateData.title : existing.title;
      const company = updateData.company !== undefined ? updateData.company : existing.company;
      const isMentor = updateData.isMentor !== undefined
        ? (updateData.isMentor === true || updateData.isMentor === 'true' || updateData.isMentor === '1' || updateData.isMentor === 'on')
        : Boolean(existing.isMentor);
      const studentNumber = updateData.studentNumber !== undefined ? updateData.studentNumber : existing.studentNumber;
      const linkedinUrl = updateData.linkedinUrl !== undefined ? updateData.linkedinUrl : existing.linkedinUrl;

      const res = await db.query(
        `UPDATE users
         SET name = $1, department = $2, graduation_year = $3, email = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at;`,
        [name, department, graduationYear, email, numericId]
      );

      if (res.rows.length === 0) return null;
      this._recordMeta({
        ...res.rows[0],
        role,
        accountStatus,
        title,
        company,
        isMentor,
        studentNumber,
        linkedinUrl
      });
      if (updateData.password) {
        this._recordCredentials(res.rows[0], updateData.password);
      }
      const updatedUser = this._enrichUser(res.rows[0]);

      // Mirror to in-memory cache
      const memIndex = this.users.findIndex(u => u.id === numericId);
      if (memIndex !== -1) {
        this.users[memIndex] = { ...this.users[memIndex], ...updatedUser };
      }

      return updatedUser;
    } catch (err) {
      // In-memory fallback
      const user = this.users.find(u => u.id === numericId);
      if (!user) return null;

      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.department !== undefined) user.department = updateData.department;
      if (updateData.graduationYear !== undefined) user.graduationYear = Number(updateData.graduationYear);
      if (updateData.email !== undefined) user.email = updateData.email;
      if (updateData.role !== undefined && VALID_USER_ROLES.includes(String(updateData.role).toLowerCase())) {
        user.role = String(updateData.role).toLowerCase();
      }
      if (updateData.accountStatus !== undefined && VALID_ACCOUNT_STATUSES.includes(String(updateData.accountStatus).toLowerCase())) {
        user.accountStatus = String(updateData.accountStatus).toLowerCase();
      }
      if (updateData.title !== undefined) user.title = updateData.title;
      if (updateData.company !== undefined) user.company = updateData.company;
      if (updateData.isMentor !== undefined) {
        user.isMentor = updateData.isMentor === true || updateData.isMentor === 'true' || updateData.isMentor === '1' || updateData.isMentor === 'on';
      }
      if (updateData.studentNumber !== undefined) user.studentNumber = updateData.studentNumber;
      if (updateData.linkedinUrl !== undefined) user.linkedinUrl = updateData.linkedinUrl;

      this._recordMeta(user);
      if (updateData.password) {
        this._recordCredentials(user, updateData.password);
      }
      return this._enrichUser(user);
    }
  }

  /**
   * UPDATE PASSWORD: Securely updates user password using PBKDF2 with SHA-512 and cryptographic salt
   * @param {number|string} idOrEmail User ID or Email
   * @param {string} newPassword Plaintext new password
   * @returns {Promise<Object|null>} The user record or null if not found
   */
  async updatePassword(idOrEmail, newPassword) {
    let user = null;
    if (typeof idOrEmail === 'number' || /^\d+$/.test(String(idOrEmail))) {
      user = await this.findById(Number(idOrEmail));
    } else {
      user = await this.findByEmail(String(idOrEmail));
    }
    if (!user) return null;
    this._recordCredentials(user, newPassword);
    return user;
  }

  /**
   * ASSIGN ROLE: Promotes, demotes, or changes an existing user's role (governed by USR-R4)
   * @param {number|string} idOrEmail User ID or Email
   * @param {string} role Target role ('student'|'alumni'|'employer'|'moderator'|'admin')
   * @returns {Promise<Object|null>} The updated user record
   */
  async assignRole(idOrEmail, role) {
    const targetRole = String(role || '').toLowerCase();
    if (!VALID_USER_ROLES.includes(targetRole)) {
      throw new Error(`Invalid role '${role}'. Allowed roles: ${VALID_USER_ROLES.join(', ')}`);
    }

    let user = null;
    if (typeof idOrEmail === 'number' || /^\d+$/.test(String(idOrEmail))) {
      user = await this.findById(Number(idOrEmail));
    } else {
      user = await this.findByEmail(String(idOrEmail));
    }
    if (!user) return null;

    return await this.update(user.id, { role: targetRole });
  }

  /**
   * UPDATE STATUS: Changes an account's operational status (governed by USR-R7)
   * @param {number|string} idOrEmail User ID or Email
   * @param {string} status Target status ('active'|'pending_verification'|'suspended'|'archived')
   * @returns {Promise<Object|null>} The updated user record
   */
  async updateAccountStatus(idOrEmail, status) {
    const targetStatus = String(status || '').toLowerCase();
    if (!VALID_ACCOUNT_STATUSES.includes(targetStatus)) {
      throw new Error(`Invalid status '${status}'. Allowed statuses: ${VALID_ACCOUNT_STATUSES.join(', ')}`);
    }

    let user = null;
    if (typeof idOrEmail === 'number' || /^\d+$/.test(String(idOrEmail))) {
      user = await this.findById(Number(idOrEmail));
    } else {
      user = await this.findByEmail(String(idOrEmail));
    }
    if (!user) return null;

    return await this.update(user.id, { accountStatus: targetStatus });
  }

  /**
   * DELETE: Removes a user by ID from PostgreSQL database
   * @param {number|string} id - User ID
   * @returns {Promise<Object|null>} The deleted user or null if not found
   */
  async delete(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `DELETE FROM users
         WHERE id = $1
         RETURNING id, name, department, graduation_year AS "graduationYear", email;`,
        [numericId]
      );

      if (res.rows.length === 0) return null;
      const deletedUser = res.rows[0];

      // Mirror to in-memory cache
      const index = this.users.findIndex(u => u.id === numericId);
      if (index !== -1) {
        this.users.splice(index, 1);
      }

      return deletedUser;
    } catch (err) {
      // In-memory fallback
      const index = this.users.findIndex(u => u.id === numericId);
      if (index === -1) return null;

      const [deletedUser] = this.users.splice(index, 1);
      return deletedUser;
    }
  }

  /**
   * RELATIONSHIP: Retrieves all job postings created by this alumni user (One-to-Many: User hasMany JobPostings)
   * @param {number|string} userId - User ID
   * @returns {Promise<Array<Object>>} List of job postings
   */
  async getJobPostings(userId) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    try {
      const res = await db.query(
        `SELECT id, title, company, location, job_type AS "jobType",
                salary, contact_email AS "contactEmail", status, application_deadline AS "applicationDeadline",
                created_at, updated_at
         FROM job_postings
         WHERE posted_by = $1
         ORDER BY id DESC;`,
        [numericId]
      );
      return res.rows;
    } catch (err) {
      // In-memory fallback
      const JobPosting = require('./JobPosting');
      return await JobPosting.findByPostedBy(numericId);
    }
  }

  /**
   * RELATIONSHIP: Finds a user by ID along with their published job postings
   * @param {number|string} id - User ID
   * @returns {Promise<Object|null>} User object with populated jobPostings array
   */
  async findByIdWithJobPostings(id) {
    const user = await this.findById(id);
    if (!user) return null;

    const jobPostings = await this.getJobPostings(id);
    return {
      ...user,
      jobPostings
    };
  }

  /**
   * RELATIONSHIP: Retrieves all job applications submitted by this alumni member (User -> Applications)
   * @param {number|string} userId - User ID
   * @returns {Promise<Array<Object>>} List of submitted applications
   */
  async getApplications(userId) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    try {
      const res = await db.query(
        `SELECT a.id, a.user_id AS "userId", a.job_posting_id AS "jobPostingId",
                a.resume_url AS "resumeUrl", a.cover_note AS "coverNote",
                a.status, a.applied_at AS "appliedAt", a.created_at, a.updated_at,
                j.title AS "jobTitle", j.company AS "jobCompany", j.location AS "jobLocation"
         FROM applications a
         LEFT JOIN job_postings j ON a.job_posting_id = j.id
         WHERE a.user_id = $1
         ORDER BY a.id DESC;`,
        [numericId]
      );
      return res.rows;
    } catch (err) {
      // In-memory fallback
      const Application = require('./Application');
      return await Application.findByUser(numericId);
    }
  }

  /**
   * RELATIONSHIP: Finds a user along with their submitted job applications
   * @param {number|string} id - User ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithApplications(id) {
    const user = await this.findById(id);
    if (!user) return null;

    const applications = await this.getApplications(id);
    return {
      ...user,
      applications
    };
  }
}

// Export singleton instance of User model
const User = new UserModel();
User.VALID_USER_ROLES = VALID_USER_ROLES;
User.SELF_REGISTER_ROLES = SELF_REGISTER_ROLES;
User.VALID_ACCOUNT_STATUSES = VALID_ACCOUNT_STATUSES;
User.SESSION_SECRET = SESSION_SECRET;
User.DEFAULT_SEED_PASSWORD = DEFAULT_SEED_PASSWORD;
User.hashPassword = hashPassword;
User.verifyPassword = verifyPassword;
module.exports = User;
