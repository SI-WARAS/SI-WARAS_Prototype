const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRecords = async (req, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      orderBy: { date: 'desc' },
      include: { patient: { select: { name: true, gender: true } } }
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

const { medicalRecordSchema } = require('../validators/recordSchema');

exports.createRecord = async (req, res) => {
  try {
    const validatedData = medicalRecordSchema.parse(req.body);

    const data = {
      patientId: validatedData.patientId,
      bloodPressure: validatedData.bloodPressure,
      bloodSugar: validatedData.bloodSugar,
      cholesterol: validatedData.cholesterol,
      uricAcid: validatedData.uricAcid,
      weight: validatedData.weight,
      height: validatedData.height,
      smokingStatus: validatedData.smokingStatus,
      activityLevel: validatedData.activityLevel,
      notes: validatedData.notes
    };

    if (validatedData.date) {
      data.date = new Date(validatedData.date);
    }

    const newRecord = await prisma.medicalRecord.create({ data });
    res.status(201).json(newRecord);
  } catch (error) {
    console.error(error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
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
    // For update, we might want to make some fields optional or use a partial schema
    // But since the frontend sends the whole object, we can use the same schema or .partial()
    const validatedData = medicalRecordSchema.partial().parse(req.body);
    const { date, ...rest } = validatedData;
    const data = { ...rest };
    
    if (date) data.date = new Date(date);

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data
    });
    res.json(updatedRecord);
  } catch (error) {
    console.error(error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
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
