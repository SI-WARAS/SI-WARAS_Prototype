const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let filter = {};
    if (search) {
      filter = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: filter,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limitNum
      }),
      prisma.patient.count({ where: filter })
    ]);

    res.json({
      patients,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        medicalRecords: {
          orderBy: { date: 'desc' }
        }
      }
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { id, name, age, gender, address, phone } = req.body;
    // Allow custom ID if provided (e.g., NIK), else prisma generates UUID
    const data = { name, age, gender, address, phone };
    if (id) data.id = id;

    const newPatient = await prisma.patient.create({ data });
    res.status(201).json(newPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const updatedPatient = await prisma.patient.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updatedPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await prisma.patient.delete({ where: { id: req.params.id } });
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
};
