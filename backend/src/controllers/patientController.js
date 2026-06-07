const { prisma } = require('../utils/db');

exports.getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let filter = {};
    if (search) {
      const trimmedSearch = search.trim();
      const isNumeric = /^\d+$/.test(trimmedSearch);
      
      filter = {
        OR: [
          { name: { contains: trimmedSearch, mode: 'insensitive' } },
          { nik: { startsWith: trimmedSearch, mode: 'insensitive' } },
          { address: { contains: trimmedSearch, mode: 'insensitive' } }
        ]
      };

      if (isNumeric) {
        const searchAge = parseInt(trimmedSearch, 10);
        // Include exact age match if numeric
        filter.OR.push({ age: searchAge });
      }
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: filter,
        include: { pedukuhan: true },
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
        pedukuhan: true,
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
    const { id, nik, name, age, gender, address, phone, pedukuhanId } = req.body;
    const data = { 
      nik: nik || null, 
      name, 
      age: parseInt(age, 10), 
      gender, 
      address, 
      phone: phone || null, 
      pedukuhanId: pedukuhanId || null 
    };
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
    const { nik, name, age, gender, address, phone, pedukuhanId } = req.body;
    
    const data = {};
    if (nik !== undefined) data.nik = nik || null;
    if (name !== undefined) data.name = name;
    if (age !== undefined) data.age = parseInt(age, 10);
    if (gender !== undefined) data.gender = gender;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone || null;
    if (pedukuhanId !== undefined) data.pedukuhanId = pedukuhanId || null;

    const updatedPatient = await prisma.patient.update({
      where: { id: req.params.id },
      data
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

exports.getAllPedukuhans = async (req, res) => {
  try {
    const list = await prisma.pedukuhan.findMany({ orderBy: { name: 'asc' } });
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pedukuhans' });
  }
};
