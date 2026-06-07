const { prisma } = require('../utils/db');
const xlsx = require('xlsx');
const { importRowSchema } = require('../validators/importRowSchema');
const { medicalRecordSchema } = require('../validators/recordSchema');
const { getBPStatus, getBSStatus, getCholesterolStatus, getUAStatus, isRiskCase } = require('../utils/healthLogic');

// Helper to calculate record metrics
const computeMetrics = (recordData, gender) => {
  const weight = parseFloat(recordData.weight);
  const height = parseFloat(recordData.height);
  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(2));

  const bpStatus = getBPStatus(recordData.bloodPressure);
  const bsStatus = getBSStatus(recordData.bloodSugar);
  const cholStatus = getCholesterolStatus(recordData.cholesterol);
  const uaStatus = getUAStatus(recordData.uricAcid, gender);
  
  const isRisk = bpStatus === 'bahaya' || bsStatus === 'bahaya' || cholStatus === 'bahaya' || uaStatus === 'bahaya';

  return {
    bmi,
    bloodPressureStatus: bpStatus,
    bloodSugarStatus: bsStatus,
    cholesterolStatus: cholStatus,
    uricAcidStatus: uaStatus,
    isRisk
  };
};

exports.getAllRecords = async (req, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      orderBy: { date: 'desc' },
      include: { 
        patient: { 
          select: { 
            name: true, 
            gender: true,
            pedukuhan: { select: { name: true } }
          } 
        } 
      }
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
      include: { patient: { select: { name: true, gender: true } } }
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
    const validatedData = medicalRecordSchema.parse(req.body);

    // Fetch patient to check gender
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const metrics = computeMetrics(validatedData, patient.gender);

    const data = {
      patientId: validatedData.patientId,
      bloodPressure: validatedData.bloodPressure,
      bloodSugar: parseFloat(validatedData.bloodSugar),
      cholesterol: parseFloat(validatedData.cholesterol),
      uricAcid: parseFloat(validatedData.uricAcid),
      weight: parseFloat(validatedData.weight),
      height: parseFloat(validatedData.height),
      smokingStatus: validatedData.smokingStatus,
      activityLevel: validatedData.activityLevel,
      notes: validatedData.notes,
      ...metrics
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
    const validatedData = medicalRecordSchema.partial().parse(req.body);

    const record = await prisma.medicalRecord.findUnique({
      where: { id: req.params.id },
      include: { patient: true }
    });
    if (!record) return res.status(404).json({ error: 'Medical record not found' });

    const merged = { ...record, ...validatedData };
    const metrics = computeMetrics(merged, record.patient.gender);

    const { date, ...rest } = validatedData;
    const data = { 
      ...rest,
      ...metrics
    };
    
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

// POST /api/medis/import
exports.importRecords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an Excel file (.xlsx or .xls)' });
    }

    // Read workbook from buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet);

    if (rawData.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    // Load active pedukuhans for mapping validation
    const pedukuhans = await prisma.pedukuhan.findMany();
    const pedukuhanMap = new Map(pedukuhans.map(p => [p.name.toLowerCase().trim(), p.id]));

    const rowErrors = [];
    const validatedRows = [];

    // First Pass: Validate Zod and regional constraints for ALL rows
    rawData.forEach((row, index) => {
      const rowIndex = index + 2; // Row 1 is header, index 0 is Row 2
      
      try {
        const validated = importRowSchema.parse(row);
        
        // Validate pedukuhan
        const pedNameLower = validated.pedukuhanName.toLowerCase().trim();
        if (!pedukuhanMap.has(pedNameLower)) {
          throw new Error(`Pedukuhan '${validated.pedukuhanName}' tidak terdaftar di sistem`);
        }
        
        const pedukuhanId = pedukuhanMap.get(pedNameLower);
        
        // Multi-tenant check: if non-admin, must match their assigned pedukuhan
        if (req.user.role !== 'ADMIN' && req.user.role !== 'VILLAGE_HEAD') {
          if (pedukuhanId !== req.user.pedukuhanId) {
            throw new Error(`Anda tidak diijinkan memasukkan data untuk wilayah Pedukuhan '${validated.pedukuhanName}'`);
          }
        }

        validatedRows.push({
          ...validated,
          pedukuhanId
        });
      } catch (err) {
        let errorMessages = [];
        if (err.name === 'ZodError') {
          errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        } else {
          errorMessages = [err.message];
        }
        rowErrors.push({
          row: rowIndex,
          errors: errorMessages
        });
      }
    });

    // If there are validation failures, ABORT and return error lists without inserting anything
    if (rowErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Proses import dibatalkan karena kesalahan validasi data.',
        details: rowErrors 
      });
    }

    // Second Pass: Atomic Transaction
    await prisma.$transaction(async (tx) => {
      for (const row of validatedRows) {
        // Find or create patient by NIK
        let patient = await tx.patient.findUnique({
          where: { nik: row.nik }
        });

        if (patient) {
          // Update patient info if details changed
          patient = await tx.patient.update({
            where: { id: patient.id },
            data: {
              name: row.name,
              age: row.age,
              gender: row.gender,
              address: row.address,
              phone: row.phone,
              pedukuhanId: row.pedukuhanId
            }
          });
        } else {
          // Register new patient
          patient = await tx.patient.create({
            data: {
              nik: row.nik,
              name: row.name,
              age: row.age,
              gender: row.gender,
              address: row.address,
              phone: row.phone,
              pedukuhanId: row.pedukuhanId
            }
          });
        }

        // Compute metrics
        const metrics = computeMetrics(row, patient.gender);

        // Record entry
        await tx.medicalRecord.create({
          data: {
            patientId: patient.id,
            date: row.date,
            bloodPressure: row.bloodPressure,
            bloodSugar: parseFloat(row.bloodSugar),
            cholesterol: parseFloat(row.cholesterol),
            uricAcid: parseFloat(row.uricAcid),
            weight: parseFloat(row.weight),
            height: parseFloat(row.height),
            smokingStatus: row.smokingStatus,
            activityLevel: row.activityLevel,
            notes: row.notes,
            ...metrics
          }
        });
      }
    });

    res.json({ message: `Berhasil mengimpor ${validatedRows.length} data rekam medis secara sukses.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error during spreadsheet processing.' });
  }
};

// POST /api/records/export
exports.exportRecords = async (req, res) => {
  try {
    const { fields, filters } = req.body;

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: 'Tentukan minimal satu field yang akan diekspor.' });
    }

    // Build Prisma query selection dynamically
    const selectClause = {
      id: true,
      date: true
    };
    
    let includePatient = false;
    const patientSelect = { id: true };
    let includePedukuhan = false;

    fields.forEach(field => {
      // Patient columns
      if (field === 'nama') {
        includePatient = true;
        patientSelect.name = true;
      } else if (field === 'nik') {
        includePatient = true;
        patientSelect.nik = true;
      } else if (field === 'umur') {
        includePatient = true;
        patientSelect.age = true;
      } else if (field === 'gender') {
        includePatient = true;
        patientSelect.gender = true;
      } else if (field === 'alamat') {
        includePatient = true;
        patientSelect.address = true;
      } else if (field === 'telepon') {
        includePatient = true;
        patientSelect.phone = true;
      } else if (field === 'pedukuhan') {
        includePatient = true;
        includePedukuhan = true;
      } 
      // Medical Record columns
      else if (field === 'bloodPressure') {
        selectClause.bloodPressure = true;
        selectClause.bloodPressureStatus = true;
      } else if (field === 'bloodSugar') {
        selectClause.bloodSugar = true;
        selectClause.bloodSugarStatus = true;
      } else if (field === 'cholesterol') {
        selectClause.cholesterol = true;
        selectClause.cholesterolStatus = true;
      } else if (field === 'uricAcid') {
        selectClause.uricAcid = true;
        selectClause.uricAcidStatus = true;
      } else if (field === 'weight') {
        selectClause.weight = true;
      } else if (field === 'height') {
        selectClause.height = true;
      } else if (field === 'bmi') {
        selectClause.bmi = true;
      } else if (field === 'smokingStatus') {
        selectClause.smokingStatus = true;
      } else if (field === 'activityLevel') {
        selectClause.activityLevel = true;
      } else if (field === 'notes') {
        selectClause.notes = true;
      } else if (field === 'isRisk') {
        selectClause.isRisk = true;
      }
    });

    if (includePatient) {
      if (includePedukuhan) {
        patientSelect.pedukuhan = { select: { name: true } };
      }
      selectClause.patient = { select: patientSelect };
    }

    // Build filter clause
    const filterClause = {};
    if (filters) {
      const { startDate, endDate, pedukuhanId } = filters;
      
      if (startDate || endDate) {
        filterClause.date = {};
        if (startDate) filterClause.date.gte = new Date(startDate);
        if (endDate) filterClause.date.lte = new Date(endDate);
      }

      // If pedukuhanId is provided (only admins can select custom ones, but security scoping is applied automatically)
      if (pedukuhanId) {
        filterClause.patient = filterClause.patient || {};
        filterClause.patient.pedukuhanId = pedukuhanId;
      }
    }

    const records = await prisma.medicalRecord.findMany({
      where: filterClause,
      select: selectClause,
      orderBy: { date: 'desc' }
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to query custom data export.' });
  }
};
