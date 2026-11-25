const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { requireAuth, requireRole } = require('../middleware');

// ==========================================
// ALL ROUTES IN ADMIN ROUTER ARE STRICTLY GUARDED
// Access requires authenticated session AND admin role (USR-R4)
// ==========================================
router.use(requireAuth);
router.use(requireRole('admin'));

// 1. Central Admin Console Dashboard
router.get('/', AdminController.getDashboard);

// 2. User & Member Governance (Role Assignment & Status Control)
router.post('/users/:id/role', AdminController.updateUserRole);
router.post('/users/:id/status', AdminController.updateUserStatus);
router.post('/users/:id/delete', AdminController.deleteUser);

// 3. Career & Job Postings Governance
router.post('/jobs/:id/status', AdminController.updateJobStatus);
router.post('/jobs/:id/delete', AdminController.deleteJob);

// 4. Campus Bulletins & Announcements Governance
router.post('/announcements/:id/delete', AdminController.deleteAnnouncement);

// 5. Fast Direct Data Manipulation
router.post('/manipulate', AdminController.manipulate);

module.exports = router;
