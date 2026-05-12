/**
 * Centralized Health Logic for SI-WARAS
 * Defined medical thresholds and status categories
 */

const HEALTH_THRESHOLDS = {
  BLOOD_PRESSURE: {
    BAHAYA_SYS: 140,
    BAHAYA_DIA: 90,
    WASPADA_SYS: 120,
    WASPADA_DIA: 80,
  },
  BLOOD_SUGAR: {
    BAHAYA: 200,
    WASPADA: 140,
  },
  CHOLESTEROL: {
    BAHAYA: 200,
  },
  URIC_ACID: {
    MALE_BAHAYA: 7.0,
    FEMALE_BAHAYA: 6.0,
  }
};

const getBPStatus = (bp) => {
  if (!bp) return 'normal';
  const [sys, dia] = bp.split('/').map(Number);
  if (sys >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.BAHAYA_SYS || dia >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.BAHAYA_DIA) return 'bahaya';
  if (sys >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.WASPADA_SYS || dia >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.WASPADA_DIA) return 'waspada';
  return 'normal';
};

const getBSStatus = (bs) => {
  if (bs >= HEALTH_THRESHOLDS.BLOOD_SUGAR.BAHAYA) return 'bahaya';
  if (bs >= HEALTH_THRESHOLDS.BLOOD_SUGAR.WASPADA) return 'waspada';
  return 'normal';
};

const getCholesterolStatus = (chol) => {
  if (chol >= HEALTH_THRESHOLDS.CHOLESTEROL.BAHAYA) return 'bahaya';
  return 'normal';
};

const getUAStatus = (ua, gender) => {
  const threshold = gender === 'MALE' ? HEALTH_THRESHOLDS.URIC_ACID.MALE_BAHAYA : HEALTH_THRESHOLDS.URIC_ACID.FEMALE_BAHAYA;
  if (ua > threshold) return 'bahaya';
  if (ua > threshold - 1) return 'waspada';
  return 'normal';
};

const isRiskCase = (record, gender) => {
  const bpStatus = getBPStatus(record.bloodPressure);
  const bsStatus = getBSStatus(record.bloodSugar);
  const cholStatus = getCholesterolStatus(record.cholesterol);
  const uaStatus = getUAStatus(record.uricAcid, gender);

  return bpStatus === 'bahaya' || bsStatus === 'bahaya' || cholStatus === 'bahaya' || uaStatus === 'bahaya';
};

module.exports = {
  HEALTH_THRESHOLDS,
  getBPStatus,
  getBSStatus,
  getCholesterolStatus,
  getUAStatus,
  isRiskCase
};
