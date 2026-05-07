const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStats = async (req, res) => {
  try {
    const totalPatients = await prisma.patient.count();
    
    // In a real app we would write complex queries or use aggregations
    // For simplicity, we'll fetch all records and calculate stats
    const patients = await prisma.patient.findMany({
      include: {
        medicalRecords: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    let hypertensionCount = 0;
    let diabetesCount = 0;
    
    const dusunStats = {};

    patients.forEach(p => {
      // Area stats (assuming dusun name is part of address)
      const dusunMatch = p.address.match(/Dusun\s+([A-Za-z0-9]+)/i);
      const dusun = dusunMatch ? dusunMatch[0] : 'Unknown';
      dusunStats[dusun] = (dusunStats[dusun] || 0) + 1;

      // Disease stats based on latest record
      if (p.medicalRecords.length > 0) {
        const latest = p.medicalRecords[0];
        
        // Hypertension logic (systolic >= 140 or diastolic >= 90)
        const [sys, dia] = latest.bloodPressure.split('/').map(Number);
        if (sys >= 140 || dia >= 90) hypertensionCount++;

        // Diabetes logic (random blood sugar >= 200)
        if (latest.bloodSugar >= 200) diabetesCount++;
      }
    });

    res.json({
      totalPatients,
      ptmCases: {
        hypertension: hypertensionCount,
        diabetes: diabetesCount,
        other: totalPatients - (hypertensionCount + diabetesCount) // Simplified
      },
      areaStats: dusunStats
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
