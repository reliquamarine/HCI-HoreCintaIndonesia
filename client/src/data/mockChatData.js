export const MOCK_SCENARIOS = [
  {
    keywords: ['10.000', '10000', 'langkah', 'demensia', 'lancet', 'jalan kaki'],
    reply:
      'Penelitian berskala besar yang dipublikasikan pada 2022 menunjukkan bahwa berjalan kaki sekitar **9.800 hingga 10.000 langkah per hari** berkaitan dengan penurunan risiko demensia hingga sekitar **50%** dibandingkan orang dewasa yang kurang aktif [1].\n\nNamun, perlu dicatat bahwa manfaat perlindungan otak sudah mulai terlihat secara signifikan sejak **3.800 langkah per hari** dengan penurunan risiko sekitar 25%, dan hubungan yang ditemukan bersifat korelasional bukan jaminan mutlak pencegahan [2].',
    claims: [
      {
        id: 'claim_steps_1',
        index: 1,
        verdict: 'SUPPORTED',
        confidence: 0.82,
        statement:
          'Studi tahun 2022 menemukan bahwa berjalan sekitar 10.000 langkah per hari berkaitan dengan penurunan risiko demensia hingga 50%.',
        summary:
          'Berbagai sumber kesehatan kredibel merujuk studi kohort UK Biobank tahun 2022 yang melaporkan dosis optimal sekitar 9.800 langkah per hari dikaitkan dengan penurunan risiko demensia hingga 50%, sementara frasa hingga menunjukkan hubungan asosiatif bukan kepastian tunggal.',
        reasoning:
          '1) Data utama berasal dari studi observasional terhadap lebih dari 78.000 partisipan dewasa di Inggris (JAMA Neurology 2022) yang sering dikutip ulang oleh media kesehatan internasional. 2) Angka penurunan 50% merupakan batas atas pada kelompok paling aktif dibanding kelompok sedenter. 3) Kecepatan berjalan yang lebih intens turut memperkuat efek penurunan risiko.',
        keySources: [
          {
            title:
              'Alzheimer Research Information: Jumlah Langkah Harian untuk Menekan Risiko Demensia',
            url: 'https://www.alzinfo.org/articles/prevention/walk-this-many-steps-a-day-to-halve-your-dementia-risk/',
          },
          {
            title:
              'JAMA Neurology: Association of Daily Step Count and Intensity With Incident Dementia',
            url: 'https://jamanetwork.com/journals/jamaneurology/fullarticle/2795819',
          },
          {
            title:
              'National Institutes of Health: Aktivitas Fisik Harian dan Kesehatan Kognitif',
            url: 'https://www.nih.gov/news-events/nih-research-matters',
          },
        ],
        evidence: [
          {
            id: 'ev_steps_1',
            sourceType: 'WEB_SEARCH',
            stance: 'SUPPORTS',
            credibility: 0.78,
            relevance: 0.92,
            title:
              'Walk This Many Steps a Day to Halve Your Dementia Risk',
            url: 'https://www.alzinfo.org/articles/prevention/walk-this-many-steps-a-day-to-halve-your-dementia-risk/',
            snippet:
              'Studi tersebut menemukan bahwa berjalan sekitar 9.800 hingga 10.000 langkah per hari merupakan dosis optimal yang berkaitan dengan penurunan risiko demensia hingga 50 persen.',
          },
          {
            id: 'ev_steps_2',
            sourceType: 'JOURNAL',
            stance: 'SUPPORTS',
            credibility: 0.94,
            relevance: 0.95,
            title:
              'Association of Daily Step Count and Intensity With Incident Dementia in UK Adults',
            url: 'https://jamanetwork.com/journals/jamaneurology/fullarticle/2795819',
            snippet:
              'Pada 78.430 partisipan berusia 40 hingga 79 tahun yang diikuti selama rata-rata 6,9 tahun, target 9.826 langkah per hari menunjukkan penurunan insiden demensia terbesar.',
          },
          {
            id: 'ev_steps_3',
            sourceType: 'WEB_SEARCH',
            stance: 'NEUTRAL',
            credibility: 0.81,
            relevance: 0.79,
            title:
              'Berjalan Beberapa Ribu Langkah Sehari Membantu Menjaga Daya Ingat',
            url: 'https://www.nytimes.com/well/mind/dementia-steps-study',
            snippet:
              'Para peneliti menekankan bahwa desain studi observasional tidak dapat membuktikan sebab akibat secara langsung karena faktor pola makan dan tidur juga berperan.',
          },
        ],
      },
      {
        id: 'claim_steps_2',
        index: 2,
        verdict: 'PARTIAL',
        confidence: 0.74,
        statement:
          'Berjalan 3.800 langkah per hari sudah memberikan penurunan risiko demensia sekitar 25%, namun bukti bersifat asosiatif.',
        summary:
          'Angka 3.800 langkah memang tercatat sebagai dosis minimal efektif dalam studi yang sama, tetapi hasil pada populasi lain dapat bervariasi tergantung usia, riwayat genetik, dan intensitas jalan kaki.',
        reasoning:
          '1) Dosis minimal 3.826 langkah per hari dilaporkan menurunkan risiko sekitar 25% pada sampel UK Biobank. 2) Sebagian besar peserta studi berasal dari populasi Eropa berkulit putih sehingga generalisasi langsung ke seluruh populasi global perlu ditafsirkan hati-hati. 3) Oleh karena itu status klaim ditetapkan sebagai Sebagian Didukung.',
        keySources: [
          {
            title:
              'WHO Guidelines on Risk Reduction of Cognitive Decline and Dementia',
            url: 'https://www.who.int/publications/i/item/9789241550543',
          },
          {
            title:
              'University of Sydney: Ringkasan Studi Langkah Harian dan Demensia',
            url: 'https://www.sydney.edu.au/news-opinion/news/2022/09/07/10000-steps-a-day-linked-to-lower-dementia-risk.html',
          },
        ],
        evidence: [
          {
            id: 'ev_steps_4',
            sourceType: 'OFFICIAL',
            stance: 'SUPPORTS',
            credibility: 0.88,
            relevance: 0.87,
            title:
              'Ringkasan Studi Universitas Sydney Mengenai Target Langkah Harian',
            url: 'https://www.sydney.edu.au/news-opinion/news/2022/09/07/10000-steps-a-day-linked-to-lower-dementia-risk.html',
            snippet:
              'Bagi individu yang belum terbiasa aktif, mencapai sekitar 3.800 langkah per hari saja sudah berasosiasi dengan penurunan risiko demensia sebesar 25 persen.',
          },
          {
            id: 'ev_steps_5',
            sourceType: 'OFFICIAL',
            stance: 'NEUTRAL',
            credibility: 0.93,
            relevance: 0.72,
            title:
              'WHO Guidelines on Risk Reduction of Cognitive Decline and Dementia',
            url: 'https://www.who.int/publications/i/item/9789241550543',
            snippet:
              'WHO merekomendasikan aktivitas fisik rutin bagi orang dewasa sebagai bagian dari pencegahan penurunan kognitif, dengan tingkat kepastian bukti sedang.',
          },
        ],
      },
    ],
    followUps: [
      'Apakah kecepatan jalan kaki lebih penting daripada jumlah langkah?',
      'Aktivitas fisik apa lagi yang terbukti menjaga kesehatan otak?',
    ],
  },
  {
    keywords: ['kendaraan listrik', 'mobil listrik', 'ev', 'emisi', 'mobil bensin', 'karbon'],
    reply:
      'Sepanjang seluruh siklus hidupnya (*lifecycle*), **kendaraan listrik baterai (BEV)** menghasilkan emisi gas rumah kaca yang **jauh lebih rendah dibandingkan mobil bensin**, umumnya 50% hingga 70% lebih rendah di banyak negara [1].\n\nMeskipun demikian, pada tahap **awal produksi baterai**, kendaraan listrik memang memiliki jejak karbon manufaktur lebih tinggi sehingga titik impas emisinya sangat dipengaruhi oleh bauran sumber listrik di negara tempat mobil tersebut diisi daya [2].',
    claims: [
      {
        id: 'claim_ev_1',
        index: 1,
        verdict: 'SUPPORTED',
        confidence: 0.89,
        statement:
          'Sepanjang masa pakainya, kendaraan listrik menghasilkan total emisi karbon yang jauh lebih rendah dibanding mobil bensin.',
        summary:
          'Analisis siklus hidup oleh lembaga energi dan transportasi global secara konsisten menunjukkan kendaraan listrik lebih rendah emisi karbon dibanding kendaraan pembakaran internal, bahkan saat masih memanfaatkan jaringan listrik campuran.',
        reasoning:
          '1) Perhitungan mencakup ekstraksi bahan baku, produksi baterai, perakitan, pemakaian energi selama berkendara, hingga daur ulang. 2) Efisiensi motor listrik mencapai 80% ke atas dibanding mesin bensin sekitar 25% hingga 35%. 3) Keunggulan emisi makin besar seiring bertambahnya porsi energi terbarukan di jaringan listrik.',
        keySources: [
          {
            title:
              'International Council on Clean Transportation: Global Lifecycle Emissions of Electric Cars',
            url: 'https://theicct.org/publication/a-global-comparison-of-the-life-cycle-greenhouse-gas-emissions-of-combustion-engine-and-electric-passenger-cars/',
          },
          {
            title:
              'International Energy Agency: Global EV Outlook dan Emisi Siklus Hidup',
            url: 'https://www.iea.org/reports/global-ev-outlook-2024',
          },
        ],
        evidence: [
          {
            id: 'ev_ev_1',
            sourceType: 'OFFICIAL',
            stance: 'SUPPORTS',
            credibility: 0.92,
            relevance: 0.94,
            title:
              'A Global Comparison of Life-Cycle Greenhouse Gas Emissions of Passenger Cars',
            url: 'https://theicct.org/publication/a-global-comparison-of-the-life-cycle-greenhouse-gas-emissions-of-combustion-engine-and-electric-passenger-cars/',
            snippet:
              'Kendaraan listrik baterai ukuran menengah yang terdaftar saat ini menghasilkan emisi siklus hidup 66 hingga 69 persen lebih rendah di Eropa dan 60 hingga 68 persen lebih rendah di Amerika Serikat.',
          },
          {
            id: 'ev_ev_2',
            sourceType: 'OFFICIAL',
            stance: 'SUPPORTS',
            credibility: 0.95,
            relevance: 0.89,
            title: 'IEA Global EV Outlook: Comparative Lifecycle Analysis',
            url: 'https://www.iea.org/reports/global-ev-outlook-2024',
            snippet:
              'Bahkan pada bauran listrik global saat ini, kendaraan listrik secara konsisten menghasilkan emisi kumulatif lebih rendah sepanjang usia operasionalnya.',
          },
        ],
      },
      {
        id: 'claim_ev_2',
        index: 2,
        verdict: 'PARTIAL',
        confidence: 0.76,
        statement:
          'Produksi baterai kendaraan listrik menghasilkan emisi awal lebih tinggi dan titik impas emisinya bergantung pada sumber listrik lokal.',
        summary:
          'Sumber sepakat bahwa pembuatan baterai menambah emisi di tahap pabrikasi, namun di negara yang masih didominasi pembangkit batu bara, waktu yang dibutuhkan untuk mencapai titik impas emisi menjadi lebih panjang.',
        reasoning:
          '1) Proses penambangan litium, nikel, dan perakitan sel baterai membutuhkan energi termal dan listrik yang besar. 2) Di wilayah dengan dominasi energi fosil seperti batu bara, keunggulan emisi kendaraan listrik tetap ada dalam jangka panjang tetapi selisihnya lebih kecil (sekitar 20% hingga 35%) dibanding negara berbasis energi terbarukan.',
        keySources: [
          {
            title:
              'MIT Climate Portal: Perbandingan Emisi Manufaktur Baterai EV dan Mobil Bensin',
            url: 'https://climate.mit.edu/ask-mit/are-electric-vehicles-definitely-better-climate-gas-powered-cars',
          },
          {
            title:
              'ESDM & IESR: Kajian Transisi Kendaraan Listrik pada Bauran Listrik Indonesia',
            url: 'https://iesr.or.id/pustaka/',
          },
        ],
        evidence: [
          {
            id: 'ev_ev_3',
            sourceType: 'WEB_SEARCH',
            stance: 'SUPPORTS',
            credibility: 0.91,
            relevance: 0.9,
            title:
              'MIT Climate Portal: Are Electric Vehicles Definitely Better for the Climate?',
            url: 'https://climate.mit.edu/ask-mit/are-electric-vehicles-definitely-better-climate-gas-powered-cars',
            snippet:
              'Pembuatan baterai menghasilkan emisi awal lebih besar dibanding produksi mobil bensin, namun selisih tersebut umumnya tertutup setelah kendaraan menempuh beberapa puluh ribu kilometer.',
          },
          {
            id: 'ev_ev_4',
            sourceType: 'WEB_SEARCH',
            stance: 'NEUTRAL',
            credibility: 0.8,
            relevance: 0.83,
            title:
              'Kajian IESR Mengenai Pengaruh Bauran Energi terhadap Emisi EV di Indonesia',
            url: 'https://iesr.or.id/pustaka/',
            snippet:
              'Dekarbonisasi jaringan listrik nasional sangat menentukan percepatan penurunan emisi bersih dari adopsi kendaraan listrik di Indonesia.',
          },
        ],
      },
    ],
    followUps: [
      'Berapa lama rata-rata usia pakai baterai mobil listrik?',
      'Bagaimana proses daur ulang baterai kendaraan listrik saat ini?',
    ],
  },
  {
    keywords: ['el nino', 'padi', 'panen', 'curah hujan', 'indonesia', 'pangan', 'bmkg'],
    reply:
      'Fenomena **El Nino** berdampak langsung terhadap penurunan curah hujan dan memanjangnya musim kemarau di sebagian besar wilayah Indonesia, terutama di Pulau Jawa, Bali, Nusa Tenggara, dan Sulawesi Selatan [1].\n\nDi sektor pangan, kondisi kering tersebut menyebabkan **pergeseran jadwal tanam dan penyusutan luas panen padi**, sehingga pemerintah dan lembaga statistik mencatat perlunya antisipasi penurunan produksi beras nasional selama periode puncak El Nino [2].',
    claims: [
      {
        id: 'claim_elnino_1',
        index: 1,
        verdict: 'SUPPORTED',
        confidence: 0.91,
        statement:
          'El Nino menurunkan curah hujan secara signifikan dan memperpanjang periode kemarau di sebagian besar wilayah Indonesia.',
        summary:
          'Laporan pemantauan iklim resmi dari BMKG secara konsisten mengonfirmasi bahwa fase El Nino menghambat pembentukan awan hujan di wilayah maritim Indonesia sehingga memicu kekeringan meteorologis.',
        reasoning:
          '1) Pemanasan suhu muka laut di Samudra Pasifik bagian tengah dan timur menggeser pola konveksi ke arah timur menjauhi Indonesia. 2) BMKG mencatat anomali curah hujan di bawah normal pada puncak kemarau di sebagian besar sentra pertanian nasional.',
        keySources: [
          {
            title: 'BMKG: Analisis Dinamika Atmosfer dan Dampak El Nino di Indonesia',
            url: 'https://www.bmkg.go.id/iklim/',
          },
          {
            title: 'NOAA Climate: Penjelasan Mekanisme Global El Nino',
            url: 'https://www.climate.gov/enso',
          },
        ],
        evidence: [
          {
            id: 'ev_elnino_1',
            sourceType: 'OFFICIAL',
            stance: 'SUPPORTS',
            credibility: 0.96,
            relevance: 0.95,
            title: 'BMKG: Informasi Iklim dan Pemantauan Fenomena El Nino',
            url: 'https://www.bmkg.go.id/iklim/',
            snippet:
              'Penguatan El Nino disertai Indian Ocean Dipole positif mengurangi pasokan uap air di wilayah Indonesia sehingga memicu penurunan curah hujan signifikan di Jawa, Bali, dan Nusa Tenggara.',
          },
          {
            id: 'ev_elnino_2',
            sourceType: 'OFFICIAL',
            stance: 'SUPPORTS',
            credibility: 0.94,
            relevance: 0.84,
            title: 'NOAA Climate: El Nino and Southern Oscillation Overview',
            url: 'https://www.climate.gov/enso',
            snippet:
              'Selama episode El Nino, wilayah Asia Tenggara dan Australia bagian utara cenderung mengalami kondisi jauh lebih kering dari rata-rata klimatologis.',
          },
        ],
      },
      {
        id: 'claim_elnino_2',
        index: 2,
        verdict: 'SUPPORTED',
        confidence: 0.86,
        statement:
          'Kondisi kering akibat El Nino menggeser musim tanam dan menurunkan luas panen padi nasional.',
        summary:
          'Data kerangka sampel area dari Badan Pusat Statistik menunjukkan berkurangnya luas panen padi dan mundurnya jadwal tanam pada tahun terjadinya El Nino kuat dibanding tahun iklim normal.',
        reasoning:
          '1) Lahan sawah tadah hujan sangat sensitif terhadap keterlambatan awal musim hujan. 2) Data BPS menunjukkan penurunan luas panen dan produksi gabah kering giling pada periode kemarau panjang akibat El Nino. 3) Dampak bervariasi antar daerah tergantung ketersediaan infrastruktur irigasi teknis.',
        keySources: [
          {
            title: 'BPS: Berita Resmi Statistik Luas Panen dan Produksi Padi Indonesia',
            url: 'https://www.bps.go.id/',
          },
          {
            title: 'Kementerian Pertanian: Mitigasi Kekeringan Sektor Pangan Nasional',
            url: 'https://pertanian.go.id/',
          },
        ],
        evidence: [
          {
            id: 'ev_elnino_3',
            sourceType: 'OFFICIAL',
            stance: 'SUPPORTS',
            credibility: 0.95,
            relevance: 0.93,
            title: 'Badan Pusat Statistik: Laporan Luas Panen dan Produksi Padi',
            url: 'https://www.bps.go.id/',
            snippet:
              'Kemarau panjang akibat fenomena El Nino menyebabkan pergeseran masa tanam di sentra padi utama serta menurunkan realisasi luas panen pada kuartal akhir.',
          },
          {
            id: 'ev_elnino_4',
            sourceType: 'OFFICIAL',
            stance: 'NEUTRAL',
            credibility: 0.87,
            relevance: 0.78,
            title: 'Kementerian Pertanian: Program Pompanisasi dan Varietas Tahan Kering',
            url: 'https://pertanian.go.id/',
            snippet:
              'Penggunaan benih varietas toleran kekeringan dan optimalisasi irigasi pompanisasi diterapkan untuk menahan penurunan produksi di lahan terdampak.',
          },
        ],
      },
    ],
    followUps: [
      'Apa perbedaan dampak El Nino dan La Nina di Indonesia?',
      'Langkah mitigasi apa yang efektif bagi petani sawah tadah hujan?',
    ],
  },
  {
    keywords: ['kopi', 'kafein', 'jantung', 'kardiovaskular'],
    reply:
      'Bagi sebagian besar orang dewasa sehat, konsumsi kopi dalam jumlah **moderat (sekitar 2 hingga 3 cangkir per hari)** umumnya aman dan dalam berbagai studi observasional justru dikaitkan dengan **penurunan risiko penyakit kardiovaskular** [1].\n\nSebaliknya, anggapan umum bahwa **minum kopi secara langsung memicu serangan jantung pada orang sehat tidak didukung bukti ilmiah kuat**, meskipun asupan kafein berlebihan atau kopi tinggi gula dan krimer tetap dapat meningkatkan tekanan darah sementara serta mengganggu kualitas tidur [2].',
    claims: [
      {
        id: 'claim_coffee_1',
        index: 1,
        verdict: 'SUPPORTED',
        confidence: 0.86,
        statement:
          'Konsumsi kopi moderat sekitar 2 hingga 3 cangkir per hari umumnya aman bagi orang dewasa sehat dan berkaitan dengan risiko kardiovaskular lebih rendah.',
        summary:
          'Studi kohort besar dan tinjauan kardiologi Eropa menunjukkan konsumsi kopi moderat tanpa tambahan gula berlebih berkaitan dengan angka kejadian penyakit jantung koroner dan mortalitas kardiovaskular yang lebih rendah.',
        reasoning:
          '1) Studi pada lebih dari 449.000 peserta di European Journal of Preventive Cardiology (2022) menemukan penurunan risiko aritmia dan penyakit kardiovaskular pada konsumsi 2 hingga 3 cangkir kopi per hari. 2) Kandungan antioksidan polifenol dalam kopi diduga berkontribusi pada kesehatan pembuluh darah.',
        keySources: [
          {
            title:
              'European Society of Cardiology: Konsumsi Kopi Moderat dan Umur Panjang',
            url: 'https://www.escardio.org/The-ESC/Press-Office/Press-releases/Coffee-drinking-is-associated-with-increased-longevity',
          },
          {
            title: 'American Heart Association: Panduan Konsumsi Kafein dan Kesehatan Jantung',
            url: 'https://www.heart.org/',
          },
        ],
        evidence: [
          {
            id: 'ev_coffee_1',
            sourceType: 'JOURNAL',
            stance: 'SUPPORTS',
            credibility: 0.94,
            relevance: 0.93,
            title:
              'European Society of Cardiology: Coffee Drinking and Cardiovascular Health',
            url: 'https://www.escardio.org/The-ESC/Press-Office/Press-releases/Coffee-drinking-is-associated-with-increased-longevity',
            snippet:
              'Konsumsi dua hingga tiga cangkir kopi per hari dikaitkan dengan penurunan risiko penyakit kardiovaskular dan kematian dini dibandingkan mereka yang tidak minum kopi.',
          },
          {
            id: 'ev_coffee_2',
            sourceType: 'OFFICIAL',
            stance: 'SUPPORTS',
            credibility: 0.92,
            relevance: 0.85,
            title: 'FDA: Batas Aman Asupan Kafein Harian Orang Dewasa',
            url: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much',
            snippet:
              'Bagi orang dewasa sehat, asupan kafein hingga 400 miligram per hari atau sekitar tiga hingga empat cangkir kopi seduh umumnya tidak menimbulkan efek berbahaya.',
          },
        ],
      },
      {
        id: 'claim_coffee_2',
        index: 2,
        verdict: 'CONTRADICTED',
        confidence: 0.81,
        statement:
          'Klaim populer bahwa minum kopi rutin secara langsung menyebabkan serangan jantung pada orang sehat.',
        summary:
          'Bukti klinis membantah klaim bahwa kopi rutin memicu serangan jantung pada individu sehat. Kafein memang dapat menaikkan tekanan darah sesaat, tetapi pada peminum rutin efek tersebut cepat beradaptasi kecuali bila dikonsumsi berlebihan pada penderita hipertensi berat.',
        reasoning:
          '1) Meta-analisis epidemiologi tidak menemukan peningkatan risiko infark miokard akibat konsumsi kopi moderat pada populasi sehat. 2) Catatan klinis khusus berlaku bagi penderita hipertensi berat derajat 2 ke atas yang mengonsumsi lebih dari 2 cangkir kopi berkafein tinggi per hari. 3) Oleh sebab itu klaim umum bahwa kopi menyebabkan serangan jantung berstatus Bertentangan dengan konsensus bukti.',
        keySources: [
          {
            title:
              'Johns Hopkins Medicine: Fakta Ilmiah di Balik Konsumsi Kopi bagi Kesehatan',
            url: 'https://www.hopkinsmedicine.org/health/wellness-and-prevention/9-reasons-why-the-right-amount-of-coffee-is-good-for-you',
          },
          {
            title:
              'Journal of the American Heart Association: Kopi pada Penderita Hipertensi Berat',
            url: 'https://www.ahajournals.org/',
          },
        ],
        evidence: [
          {
            id: 'ev_coffee_3',
            sourceType: 'WEB_SEARCH',
            stance: 'CONTRADICTS',
            credibility: 0.91,
            relevance: 0.92,
            title:
              'Johns Hopkins Medicine: Manfaat dan Keamanan Kopi bagi Jantung',
            url: 'https://www.hopkinsmedicine.org/health/wellness-and-prevention/9-reasons-why-the-right-amount-of-coffee-is-good-for-you',
            snippet:
              'Minum satu hingga dua cangkir kopi sehari tidak memicu serangan jantung pada orang sehat dan justru berkorelasi dengan risiko gagal jantung yang lebih rendah.',
          },
          {
            id: 'ev_coffee_4',
            sourceType: 'JOURNAL',
            stance: 'NEUTRAL',
            credibility: 0.89,
            relevance: 0.82,
            title:
              'JAHA Study: Heavy Coffee Consumption and Severe Hypertension Caution',
            url: 'https://www.ahajournals.org/',
            snippet:
              'Kewaspadaan khusus dianjurkan bagi penderita hipertensi berat dengan tekanan darah 160/100 mmHg atau lebih saat mengonsumsi lebih dari dua cangkir kopi berkafein tinggi setiap hari.',
          },
        ],
      },
    ],
    followUps: [
      'Apakah kopi tanpa kafein (decaf) memberi manfaat yang sama?',
      'Kapan waktu terbaik minum kopi agar tidak mengganggu tidur?',
    ],
  },
]

export function buildFallbackScenario(query) {
  const cleanQuery = query.trim()
  return {
    reply:
      `Berdasarkan penelusuran awal untuk pertanyaan **"${cleanQuery}"**, jawaban yang akurat perlu memisahkan antara fakta utama yang sudah memiliki konsensus rujukan terbuka [1] serta detail kontekstual yang masih memerlukan verifikasi lanjutan saat terhubung ke mesin pencari LLM langsung [2].\n\nSaat ini FritoGrafi berjalan dalam **mode simulasi UI frontend**. Setelah backend LLM dengan pencarian web dihubungkan ke endpoint \`/api/chat\`, bagian Ringkasan Klaim di bawah akan terisi otomatis dari hasil penelusuran langsung.`,
    claims: [
      {
        id: `claim_gen_1_${Date.now()}`,
        index: 1,
        verdict: 'SUPPORTED',
        confidence: 0.79,
        statement: `Inti informasi mengenai "${cleanQuery.slice(0, 90)}" dapat diverifikasi melalui pemecahan klaim dan rujukan sumber terbuka.`,
        summary:
          'Pada arsitektur FritoGrafi, setiap pernyataan faktual dalam jawaban AI diekstraksi menjadi klaim terpisah agar pengguna dapat mengecek tingkat keyakinan dan sumber aslinya.',
        reasoning:
          '1) Pipeline backend memecah teks jawaban LLM menjadi daftar klaim atomik. 2) Setiap klaim dicocokkan dengan hasil pencarian web untuk menghitung skor Kredibilitas, Relevansi, dan Sikap (Mendukung, Netral, atau Membantah). 3) Tampilan ini mensimulasikan kontrak data yang sama persis dengan integrasi produksi.',
        keySources: [
          {
            title: 'Dokumentasi Arsitektur Verifikasi Klaim FritoGrafi',
            url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
          },
        ],
        evidence: [
          {
            id: `ev_gen_1_${Date.now()}`,
            sourceType: 'WEB_SEARCH',
            stance: 'SUPPORTS',
            credibility: 0.84,
            relevance: 0.88,
            title: 'Prinsip Transparansi Sumber pada Antarmuka Percakapan AI',
            url: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
            snippet:
              'Menampilkan dasar rujukan secara eksplisit di samping klaim sistem membantu pengguna menilai keakuratan informasi dan membangun kepercayaan secara objektif.',
          },
        ],
      },
      {
        id: `claim_gen_2_${Date.now()}`,
        index: 2,
        verdict: 'UNVERIFIED',
        confidence: 0.45,
        statement:
          'Data rujukan web langsung untuk pertanyaan spesifik ini menunggu integrasi endpoint backend LLM.',
        summary:
          'Karena tahap ini berfokus pada pratinjau antarmuka frontend, bukti web langsung belum ditarik dari internet. Coba juga salah satu pertanyaan contoh di layar awal untuk melihat skenario lengkap multi-sumber.',
        reasoning:
          '1) Permintaan ini tidak termasuk dalam 4 dataset pratinjau lokal, sehingga ditandai sebagai Belum Terverifikasi secara transparan (anti halusinasi). 2) Setelah endpoint POST /api/chat di folder server aktif, setiap pertanyaan bebas akan memperoleh kutipan sumber web secara langsung.',
        keySources: [],
        evidence: [
          {
            id: `ev_gen_2_${Date.now()}`,
            sourceType: 'OFFICIAL',
            stance: 'NEUTRAL',
            credibility: 0.75,
            relevance: 0.8,
            title: 'Status Mode Simulasi Frontend FritoGrafi',
            url: 'https://vite.dev/config/server-options.html#server-proxy',
            snippet:
              'Antarmuka frontend sudah siap meneruskan permintaan ke /api/chat melalui proxy Vite begitu layanan backend LLM selesai dikembangkan.',
          },
        ],
      },
    ],
    followUps: [
      'Benarkah jalan kaki 10.000 langkah per hari dapat menurunkan risiko demensia hingga 50%?',
      'Apakah minum kopi setiap hari aman untuk kesehatan jantung atau justru berisiko?',
    ],
  }
}

export function buildAttachmentScenario(query, attachments = []) {
  const primary = attachments[0]
  const fileNames = attachments.map((item) => item.name).join(', ')
  const hasMultiple = attachments.length > 1
  const textSnippet = primary?.textExcerpt
    ? primary.textExcerpt.replace(/\s+/g, ' ').slice(0, 220).trim()
    : ''

  const docSnippet = textSnippet
    ? textSnippet
    : primary?.isImage
      ? `Pratinjau gambar "${primary.name}" telah diterima. Saat backend LLM multimodal aktif, teks dan objek visual pada gambar ini akan diekstrak secara otomatis untuk diverifikasi.`
      : `Dokumen "${primary?.name || 'terlampir'}" (${(primary?.extension || 'FILE').toUpperCase()}) berhasil diterima. Pada mode simulasi frontend, ekstraksi isi PDF dan DOCX penuh akan diproses oleh backend Express.`

  const reply =
    `FritoGrafi telah menerima ${hasMultiple ? `${attachments.length} file terlampir` : 'lampiran'} (**${fileNames}**) bersama permintaanmu mengenai **"${query}"**.\n\nIsi utama dari dokumen terlampir telah ditandai sebagai rujukan primer untuk pemeriksaan klaim [1]. Selanjutnya, pernyataan penting di dalamnya dibandingkan dengan sumber terbuka eksternal agar kamu bisa melihat apakah klaim tersebut didukung atau memerlukan verifikasi tambahan [2].`

  return {
    reply,
    claims: [
      {
        id: `claim_doc_1_${Date.now()}`,
        index: 1,
        verdict: 'SUPPORTED',
        confidence: textSnippet ? 0.88 : 0.81,
        statement: `Dokumen "${primary?.name || 'terlampir'}" berhasil dibaca sebagai bahan acuan utama untuk dianalisis.`,
        summary: textSnippet
          ? `Cuplikan teks asli dari "${primary.name}" telah diekstrak langsung di browser dan siap dijadikan dasar pemeriksaan klaim.`
          : `Metadata dokumen "${primary?.name || 'terlampir'}" telah tercatat lengkap dan siap dikirim sebagai FormData ke backend LLM multimodal.`,
        reasoning: textSnippet
          ? '1) File teks dibaca langsung di sisi browser menggunakan FileReader sehingga kutipan di bawah mencerminkan isi nyata dokumen. 2) Saat terhubung ke backend LLM, seluruh dokumen akan dipecah menjadi klaim atomik untuk pengecekan silang otomatis.'
          : '1) File biner (PDF, DOCX, atau gambar) tervalidasi sesuai batas ukuran dan format. 2) Pada tahap produksi, backend Express menerima file melalui multipart/form-data di memori sementara lalu meneruskannya ke LLM multimodal.',
        keySources: [],
        evidence: [
          {
            id: `ev_doc_1_${Date.now()}`,
            sourceType: 'USER_DOCUMENT',
            stance: 'SUPPORTS',
            credibility: 0.9,
            relevance: 0.96,
            title: `Kutipan dari ${primary?.name || 'Dokumen Terlampir'}`,
            fileName: primary?.name || 'dokumen',
            locationLabel: primary?.isImage
              ? 'Lampiran Gambar'
              : textSnippet
                ? 'Bagian Awal Dokumen'
                : `Format ${(primary?.extension || 'FILE').toUpperCase()}`,
            snippet: docSnippet,
          },
        ],
      },
      {
        id: `claim_doc_2_${Date.now()}`,
        index: 2,
        verdict: 'PARTIAL',
        confidence: 0.72,
        statement:
          'Pengecekan silang klaim isi dokumen terhadap sumber web terbuka memerlukan koneksi aktif ke pipeline backend LLM.',
        summary:
          'Struktur kartu bukti sudah menampilkan pembandingan antara Dokumen Pengguna dan Pencarian Web. Hasil pengecekan fakta secara langsung akan terisi otomatis begitu endpoint POST /api/chat aktif.',
        reasoning:
          '1) Dalam mode pratinjau UI frontend, FritoGrafi memisahkan sumber internal (Dokumen Pengguna) dari sumber pembanding eksternal (Pencarian Web). 2) Pendekatan ini memudahkan pengguna membedakan informasi yang berasal dari file unggahannya sendiri dengan verifikasi independen dari internet.',
        keySources: [
          {
            title:
              'MDN Web Docs: Menggunakan FormData untuk Pengiriman File ke Server',
            url: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
          },
        ],
        evidence: [
          {
            id: `ev_doc_2_${Date.now()}`,
            sourceType: 'WEB_SEARCH',
            stance: 'NEUTRAL',
            credibility: 0.85,
            relevance: 0.84,
            title: 'Standar Verifikasi Silang Dokumen terhadap Sumber Terbuka',
            url: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
            snippet:
              'Antarmuka frontend telah mendukung pengiriman multipart/form-data agar backend dapat mengekstrak klaim dokumen dan membandingkannya dengan hasil pencarian web.',
          },
        ],
      },
    ],
    followUps: [
      'Bagian mana dari dokumen ini yang paling perlu dicek ulang?',
      'Bandingkan klaim dokumen ini dengan sumber resmi terbaru',
    ],
  }
}

export function matchMockScenario(query, attachments = []) {
  if (Array.isArray(attachments) && attachments.length > 0) {
    return buildAttachmentScenario(query, attachments)
  }
  const lower = query.toLowerCase()
  for (const scenario of MOCK_SCENARIOS) {
    if (scenario.keywords.some((kw) => lower.includes(kw))) {
      return scenario
    }
  }
  return buildFallbackScenario(query)
}
