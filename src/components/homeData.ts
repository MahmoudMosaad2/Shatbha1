export interface Slide {
  id: string;
  url: string;
  labelAr: string;
  labelEn: string;
}

export interface FAQItem {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

export interface FeaturedProject {
  id: string;
  nameAr: string;
  nameEn: string;
  locationAr: string;
  locationEn: string;
  areaAr: string;
  areaEn: string;
  levelAr: string;
  levelEn: string;
  descAr: string;
  descEn: string;
  images: string[];
}

export interface Testimonial {
  initial: string;
  nameAr: string;
  nameEn: string;
  locationAr: string;
  locationEn: string;
  textAr: string;
  textEn: string;
  rating: number;
}

export const HOME_DEFAULT_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'تصميم ليفينج روم راقي بإضاءة دافئة مسلطة ✨',
    labelEn: 'Premium luxury interior living room with warm lights ✨'
  },
  {
    id: 'slide-2',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'فيلا مودرن ساحرة مع جدران زجاجية وتصميم معاصر 🏡',
    labelEn: 'Breathtaking modern villa dining and high glass design 🏡'
  },
  {
    id: 'slide-3',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'غرفة نوم رئيسية مع تكسيات خشبية مخصصة وجدران أنيقة 🪵',
    labelEn: 'High-end custom wood cladding master bedroom & paneling 🪵'
  },
  {
    id: 'slide-4',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'صالون سوبر لوكس فائق النقاء برخام فاخر وألوان متناسقة 🌟',
    labelEn: 'Sleek minimalistic polished white stone & steel-blue salon 🌟'
  }
];

export const HOME_COMPARISON = {
  ar: {
    title: "مقارنة صريحة: التشطيب التقليدي مقابل التشطيب الذكي مع شطبها",
    subtitle: "لماذا يحتاج مالك العقار إلى شطبها من الأساس لتجنب أزمات ومخاطر السوق؟",
    traditional: {
      title: "التشطيب بالطريقة التقليدية (حيرة ومخاطرة)",
      items: [
        { title: "إزعاج واتصالات عشوائية", text: "سماسرة ومسوقون مجهولون يزعجون هاتفك ليل نهار بعروض وهمية وغير مدروسة لجرّك لعقود عشوائية." },
        { title: "تلاعب في التكاليف الفنية والمصنعية", text: "تفاجأ بزيادات مستمرة وطلب مبالغ تكميلية مراراً وتكراراً بعد عملية توقيع العقود والاتفاق." },
        { title: "استلام بلا أي رقابة هندسية", text: "تعتمد كلياً على وعود الصنايعية وتستلم بنود السباكة والكهرباء والدهانات دون فحص هندسي دقيق لمشاكلها المستترة." },
        { title: "انعدام الضمان وضياع المستحقات", text: "تضطر لتقديم مبالغ مالية ضخمة للمقاول كمقدم عمل دون وجود شروط قانونية قوية أو ربط للمقاول مع التسليم." }
      ]
    },
    shattabha: {
      title: "التشطيب مع منصة شطبها (أمان وجودة وراحة بال)",
      items: [
        { title: "خصوصية مطلقة وأرقام هاتف مؤمنة", text: "رقمك وبياناتك مشفرة ومحجوبة بالكامل؛ تظهر عروض الأسعار على لوحة التحكم الإلكترونية لتقارنها بأمان وبموافقتك." },
        { title: "عقود ثلاثية وتسعير نهائي ثابت", text: "بنود وجداول تسعير دقيقة ملزمة توثق جميع خامات التشطيب ونوعيتها وتمنع أي مطالبات مالية مفاجئة." },
        { title: "إشراف هندسي ومفتش فني مستقل", text: "يقوم مهندسون استشاريون معتمدون بالموقع بمعاينة وفحص واستلام كل مرحلة تشطيب فنية طبقاً للكود الهندسي." },
        { title: "ربط الدفعات بالاستلام (حساب الضمان)", text: "لا تدفع جنيهاً واحداً للمقاول إلا بعد استلام المشرف الهندسي للمرحلة وجاهزية الإفراج وبطوع إرادتك الكاملة." }
      ]
    }
  },
  en: {
    title: "Comparison: Traditional Contracting vs. Shatibha Smart Oversight",
    subtitle: "Why property owners count on Shatibha to shield their construction capital and ensure standard specifications.",
    traditional: {
      title: "Traditional Contracting (Vague & High Risk)",
      items: [
        { title: "Spam Phone Calls & Intrusive Sales", text: "Unlicensed brokers violating your privacy, calling day and night with unorganized quotes." },
        { title: "Surprise Post-Contract Costs", text: "Sudden claims for premium additions and extra money demanded midway through contracting stages." },
        { title: "Blind Handovers Without Professional Audit", text: "Relying purely on workers words, leaving critical plumbing and electrical mistakes undiscovered." },
        { title: "Prepayments Risk & Vanishing Guarantees", text: "Releasing major deposits to unverified individuals with zero legal recourse to ensure execution." }
      ]
    },
    shattabha: {
      title: "Finishing with Shatibha (Security, Quality & Trust)",
      items: [
        { title: "100% Client Privacy Shield", text: "Your credentials are safe and hidden. Certified tenders are loaded on your personal screen without phone spam." },
        { title: "Stiff Fixed-Cost Tripartite Contract", text: "Detailed legal blueprints locking materials, brands, timelines, and exact prices securely." },
        { title: "Certified Independent On-Site Inspections", text: "On-site consultant engineers examine and audit every execution detail to clear construction standards." },
        { title: "Smart Payment Escrow Workspaces", text: "Money is kept secure. Funds are only triggered step-by-step upon technical inspections cleared by you." }
      ]
    }
  }
};

export const HOME_FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: 'proj-1',
    nameAr: 'شقة سكنية واجهة ليد - مدينتي 🌟',
    nameEn: 'Elite Classic Apartment - Madinaty 🌟',
    locationAr: 'القاهرة الجديدة، مدينتي',
    locationEn: 'New Cairo, Madinaty',
    areaAr: '١٧٥ م²',
    areaEn: '175 sqm',
    levelAr: 'سوبر لوكس',
    levelEn: 'Super Lux',
    descAr: 'تصميم يمزج بين الكلاسيكية الهادئة والمودرن بألوان دهانات جوتن الراقية، تأسيس شبكة السويدي للكهرباء المعتمدة واستلام هندسي كامل لمراحل العزل المائي والحراري بمنتجات سيكا العالمية.',
    descEn: 'A pristine blend of cozy classic aesthetics and modern clean lines finished with premium Jotun paints, Elsewedy certified electric cables, and double-certified Sika waterproofing across master bathrooms.',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'proj-2',
    nameAr: 'فيلا مستقلة بإطلالة زجاجية - الشيخ زايد 🏡',
    nameEn: 'Luxury Glass Villa - Sheikh Zayed 🏡',
    locationAr: 'الشيخ زايد، جيزة',
    locationEn: 'Sheikh Zayed, Giza',
    areaAr: '٣٨٠ م²',
    areaEn: '380 sqm',
    levelAr: 'فاخر / ألترا لوكس',
    levelEn: 'Ultra Luxury Premium',
    descAr: 'فيلا متكاملة بأرقى تكسيات الرخام المستورد والجبسيوم بورد المعاصر مع أنظمة إضاءة مخفية دافئة ذكية، مطابخ رخام أسود فاخرة وتأسيس دقيق وعزل للسباكة مع تقارير الفحص الفني خطوة بخطوة.',
    descEn: 'An aesthetic modern villa clad in polished Italian stone with custom gypsum-board drop ceilings. Includes integrated hidden intelligent LEDs, full plumbing and insulation under certified inspector supervision.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'proj-3',
    nameAr: 'مقر شركة جلوبال فايبر - التجمع الخامس 🏢',
    nameEn: 'Global Fiber Office HQ - 5th Settlement 🏢',
    locationAr: 'التجمع الخامس، القاهرة الجديدة',
    locationEn: 'Fifth Settlement, New Cairo',
    areaAr: '١٢٠ م²',
    areaEn: '120 sqm',
    levelAr: 'بريميوم إداري',
    levelEn: 'Premium Corporate',
    descAr: 'إعادة تهيئة كاملة مع توير توزيع لوحات الكهرباء لخدمة غرف الخوادم، جدران وحوائط عازلة للصوت والحرارة، دهانات فينوماستيك جوتن لمقاومة الاحتكاك وسهولة التنظيف وواجهة إضاءة ممتازة.',
    descEn: 'A fully integrated smart office layout with dedicated heavy-duty power lines for high-density server rooms, acoustic isolation partitions, anti-scratch Jotun coating, and verified architectural layouts.',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

export const HOME_TESTIMONIALS: Testimonial[] = [
  {
    initial: 'أ',
    nameAr: 'المهندس أحمد رشاد',
    nameEn: 'Eng. Ahmed Rashad',
    locationAr: 'عميل شطبها - شقة بمدينتي',
    locationEn: 'Shatibha Client - Apartment in Madinaty',
    textAr: 'أكاد لا أصدق سهولة تجربة تشطيب منزلي! سجلت طلبي في دقائق، واستقبلت ٣ عروض دقيقة وبنود الخامات مفصلة في لوحة مقارنة واحدة. الأجمل أن رقم هاتفي مع شطبها ظل سرياً ومحجوباً وتخلصت تماماً من اتصالات السماسرة ومقالي الإزعاج التقليدية.',
    textEn: 'I can barely believe how straightforward it was to finish my home. I submitted my unit size, and got 3 tenders mapped side-by-side with exact metrics. Best of all, my phone remained completely hidden from annoying spam brokers.',
    rating: 5
  },
  {
    initial: 'م',
    nameAr: 'المهندسة منى عاصم',
    nameEn: 'Eng. Mona Assem',
    locationAr: 'عميلة شطبها - فيلا بالشيخ زايد',
    locationEn: 'Shatibha Client - Villa in Sheikh Zayed',
    textAr: 'نظام ربط الدفعات بالاستلام الهندسي غير مسبوق! المقاول كان مهتماً بأعلى درجات الالتزام والجودة لأن الكاش لن يخرج له من حساب الضمان بالمنصة إلا بنزول المفتش الهندسي واستلام البنود بالمللي وفحص خطوط السباكة والعزل بدقة.',
    textEn: 'The milestone escrow integration is revolutionary! The interior builder worked meticulously knowing funds would only land in their balance from escrow once Shatibhas inspector approves the quality of the raw installation.',
    rating: 5
  },
  {
    initial: 'ش',
    nameAr: 'شريف عبد الرحمن',
    nameEn: 'Sherif Abdel-Rahman',
    locationAr: 'عميل شطبها - الإسكندرية',
    locationEn: 'Shatibha Client - Alexandria',
    textAr: 'وداعاً للسماسرة والاتصالات العشوائية المزعجة! حظرت رقم هاتفي وسجلت شقتي بمساحة 150م² بالإسكندرية، وقارنت البنود والخامات بكل سهولة من خلال مستشار المقارنة الذكي بالمنصة. شطبها وفرت عليّ الجهد والمال ورافقتنا بالأمان',
    textEn: 'Goodbye to brokers and annoying random calls! I hid my phone number, registered my 150 sqm apartment in Alexandria, and compared terms and materials with ease through our smart comparison consultant on the platform. Shattabha saved my effort, money, and kept us secure.',
    rating: 5
  },
  {
    initial: 'د',
    nameAr: 'الدكتورة دينا الصاوي',
    nameEn: 'Dr. Dina El-Sawy',
    locationAr: 'عميلة غائبة بالخارج - التجمع الخامس',
    locationEn: 'Expat Client - New Cairo',
    textAr: 'كمغتربة تمنيت الحصول على عين تحرس عقاري وتشرف عليه بالمرصاد. مهندس فحص شطبها الميداني كان يرسل التقارير خطوة بخطوة بالصور التوثيقية الدقيقة لكل مرحلة، مع تقرير هندسي بصافي القياسات. وفروا علي القلق والتذاكر ووهبوني راحة بال تامة.',
    textEn: 'As an expat doctor living abroad, finding a trusted eye in Egypt was critical. Shatibhas technical field inspectors updated me constantly with pristine snapshots and site logs on each stage. Exquisite support and supreme quietude.',
    rating: 5
  }
];

export const HOME_FAQ: FAQItem[] = [
  {
    qAr: 'كيف يختار شطبها شركات التشطيب المعتمدة؟',
    qEn: 'How does Shatibha select and verify interior companies?',
    aAr: 'شطبها تتبع ميثاق أمان صارم؛ حيث نخضع الشركات المسجلة لبلدية وتفتيش قانوني كامل يراجع السجل التجاري والملف الضريبي وصحة التراخيص، مع زيارة ميدانية هندسية لسابقة أعمالهم ومعاينتها هندسياً.',
    aEn: 'Shatibha follows a strict security code; we audit and inspect every single newly registered outfit checking their active commercial license, tax status, legal certifications, and touring their actual previous build spots.'
  },
  {
    qAr: 'هل يتطلب الإشراف الميداني الهندسي اختيار المقاول من داخل المنصة؟',
    qEn: 'Do I have to select a contractor from the platform to request supervision?',
    aAr: 'أبداً! باقة الإشراف الهندسي الميداني المستقل من شطبها تتوفر كخدمة مستقلة تماماً لحماية ميزانيتك، حيث يمكنك تعيين مهندس من المنصة للإشراف والتحقق من جودة البناء لدى أي مقاول خارجي تتعاقد معه ومطابقتها للكود المصري.',
    aEn: 'Not at all! Independent sight engineers on Shatibha can be hired as a separate dedicated service to safeguard your budget and review execution compliance of any external contractor you selected privately.'
  },
  {
    qAr: 'كيف يتم تأمين وحفظ دفعاتي المالية بنظام حماية أموال شطبها؟',
    qEn: 'How are my finances kept safe under Shatibhas security system?',
    aAr: 'تقوم بإيداع الدفعات المجزأة الخاصة بمشروعك في حساب الضمان المستقل بالشركة. ولا نقوم بتحويل أو فك أي دفعة مالية للمقاول المنفذ إلا بعد نزول مهندس الاستلام والاستشاري الميداني، والتوقيع الفني المزدوج للمرحلة وموافقتك الكاملة.',
    aEn: 'Your project payments are segmented and held securely inside our protected corporate escrow account. Transacting money to the builder only triggers upon technical field inspectors clearance reports followed by your final consent.'
  },
  {
    qAr: 'ما هي الطريقة التي يضمن بها شطبها عدم إزعاجي بالاتصالات؟',
    qEn: 'How does Shatibha guarantee that I will not be bothered by spam calls?',
    aAr: 'على عكس المواقع التقليدية والأدلة العامة، تلتزم شطبها بتعمية وحظر إظهار رقم هاتفك المحمول أو هويتك الشخصية لأي مقاول. ترفع مواصفات المبنى كطلب مجهول الهوية، وتتلقى العروض التنافسية على لوحة مقارنتك بموقعنا بكل أمان.',
    aEn: 'Unlike directories, Shatibha enforces active data encryption. Your personal identity and phone number are masked completely. Contractors issue technical tenders only using your buildings parameters anonymously on your display.'
  },
  {
    qAr: 'كيف يتم احتساب تسعير باقات المعاينة والإشراف الفني؟',
    qEn: 'How are technical inspection & supervision fees calculated?',
    aAr: 'تُحتسب الرسوم إما بنسبة مئوية تيسيرية مخفضة ومحددة سلفاً وبوضوح شديد تندمج مع العقد المالي، أو بنظام زيارة استلام المرحلة الواحدة المحددة بسعر ثابت منافس يتناسب تماماً مع حماية عقارك من الخسائر المادية ومخالفات الكود.',
    aEn: 'Supervision fees are structured either as a transparent low percentage integrated in the tripartite bundle or on a pre-fixed flat-rate inspection visit scheme, keeping costs highly competitive and securing building integrity.'
  }
];

export const HOME_PACKAGES = [
  {
    id: 'pkg-eco',
    nameAr: 'باقة تشطيب اقتصادي 📋',
    nameEn: 'Economic Standard Package 📋',
    priceAr: '٤،٥٠٠ ج.م / م²',
    priceEn: '4,500 EGP / sqm',
    featuresAr: [
      'تأسيس سباكة معتمد بمواسير بي آر الألمانية وضمان ٢٠ سنة',
      'تأسيس الكهرباء بالكامل بأسلاك السويدي المعتمدة الأصيلة',
      'حليات كرانيش جبسية كلاسيكية ناعمة للصالات والممرات',
      'دهانات ٣ أوجه سايبس أو كابسي بمظهر متجانس ومقبول',
      'سيراميك كليوباترا فرز أول للأرضيات والحوائط بالكامل'
    ],
    featuresEn: [
      'German-certified BR plumbing with a full 20-year guaranty',
      'Complete wiring using authentic certified Elsewedy cables',
      'Smooth classical gypsum decorative profiles in lounge rows',
      '3-coat standard paints using Scib or Kapci quality supplies',
      '1st grade Ceramics Cleopatra flooring and bathroom clad'
    ]
  },
  {
    id: 'pkg-lux',
    nameAr: 'باقة تشطيب متوسط / لوكس 👷',
    nameEn: 'Smart Lux Package 👷',
    priceAr: '٦،٥٠٠ ج.م / م²',
    priceEn: '6,500 EGP / sqm',
    featuresAr: [
      'تأسيس سباكة مع كود الشريف المعتمد وعزل مائي بالبيتومين',
      'أطقم حمامات ديورافيت فرز أول وخلاطات جروهي الشهيرة',
      'تأسيس الكهرباء بكابلات السويدي وإكسسوارات شنايدر إليكتريك',
      'أسقف معلقة كناوف جبسيوم بورد عصرية بالصالات مع بيت النور',
      'أرضيات سيراميك الجوهرة أو رويال فرز أول بمقاسات كبيرة',
      'دهانات جوتن الأنيقة والمقاومة للمياه والاتساخ لتنظيف مثالي'
    ],
    featuresEn: [
      'Al-Shareef certified plumbing and bituminous moisture lining',
      'Duravit high-class sanitary-ware paired with Grohe mixers',
      'Full wiring with Elsewedy premium cords and Schneider switches',
      'Seamless Knauf board drop ceiling with led strip light beds',
      'El-Jawhara or Royal large-format polished tiles',
      'Beautiful washable Jotun paints ensuring long service years'
    ]
  },
  {
    id: 'pkg-super',
    nameAr: 'باقة سوبر لوكس عصرية ✨',
    nameEn: 'Super Lux Modern Package ✨',
    priceAr: '٩،٠٠٠ ج.م / م²',
    priceEn: '9,000 EGP / sqm',
    featuresAr: [
      'تثبيت وتأسيس عزل كيميائي متقدم للحمامات مع منتجات سيكا',
      'بورسلين كليوباترا أو رويال مستورد لامع فرز أول للصالات',
      'تكسيات بديل خشب وبديل رخام جدارية فنية أنيقة بالريسيبشن',
      'أسقف معلقة جبسيوم بورد متكاملة مع خطوط ليد بروفايل حديثة',
      'أبواب غرف خشب سويدي سميك مطلي استر باللون المطلوب',
      'شبكة تكييفات مجهزة وأسلاك نحاسية معزولة مخفية تحت الجدران',
      'دهانات جوتن فينوماستيك حريري الملمس الخلاب والخالي من العيوب'
    ],
    featuresEn: [
      'Sika chemical isolation layer for complete leakage shielding',
      'Sparkling Cleopatra or Royal shiny Porcelain floors for halls',
      'Elegant wood cladding alternative and marble pvc wall sets',
      'Detailed gypsum false-ceilings fitted with LED profile layouts',
      'Dense Swedish wooden solid doors spray-coated as preferred',
      'Concealed built-in copper cabling routes for split AC units',
      'Luxury Jotun Fenomastic silk finishing coats for pristine walls'
    ]
  },
  {
    id: 'pkg-premium',
    nameAr: 'باقة الترا لوكس / فاخر 👑',
    nameEn: 'Premium Royal Villa Package 👑',
    priceAr: '١٣،٠٠٠ ج.م / م²',
    priceEn: '13,000 EGP / sqm',
    featuresAr: [
      'ريسيبشن وصالونات مفروشة برخام إيطالي طبيعي مستورد بالكامل',
      'أطقم حمامات ديورافيت معلقة داخل الجدار وجروهي إلكتروني',
      'إكسسوارات شنايدر وقواطع كهربائية ذكية متصلة بالهاتف الذكي',
      'تكسيات حائط خشب أرو طبيعي وتصميمات خشبية مصنوعة خصيصاً',
      'أرضيات باركيه خشب مسمار حقيقي لغرف النوم الرئيسية والماستر',
      'أنظمة سمارت هوم تحكم في الإضاءة والتكييف والتلفاز بلمسة زر',
      'أبواب خشب زان ثقيل مع أحدث المفصلات المانعة للصوت ورفاهية قصوى'
    ],
    featuresEn: [
      'Main receptions completely floored in premium Italian natural Marble',
      'Wall-hung sleek Duravit restrooms with integrated sensory mixers',
      'Smart Schneider Electric sockets and remote phone breakers',
      'Premium natural Oak wooden cladding and bespoke carpentry sheets',
      'Solid teakwood parquet flooring in master rooms and master suite',
      'Integrated Smart Home automation for climate, TVs & LED layouts',
      'Heavy beechwood doors fitted with magnetic latch sound insulation'
    ]
  }
];
