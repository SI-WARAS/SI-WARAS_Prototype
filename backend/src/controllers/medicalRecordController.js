const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRecords = async (req, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      orderBy: { date: 'desc' },
      include: { patient: { select: { name: true } } }
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: req.params.id },
      include: { patient: { select: { name: true } } }
    });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch medical record details' });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const {
      patientId,
      date,
      bloodPressure,
      bloodSugar,
      cholesterol,
      weight,
      height,
      smokingStatus,
      activityLevel,
      notes
    } = req.body;

    const data = {
      patientId,
      bloodPressure,
      bloodSugar: parseFloat(bloodSugar),
      cholesterol: parseFloat(cholesterol),
      weight: parseFloat(weight),
      height: parseFloat(height),
      smokingStatus: Boolean(smokingStatus),
      activityLevel,
      notes
    };

    if (date) {
      data.date = new Date(date);
    }

    const newRecord = await prisma.medicalRecord.create({ data });
    res.status(201).json(newRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
};

exports.getRecordsByPatientId = async (req, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { date: 'desc' }
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const { date, ...rest } = req.body;
    const data = { ...rest };
    
    if (data.bloodSugar) data.bloodSugar = parseFloat(data.bloodSugar);
    if (data.cholesterol) data.cholesterol = parseFloat(data.cholesterol);
    if (data.weight) data.weight = parseFloat(data.weight);
    if (data.height) data.height = parseFloat(data.height);
    if (data.smokingStatus !== undefined) data.smokingStatus = Boolean(data.smokingStatus);
    if (date) data.date = new Date(date);

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data
    });
    res.json(updatedRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update medical record' });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    await prisma.medicalRecord.delete({ where: { id: req.params.id } });
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete medical record' });
  }
};
