/**
 * Centralized Health Logic for SI-WARAS (Frontend)
 * Defined medical thresholds and status categories
 */

export const HEALTH_THRESHOLDS = {
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

export const getBPStatus = (bp) => {
  if (!bp) return 'normal';
  const parts = bp.split('/');
  if (parts.length !== 2) return 'normal';
  const sys = parseInt(parts[0]);
  const dia = parseInt(parts[1]);
  
  if (sys >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.BAHAYA_SYS || dia >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.BAHAYA_DIA) return 'bahaya';
  if (sys >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.WASPADA_SYS || dia >= HEALTH_THRESHOLDS.BLOOD_PRESSURE.WASPADA_DIA) return 'waspada';
  return 'normal';
};

export const getBSStatus = (bs) => {
  const val = parseFloat(bs);
  if (val >= HEALTH_THRESHOLDS.BLOOD_SUGAR.BAHAYA) return 'bahaya';
  if (val >= HEALTH_THRESHOLDS.BLOOD_SUGAR.WASPADA) return 'waspada';
  return 'normal';
};

export const getCholesterolStatus = (chol) => {
  const val = parseFloat(chol);
  if (val >= HEALTH_THRESHOLDS.CHOLESTEROL.BAHAYA) return 'bahaya';
  return 'normal';
};

export const getUAStatus = (ua, gender) => {
  const val = parseFloat(ua);
  const threshold = gender === 'MALE' ? HEALTH_THRESHOLDS.URIC_ACID.MALE_BAHAYA : HEALTH_THRESHOLDS.URIC_ACID.FEMALE_BAHAYA;
  if (val > threshold) return 'bahaya';
  if (val > threshold - 1) return 'waspada';
  return 'normal';
};

export const isRiskCase = (record, gender) => {
  const bpStatus = getBPStatus(record.bloodPressure);
  const bsStatus = getBSStatus(record.bloodSugar);
  const cholStatus = getCholesterolStatus(record.cholesterol);
  const uaStatus = getUAStatus(record.uricAcid, gender);

  return bpStatus === 'bahaya' || bsStatus === 'bahaya' || cholStatus === 'bahaya' || uaStatus === 'bahaya';
};
