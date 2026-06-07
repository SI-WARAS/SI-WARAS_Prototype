const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { injectTenantContext } = require('../middleware/tenant');

router.get('/public-stats', dashboardController.getStats);

router.use(authenticate);
router.use(injectTenantContext);

router.get('/stats', dashboardController.getStats);

module.exports = router;
