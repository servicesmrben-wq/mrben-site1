export type Locale = "fr" | "en";

export type CityPage = {
  slug: string;
  name: string;
  priceLow?: number;
  priceHigh?: number;
  fr: {
    title: string;
    description: string;
    paragraphs: string[];
  };
  en: {
    title: string;
    description: string;
    paragraphs: string[];
  };
};

export const CITY_PAGES: CityPage[] = [
  {
    slug: "lachute",
    name: "Lachute",
    fr: {
      title: "Services de nettoyage extérieur à Lachute",
      description:
        "Lavage de vitres et entretien de gouttières à Lachute (Avenue de la Providence, Barron, Centre-ville).",
      paragraphs: [
        "À Lachute, de l'Avenue de la Providence jusqu'au quartier Barron, les saisons laissent leur marque sur les façades. Pluie, pollen et poussière finissent par ternir l’apparence d’une maison près de la Polyvalente Lavigne ou du centre-ville. Notre équipe intervient avec des méthodes douces et efficaces pour redonner de l’éclat aux surfaces extérieures sans endommager les matériaux.",
        "Nos services sont pensés pour couvrir l’essentiel de l’entretien extérieur à Lachute. Le lavage de vitres élimine les dépôts et laisse une finition nette, idéale pour les maisons historiques de la rue Principale comme pour les constructions neuves. La vidange de gouttières protège la toiture et la fondation en favorisant un écoulement fluide, essentiel avec nos arbres matures.",
        "Nous vérifions les points sensibles, sécurisons les zones de travail et nous assurons que les sorties d’eau sont dégagées. Pour les maisons de plusieurs étages, nous utilisons l’équipement adapté afin de travailler en hauteur avec précision. Notre approche vise un résultat visible et durable, tout en respectant votre aménagement paysager.",
        "Nous accordons une grande importance à la communication. Avant de commencer, nous confirmons les priorités, le type de surface et les zones à traiter. Nous expliquons nos méthodes et vous indiquons comment maintenir l’entretien entre les visites. Cette transparence aide à planifier les prochains nettoyages.",
        "Pour planifier votre service à Lachute, utilisez le bouton « Obtenir une estimation gratuite » et décrivez vos besoins. Nous sommes prêts à vous aider à maintenir un extérieur propre, sécuritaire et accueillant tout au long de l’année.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Lachute",
      description:
        "Window washing and gutter cleaning in Lachute (Providence Ave, Barron, Downtown area).",
      paragraphs: [
        "In Lachute, from Providence Avenue to the Barron neighborhood, weather and seasonal change leave their mark. Rain, pollen, and dust can dull a home’s curb appeal near Lavigne High School or the downtown core. Our team provides gentle, effective cleaning that restores brightness without harming the materials.",
        "We cover the core services that matter most for Lachute homeowners. Window washing removes buildup and leaves a clear, streak-free finish, perfect for historic Main Street homes and new builds alike. Gutter cleaning keeps water flowing properly, which is crucial given our mature tree canopy.",
        "Many Lachute properties have mature trees, which means leaves and debris often collect in gutters. We check the critical areas, secure the work zone, and make sure downspouts are clear. For multi-story homes, we use the right equipment to work safely at height and detail every section with care.",
        "Clear communication is part of the experience. Before starting, we confirm priorities, surface types, and the areas you want to focus on. We explain how we approach each surface and share practical tips for maintaining results between visits.",
        "To schedule service in Lachute, click the “Get a free estimate” button and tell us what you need. We’re ready to keep your exterior clean, safe, and attractive year-round with punctual, detail-oriented service.",
      ],
    },
  },
  {
    slug: "saint-jerome",
    name: "Saint-Jérôme",
    fr: {
      title: "Services de nettoyage extérieur à Saint-Jérôme",
      description:
        "Lavage de vitres et gouttières à Saint-Jérôme (Bellefeuille, Quartier des Arts, Cégep).",
      paragraphs: [
        "Saint-Jérôme est dynamique, du Quartier des Arts jusqu'au secteur Bellefeuille. Cette densité apporte son lot de poussière urbaine et de résidus routiers qui s'accumulent sur les vitres et les revêtements. Nous intervenons avec une approche soignée pour garder les façades propres, que vous soyez près du Cégep, de la Cathédrale ou dans les quartiers résidentiels paisibles.",
        "Le lavage de vitres est essentiel pour conserver une apparence lumineuse et professionnelle. Nous nettoyons les vitres intérieures et extérieures, les cadrages et les moustiquaires, avec une finition sans traces. La vidange de gouttières permet d’éviter les débordements et de protéger les fondations contre l’eau stagnante, un entretien clé pour les propriétés de Saint-Jérôme.",
        "Les propriétés de Saint-Jérôme sont souvent exposées aux changements rapides de température. Cela peut laisser des traces sur les fenêtres et favoriser l’accumulation de débris. Nous planifions le nettoyage au bon moment de la saison pour limiter l’usure et maximiser l’efficacité.",
        "Nous aimons travailler avec une communication claire, de l’estimation jusqu’au rendu final. Si vous combinez nos services, nous coordonnons le travail pour que l’ensemble de l’extérieur ait un aspect uniforme et durable. Cette méthode simplifie aussi l’entretien futur.",
        "Pour une intervention à Saint-Jérôme, cliquez sur « Obtenir une estimation gratuite ». Notre objectif est de rendre votre extérieur propre, sécuritaire et agréable, tout en maintenant une expérience client simple et efficace.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Saint-Jérôme",
      description:
        "Window cleaning and gutter services in Saint-Jérôme (Bellefeuille, Arts District, College area).",
      paragraphs: [
        "Saint-Jérôme is vibrant, from the Arts District to Bellefeuille. This activity brings urban dust and road residue that settles on windows and siding. We bring a careful approach to keep facades clean, whether you're near the CEGEP, the Cathedral, or in a quiet residential street.",
        "Window washing keeps spaces bright and clear, and we handle interior and exterior panes, frames, and screens with a streak-free finish. Gutter cleaning helps prevent overflow and protects foundations from standing water—key maintenance for Saint-Jérôme properties.",
        "Saint-Jérôme properties often face rapid temperature shifts, which can leave marks on glass and accelerate debris buildup. We schedule cleanings at the right time in the season to reduce wear and maximize effectiveness. Our team arrives with the proper equipment and a respect for your schedule.",
        "We focus on straightforward communication from estimate to final result. If you bundle services, we coordinate them so the entire exterior has a consistent finish. This simplifies ongoing maintenance and keeps the property looking uniform throughout the year.",
        "For service in Saint-Jérôme, click the “Get a free estimate” button. Our goal is a clean, safe, and attractive exterior with a smooth and professional client experience.",
      ],
    },
  },
  {
    slug: "saint-sauveur",
    name: "Saint-Sauveur",
    fr: {
      title: "Services de nettoyage extérieur à Saint-Sauveur",
      description:
        "Entretien de vitres et chalets à Saint-Sauveur (Mont Habitant, Rue Principale, Lac des Becs-Scie).",
      paragraphs: [
        "À Saint-Sauveur, que ce soit près du Mont Habitant ou du Lac des Becs-Scie, le cadre naturel apporte charme et tranquillité, mais aussi feuilles, pollen et sève. Notre équipe propose un entretien extérieur minutieux pour préserver la clarté des fenêtres de votre chalet ou maison, tout en respectant l’aménagement paysager.",
        "Nous offrons un service complet qui inclut le lavage de vitres pour un rendu lumineux—indispensable pour profiter de la vue sur les montagnes—et le nettoyage de gouttières pour prévenir les débordements fréquents dans les zones boisées.",
        "Les variations saisonnières de Saint-Sauveur rendent l’entretien régulier particulièrement utile. Nous planifions les interventions selon l’état des surfaces et vos priorités, avec un service ponctuel et une communication claire.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Saint-Sauveur",
      description:
        "Window and chalet cleaning in Saint-Sauveur (Mont Habitant, Main Street, Lac des Becs-Scie).",
      paragraphs: [
        "In Saint-Sauveur, whether near Mont Habitant or Lac des Becs-Scie, the natural landscape adds beauty but also brings leaves, pollen, and sap. Our team delivers meticulous exterior care that keeps windows crystal clear—essential for enjoying those mountain views—while respecting your landscaping.",
        "We provide a complete lineup that includes window cleaning for bright, streak-free glass and gutter cleaning to prevent overflow, which is common in our wooded areas.",
        "Seasonal shifts in Saint-Sauveur make consistent upkeep especially valuable. We schedule visits based on surface conditions and your priorities, with punctual service and clear communication.",
      ],
    },
  },
  {
    slug: "mirabel",
    name: "Mirabel",
    fr: {
      title: "Services de nettoyage extérieur à Mirabel",
      description:
        "Lavage de vitres à Mirabel (Saint-Janvier, Domaine Vert, Saint-Augustin).",
      paragraphs: [
        "À Mirabel, des secteurs résidentiels de Saint-Janvier aux grands terrains du Domaine Vert, les propriétés sont souvent exposées au vent et à la poussière. Nous proposons un service de nettoyage extérieur qui tient compte de ces conditions pour préserver l’apparence et la durabilité des surfaces, que ce soit pour une maison neuve ou établie.",
        "Le lavage de vitres est l’une des meilleures façons d’améliorer immédiatement la luminosité d’une maison. Nous nettoyons les vitres, les cadres et les moustiquaires avec une finition soignée. La vidange de gouttières est essentielle pour éviter les accumulations de débris et protéger l’écoulement de l’eau, surtout dans les quartiers en développement.",
        "Les maisons de Mirabel ont parfois de grandes façades. Nous planifions l’intervention pour couvrir chaque zone sans précipitation, en utilisant l’équipement approprié pour les hauteurs. L’objectif est d’obtenir un rendu impeccable, tout en maintenant un chantier sécuritaire.",
        "Nous croyons qu’un entretien régulier est la clé pour conserver la valeur d’une propriété. Nous vous conseillons sur la fréquence idéale selon l’exposition de votre maison, afin que les résultats restent visibles plus longtemps.",
        "Pour planifier un nettoyage extérieur à Mirabel, cliquez sur « Obtenir une estimation gratuite ». Notre équipe est prête à prendre soin de vos vitres, gouttières et revêtement avec un service fiable.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Mirabel",
      description:
        "Window cleaning in Mirabel (Saint-Janvier, Domaine Vert, Saint-Augustin areas).",
      paragraphs: [
        "In Mirabel, from the residential streets of Saint-Janvier to the spacious lots of Domaine Vert, homes are often exposed to wind and dust. Our cleaning service is designed for these conditions, preserving both appearance and durability, whether for a new build or an established home.",
        "Window washing is one of the quickest ways to brighten a home, and we clean panes, frames, and screens with care. Gutter cleaning is essential for preventing debris buildup and ensuring water flows where it should, especially in developing neighborhoods.",
        "Many Mirabel homes feature large facades. We plan each visit to cover every area without rushing, using the appropriate equipment for height and reach. The goal is a spotless result while keeping the worksite safe.",
        "We believe regular maintenance is the best way to protect property value. We also share guidance on the best frequency based on exposure, so results remain visible for longer.",
        "To schedule exterior cleaning in Mirabel, click the “Get a free estimate” button. Our team is ready to care for your windows, gutters, and siding with reliable service.",
      ],
    },
  },
  {
    slug: "blainville",
    name: "Blainville",
    fr: {
      title: "Services de nettoyage extérieur à Blainville",
      description:
        "Lavage de vitres de prestige à Blainville (Fontainebleau, Chambéry, Côte-Saint-Louis).",
      paragraphs: [
        "Blainville se distingue par ses quartiers soignés comme Fontainebleau et Chambéry. La propreté extérieure y est primordiale. Nous aidons les propriétaires à conserver un aspect impeccable en éliminant les traces laissées par la pluie et le pollen. Notre approche est méticuleuse, afin que chaque surface retrouve une apparence nette.",
        "Le lavage de vitres améliore la lumière et la visibilité, et nous traitons les fenêtres, les cadrages et les moustiquaires pour une finition sans traces. La vidange de gouttières évite les accumulations de feuilles—fréquentes sur la Côte-Saint-Louis—et protège la toiture ainsi que les fondations.",
        "Les arbres matures à Blainville peuvent provoquer une accumulation rapide de débris dans les gouttières. Nous nettoyons et vérifions l’écoulement afin de limiter les risques d’infiltration. Pour les façades plus hautes, nous intervenons avec l’équipement adapté.",
        "Chaque projet débute par une évaluation claire des besoins. En regroupant les services, vous optimisez votre entretien extérieur. Nous privilégions une communication simple et transparente.",
        "Pour votre maison à Blainville, cliquez sur « Obtenir une estimation gratuite ». Notre équipe est prête à offrir un service attentif et un extérieur propre toute l’année.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Blainville",
      description:
        "Prestige window cleaning in Blainville (Fontainebleau, Chambéry, Côte-Saint-Louis).",
      paragraphs: [
        "Blainville is known for manicured neighborhoods like Fontainebleau and Chambéry. Exterior cleanliness is key here. We help homeowners maintain a polished look by removing marks left by rain and pollen. Our approach is detailed so every surface looks clean and consistent.",
        "Window washing boosts light and visibility, and we handle panes, frames, and screens for a streak-free finish. Gutter cleaning prevents leaf buildup—common along Côte-Saint-Louis—and protects the roofline and foundation.",
        "Mature trees in Blainville can cause rapid gutter buildup. We clear debris and verify water flow to reduce the risk of infiltration. For taller facades, we use the proper equipment to work safely.",
        "Every project starts with a clear assessment of what you need. When services are combined, exterior maintenance becomes more efficient. We keep communication straightforward.",
        "For your Blainville home, click the “Get a free estimate” button. Our team is ready to deliver attentive service and a clean, welcoming exterior all year long.",
      ],
    },
  },
  {
    slug: "laval",
    name: "Laval",
    fr: {
      title: "Services de nettoyage extérieur à Laval",
      description:
        "Lavage de vitres à Laval (Sainte-Rose, Vimont, Fabreville, Chomedey).",
      paragraphs: [
        "À Laval, de Sainte-Rose à Chomedey, l’environnement urbain peut laisser des résidus sur les façades. Nous proposons un service de nettoyage extérieur conçu pour maintenir une apparence impeccable malgré la poussière de la ville. Que votre propriété soit un duplex à Vimont ou une maison unifamiliale à Fabreville, notre équipe travaille avec soin.",
        "Le lavage de vitres est essentiel pour garder la lumière naturelle. Nous nettoyons les vitres et les cadrages pour un rendu clair. La vidange de gouttières aide à prévenir les débordements et protège les fondations, surtout lors des fortes pluies urbaines. Le nettoyage de revêtement enlève la saleté accumulée.",
        "Dans un contexte urbain comme Laval, l’efficacité est importante. Nous planifions les interventions pour minimiser les perturbations, avec un service bien organisé. Nous utilisons l’équipement adapté pour les zones difficiles d’accès.",
        "Nous savons que chaque propriété a ses priorités. Nous ajustons nos recommandations selon l’état des surfaces. La coordination des services facilite aussi la planification.",
        "Pour un nettoyage extérieur à Laval, cliquez sur « Obtenir une estimation gratuite ». Notre équipe est prête à offrir un service professionnel pour des vitres et gouttières impeccables.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Laval",
      description:
        "Window cleaning in Laval (Sainte-Rose, Vimont, Fabreville, Chomedey).",
      paragraphs: [
        "In Laval, from Sainte-Rose to Chomedey, the urban environment can leave residue on exterior surfaces. We provide cleaning designed to keep properties looking sharp despite city dust. Whether you own a duplex in Vimont or a single-family home in Fabreville, our team works carefully.",
        "Window washing keeps natural light flowing. We clean panes and frames for a bright finish. Gutter cleaning prevents overflow and protects foundations, especially during heavy urban rain. Exterior siding cleaning removes accumulated grime.",
        "In a city setting like Laval, efficiency matters. We schedule work to minimize interruptions and arrive with a well-organized plan. Our team uses the appropriate equipment for access challenges.",
        "Every property has different priorities. We tailor recommendations to the condition of the surfaces. Coordinating services also makes planning easier.",
        "For exterior cleaning in Laval, click the “Get a free estimate” button. Our team is ready to provide professional service for spotless windows and gutters.",
      ],
    },
  },
  {
    slug: "levis",
    name: "Lévis",
    fr: {
      title: "Lavage de vitres et entretien extérieur à Lévis",
      description: "Services professionnels de nettoyage de vitres et gouttières à Lévis (Vieux-Lévis, Lauzon, Pintendre).",
      paragraphs: [
        "À Lévis, du charme historique du Vieux-Lévis jusqu'aux nouveaux développements de Pintendre, l'entretien des propriétés est essentiel pour faire face aux vents du fleuve et aux changements de saison. Notre équipe offre un service méticuleux pour redonner de l'éclat à vos fenêtres et assurer le bon fonctionnement de vos gouttières.",
        "Le lavage de vitres permet de maximiser la luminosité et de profiter pleinement de la vue, que vous soyez face au Château Frontenac ou dans un quartier résidentiel paisible. Nous utilisons des techniques de nettoyage sans traces pour un résultat professionnel durable.",
        "Le nettoyage de gouttières est une étape clé pour protéger votre fondation contre les eaux de pluie. Dans une région boisée comme Lévis, les débris s'accumulent rapidement; nous nous assurons que l'évacuation se fait sans encombre.",
      ],
    },
    en: {
      title: "Window cleaning and exterior maintenance in Lévis",
      description: "Professional window and gutter cleaning services in Lévis (Old Lévis, Lauzon, Pintendre).",
      paragraphs: [
        "In Lévis, from the historic charm of Old Lévis to the new developments in Pintendre, property maintenance is key to facing river winds and seasonal shifts. Our team provides meticulous service to brighten your windows and ensure your gutters function perfectly.",
        "Window washing maximizes natural light and lets you enjoy the views, whether you're facing the skyline or in a quiet neighborhood. We use streak-free techniques for a lasting professional finish.",
        "Gutter cleaning is a vital step in protecting your foundation from rainwater. In wooded areas like Lévis, debris builds up quickly; we ensure water flows freely away from your home.",
      ],
    },
  },
  {
    slug: "saint-nicolas",
    name: "Saint-Nicolas",
    fr: {
      title: "Lavage de vitres et entretien extérieur à Saint-Nicolas",
      description: "Services de nettoyage de vitres et gouttières à Saint-Nicolas (Rive-Sud de Québec).",
      paragraphs: [
        "Saint-Nicolas est un secteur en pleine expansion où la propreté des façades contribue à la valeur des propriétés. Nous intervenons avec soin pour éliminer la poussière et les résidus accumulés sur vos vitres et revêtements extérieurs.",
        "Nos services incluent le lavage de vitres intérieur et extérieur ainsi que la vidange complète des gouttières. Nous adaptons nos méthodes selon le type de bâtiment, du bungalow classique à la résidence de prestige.",
      ],
    },
    en: {
      title: "Window cleaning and exterior maintenance in Saint-Nicolas",
      description: "Window and gutter cleaning services in Saint-Nicolas (South Shore of Quebec City).",
      paragraphs: [
        "Saint-Nicolas is a growing area where clean facades contribute to property value. We work carefully to remove dust and residue buildup from your windows and exterior siding.",
        "Our services include interior and exterior window washing and full gutter cleaning. We adapt our methods to your specific home, from classic bungalows to prestige residences.",
      ],
    },
  },
  {
    slug: "charny",
    name: "Charny",
    fr: {
      title: "Services de nettoyage extérieur à Charny",
      description: "Lavage de vitres et entretien de gouttières à Charny (Lévis).",
      paragraphs: [
        "À Charny, la proximité des grands axes et des zones boisées peut accélérer l'encrassement des vitres et le blocage des gouttières. Nous offrons un service local et rapide pour maintenir votre maison propre et sécuritaire.",
        "Un lavage de vitres régulier prévient l'usure prématurée des cadrages et améliore l'aspect général de votre propriété. Nous nous occupons de tout, incluant les moustiquaires et les rails.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Charny",
      description: "Window washing and gutter cleaning in Charny (Lévis).",
      paragraphs: [
        "In Charny, the proximity to major roads and wooded areas can lead to faster window soiling and gutter blockages. We provide fast, local service to keep your home clean and safe.",
        "Regular window washing prevents premature wear on frames and improves your property's overall look. We handle everything, including screens and tracks.",
      ],
    },
  },
  {
    slug: "dosquet",
    name: "Dosquet",
    fr: {
      title: "Lavage de vitres et entretien extérieur à Dosquet",
      description: "Services de nettoyage extérieur à Dosquet et dans les environs.",
      paragraphs: [
        "Pour les résidents de Dosquet, nous proposons un service de nettoyage extérieur fiable et professionnel. Que ce soit pour le lavage de vos vitres ou le nettoyage de vos gouttières avant l'hiver, notre équipe se déplace pour vous offrir un résultat impeccable.",
        "Nous comprenons l'importance d'un travail bien fait et du respect de votre environnement. Profitez d'une vue claire et d'une maison bien entretenue sans effort.",
      ],
    },
    en: {
      title: "Window cleaning and exterior maintenance in Dosquet",
      description: "Exterior cleaning services in Dosquet and surrounding areas.",
      paragraphs: [
        "For Dosquet residents, we offer reliable and professional exterior cleaning. Whether it's window washing or gutter cleaning before winter, our team travels to provide spotless results.",
        "We understand the importance of quality work and respecting your property. Enjoy a clear view and a well-maintained home with zero effort.",
      ],
    },
  },
  {
    slug: "saint-apollinaire",
    name: "Saint-Apollinaire",
    fr: {
      title: "Lavage de vitres et entretien extérieur à Saint-Apollinaire",
      description: "Services de nettoyage de vitres et gouttières à Saint-Apollinaire (Rive-Sud de Québec).",
      paragraphs: [
        "À Saint-Apollinaire, le développement résidentiel rapide demande un entretien régulier pour conserver l'aspect neuf des habitations. Notre équipe intervient avec soin pour le lavage de vos vitres et le nettoyage de vos gouttières.",
        "Nous offrons un service professionnel adapté aux besoins des familles et des propriétaires de la région, garantissant une finition sans traces et un environnement propre.",
      ],
    },
    en: {
      title: "Window cleaning and exterior maintenance in Saint-Apollinaire",
      description: "Window and gutter cleaning services in Saint-Apollinaire (South Shore of Quebec City).",
      paragraphs: [
        "In Saint-Apollinaire, rapid residential growth calls for regular maintenance to keep homes looking their best. Our team provides careful window washing and gutter cleaning services.",
        "We offer professional service tailored to the needs of local families and homeowners, ensuring a streak-free finish and a clean environment.",
      ],
    },
  },
  {
    slug: "laurier-station",
    name: "Laurier-Station",
    fr: {
      title: "Services de nettoyage extérieur à Laurier-Station",
      description: "Lavage de vitres et entretien de gouttières à Laurier-Station (Lévis).",
      paragraphs: [
        "Pour les résidents de Laurier-Station, nous proposons un service de nettoyage extérieur complet. Nous prenons en charge le lavage de vos vitres et l'entretien de vos gouttières pour protéger votre investissement.",
        "Notre approche est simple : un travail bien fait, des prix transparents et un service client irréprochable dans toute la région de Lotbinière et Lévis.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Laurier-Station",
      description: "Window washing and gutter cleaning in Laurier-Station (Lévis area).",
      paragraphs: [
        "For Laurier-Station residents, we offer a complete exterior cleaning service. We handle your window washing and gutter maintenance to protect your investment.",
        "Our approach is simple: high-quality work, transparent pricing, and excellent customer service throughout the Lotbinière and Lévis region.",
      ],
    },
  },
  {
    slug: "gore",
    name: "Gore",
    fr: {
      title: "Lavage de vitres et entretien de chalets à Gore",
      description: "Services de nettoyage extérieur à Gore (près de Lachute et des Laurentides).",
      paragraphs: [
        "À Gore, l'environnement boisé et les nombreux lacs rendent l'entretien des vitres et des gouttières indispensable. Nous aidons les propriétaires de chalets et de maisons à préserver la clarté de leur vue et la solidité de leur toiture.",
        "Que vous soyez au Lac Barron ou dans les secteurs environnants, notre équipe se déplace pour offrir un service de nettoyage professionnel respectueux de la nature environnante.",
      ],
    },
    en: {
      title: "Window cleaning and chalet maintenance in Gore",
      description: "Exterior cleaning services in Gore (near Lachute and the Laurentians).",
      paragraphs: [
        "In Gore, the wooded environment and many lakes make window and gutter maintenance essential. We help chalet and homeowners preserve their clear views and the integrity of their roofs.",
        "Whether you're at Lake Barron or in the surrounding areas, our team travels to provide professional cleaning services that respect the natural environment.",
      ],
    },
  },
];

function normalizeSlug(s: string) {
  return decodeURIComponent(s)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const CITY_SLUGS = CITY_PAGES.map((c) => c.slug);

export function getCityBySlug(slug: string) {
  const n = normalizeSlug(slug);
  return CITY_PAGES.find((c) => normalizeSlug(c.slug) === n);
}
