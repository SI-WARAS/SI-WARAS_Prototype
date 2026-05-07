const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', medicalRecordController.getAllRecords);
router.post('/', medicalRecordController.createRecord);
router.get('/patient/:patientId', medicalRecordController.getRecordsByPatientId);
router.get('/:id', medicalRecordController.getRecordById);
router.put('/:id', medicalRecordController.updateRecord);
router.delete('/:id', medicalRecordController.deleteRecord);

module.exports = router;
