const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getBPStatus, getBSStatus, getCholesterolStatus, getUAStatus } = require('../utils/healthLogic');

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
    let cholesterolCount = 0;
    let uricAcidCount = 0;
    let otherCasesCount = 0;
    
    const PADUKUHAN_LIST = [
      'Gluntung Kidul', 'Gumulan', 'Tegalsempu', 'Tunjungan', 'Krapakan', 
      'Samparan', 'Tegallayang 9', 'Tegallayang 10', 'Kuroboyo', 'Korowelang', 
      'Glagahan', 'Bogem', 'Banyuurip', 'Gluntung Lor'
    ];
    
    const dusunStats = {};
    PADUKUHAN_LIST.forEach(dusun => { dusunStats[dusun] = 0; });
    dusunStats['Lainnya'] = 0;

    patients.forEach(p => {
      // Area stats matching against exact padukuhan names
      let matchedDusun = 'Lainnya';
      for (const dusun of PADUKUHAN_LIST) {
        if (p.address && p.address.toLowerCase().includes(dusun.toLowerCase())) {
          matchedDusun = dusun;
          break;
        }
      }
      dusunStats[matchedDusun]++;

      // Disease stats based on latest record
      if (p.medicalRecords.length > 0) {
        const latest = p.medicalRecords[0];
        let hasPtm = false;
        
        if (getBPStatus(latest.bloodPressure) === 'bahaya') {
          hypertensionCount++;
          hasPtm = true;
        }

        if (getBSStatus(latest.bloodSugar) === 'bahaya') {
          diabetesCount++;
          hasPtm = true;
        }

        if (getCholesterolStatus(latest.cholesterol) === 'bahaya') {
          cholesterolCount++;
          hasPtm = true;
        }

        if (getUAStatus(latest.uricAcid, p.gender) === 'bahaya') {
          uricAcidCount++;
          hasPtm = true;
        }
        
        if (!hasPtm) {
          otherCasesCount++;
        }
      } else {
        otherCasesCount++;
      }
    });

    res.json({
      totalPatients,
      ptmCases: {
        hypertension: hypertensionCount,
        diabetes: diabetesCount,
        cholesterol: cholesterolCount,
        uricAcid: uricAcidCount,
        other: otherCasesCount
      },
      areaStats: dusunStats
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
