import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, LineChart, FileText, Users, ArrowRight, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

const fetchPublicStats = async () => {
  const { data } = await api.get('/dashboard/public-stats');
  return data;
};

const Landing = () => {
  const { data: stats } = useQuery({
    queryKey: ['publicDashboardStats'],
    queryFn: fetchPublicStats,
  });

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-[#2d2a26] overflow-x-hidden selection:bg-brand-light selection:text-brand-primary">

      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-brand-primary p-2 rounded-xl text-brand-light">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-primary">SI-WARAS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold tracking-wide uppercase">
          <a href="#tentang" className="hover:text-brand-primary transition-colors">Tentang</a>
          <a href="#fitur" className="hover:text-brand-primary transition-colors">Fitur</a>
          <a href="#statistik" className="hover:text-brand-primary transition-colors">Statistik</a>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-2 bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-light px-6 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-wider transition-all duration-300"
        >
          Masuk <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <h1 className="text-5xl md:text-7xl font-serif text-brand-primary leading-[1.1] tracking-tight mb-6">
            Sistem Informasi <br />
            <span className="italic text-[#2d2a26]">Warasing</span> Desa
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
            Platform modern untuk monitoring penyakit tidak menular (PTM) dan rekam medis pasien di tingkat desa. Menciptakan lingkungan yang lebih sehat untuk generasi mendatang.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="bg-brand-primary text-brand-light px-8 py-4 rounded-full text-[14px] font-bold uppercase tracking-wider hover:shadow-[0_8px_30px_rgb(158,31,99,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              Masuk Dashboard
            </Link>
            <a
              href="#tentang"
              className="px-8 py-4 rounded-full text-[14px] font-bold uppercase tracking-wider text-brand-primary hover:bg-brand-light transition-all duration-300"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative"
        >
          {/* Aesthetic Dashboard Pratinjau Element */}
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative z-10 border border-brand-light">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-brand-primary uppercase bg-brand-light px-3 py-1 rounded-full">Pratinjau</div>
            </div>
            <div className="space-y-4">
              <div className="h-24 bg-brand-bg rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kasus Hipertensi</div>
                  <div className="text-3xl font-serif text-brand-primary">
                    {stats?.ptmCases?.hypertension !== undefined ? stats.ptmCases.hypertension : '...'}
                  </div>
                </div>
                <HeartPulse className="w-8 h-8 text-brand-primary opacity-20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-brand-light/30 rounded-2xl p-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pasien Aktif</div>
                  <div className="w-full h-12 bg-brand-primary/10 rounded-xl mt-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-2/3 bg-brand-primary rounded-xl"></div>
                  </div>
                </div>
                <div className="h-32 bg-brand-bg rounded-2xl p-4 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Laporan</div>
                  <FileText className="w-6 h-6 text-brand-primary" />
                </div>
              </div>
            </div>
          </div>
          {/* Decorative background shapes */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-light rounded-full blur-3xl opacity-50 z-0"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-primary rounded-full blur-3xl opacity-10 z-0"></div>
        </motion.div>
      </section>

      {/* Tentang Sistem */}
      <section id="tentang" className="py-24 bg-white px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4">Tentang Sistem</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-slate-800 leading-tight mb-6">
              Membangun Ekosistem <br /><span className="italic text-brand-primary">Kesehatan yang Presisi</span>
            </h3>
          </div>
          <div className="flex-1">
            <p className="text-slate-600 leading-relaxed mb-6">
              Di SI-WARAS, kami berdedikasi untuk merancang sistem pemantauan kesehatan desa yang terpadu. Kami percaya bahwa pencegahan PTM (Penyakit Tidak Menular) dimulai dari pencatatan yang rapi, pemantauan aktif, dan integrasi data antara pasien dan petugas kesehatan.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Sistem ini dirancang khusus untuk memfasilitasi kebutuhan desa dengan antarmuka yang elegan, mudah digunakan, dan dapat diakses dari berbagai perangkat.
            </p>
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section id="fitur" className="py-32 bg-brand-primary text-brand-light px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-light opacity-5 blur-3xl rounded-full translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand-light mb-4">Fitur Utama</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-white">Fasilitas Pemantauan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: HeartPulse, title: 'Monitoring PTM', desc: 'Pemantauan berkala pasien Hipertensi, Diabetes, dan Kolesterol.' },
              { icon: LineChart, title: 'Grafik Kesehatan', desc: 'Visualisasi pertumbuhan pasien dan distribusi penyakit wilayah.' },
              { icon: FileText, title: 'Riwayat Pasien', desc: 'Penyimpanan digital rekam medis terpusat dan aman.' },
              { icon: Activity, title: 'Dashboard Statistik', desc: 'Ringkasan data realtime untuk pengambilan keputusan.' },
              { icon: Users, title: 'Multi-Role System', desc: 'Akses khusus untuk Admin, Petugas, dan Kepala Desa.' },
              { icon: ShieldCheck, title: 'Privasi Terjamin', desc: 'Keamanan data setara standar fasilitas pelayanan kesehatan.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 p-8 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                <div className="bg-brand-light w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-white/70 leading-relaxed text-[14px]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistik Section */}
      <section id="statistik" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { value: stats?.totalPatients !== undefined ? stats.totalPatients : '...', label: 'Total Pasien' },
            { value: stats?.ptmCases?.hypertension !== undefined ? stats.ptmCases.hypertension : '...', label: 'Kasus Hipertensi' },
            { value: stats?.ptmCases?.diabetes !== undefined ? stats.ptmCases.diabetes : '...', label: 'Kasus Diabetes' },
            { value: stats?.areaStats ? Object.keys(stats.areaStats).filter(k => k !== 'Lainnya' && stats.areaStats[k] > 0).length : '...', label: 'Dusun Terpantau' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-serif text-brand-primary mb-2">{stat.value}</div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 px-8 border-t border-brand-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-brand-primary p-2 rounded-xl text-brand-light">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight text-brand-primary">SI-WARAS</span>
            </div>
            <p className="text-slate-500 text-[14px] leading-relaxed">
              Menciptakan ruang hidup yang lebih sehat dengan pemantauan medis minimalis dan dampak lingkungan yang ramah, mewujudkan desa hijau satu langkah pada satu waktu.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-6">Navigasi</h4>
              <ul className="space-y-4 text-[14px] text-slate-500">
                <li><a href="#tentang" className="hover:text-brand-primary transition-colors">Tentang Sistem</a></li>
                <li><a href="#fitur" className="hover:text-brand-primary transition-colors">Fitur Utama</a></li>
                <li><a href="#statistik" className="hover:text-brand-primary transition-colors">Statistik Desa</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-6">Kontak</h4>
              <ul className="space-y-4 text-[14px] text-slate-500">
                <li>PPK Ormawa IMM FKM 2026</li>
                <li>Email: hello@siwaras.desa.id</li>
                <li>Telp: (0274) 123456</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-slate-400 font-medium">
          <p>&copy; 2026 SI-WARAS. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-1">
            Dikembangkan oleh <HeartPulse className="w-3 h-3 text-brand-primary" /> PPK Ormawa IMM FKM 2026.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
