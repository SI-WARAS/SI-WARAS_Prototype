import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates a standard PDF header for SI-WARAS reports
 */
const addReportHeader = (doc, title) => {
  doc.setFontSize(22);
  doc.setTextColor(225, 29, 72); // Rose-600
  doc.text('SI-WARAS', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Sistem Informasi Desa Caturharjo', 14, 28);
  
  doc.setDrawColor(225, 29, 72);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);
  
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text(title, 14, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 52);
};

/**
 * Exports Dashboard Summary to PDF
 */
export const exportDashboardToPDF = (data) => {
  const { totalPatients, ptmCases, areaStats } = data;
  const doc = new jsPDF();
  
  addReportHeader(doc, 'Ringkasan Statistik Dashboard');
  
  // Stats Table
  doc.autoTable({
    startY: 60,
    head: [['Kategori', 'Jumlah']],
    body: [
      ['Total Pasien Terdaftar', totalPatients],
      ['Kasus Hipertensi', ptmCases.hypertension],
      ['Kasus Diabetes', ptmCases.diabetes],
      ['Peringatan Risiko Tinggi', ptmCases.hypertension + ptmCases.diabetes],
    ],
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72] }
  });
  
  // Territory Stats Table
  doc.text('Distribusi Pasien Per Wilayah', 14, doc.lastAutoTable.finalY + 15);
  
  const territoryBody = Object.entries(areaStats).map(([name, count]) => [name, count]);
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Nama Pedukuhan', 'Jumlah Pasien']],
    body: territoryBody,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105] }
  });
  
  doc.save(`SIWARAS_Dashboard_Summary_${new Date().getTime()}.pdf`);
};

/**
 * Exports Patients List to PDF
 */
export const exportPatientsToPDF = (patients) => {
  const doc = new jsPDF();
  addReportHeader(doc, 'Daftar Direktori Pasien');
  
  const tableBody = patients.map(p => [
    p.name,
    p.age,
    p.gender === 'MALE' ? 'Laki-laki' : 'Perempuan',
    p.address,
    p.phone || '-'
  ]);
  
  doc.autoTable({
    startY: 60,
    head: [['Nama', 'Umur', 'J. Kelamin', 'Alamat', 'Telepon']],
    body: tableBody,
    headStyles: { fillColor: [225, 29, 72] }
  });
  
  doc.save(`SIWARAS_Daftar_Pasien_${new Date().getTime()}.pdf`);
};

/**
 * Exports Medical Records to PDF
 */
export const exportRecordsToPDF = (records) => {
  const doc = new jsPDF();
  addReportHeader(doc, 'Laporan Rekam Medis Pasien');
  
  const tableBody = records.map(r => [
    new Date(r.date).toLocaleDateString('id-ID'),
    r.patient?.name || 'N/A',
    r.bloodPressure,
    r.bloodSugar,
    r.cholesterol,
    r.weight
  ]);
  
  doc.autoTable({
    startY: 60,
    head: [['Tanggal', 'Nama Pasien', 'Tensi', 'Gula', 'Kolest.', 'Berat']],
    body: tableBody,
    headStyles: { fillColor: [16, 185, 129] } // Emerald-500
  });
  
  doc.save(`SIWARAS_Rekam_Medis_${new Date().getTime()}.pdf`);
};
