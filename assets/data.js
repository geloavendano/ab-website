/* Prototype content store.
 *
 * Mirrors the CMS collections in "redesign plan/system-architecture.md" §3,
 * so the client sees the real data model while clicking through.
 *
 * Source: angatbuhay.ph (scraped Oct 2026). Titles, authors, dates, team and
 * pillar copy are real. Story formats, project/area tags, implementation dates
 * and anything with `sample: true` are ILLUSTRATIVE and need client confirmation.
 *
 * MEDIA: photos are hot-linked from angatbuhay.ph/wp-content (paths below are
 * relative to media.base). The hero video is the montage the live homepage plays
 * (served from a third-party domain, as on the live site). The Liloan story uses
 * Instagram's official embed.
 * Photo-to-project pairings are a best guess from filenames — confirm with comms.
 */
window.AB = {

  media: {
    base: "https://www.angatbuhay.ph/wp-content/uploads/",
    heroVideo: "https://www.neithan.rocks/mid.mp4",
    heroPoster: "2024/09/22-1024x683.jpg"
  },

  org: {
    name: "Angat Buhay",
    legalName: "Angat Pinas, Inc.",
    intro: "Angat Pinas, Inc., commonly known as Angat Buhay, is a Filipino non-profit organization that aims to empower Filipinos to become communities of active citizens by mobilizing the largest volunteer network in implementing Bayanihan programs.",
    mission: "Responding to the needs of marginalized communities by mobilizing the largest volunteer network in implementing Bayanihan programs.",
    vision: "To empower Filipinos in becoming communities of active citizens as we collectively pursue a life of dignity and hope.",
    values: [
      { en: "Creative & Effective Responsiveness", fil: "Malikhain at mahusay na pagtugon" },
      { en: "Collective Spirit of Community Towards Solidarity", fil: "Bayanihan tungo sa pakikipagkapwa" },
      { en: "Accountability in the Service to the Nation", fil: "Pananagutan para sa bayan" }
    ],
    accreditation: "Angat Buhay is a non-government organization accredited by the Philippine Council for NGO Certification (PCNC) and certified with ISO 9001:2015 – Quality management systems, ensuring its commitment to transparency, accountability, and operational excellence.",
    solicitationPermit: "DSWD-SB-PSP-S-2025-000049",
    email: "info@angatbuhay.ph",
    partnershipsEmail: "partnerships@angatbuhay.ph",
    socials: [
      { name: "Facebook", url: "https://www.facebook.com/angatbuhaypilipinas" },
      { name: "Instagram", url: "https://www.instagram.com/angatbuhay/" },
      { name: "TikTok", url: "https://www.tiktok.com/@angatbuhaypinas" },
      { name: "X", url: "https://x.com/angatbuhay_ph" }
    ]
  },

  /* ---------- AdvocacyPillar ---------- */
  pillars: [
    { slug: "public-education", image: "2024/09/Day-7_Don-Abella-CS-12-1024x683.jpg", name: "Public Education",
      tagline: "Championing accessible and inclusive quality education for every Filipino",
      description: "Angat Buhay champions accessible and inclusive quality education for every Filipino child. Through initiatives that include literacy and numeracy interventions, we promote a love for learning and ensure that students are skilled and equipped for employment. We also work with partners to provide facilities that enable effective learning, especially in the most vulnerable areas of the country." },
    { slug: "health-nutrition-food-security", image: "2024/09/IMG_1853-1024x683.jpg", name: "Health, Nutrition & Food Security",
      tagline: "Ensuring that Filipinos have access to quality healthcare and proper nutrition",
      description: "Angat Buhay aims to ensure that every Filipino has access to quality healthcare and proper nutrition. We partner with organizations and mobilize volunteers to provide holistic interventions that improve the mental well-being, nutrition, and overall health of families in need." },
    { slug: "climate-action-sustainability", image: "2024/09/22-1024x683.jpg", name: "Climate Action & Sustainability",
      tagline: "Building resilience and long-term strategies that mitigate the impact of future disasters",
      description: "Angat Buhay assists disaster-stricken areas by providing immediate assistance, supporting rehabilitation initiatives, and delivering interventions for risk reduction and resiliency." },
    { slug: "community-engagement", image: "2024/09/Kababaihan-10-e1726462055812.jpg", name: "Community Engagement",
      tagline: "Engaging stakeholders, sectors and volunteers towards active social involvement",
      description: "Angat Buhay believes that active citizenship and people's participation and empowerment are essential in the fight against poverty. We harness the true spirit of bayanihan and engage stakeholders and volunteers to become actively involved in projects that uplift their communities." },
    { slug: "arts-culture", image: "2024/09/weaving-3.jpg", name: "Arts and Culture",
      tagline: "Empowering young Filipino artists and serving as a platform for inclusive learning",
      description: "Angat Sining fosters an inclusive space for mutual learning, dialogue, and networking between emerging young talent and established artists in the Philippines." }
  ],

  /* ---------- Area (PSGC hierarchy: region > province > city/municipality) ---------- */
  areas: [
    { id: "ncr", name: "National Capital Region", type: "region", parent: null },
    { id: "makati", name: "Makati City", type: "city", parent: "ncr" },
    { id: "quezon-city", name: "Quezon City", type: "city", parent: "ncr" },

    { id: "r5", name: "Bicol Region (Region V)", type: "region", parent: null },
    { id: "camarines-sur", name: "Camarines Sur", type: "province", parent: "r5" },
    { id: "naga", name: "Naga City", type: "city", parent: "camarines-sur" },
    { id: "albay", name: "Albay", type: "province", parent: "r5" },
    { id: "legazpi", name: "Legazpi City", type: "city", parent: "albay" },
    { id: "catanduanes", name: "Catanduanes", type: "province", parent: "r5" },
    { id: "sorsogon", name: "Sorsogon", type: "province", parent: "r5" },

    { id: "r4b", name: "MIMAROPA Region", type: "region", parent: null },
    { id: "palawan", name: "Palawan", type: "province", parent: "r4b" },

    { id: "r6", name: "Western Visayas (Region VI)", type: "region", parent: null },
    { id: "iloilo", name: "Iloilo", type: "province", parent: "r6" },
    { id: "ajuy", name: "Ajuy", type: "municipality", parent: "iloilo" },
    { id: "concepcion", name: "Concepcion", type: "municipality", parent: "iloilo" },
    { id: "carles", name: "Carles", type: "municipality", parent: "iloilo" },
    { id: "cabatuan", name: "Cabatuan", type: "municipality", parent: "iloilo" },

    { id: "r7", name: "Central Visayas (Region VII)", type: "region", parent: null },
    { id: "cebu", name: "Cebu", type: "province", parent: "r7" },
    { id: "liloan", name: "Liloan", type: "municipality", parent: "cebu" },

    { id: "r11", name: "Davao Region (Region XI)", type: "region", parent: null },
    { id: "davao-del-sur", name: "Davao del Sur", type: "province", parent: "r11" }
  ],

  /* ---------- Project (implementation dates ≠ publish dates) ---------- */
  projects: [
    { id: "bayan-ko-titser-ko", image: "2024/09/Day-7_Don-Abella-CS-60-1024x683.jpg", pillar: "public-education", title: "Bayan Ko, Titser Ko",
      summary: "Literacy and numeracy program for struggling early-grade learners, delivered by trained volunteer tutors.",
      areas: ["naga", "iloilo", "quezon-city"], start: "2022-09-01", end: null, status: "published" },
    { id: "early-learning-spaces", image: "2026/02/AB-Small-Spaces-1.jpg", pillar: "public-education", title: "Early Learning Spaces",
      summary: "Classrooms and community-based Educare centers that give young learners safe, conducive spaces to learn.",
      areas: ["naga"], start: "2023-06-01", end: null, status: "published" },
    { id: "dormitory-young-women", image: "2024/09/SorSuDorm_Turnover-6-1024x683.jpg", pillar: "public-education", title: "Dormitory for Young Women",
      summary: "Safe, secure living spaces for young women from far-flung areas so they can pursue their education.",
      areas: ["sorsogon", "palawan"], start: "2023-01-15", end: "2024-03-30", status: "published" },

    { id: "iloilo-greenhouses", image: "2026/02/AB-Greenhouse-2.jpg", pillar: "health-nutrition-food-security", title: "Hapag ng Ani: Iloilo Greenhouses",
      summary: "Community-owned greenhouse facilities supporting a malnutrition-free Iloilo, turned over in Carles, Cabatuan, Ajuy and Concepcion.",
      areas: ["carles", "cabatuan", "ajuy", "concepcion"], start: "2024-02-01", end: "2026-01-31", status: "published" },
    { id: "school-feeding", image: "2024/09/IMG_1853-1024x683.jpg", pillar: "health-nutrition-food-security", title: "School-Based Feeding Program",
      summary: "Nutritious meals for early-grade learners enrolled in Bayan Ko, Titser Ko.",
      areas: ["naga", "iloilo"], start: "2023-08-01", end: null, status: "published" },
    { id: "e-konsulta", image: "2024/09/IMG_1927-1024x683.jpg", pillar: "health-nutrition-food-security", title: "Bayanihan E-Konsulta",
      summary: "Free teleconsultations bringing healthcare closer to underserved communities.",
      areas: ["ncr"], start: "2022-10-01", end: null, status: "published" },

    { id: "disaster-relief-2025", image: "2024/09/Polillo-Islands-Turnover_4-e1726462290178.jpg", pillar: "climate-action-sustainability", title: "Typhoon Response 2025",
      summary: "From hot meals and food packs to shelter repair kits and livelihood boats: relief and recovery after Typhoons Tino and Uwan.",
      areas: ["liloan", "cebu", "catanduanes"], start: "2025-11-04", end: "2026-05-31", status: "published" },
    { id: "angat-kalikasan", image: "2024/09/22-1024x683.jpg", pillar: "climate-action-sustainability", title: "Angat Kalikasan",
      summary: "Training Sangguniang Kabataan members in environmental governance, leadership and sustainability.",
      areas: ["iloilo", "davao-del-sur"], start: "2024-03-01", end: "2024-11-30", status: "published" },

    { id: "abvn", image: "2024/09/baklaya-9-1024x768.jpg", pillar: "community-engagement", title: "Angat Bayanihan Volunteer Network",
      summary: "A network of civil society organizations and individual volunteers across 48 provinces and 11 countries.",
      areas: ["ncr", "r5", "r6", "r7", "r11"], start: "2022-07-01", end: null, status: "published" },

    { id: "angat-sining-fellowship", image: "2024/09/weaving-3.jpg", pillar: "arts-culture", title: "Angat Sining Fellowship for Visual Arts",
      summary: "Mentorship and exhibition opportunities for emerging young Filipino visual artists.",
      areas: ["ncr"], start: "2023-05-01", end: null, status: "published" },
    { id: "angat-sining-arkitektura", image: "2026/01/AB-building-with-people-1-1024x683.jpg", pillar: "arts-culture", title: "Angat Sining Arkitektura Internship",
      summary: "Young architects design for communities at the margins, guided by practitioners.",
      areas: ["ncr", "naga"], start: "2025-03-01", end: "2025-08-31", status: "published" },
    { id: "museo-ng-pag-asa", pillar: "arts-culture", title: "Museo ng Pag-asa",
      summary: "A museum of the 2022 volunteer campaign, inviting visitors into community service and active citizenship.",
      areas: ["quezon-city"], start: "2022-10-01", end: null, status: "published" }
  ],

  /* ---------- Story (feed order = publishedAt only) ---------- */
  stories: [
    { slug: "bayanihan-in-action", format: "video", featured: true, sample: true,
      title: "Bayanihan in Action",
      subheading: "Volunteers, partners and communities across the Philippines, in their own words.",
      pillar: "community-engagement", project: "abvn", areas: ["ncr", "r5", "r6", "r7", "r11"],
      author: "Angat Buhay", status: "published", publishedAt: "2026-03-01T09:00:00+08:00",
      videoUrl: "https://www.neithan.rocks/mid.mp4",
      body: [
        "[This is the 3:52 montage the current homepage plays: farms and community gardens, volunteers on stage, and testimonials from community members. Real title, description and date to be supplied by the comms team.]"
      ] },

    { slug: "from-immediate-relief-to-long-term-recovery", format: "video",
      title: "From Immediate Relief to Long-Term Recovery",
      subheading: "In Liloan, Cebu, fisherfolk hit by Typhoon Tino are back at sea with 40 new fishing boats.",
      pillar: "climate-action-sustainability", project: "disaster-relief-2025", areas: ["liloan"],
      author: "Angat Buhay", status: "published", publishedAt: "2026-06-15T18:00:00+08:00",
      embedUrl: "https://www.instagram.com/p/DdBb9ilhm5o/embed/",
      alsoOn: [["Instagram", "https://www.instagram.com/p/DdBb9ilhm5o/"]],
      body: [
        "For communities recovering from disaster, rebuilding means more than meeting immediate needs. It means creating the conditions for families to recover, regain their livelihoods, and move toward a more sustainable future.",
        "In Liloan, Cebu, support for fisherfolk affected by Typhoon Tino began with hot meals and food packs, followed by shelter repair kits. Months later, Angat Buhay came back to turn over 40 fishing boats to 40 families, helping them return to work and rebuild their independence.",
        "Made possible by VXI Global Holdings BV PH and Kumbira Cafe and Grill, with on-the-ground support from Angat Cebu BPO and Angat Liloan."
      ] },

    { slug: "hapag-ng-ani-what-are-we-feeding-our-children", image: "2026/02/AB-Hapag-ng-Ani-4-1.jpg", format: "article",
      title: "Hapag ng Ani: What Are We Feeding Our Children?",
      subheading: "Two greenhouses in Ajuy and Isla Tambaliza join Iloilo's push for a malnutrition-free province.",
      pillar: "health-nutrition-food-security", project: "iloilo-greenhouses", areas: ["ajuy", "concepcion"],
      author: "Zerenea Pollicar", status: "published", publishedAt: "2026-02-03T09:00:00+08:00",
      gallery: ["2026/02/AB-Hapag-ng-Ani-1-1024x682.jpg", "2026/02/AB-Hapag-ng-Ani-3-1024x683.jpg"] },

    { slug: "two-greenhouse-facilities-iloilo", image: "2026/02/AB-Greenhouse-2.jpg", format: "article",
      title: "Angat Buhay Turns Over Two Greenhouse Facilities in Iloilo",
      subheading: "Bringing the total to four community-owned greenhouses across the province.",
      pillar: "health-nutrition-food-security", project: "iloilo-greenhouses", areas: ["ajuy", "concepcion"],
      author: "Milliesa Flores", status: "published", publishedAt: "2026-02-03T08:00:00+08:00" },

    { slug: "small-spaces-big-beginnings", image: "2026/02/AB-Small-Spaces-1.jpg", format: "article",
      title: "Small Spaces, Big Beginnings: Building Strong Foundations for Young Filipino Learners",
      subheading: "In Naga City, a chapel becomes a classroom for a community Educare center.",
      pillar: "public-education", project: "early-learning-spaces", areas: ["naga"],
      author: "Sabina Ma", status: "published", publishedAt: "2026-02-03T07:00:00+08:00" },

    { slug: "sustainable-cabatuan-demo-farm", image: "2026/02/AB-Cabanatuan-Demo-Farm-3.jpg", format: "video",
      title: "SustainABLE: Cabatuan Demo Farm cultivates more than just crops",
      subheading: "A demonstration farm grows skills and livelihoods alongside vegetables.",
      pillar: "health-nutrition-food-security", project: "iloilo-greenhouses", areas: ["cabatuan"],
      author: "Stela Militante", status: "published", publishedAt: "2026-02-03T06:00:00+08:00" },

    { slug: "nationwide-relief-typhoons-tino-uwan", image: "2026/01/Dinagat.jpg", format: "article",
      title: "Angat Buhay Delivers Nationwide Relief Due To Super Typhoons Tino, Uwan",
      subheading: "The Angat Bayanihan Volunteer Network served 16 provinces after back-to-back typhoons.",
      pillar: "climate-action-sustainability", project: "disaster-relief-2025", areas: ["cebu", "catanduanes"],
      author: "Eunicito Barreno", status: "published", publishedAt: "2026-01-30T10:00:00+08:00" },

    { slug: "free-checkup-glasses-naga", image: "2026/01/AB-eyesight-1.jpg", format: "article",
      title: "Angat Buhay gives free check-up, glasses to children with poor eyesight in Naga City",
      subheading: "Learners in Bayan Ko, Titser Ko receive eye screening and prescription eyeglasses.",
      pillar: "public-education", project: "bayan-ko-titser-ko", areas: ["naga"],
      author: "Eunicito Barreno", status: "published", publishedAt: "2026-01-30T09:00:00+08:00" },

    { slug: "building-with-people-at-the-center", image: "2026/01/AB-building-with-people-1-1024x683.jpg", format: "article",
      title: "Building With People at the Center",
      subheading: "An architecture alumna on why the true foundation of a building is its people.",
      pillar: "arts-culture", project: "angat-sining-arkitektura", areas: ["ncr"],
      author: "Milliesa Flores", status: "published", publishedAt: "2026-01-21T09:00:00+08:00" },

    { slug: "designing-with-empathy", image: "2025/10/AB-Designing-with-Empathy-1-1024x683.jpg", format: "article",
      title: "Designing with Empathy: Young Architects Build for Communities at the Margins",
      subheading: "The Angat Sining Arkitektura Internship Program comes to a close.",
      pillar: "arts-culture", project: "angat-sining-arkitektura", areas: ["ncr", "naga"],
      author: "Milliesa Flores", status: "published", publishedAt: "2025-09-24T09:00:00+08:00" },

    /* --- Sample stories: show the other formats and statuses --- */
    { slug: "bktk-impact-at-a-glance", format: "infographic", sample: true,
      title: "Bayan Ko, Titser Ko: Impact at a Glance",
      subheading: "1,156 struggling learners across 18 sites improved their literacy.",
      pillar: "public-education", project: "bayan-ko-titser-ko", areas: ["naga", "iloilo", "quezon-city"],
      author: "Communications Team", status: "published", publishedAt: "2025-08-12T09:00:00+08:00",
      textVersion: "1,156 struggling learners in 18 sites nationwide improved their literacy skills through the Bayan Ko, Titser Ko program. 146 early-grade learners in the school-based feeding program achieved normal nutritional status." },

    { slug: "a-day-with-a-reading-volunteer", image: "2024/09/Day-7_Don-Abella-CS-60-1024x683.jpg", format: "video", sample: true,
      title: "A Day with a Reading Volunteer",
      subheading: "Follow a volunteer tutor through one Saturday session in Naga City.",
      pillar: "public-education", project: "bayan-ko-titser-ko", areas: ["naga"],
      author: "Communications Team", status: "published", publishedAt: "2025-07-02T09:00:00+08:00" },

    { slug: "abvn-in-numbers", format: "infographic", sample: true,
      title: "The Angat Bayanihan Volunteer Network in Numbers",
      subheading: "87 civil society organizations, 48 provinces, 11 countries.",
      pillar: "community-engagement", project: "abvn", areas: ["ncr", "r5", "r6", "r7", "r11"],
      author: "Communications Team", status: "published", publishedAt: "2025-06-18T09:00:00+08:00",
      textVersion: "87 civil society organizations strengthened through the Angat Bayanihan Volunteer Network, reaching 48 provinces and 11 countries. 1,456 unique volunteers mobilized." },

    { slug: "e-konsulta-one-year", image: "2024/09/IMG_1927-1024x683.jpg", format: "article", sample: true,
      title: "Bayanihan E-Konsulta: Bringing the Clinic Closer",
      subheading: "269 patients accessed free teleconsultations.",
      pillar: "health-nutrition-food-security", project: "e-konsulta", areas: ["ncr"],
      author: "Communications Team", status: "published", publishedAt: "2025-05-06T09:00:00+08:00" },

    { slug: "sk-leaders-angat-kalikasan", image: "2024/09/22-1024x683.jpg", format: "video", sample: true,
      title: "Youth Leaders Take On Environmental Governance",
      subheading: "Sangguniang Kabataan members build local climate projects through Angat Kalikasan.",
      pillar: "climate-action-sustainability", project: "angat-kalikasan", areas: ["iloilo", "davao-del-sur"],
      author: "Communications Team", status: "published", publishedAt: "2024-12-10T09:00:00+08:00" },

    { slug: "museo-ng-pag-asa-visitors", image: "2024/09/11111111-3-e1726461662552.jpg", format: "article", sample: true,
      title: "Museo ng Pag-asa Welcomes Its 2,000th Visitor",
      subheading: "A museum of the bayanihan spirit keeps inspiring community service.",
      pillar: "arts-culture", project: "museo-ng-pag-asa", areas: ["quezon-city"],
      author: "Communications Team", status: "published", publishedAt: "2024-10-15T09:00:00+08:00" },

    /* These three exist in the CMS but must NOT appear on the public feed. */
    { slug: "upcoming-feeding-program-results", format: "article", sample: true,
      title: "[Scheduled] Feeding Program: Year Two Results",
      subheading: "Scheduled to publish on 20 October 2026.",
      pillar: "health-nutrition-food-security", project: "school-feeding", areas: ["naga"],
      author: "Communications Team", status: "scheduled", publishedAt: "2026-10-20T09:00:00+08:00" },

    { slug: "draft-volunteer-spotlight", format: "article", sample: true,
      title: "[Draft] Volunteer Spotlight: Catanduanes",
      subheading: "Work in progress, not yet published.",
      pillar: "community-engagement", project: "abvn", areas: ["catanduanes"],
      author: "Communications Team", status: "draft", publishedAt: null },

    { slug: "old-campaign-announcement", format: "article", sample: true,
      title: "[Archived] 2022 Campaign Announcement",
      subheading: "Archived by an editor; kept for the record.",
      pillar: "community-engagement", project: null, areas: ["ncr"],
      author: "Communications Team", status: "archived", publishedAt: "2022-08-01T09:00:00+08:00" }
  ],

  /* ---------- VolunteerOrg (all sample; real list comes from ABVN) ---------- */
  volunteerOrgs: [
    { name: "Naga youth tutors collective", areas: ["naga"], pillars: ["public-education"], sample: true },
    { name: "Iloilo community farmers association", areas: ["iloilo"], pillars: ["health-nutrition-food-security"], sample: true },
    { name: "Cebu disaster response volunteers", areas: ["cebu"], pillars: ["climate-action-sustainability"], sample: true },
    { name: "Catanduanes relief network", areas: ["catanduanes"], pillars: ["climate-action-sustainability", "community-engagement"], sample: true },
    { name: "Albay health volunteers", areas: ["legazpi"], pillars: ["health-nutrition-food-security"], sample: true },
    { name: "Davao SK environmental council", areas: ["davao-del-sur"], pillars: ["climate-action-sustainability"], sample: true }
  ],

  /* ---------- ImpactStat (every figure carries asOf + source) ---------- */
  impactStats: [
    { pillar: "public-education", value: "1,156", label: "struggling learners in 18 sites improved their literacy (Bayan Ko, Titser Ko)" },
    { pillar: "public-education", value: "1,280", label: "early-grade learners given safe, conducive classrooms" },
    { pillar: "public-education", value: "187", label: "young women given safe dormitory housing to pursue their education" },
    { pillar: "community-engagement", value: "87", label: "civil society organizations strengthened across 48 provinces and 11 countries" },
    { pillar: "community-engagement", value: "1,456", label: "unique volunteers mobilized" },
    { pillar: "health-nutrition-food-security", value: "146", label: "learners in the feeding program reached normal nutritional status" },
    { pillar: "health-nutrition-food-security", value: "269", label: "patients accessed free teleconsultations" },
    { pillar: "health-nutrition-food-security", value: "96", label: "patients received free medical services on-ground" },
    { pillar: "climate-action-sustainability", value: "8,965", label: "relief packs and hot meals distributed during disasters" },
    { pillar: "arts-culture", value: "2,043", label: "Museo ng Pag-asa visitors" }
  ],
  impactAsOf: "[Reporting period — to confirm]",
  impactSource: "[Source — e.g. Annual Report 2024]",

  /* ---------- TeamMember (photos in the same order as the live Team page) ---------- */
  team: {
    trustees: [
      { name: "Maria Leonor Gerona Robredo", role: "Chairperson Emeritus", photo: "2024/09/1-1-300x300.png" },
      { name: "Rafael Cojuangco Lopa", role: "President", photo: "2024/09/4-300x300.png" },
      { name: "Camille Tolentino Genuino", role: "Treasurer", photo: "2024/09/2-1-300x300.png" },
      { name: "Stella Angela Pastores Esquivias", role: "Corporate Secretary", photo: "2024/09/3-1-300x300.png" },
      { name: "Maximillan Roberts Ventura", role: "Trustee", photo: "2024/09/9-300x300.png" },
      { name: "Judith Ronquilloa Azarcon-Marquez", role: "Trustee", photo: "2024/09/5-300x300.png" },
      { name: "Joanne Alvarezs Baylon", role: "Trustee", photo: "2024/09/6-300x300.png" },
      { name: "Jose Christopher Belmonte", role: "Trustee", photo: "2024/09/7-300x300.png" },
      { name: "Gabriel De Alban David", role: "Trustee", photo: "2024/09/8-300x300.png" },
      { name: "Edward Lim", role: "Trustee", photo: "2025/09/AB-LIM-300x300.png" },
      { name: "Raphael Martin R. Magno", role: "Executive Director", photo: "2024/09/10-1-300x300.png" }
    ],
    secretariat: [
      { name: "Raphael Martin R. Magno", role: "Executive Director", pillar: null, photo: "2024/09/10-1-300x300.png" },
      { name: "Marie Joanna Camille D. Belmonte", role: "Deputy Executive Director for Operations", pillar: null, photo: "2024/09/11-300x300.png" },
      { name: "Patrick Vaughn Emil M. Manuel", role: "Deputy Executive Director for Monitoring, Evaluation, Learning, and Impact", pillar: null, photo: "2024/09/13-300x300.png" },
      { name: "Joanne Charina S. Astilla", role: "Program Manager for Public Education", pillar: "public-education", photo: "2025/06/Jai-Astilla-300x300.png" },
      { name: "Menard M. Mabutol", role: "Program Officer for Community Engagement and Empowerment", pillar: "community-engagement", photo: "2024/09/19-300x300.png" },
      { name: "Danielle Marie S. Bordado", role: "Program Manager for Arts and Culture", pillar: "arts-culture", photo: "2024/09/18-300x300.png" },
      { name: "Karelle Anne Bulan-Guico", role: "Program Officer for Food Security, Nutrition, and Universal Healthcare", pillar: "health-nutrition-food-security", photo: "2025/09/AB-KARELLE-300x300.png" },
      { name: "Rona T. Resngit", role: "Arts & Culture Associate", pillar: "arts-culture", photo: "2025/09/AB-RESNGIT-300x300.png" },
      { name: "Grem Gel Jane R. Montada", role: "Partnerships and Linkages Associate", pillar: null, photo: "2024/09/20-300x300.png" },
      { name: "Milliesa L. Flores", role: "Communications Manager", pillar: null, photo: "2024/09/21-300x300.png" },
      { name: "Maria Luiza P. Miguel", role: "Administrative and Finance Associate", pillar: null, photo: "2024/09/22-300x300.png" },
      { name: "Jeanne Erika L. Pelayo", role: "Administrative and Finance Associate", pillar: null, photo: "2024/09/23-300x300.png" }
    ]
  },

  /* ---------- Certification ---------- */
  certifications: [
    { name: "PCNC Accreditation", issuer: "Philippine Council for NGO Certification", detail: "Three-year accreditation affirming compliance with non-profit management standards." },
    { name: "ISO 9001:2015", issuer: "Quality management systems", detail: "Surveillance audit passed; internationally recognized benchmark for quality management." },
    { name: "License to Operate", issuer: "Department of Social Welfare and Development (DSWD)", detail: "Auxiliary Social Welfare and Development Agency." },
    { name: "Public Solicitation Permit", issuer: "DSWD", detail: "Permit No. DSWD-SB-PSP-S-2025-000049. [Validity date — to confirm]" },
    { name: "Donee Institution Status", issuer: "Bureau of Internal Revenue", detail: "Donations are tax-deductible." },
    { name: "Member", issuer: "Association of Foundations (AF)", detail: "A network of NGOs developing sustainable community programs." }
  ],

  /* ---------- Fundraiser ---------- */
  fundraisers: [
    { slug: "angat-buhay-makati", name: "Angat Buhay Makati", date: "[Date]", location: "Makati City", sample: true,
      description: "[Short description of the event, what funds raised support, and how to take part.]" },
    { slug: "angat-buhay-run-naga", name: "Angat Buhay Run Naga", date: "[Date]", location: "Naga City", sample: true,
      description: "[Fun run details: categories, registration, beneficiary program.]" },
    { slug: "alab", name: "ALAB", date: "[Date]", location: "[Venue]", sample: true,
      description: "[What ALAB is, past editions, how to attend or support.]" }
  ],

  /* ---------- DonationChannel (account numbers managed in CMS) ---------- */
  donationChannels: [
    { id: "gcash", name: "GCash", currency: "PHP",
      steps: ["Open the GCash app and log in.", "Tap “Pay QR”, then scan or upload the QR code below.", "Enter the amount and confirm.", "Keep the confirmation for your records."] },
    { id: "bank", name: "Bank transfer (BDO / BPI)", currency: "PHP",
      accounts: [["BDO", "Angat Pinas Inc."], ["BPI", "Angat Pinas, Inc."]],
      steps: ["Log in to your bank's app or online banking.", "Choose “Send money” / “Transfer to another account”.", "Enter the account details below and the amount.", "Review, confirm, and keep the confirmation."] },
    { id: "bpi-usd", name: "BPI USD / International wire", currency: "USD",
      accounts: [["BPI (USD)", "Angat Pinas, Inc."]], swift: "BOPIPHMM",
      steps: ["From a BPI account: Fund Transfer → Third-party BPI account → select USD.", "From another bank or overseas: request an international wire with the details below.", "Confirm fees and processing time with your bank.", "Keep the transaction receipt."] },
    { id: "bpi-edonate", name: "BPI eDonate", currency: "PHP",
      steps: ["[Steps for BPI eDonate — to confirm]"] },
    { id: "myriad-au", name: "Myriad Australia", currency: "AUD",
      steps: ["[Steps for donating through Myriad Australia — tax-deductible in Australia]"] },
    { id: "myriad-us", name: "Myriad USA", currency: "USD",
      steps: ["[Steps for donating through Myriad USA — tax-deductible in the US]"] }
  ],

  /* ---------- Resource ---------- */
  resources: [
    { title: "Annual Report 2023–2024", type: "Annual report", year: 2024, format: "PDF", size: "[x MB]" },
    { title: "Annual Report 2022–2023", type: "Annual report", year: 2023, format: "PDF", size: "[x MB]" },
    { title: "Angat Kalikasan Toolkit 2024", type: "Toolkit", year: 2024, format: "PDF", size: "[x MB]" },
    { title: "Audited Financial Statements 2024", type: "Transparency", year: 2024, format: "PDF", size: "[x MB]", sample: true }
  ]
};
