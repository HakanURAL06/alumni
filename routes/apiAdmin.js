const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { requireAuth, requireRole } = require('../middleware');

// ==========================================
// ALL REST API ENDPOINTS UNDER /api/admin REQUIRE ADMIN ROLE
// ==========================================
router.use(requireAuth);
router.use(requireRole('admin'));

// 1. Metric Overview
router.get('/overview', AdminController.getDashboard);

// 2. User Role & Status Mutations
router.patch('/users/:id/role', AdminController.updateUserRole);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.delete('/users/:id', AdminController.deleteUser);

// 3. Job Postings Oversight
router.patch('/jobs/:id/status', AdminController.updateJobStatus);
router.delete('/jobs/:id', AdminController.deleteJob);

// 4. Announcements Oversight
router.delete('/announcements/:id', AdminController.deleteAnnouncement);

// 5. Direct Data Manipulation Command
router.post('/manipulate', AdminController.manipulate);

module.exports = router;
