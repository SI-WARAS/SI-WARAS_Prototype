const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { injectTenantContext } = require('../middleware/tenant');

router.use(authenticate);
router.use(injectTenantContext);

router.get('/', patientController.getAllPatients);
router.get('/pedukuhans', patientController.getAllPedukuhans);
router.get('/:id', patientController.getPatientById);
router.post('/', patientController.createPatient);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;
