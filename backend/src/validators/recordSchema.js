const { z } = require('zod');

const medicalRecordSchema = z.object({
  patientId: z.string().uuid({ message: "Invalid Patient ID" }),
  date: z.string().optional().or(z.date().optional()),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, {
    message: "Blood pressure must be in format like '120/80'"
  }),
  bloodSugar: z.preprocess((val) => parseFloat(val), z.number().min(0, "Blood sugar cannot be negative")),
  cholesterol: z.preprocess((val) => parseFloat(val), z.number().min(0, "Cholesterol cannot be negative")),
  uricAcid: z.preprocess((val) => parseFloat(val), z.number().min(0, "Uric acid cannot be negative")),
  weight: z.preprocess((val) => parseFloat(val), z.number().positive("Weight must be positive")),
  height: z.preprocess((val) => parseFloat(val), z.number().positive("Height must be positive")),
  smokingStatus: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return Boolean(val);
  }, z.boolean()),
  activityLevel: z.enum(['LOW', 'MODERATE', 'HIGH'], {
    errorMap: () => ({ message: "Activity level must be LOW, MODERATE, or HIGH" })
  }),
  notes: z.string().optional().nullable(),
});

module.exports = {
  medicalRecordSchema
};
