const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const User = require('../models/User');
const {
  parseCookies,
  setSessionCookie,
  clearSessionCookie,
  authMiddleware,
  requireAuth,
  requireRole,
  requireActive,
  requireOwnershipOrAdmin,
  guestOnly
} = require('../middleware');

function createMockReq(overrides = {}) {
  return {
    method: 'GET',
    originalUrl: '/protected',
    url: '/protected',
    headers: {},
    accepts: (type) => type === 'json',
    ...overrides
  };
}

function createMockRes() {
  const headers = {};
  return {
    statusCode: 200,
    locals: {},
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    getHeader: (k) => headers[k.toLowerCase()],
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.sentJson = data; return this; },
    send: function(body) { this.sentBody = body; return this; },
    redirect: function(target) { this.redirectTarget = target; this.statusCode = 302; return this; }
  };
}

test('parseCookies parses cookie string and handles edge cases', () => {
  assert.deepStrictEqual(parseCookies(''), {});
  assert.deepStrictEqual(parseCookies(null), {});
  assert.deepStrictEqual(parseCookies(undefined), {});

  const parsed = parseCookies('session=token123; user=Hakan%20Ural; theme=dark');
  assert.strictEqual(parsed.session, 'token123');
  assert.strictEqual(parsed.user, 'Hakan Ural');
  assert.strictEqual(parsed.theme, 'dark');
});

test('setSessionCookie and clearSessionCookie format Set-Cookie headers properly', () => {
  const res1 = createMockRes();
  setSessionCookie(res1, 'tokenABC', false);
  const cookie1 = res1.getHeader('set-cookie');
  assert.ok(cookie1.includes('session=tokenABC'));
  assert.ok(cookie1.includes('HttpOnly'));
  assert.ok(cookie1.includes('SameSite=Lax'));
  assert.ok(cookie1.includes('Max-Age=86400'));

  const res2 = createMockRes();
  setSessionCookie(res2, 'tokenXYZ', true);
  const cookie2 = res2.getHeader('set-cookie');
  assert.ok(cookie2.includes('Max-Age=2592000'));

  const res3 = createMockRes();
  clearSessionCookie(res3);
  const cookie3 = res3.getHeader('set-cookie');
  assert.ok(cookie3.includes('Max-Age=0'));
});

test('authMiddleware hydrates req.user and res.locals from Bearer Authorization header', () => {
  const dummyUser = { id: 1, email: 'hakan@alumni.edu', role: 'alumni', name: 'Hakan Ural' };
  const token = User.createSessionToken(dummyUser);

  const req = createMockReq({
    headers: { authorization: `Bearer ${token}` }
  });
  const res = createMockRes();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.ok(req.user);
  assert.strictEqual(req.user.email, 'hakan@alumni.edu');
  assert.strictEqual(res.locals.currentUser.email, 'hakan@alumni.edu');
  assert.strictEqual(res.locals.isAuthenticated, true);
});

test('authMiddleware hydrates req.user from session Cookie header', () => {
  const dummyUser = { id: 2, email: 'ayse@alumni.edu', role: 'alumni', name: 'Ayşe Yılmaz' };
  const token = User.createSessionToken(dummyUser);

  const req = createMockReq({
    headers: { cookie: `session=${token}; other=val` }
  });
  const res = createMockRes();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.ok(req.user);
  assert.strictEqual(req.user.email, 'ayse@alumni.edu');
  assert.strictEqual(res.locals.isAuthenticated, true);
});

test('authMiddleware leaves req.user null when token is missing or forged', () => {
  const req1 = createMockReq();
  const res1 = createMockRes();
  authMiddleware(req1, res1, () => {});
  assert.strictEqual(req1.user, null);
  assert.strictEqual(res1.locals.isAuthenticated, false);

  const req2 = createMockReq({
    headers: { authorization: 'Bearer forged.signature' }
  });
  const res2 = createMockRes();
  authMiddleware(req2, res2, () => {});
  assert.strictEqual(req2.user, null);
  assert.strictEqual(res2.locals.isAuthenticated, false);
});

test('requireAuth allows authenticated users and rejects unauthenticated API/Web clients', () => {
  // 1. Authenticated
  const reqAuth = createMockReq({ user: { id: 1, role: 'alumni' } });
  const resAuth = createMockRes();
  let calledNext = false;
  requireAuth(reqAuth, resAuth, () => { calledNext = true; });
  assert.strictEqual(calledNext, true);

  // 2. Unauthenticated API client -> 401 JSON
  const reqApi = createMockReq({ user: null });
  const resApi = createMockRes();
  requireAuth(reqApi, resApi, () => {});
  assert.strictEqual(resApi.statusCode, 401);
  assert.ok(resApi.sentJson?.error);

  // 3. Unauthenticated Web client -> 302 redirect to /login
  const reqWeb = createMockReq({
    user: null,
    originalUrl: '/users/1/edit',
    accepts: (type) => type === 'html'
  });
  const resWeb = createMockRes();
  requireAuth(reqWeb, resWeb, () => {});
  assert.strictEqual(resWeb.statusCode, 302);
  assert.ok(resWeb.redirectTarget.includes('/login?returnUrl='));
});

test('requireRole enforces RBAC role boundaries (USR-R3..USR-R6)', () => {
  const employerGuard = requireRole('employer', 'moderator');

  // 1. Matches role -> next()
  const reqEmployer = createMockReq({ user: { id: 3, role: 'employer' } });
  const resEmployer = createMockRes();
  let called1 = false;
  employerGuard(reqEmployer, resEmployer, () => { called1 = true; });
  assert.strictEqual(called1, true);

  // 2. Admin superuser bypasses specific role requirement
  const reqAdmin = createMockReq({ user: { id: 99, role: 'admin' } });
  const resAdmin = createMockRes();
  let calledAdmin = false;
  employerGuard(reqAdmin, resAdmin, () => { calledAdmin = true; });
  assert.strictEqual(calledAdmin, true);

  // 3. Unauthorized role ('student') -> 403 Forbidden
  const reqStudent = createMockReq({ user: { id: 5, role: 'student' } });
  const resStudent = createMockRes();
  employerGuard(reqStudent, resStudent, () => {});
  assert.strictEqual(resStudent.statusCode, 403);
  assert.ok(resStudent.sentJson?.error.includes('Insufficient privileges'));
});

test('requireActive blocks suspended or unverified member operations (USR-R7)', () => {
  // 1. Active user -> allowed
  const reqActive = createMockReq({ user: { id: 1, accountStatus: 'active' } });
  const resActive = createMockRes();
  let calledActive = false;
  requireActive(reqActive, resActive, () => { calledActive = true; });
  assert.strictEqual(calledActive, true);

  // 2. Suspended user -> 403 Forbidden
  const reqSuspended = createMockReq({ user: { id: 2, accountStatus: 'suspended' } });
  const resSuspended = createMockRes();
  requireActive(reqSuspended, resSuspended, () => {});
  assert.strictEqual(resSuspended.statusCode, 403);
  assert.ok(resSuspended.sentJson?.error.includes('suspended'));
});

test('requireOwnershipOrAdmin enforces resource owner or admin access', () => {
  const ownershipGuard = requireOwnershipOrAdmin((req) => req.params?.userId);

  // 1. Owner matches -> allowed
  const reqOwner = createMockReq({
    user: { id: 10, userId: 10, role: 'alumni' },
    params: { userId: '10' }
  });
  const resOwner = createMockRes();
  let calledOwner = false;
  ownershipGuard(reqOwner, resOwner, () => { calledOwner = true; });
  assert.strictEqual(calledOwner, true);

  // 2. Admin oversight -> allowed
  const reqAdmin = createMockReq({
    user: { id: 99, role: 'admin' },
    params: { userId: '10' }
  });
  const resAdmin = createMockRes();
  let calledAdmin = false;
  ownershipGuard(reqAdmin, resAdmin, () => { calledAdmin = true; });
  assert.strictEqual(calledAdmin, true);

  // 3. Different user -> 403 Forbidden
  const reqStranger = createMockReq({
    user: { id: 5, userId: 5, role: 'alumni' },
    params: { userId: '10' }
  });
  const resStranger = createMockRes();
  ownershipGuard(reqStranger, resStranger, () => {});
  assert.strictEqual(resStranger.statusCode, 403);
  assert.ok(resStranger.sentJson?.error.includes('ownership required'));
});

test('guestOnly redirects logged-in users and allows anonymous guests', () => {
  // 1. Anonymous guest -> allowed
  const reqGuest = createMockReq({ user: null });
  const resGuest = createMockRes();
  let calledGuest = false;
  guestOnly(reqGuest, resGuest, () => { calledGuest = true; });
  assert.strictEqual(calledGuest, true);

  // 2. Already logged in (web) -> redirects to /users
  const reqLoggedIn = createMockReq({
    user: { id: 1, email: 'hakan@alumni.edu' },
    accepts: (type) => type === 'html'
  });
  const resLoggedIn = createMockRes();
  guestOnly(reqLoggedIn, resLoggedIn, () => {});
  assert.strictEqual(resLoggedIn.statusCode, 302);
  assert.strictEqual(resLoggedIn.redirectTarget, '/users');
});
