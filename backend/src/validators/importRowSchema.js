const { z } = require('zod');

const importRowSchema = z.object({
  name: z.string({ required_error: "Nama pasien wajib diisi" }).min(1, "Nama pasien tidak boleh kosong"),
  nik: z.string({ required_error: "NIK wajib diisi" }).regex(/^\d{16}$/, "NIK harus terdiri dari 16 digit angka"),
  age: z.preprocess((val) => parseInt(val, 10), z.number().int().positive("Umur harus berupa angka positif")),
  gender: z.enum(['MALE', 'FEMALE'], {
    errorMap: () => ({ message: "Jenis kelamin harus MALE atau FEMALE" })
  }),
  address: z.string({ required_error: "Alamat wajib diisi" }).min(1, "Alamat tidak boleh kosong"),
  phone: z.preprocess((val) => val ? String(val) : null, z.string().nullable().optional()),
  pedukuhanName: z.string({ required_error: "Nama pedukuhan wajib diisi" }).min(1, "Nama pedukuhan tidak boleh kosong"),
  
  date: z.preprocess((val) => {
    if (!val) return new Date();
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, z.date().optional()),
  
  bloodPressure: z.string({ required_error: "Tekanan darah wajib diisi" }).regex(/^\d{2,3}\/\d{2,3}$/, {
    message: "Tekanan darah harus berformat sistolik/diastolik (contoh: '120/80')"
  }),
  bloodSugar: z.preprocess((val) => parseFloat(val), z.number().min(0, "Gula darah tidak boleh negatif")),
  cholesterol: z.preprocess((val) => parseFloat(val), z.number().min(0, "Kolesterol tidak boleh negatif")),
  uricAcid: z.preprocess((val) => parseFloat(val), z.number().min(0, "Asam urat tidak boleh negatif")),
  weight: z.preprocess((val) => parseFloat(val), z.number().positive("Berat badan harus berupa angka positif")),
  height: z.preprocess((val) => parseFloat(val), z.number().positive("Tinggi badan harus berupa angka positif")),
  smokingStatus: z.preprocess((val) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      return lower === 'true' || lower === 'ya' || lower === '1' || lower === 'yes';
    }
    if (typeof val === 'number') return val === 1;
    return Boolean(val);
  }, z.boolean()),
  activityLevel: z.enum(['LOW', 'MODERATE', 'HIGH'], {
    errorMap: () => ({ message: "Tingkat aktivitas harus LOW, MODERATE, atau HIGH" })
  }),
  notes: z.preprocess((val) => val ? String(val) : null, z.string().nullable().optional())
});

module.exports = {
  importRowSchema
};
