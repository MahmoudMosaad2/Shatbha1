import { ClientRequest, Company, Offer, Contract, Inspector, ProjectStage, Notification, ProjectCommission, PromoCode, WarrantyRecord, WarrantyComplaint, AuditLog } from './types';

export const initialRequests: ClientRequest[] = [
  {
    id: 'REQ-1',
    clientId: 'ID#4092',
    clientName: 'أحمد محمود سليمان',
    clientPhone: '+20 100 234 5678',
    clientEmail: 'ahmed.soliman@gmail.com',
    unitType: 'شقة',
    area: 120,
    governorate: 'القاهرة',
    city: 'قاهرة الجديدة',
    finishingLevel: 'لوكس',
    budget: 650000,
    requireInspector: true,
    status: 'DRAFT',
    createdAt: '2026-06-01T10:00:00.000Z'
  },
  {
    id: 'REQ-2',
    clientId: 'ID#4092',
    clientName: 'أحمد محمود سليمان',
    clientPhone: '+20 100 234 5678',
    clientEmail: 'ahmed.soliman@gmail.com',
    unitType: 'شقة',
    area: 150,
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    finishingLevel: 'سوبر لوكس',
    budget: 950000,
    requireInspector: true,
    status: 'CONTRACT_AWARD_PENDING',
    selectedOfferId: 'OFFER-2-1',
    selectedCompanyId: 'COMP-1',
    assignedInspectorId: 'INSP-1',
    createdAt: '2026-06-02T11:00:00.000Z'
  },
  {
    id: 'REQ-3',
    clientId: 'ID#7721',
    clientName: 'مروة عبد الرحمن غانم',
    clientPhone: '+20 111 445 8891',
    clientEmail: 'marwa.ghanem@outlook.com',
    unitType: 'مكتب',
    area: 90,
    governorate: 'الجيزة',
    city: 'الشيخ زايد',
    finishingLevel: 'لوكس',
    budget: 500000,
    requireInspector: true,
    status: 'CONTRACT_AWARD_PENDING',
    selectedOfferId: 'OFFER-3-1',
    selectedCompanyId: 'COMP-2',
    assignedInspectorId: 'INSP-2',
    createdAt: '2026-06-03T09:30:00.000Z'
  },
  {
    id: 'REQ-4',
    clientId: 'ID#8835',
    clientName: 'م/ عمرو دياب الصاوي',
    clientPhone: '+20 120 776 2201',
    clientEmail: 'amr.elsawy@hotmail.com',
    unitType: 'فيلا',
    area: 320,
    governorate: 'القاهرة',
    city: 'القاهرة الجديدة',
    finishingLevel: 'بريميوم',
    budget: 3500000,
    requireInspector: true,
    status: 'CONTRACT_AWARD_PENDING',
    deadline: '2026-06-12T12:00:00.000Z',
    selectedOfferId: 'OFFER-4-1',
    selectedCompanyId: 'COMP-1',
    assignedInspectorId: 'INSP-1',
    createdAt: '2026-06-04T14:15:00.000Z'
  },
  {
    id: 'REQ-5',
    clientId: 'ID#4092',
    clientName: 'أحمد محمود سليمان',
    clientPhone: '+20 100 234 5678',
    clientEmail: 'ahmed.soliman@gmail.com',
    unitType: 'شقة',
    area: 180,
    governorate: 'الجيزة',
    city: 'الشيخ زايد',
    finishingLevel: 'سوبر لوكس',
    budget: 1200000,
    requireInspector: true,
    status: 'CONTRACT_AWARD_PENDING',
    selectedOfferId: 'OFFER-5-1',
    selectedCompanyId: 'COMP-1',
    assignedInspectorId: 'INSP-3',
    createdAt: '2026-06-05T08:00:00.000Z'
  },
  {
    id: 'REQ-6',
    clientId: 'ID#4092',
    clientName: 'أحمد محمود سليمان',
    clientPhone: '+20 100 234 5678',
    clientEmail: 'ahmed.soliman@gmail.com',
    unitType: 'شقة',
    area: 140,
    governorate: 'القاهرة',
    city: 'المعادي',
    finishingLevel: 'لوكس',
    budget: 800000,
    requireInspector: true,
    status: 'CONTRACT_SIGNED',
    selectedCompanyId: 'COMP-2',
    assignedInspectorId: 'INSP-2',
    actualStartDate: '2026-06-07',
    createdAt: '2026-05-20T10:00:00.000Z'
  },
  {
    id: 'REQ-7',
    clientId: 'ID#4092',
    clientName: 'أحمد محمود سليمان',
    clientPhone: '+20 100 234 5678',
    clientEmail: 'ahmed.soliman@gmail.com',
    unitType: 'دوبلكس',
    area: 240,
    governorate: 'القاهرة',
    city: 'مصر الجديدة',
    finishingLevel: 'بريميوم',
    budget: 2200000,
    selectedCompanyId: 'COMP-1',
    assignedInspectorId: 'INSP-2',
    requireInspector: true,
    status: 'COMPLETED',
    createdAt: '2026-04-10T11:00:00.000Z'
  }
];

export const initialCompanies: Company[] = [
  {
    id: 'COMP-1',
    userId: 'USER-COMP-1',
    companyName: 'LuxSpace Interiors',
    commercialReg: 'CR-882947-LUX.pdf',
    taxCard: 'TC-99201-LUX.pdf',
    status: 'APPROVED',
    finishingTypes: ['لوكس', 'سوبر لوكس', 'بريميوم'],
    governorates: ['القاهرة', 'الجيزة'],
    cities: ['القاهرة الجديدة', 'الشيخ زايد', 'المعادي', 'مدينة نصر'],
    rating: 4.9,
    projectsCompleted: 62,
    isVerified: true,
    logoUrl: 'https://images.unsplash.com/photo-1541829011-558d43419155?auto=format&fit=crop&w=150&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    establishedYear: 2018,
    aboutText: 'نحن في لوكس سبيس نهتم بأدق تفاصيل الديكور الداخلي والتشطيب الراقي، نمتلك فريقاً متكاملاً من المهندسين الاستشاريين ذوي الخبرة الواسعة لتنفيذ أحلامك السكنية والتجارية بأعلى معايير المحاذاة لمواصفات الجودة المصرية والعالمية.',
    timingCommitment: 97,
    inspectorApprovalRate: 98,
    projectsThroughShattabha: 15,
    phone: '+20 100 488 2911',
    whatsapp: '+20 100 488 2911',
    email: 'info@luxspace-eg.com',
    website: 'https://luxspace-interiors.com',
    officeAddress: 'شارع التسعين الشمالي، التجمع الخامس، مبنى ميراد الإداري، مكتب رقم ٤٠٤',
    packages: [
      {
        id: 'pkg-1-1',
        name: 'الباقة الملكية البريميوم',
        pricePerSqm: 4800,
        description: 'تشطيب فاخر للباحثين عن الرقي والتميز مع استخدام أفخر مواد الرخام المستورد والدهانات الذكية الإيطالية.',
        features: ['رخام إيطالي بالكامل للريسيبشن والصالونات', 'أطقم حمامات ديورافيت وخلاطات جروهي المستوردة', 'تأسيس شبكة الكهرباء بكابلات السويدي المعتمدة وإكسسوارات شنايدر', 'دهانات جوتن الأنيقة (ثلاثة أوجه ملمس حريري)']
      },
      {
        id: 'pkg-1-2',
        name: 'الباقة المتميزة سوبر لوكس',
        pricePerSqm: 3400,
        description: 'باقة ممتازة تجمع بين مستويات التشطيب فئة السوبر لوكس والصلابة وتوفير الطاقة المناسبة للشقق والفلل العصرية.',
        features: ['بورسلين كليوباترا فرز أول بمقاسات كبيرة للصالات', 'أرضيات سيراميك الجوهرة للغرف والمطبخ', 'أسقف معلقة جبسيوم بورد كناوف بأشكال معاصرة وإنارة مخفية', 'أبواب خشبية سويدي سميك وقشرة ميرنتي ناعمة']
      }
    ],
    portfolio: [
      {
        id: 'port-1-1',
        projectName: 'بنتهاوس فاخر بمدينتي',
        projectType: 'سكني',
        governorate: 'القاهرة',
        executionYear: 2024,
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
        beforeImages: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
        afterImages: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
        description: 'تشطيب وتأثيث بنتهاوس بالكامل بمساحة ٢٢٠ متر مربع مع الاهتمام بالعزل المائي والتكييفات المركزية الخفية والجبسيوم بورد الراقية.'
      },
      {
        id: 'port-1-2',
        projectName: 'مقر جلوبال كابيتال لخدمات التداول',
        projectType: 'إداري',
        governorate: 'القاهرة',
        executionYear: 2025,
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
        beforeImages: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'],
        afterImages: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
        description: 'تصميم وبناء مكاتب مفتوحة بنظام اللوفت الحديث للشركات الناشئة مع مراعاة قنوات كابلات الشبكة المعزولة داخل الأرضيات وجدران عزل الصوت للحجرات.'
      }
    ]
  },
  {
    id: 'COMP-2',
    userId: 'USER-COMP-2',
    companyName: 'Mimar Pro Egypt',
    commercialReg: 'CR-772911-MIM.pdf',
    taxCard: 'TC-44021-MIM.pdf',
    status: 'APPROVED',
    finishingTypes: ['اقتصادي', 'لوكس', 'سوبر لوكس'],
    governorates: ['القاهرة'],
    cities: ['مدينة نصر', 'المعادي', 'مصر الجديدة'],
    rating: 4.7,
    projectsCompleted: 45,
    isVerified: true,
    logoUrl: 'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&w=150&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    establishedYear: 2020,
    aboutText: 'شركة معمار برو إيجيبت رائدة في التشغيل المتكامل وتقسيم الوحدات السكنية باحترافية بأسعار تنافسية ممتازة مع الالتزام الكامل بجداول التنفيذ الزمنية الصارمة.',
    timingCommitment: 95,
    inspectorApprovalRate: 94,
    projectsThroughShattabha: 8,
    phone: '+20 111 882 1243',
    whatsapp: '+20 111 882 1243',
    email: 'contact@mimarpro.eg',
    website: 'https://mimarpro-egypt.com',
    officeAddress: 'شارع عباس العقاد، المنطقة الأولى، مدينة نصر، عمارة الأمل، الدور الثاني',
    packages: [
      {
        id: 'pkg-2-1',
        name: 'باقة لوكس الذكية',
        pricePerSqm: 2800,
        description: 'تشطيب جودته عالية ويراعي حلول المنازل الذكية وتوفير الإضاءة واستهلاك الطاقة بمواد مصرية معتمدة.',
        features: ['سيراميك كليوباترا فرز أول لكامل الوحدة', 'دهانات سايبس البلاستيكية المريحة والقابلة للغسل', 'تأسيس الكهرباء بالسويدي ولوحات فينوس الذكية للتحكم عن بعد', 'عزل مائي متكامل للحمامات والمطابخ رطوبة وحرارة']
      },
      {
        id: 'pkg-2-2',
        name: 'الباقة الكلاسيكية اللوكس',
        pricePerSqm: 2400,
        description: 'أفضل الخيارات الاقتصادية بمواصفات متوازنة توفر شكلاً جذاباً وعمراً طويلاً لبنود التأسيس.',
        features: ['أرضيات سيراميك ليسيكو فرز أول', 'خلاطات مياه كاردو مع خلاطات محلية بضمان ثلاث سنوات', 'إنارة ليد لأسقف وحوائط ناعمة', 'شبابيك الألومنيوم العازلة للصوت والحرارة للغرف الواجهة']
      }
    ],
    portfolio: [
      {
        id: 'port-2-1',
        projectName: 'شقة نيو هليوبوليس العائلية',
        projectType: 'سكني',
        governorate: 'القاهرة',
        executionYear: 2023,
        images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'],
        beforeImages: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'],
        afterImages: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'],
        description: 'تنفيذ بنود المحارة وتعديل قطاعات السباكة والصرف وتأسيس الكهرباء لشقة بمساحة ١٦٠ متراً مكعباً بتشطيب لوكس مميز.'
      }
    ]
  },
  {
    id: 'COMP-3',
    userId: 'USER-COMP-3',
    companyName: 'DecorPro Egypt',
    commercialReg: 'CR-554102-DEC.pdf',
    taxCard: 'TC-33201-DEC.pdf',
    status: 'APPROVED',
    finishingTypes: ['لوكس', 'سوبر لوكس'],
    governorates: ['القاهرة', 'الجيزة'],
    cities: ['القاهرة الجديدة', 'الشيخ زايد', 'مدينة نصر'],
    rating: 4.6,
    projectsCompleted: 38,
    isVerified: false,
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=150&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    establishedYear: 2021,
    aboutText: 'ديكور برو إيجيبت تقدم حلول التشطيب العصري الحديث بجداول متسلسلة تريح العميل وتضمن الفعالية والجودة.',
    timingCommitment: 92,
    inspectorApprovalRate: 91,
    projectsThroughShattabha: 4,
    phone: '+20 122 009 2311',
    whatsapp: '+20 122 009 2311',
    email: 'office@decorpro-egy.com',
    website: 'https://decorpro-egypt.com',
    officeAddress: 'محور جمال عبد الناصر، الشيخ زايد، مول هاب تاون، الدور الأول مكرر',
    packages: [
      {
        id: 'pkg-3-1',
        name: 'باقة ديكور برو بلس',
        pricePerSqm: 3100,
        description: 'باقة تشطيب فريدة تعتمد على أفضل الديكورات الجدارية والاضاءات الليد والتنسيق اللوني الرائع.',
        features: ['بورسلين هندي للصالات وسيراميك الجوهرة للحمامات', 'أطقم كليوباترا الاستثنائية لجميع الحمامات', 'دهانات جوتن الفينومست لسهولة التنظيف التام وبأشكال كمبيوترية', 'ديكورات بديل الرخام وبديل الخشب للصالون والشاشات']
      }
    ],
    portfolio: [
      {
        id: 'port-3-1',
        projectName: 'شقة بمشروع دار مصر الشيخ زايد',
        projectType: 'سكني',
        governorate: 'الجيزة',
        executionYear: 2024,
        images: ['https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=800&q=80'],
        beforeImages: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'],
        afterImages: ['https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=800&q=80'],
        description: 'تشطيب كامل للغرف والمطابخ والصالات والشبابيك والأبواب وتسليمها تحت إشراف هندسي وحسب المواصفات المحددة.'
      }
    ]
  },
  {
    id: 'COMP-4',
    userId: 'USER-COMP-4',
    companyName: 'EGY Build & Finishes',
    commercialReg: 'CR-112009-EGY.pdf',
    taxCard: 'TC-55612-EGY.pdf',
    status: 'PENDING_APPROVAL',
    finishingTypes: ['اقتصادي', 'لوكس', 'سوبر لوكس', 'بريميوم'],
    governorates: ['القاهرة', 'الجيزة', 'الإسكندرية'],
    cities: ['القاهرة الجديدة', 'الشيخ زايد', 'المندرة', 'سموحة'],
    rating: 5.0,
    projectsCompleted: 0,
    isVerified: false,
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    establishedYear: 2022,
    aboutText: 'شركة إيجيب بيلد للمقاولات والتشطيبات الفخمة ذات الموثوقية العالية والأطقم الفنية المتميزة في جميع أنحاء الجمهورية.',
    timingCommitment: 99,
    inspectorApprovalRate: 98,
    projectsThroughShattabha: 0,
    phone: '+20 101 229 3390',
    whatsapp: '+20 101 229 3390',
    email: 'ceo@egy-build-finishes.com',
    website: 'https://egy-build-finishes.com',
    officeAddress: 'كورنيش الإسكندرية، منطقة كليوباترا، مبنى لؤلؤة البحر، الدور الثالث',
    packages: [],
    portfolio: []
  },
  {
    id: 'COMP-5',
    userId: 'USER-COMP-5',
    companyName: 'Elite Finishes Co.',
    commercialReg: 'CR-334112-ELI.pdf',
    taxCard: 'TC-88902-ELI.pdf',
    status: 'APPROVED',
    finishingTypes: ['لوكس', 'سوبر لوكس', 'بريميوم'],
    governorates: ['القاهرة'],
    cities: ['المعادي', 'القاهرة الجديدة'],
    rating: 4.8,
    projectsCompleted: 27,
    isVerified: false,
    logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    establishedYear: 2019,
    aboutText: 'إيليت فينيشيز هي عنوان الأناقة والتشطيب النخبوي، نحن نوفر خدمة راقية جداً للملاك لتمييز مساكنهم وجعلها لوحات فنية دافئة.',
    timingCommitment: 96,
    inspectorApprovalRate: 98,
    projectsThroughShattabha: 6,
    phone: '+20 109 443 1121',
    whatsapp: '+20 109 443 1121',
    email: 'design@elite-finishes.com',
    website: 'https://elite-finishes.net',
    officeAddress: 'شارع مكة متفرع من دجلة المعادي، عمارة إيليت، الدور الأرضي',
    packages: [
      {
        id: 'pkg-5-1',
        name: 'باقة إيليت VIP',
        pricePerSqm: 5200,
        description: 'باقة حصرية برؤية مهندسي المجلات الفاخرة تشمل كل تفصيلية من التصميم ثلاثي الأبعاد والفرش المتقن والإضاءة الراقية.',
        features: ['أرضيات خشب طبيعي مستورد باركيه مسمار صالون', 'خلاطات وحنفيات هانس جروهي الألمانية الفاخرة بالكامل', 'زجاج سيكوريت للحمامات وعزل حراري كامل لكافة النوافذ الحصينة', 'دهانات حاسوبية ضد البكتيريا والرطوبة بأثر بريق مخملي']
      }
    ],
    portfolio: [
      {
        id: 'port-5-1',
        projectName: 'بنتهاوس القطامية ديونز',
        projectType: 'سكني',
        governorate: 'القاهرة',
        executionYear: 2024,
        images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80'],
        beforeImages: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'],
        afterImages: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80'],
        description: 'تصميم وتنفيذ كامل للفيلا الفاخرة للضيف الدائم في قطامية ديونز بأرقى خامات الرخام المستورد الإسباني.'
      }
    ]
  }
];

export const initialOffers: Offer[] = [
  {
    id: 'OFFER-2-1',
    requestId: 'REQ-2',
    companyId: 'COMP-1',
    companyName: 'LuxSpace Interiors',
    price: 920000,
    durationDays: 75,
    description: 'تشطيب سوبر لوكس مميز لشقة مدينة نصر، بياض محارة ناعم، سيراميك الجوهرة للمطابخ وحمامات ديورافيت الألمانية، أسقف معلقة مودرن مع توثيق وإيقاع إنارة مخفية كاملة.',
    portfolio: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'],
    createdAt: '2526-06-03T10:00:00.000Z',
    materialsDetail: 'السباكة: بي آر مصر، الكهرباء: كابلات السويدي الأصلية المعتمدة ومفاتيح شنايدر، الدهانات: جوتن فينوماستيك مط، الأرضيات: بورسلين كليوباترا فرز أول.',
    warrantyDetail: 'ضمان كامل معتمد لمدة 10 سنوات على السباكة والكهرباء، وضمان 3 سنوات على محارة وبياض الأسقف والجدران.'
  },
  {
    id: 'OFFER-3-1',
    requestId: 'REQ-3',
    companyId: 'COMP-2',
    companyName: 'Mimar Pro Egypt',
    price: 480000,
    durationDays: 60,
    description: 'عرض تشطيب مكتبك التجاري بالشيخ زايد بمواد مصرية معتمدة مطابقة تماماً للمواصفات والأكواد الهندسية المطلوبة مع دهانات جوتن ضد الرطوبة وسيراميك فرز أول.',
    portfolio: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
    createdAt: '2026-06-04T11:30:00.000Z',
    materialsDetail: 'السباكة: أنظمة باننجر المتكاملة، الكهرباء: السويدي بمفاتيح شنايدر الفرنسية، الدهانات: جوتن، الأرضيات: سيراميك ليسيكو فرز أول.',
    warrantyDetail: 'ضمان شامل لمدة 5 سنوات على كافة بنود التأسيس للسباكة والكهرباء والشبكات الإدارية.'
  },
  {
    id: 'OFFER-4-1',
    requestId: 'REQ-4',
    companyId: 'COMP-1',
    companyName: 'LuxSpace Interiors',
    price: 3350000,
    durationDays: 120,
    description: 'عرضنا المتكامل للباقة الملكية البريميوم لفيلا القاهرة الجديدة، يشمل أسقف معلقة مع إنارة فرنسية وكوابل السويدي الأصلية وعوازل رطوبة إيطالية متميزة بالحمامات.',
    portfolio: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
    createdAt: '2026-06-05T12:00:00.000Z',
    materialsDetail: 'السباكة: مواسير شريف بي آر الألمانية، الكهرباء: كابلات السويدي الأصلية المعتمدة، الدهانات: جوتن فينوماستيك، الأرضيات: رخام كرارة إيطالي للصالات وبورسلين مستورد للغرف.',
    warrantyDetail: 'ضمان شامل لمدة 10 سنوات على أعمال السباكة والكهرباء والـتأسيس، وضمان 5 سنوات على الدهانات والديكورات ضد عيوب الاستخدام.'
  },
  {
    id: 'OFFER-4-2',
    requestId: 'REQ-4',
    companyId: 'COMP-5',
    companyName: 'Elite Finishes Co.',
    price: 3450000,
    durationDays: 110,
    description: 'تشطيب نخبوي VIP لفيلا القاهرة الجديدة يشمل تكييف مركزي ومطابخ مجهزة بالكامل وبورسلين للصالات ورخام مستورد لكامل المداخل السكنية.',
    portfolio: ['https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80'],
    createdAt: '2026-06-05T15:00:00.000Z',
    materialsDetail: 'السباكة: أنظمة باننجر المتكاملة، الكهرباء: السويدي بمفاتيح شنايدر الفرنسية، الدهانات: جوتن ورش قطيفة، الأرضيات: رخام بوتشينو كلاسيك وبورسلين هندي فاخر.',
    warrantyDetail: 'ضمان معتمد من الشركة لمدة 15 سنة على الهيكل التأسيسي المائي والكهربائي، وضمان صيانة مجانية لمدة عامين على كافة البنود.'
  },
  {
    id: 'OFFER-5-1',
    requestId: 'REQ-5',
    companyId: 'COMP-1',
    companyName: 'LuxSpace Interiors',
    price: 1150000,
    durationDays: 85,
    description: 'تشطيب سوبر لوكس لمشروع الشيخ زايد مع استخدام دهانات جوتن ورخام مستورد بالكامل وكوابل السويدي واللوحات الكهربائية الفرنسية المعتمدة.',
    portfolio: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'],
    createdAt: '2026-06-05T10:00:00.000Z',
    materialsDetail: 'السباكة: بي آر مصر، الكهرباء: كابلات السويدي المعتمدة ومفاتيح شنايدر، الدهانات: جوتن فينوماستيك مط، الأرضيات: بورسلين كليوباترا فرز أول.',
    warrantyDetail: 'ضمان كامل معتمد لمدة 10 سنوات على السباكة والكهرباء، وضمان 3 سنوات على محارة وبياض الأسقف والجدران.'
  }
];

export const initialContracts: Contract[] = [
  {
    id: 'CONT-1',
    requestId: 'REQ-5',
    companyId: 'COMP-1',
    totalAmount: 1150000,
    finalContractPrice: 1150000,
    commissionRate: 0.05,
    commissionAmt: 57500,
    inspectionDate: '2026-06-08',
    meetingDate: '2026-06-10',
    status: 'تمت المعاينة',
    isSigned: false,
    createdAt: '2026-06-06T11:00:00.000Z'
  },
  {
    id: 'CONT-2',
    requestId: 'REQ-6',
    companyId: 'COMP-2',
    totalAmount: 800000,
    finalContractPrice: 800000,
    commissionRate: 0.05,
    commissionAmt: 40000,
    inspectionDate: '2026-05-25',
    meetingDate: '2026-05-28',
    status: 'تمت كتابة العقد',
    isSigned: true,
    createdAt: '2026-05-20T10:00:00.000Z'
  }
];

export const initialInspectors: Inspector[] = [
  {
    id: 'INSP-1',
    name: 'م/ كريم ممدوح',
    governorate: 'القاهرة',
    zone: 'القاهرة الجديدة والتجمع',
    activeProjectsCount: 2,
    phone: '+20 102 445 6678',
    status: 'ACTIVE',
    password: 'INSPPass-1',
    stagesSpecialties: ['سباكة', 'كهرباء', 'محارة', 'دهانات', 'أعمال صحية']
  },
  {
    id: 'INSP-2',
    name: 'م/ يحيى زكريا',
    governorate: 'القاهرة',
    zone: 'مدينة نصر ومصر الجديدة',
    activeProjectsCount: 1,
    phone: '+20 115 889 0012',
    status: 'ACTIVE',
    password: 'INSPPass-2',
    stagesSpecialties: ['سباكة', 'كهرباء', 'محارة', 'دهانات', 'أعمال صحية']
  },
  {
    id: 'INSP-3',
    name: 'م/ عمرو الشافعي',
    governorate: 'الجيزة',
    zone: 'الشيخ زايد و٦ أكتوبر',
    activeProjectsCount: 3,
    phone: '+20 122 344 5566',
    status: 'ACTIVE',
    password: 'INSPPass-3',
    stagesSpecialties: ['سباكة', 'كهرباء', 'محارة', 'دهانات', 'أعمال صحية']
  }
];

export const initialProjectStages: ProjectStage[] = [
  // Stages for REQ-6 (Active project in execution)
  {
    id: 'STG-6-1',
    requestId: 'REQ-6',
    name: 'أعمال السباكة والصرف الفني',
    status: 'IN_PROGRESS',
    progress: 40,
    totalDurationDays: 12,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
    inspectionRequested: false,
    paymentReleased: false
  },
  {
    id: 'STG-6-2',
    requestId: 'REQ-6',
    name: 'تأسيس أعمال الكهرباء والشبكات',
    status: 'PLANNED',
    progress: 0,
    totalDurationDays: 10,
    images: [],
    inspectionRequested: false,
    paymentReleased: false
  },
  {
    id: 'STG-6-3',
    requestId: 'REQ-6',
    name: 'أعمال البياض والمحارة الداخلية',
    status: 'PLANNED',
    progress: 0,
    totalDurationDays: 15,
    images: [],
    inspectionRequested: false,
    paymentReleased: false
  },
  {
    id: 'STG-6-4',
    requestId: 'REQ-6',
    name: 'تركيب الأرضيات والسراميك والبورسلين',
    status: 'PLANNED',
    progress: 0,
    totalDurationDays: 18,
    images: [],
    inspectionRequested: false,
    paymentReleased: false
  },
  {
    id: 'STG-6-5',
    requestId: 'REQ-6',
    name: 'الدهانات الأساسية والديكورية',
    status: 'PLANNED',
    progress: 0,
    totalDurationDays: 14,
    images: [],
    inspectionRequested: false,
    paymentReleased: false
  },
  {
    id: 'STG-6-6',
    requestId: 'REQ-6',
    name: 'التشطيبات النهائية وتركيب المفاتيح',
    status: 'PLANNED',
    progress: 0,
    totalDurationDays: 10,
    images: [],
    inspectionRequested: false,
    paymentReleased: false
  },

  // Stages for REQ-7 (Completed project with active warranty)
  {
    id: 'STG-7-1',
    requestId: 'REQ-7',
    name: 'أعمال السباكة والصرف الفني',
    status: 'CLOSED',
    progress: 100,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
    inspectionRequested: false,
    paymentReleased: true
  },
  {
    id: 'STG-7-2',
    requestId: 'REQ-7',
    name: 'تأسيس أعمال الكهرباء والشبكات',
    status: 'CLOSED',
    progress: 100,
    images: [],
    inspectionRequested: false,
    paymentReleased: true
  },
  {
    id: 'STG-7-3',
    requestId: 'REQ-7',
    name: 'أعمال البياض والمحارة الداخلية',
    status: 'CLOSED',
    progress: 100,
    images: [],
    inspectionRequested: false,
    paymentReleased: true
  },
  {
    id: 'STG-7-4',
    requestId: 'REQ-7',
    name: 'تركيب الأرضيات والسراميك والبورسلين',
    status: 'CLOSED',
    progress: 100,
    images: [],
    inspectionRequested: false,
    paymentReleased: true
  },
  {
    id: 'STG-7-5',
    requestId: 'REQ-7',
    name: 'الدهانات الأساسية والديكورية',
    status: 'CLOSED',
    progress: 100,
    images: [],
    inspectionRequested: false,
    paymentReleased: true
  },
  {
    id: 'STG-7-6',
    requestId: 'REQ-7',
    name: 'التشطيبات النهائية وتركيب المفاتيح',
    status: 'CLOSED',
    progress: 100,
    images: [],
    inspectionRequested: false,
    paymentReleased: true
  }
];

export const initialWarrantyRecords: WarrantyRecord[] = [
  {
    id: 'WR-1',
    requestId: 'REQ-7',
    clientName: 'أحمد محمود سليمان',
    clientId: 'ID#4092',
    companyName: 'LuxSpace Interiors',
    companyId: 'COMP-1',
    inspectorName: 'م/ يحيى زكريا',
    inspectorId: 'INSP-2',
    startDate: '2026-05-15',
    endDate: '2027-05-15',
    durationDays: 365,
    status: 'ACTIVE'
  }
];

export const initialWarrantyComplaints: WarrantyComplaint[] = [
  {
    id: 'WC-1',
    warrantyRecordId: 'WR-1',
    requestId: 'REQ-7',
    clientId: 'ID#4092',
    companyId: 'COMP-1',
    inspectorId: 'INSP-2',
    title: 'تشرخ بسيط في الصالون',
    description: 'ظهر تشرخ رفيع جداً تحت طبقة المعجون في الجدار البحري، نرجو المعاينة من المهندس لدهان الموقع المتأثر.',
    locationOfProblem: 'الريسبشن - الجدار البحري',
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
    status: 'OPEN',
    createdAt: '2026-05-28T09:00:00.000Z'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'AUD-1',
    userId: 'ADMIN-1',
    userName: 'المدير العام (الأدمن)',
    userRole: 'ADMIN',
    actionAr: 'تحديث حالة المنصة وتوسيع المراقبة',
    actionEn: 'Platform system baseline loaded',
    details: 'تم تحديث الأمان ونطاق العمل ومستويات المزايدة وتسجيل عقود الفحص وتوسيع الرصد الشامل.',
    createdAt: '2026-06-06T12:00:00.000Z'
  },
  {
    id: 'AUD-2',
    userId: 'ID#4092',
    userName: 'أحمد محمود سليمان',
    userRole: 'CLIENT',
    actionAr: 'تقديم طلب مناقصة جديد',
    actionEn: 'New project request draft created',
    details: 'إنشاء مسودة طلب تشطيب شقة بمساحة ١٢٠ متر مربع.',
    createdAt: '2026-06-06T12:15:00.000Z'
  }
];

export const initialNotifications: Notification[] = [];

export const initialCommissions: ProjectCommission[] = [];

export const initialPromoCodes: PromoCode[] = [
  {
    id: 'PROMO-1',
    code: 'WELCOME20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 100,
    usageCount: 15,
    maxPerClient: 1,
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'PROMO-2',
    code: 'SUPERVISION2000',
    discountType: 'FIXED',
    discountValue: 2000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 50,
    usageCount: 5,
    maxPerClient: 1,
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'PROMO-3',
    code: 'WELCOME10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 10,
    usageCount: 2,
    maxPerClient: 1,
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

