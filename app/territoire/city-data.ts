export type Locale = "fr" | "en";

export type CityPage = {
  slug: string;
  name: string;
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
        "Un service local et soigné pour le lavage de vitres, la vidange de gouttières et le nettoyage de revêtement à Lachute.",
      paragraphs: [
        "À Lachute, les saisons laissent leur marque sur les façades : pluie, pollen, neige et poussière finissent par ternir l’apparence d’une maison. Notre équipe intervient avec des méthodes douces et efficaces pour redonner de l’éclat aux surfaces extérieures sans endommager les matériaux. Que vous soyez dans un quartier résidentiel ou près des zones plus rurales, nous adaptons nos interventions pour préserver la valeur de votre propriété et garder votre entrée propre et invitante.",
        "Nos services sont pensés pour couvrir l’essentiel de l’entretien extérieur. Le lavage de vitres élimine les dépôts et laisse une finition nette, même sur des vitrages difficiles d’accès. La vidange de gouttières protège la toiture et la fondation en favorisant un écoulement fluide. Le nettoyage de revêtement (extérieur de la maison) redonne une couleur uniforme aux surfaces en vinyle, bois ou aluminium. Chaque service est planifié pour réduire les traces et limiter les interruptions.",
        "À Lachute, beaucoup de propriétés sont entourées d’arbres matures, ce qui augmente la présence de feuilles et de débris. Nous vérifions les points sensibles, sécurisons les zones de travail et nous assurons que les sorties d’eau sont dégagées. Pour les maisons de plusieurs étages, nous utilisons l’équipement adapté afin de travailler en hauteur avec précision. Notre approche vise un résultat visible et durable, tout en respectant votre aménagement paysager.",
        "Nous accordons une grande importance à la communication. Avant de commencer, nous confirmons les priorités, le type de surface et les zones à traiter. Nous expliquons nos méthodes et vous indiquons comment maintenir l’entretien entre les visites. Cette transparence aide à planifier les prochains nettoyages, surtout lorsqu’on veut synchroniser l’entretien des vitres, des gouttières et du revêtement pour un rendu uniforme.",
        "Pour planifier votre service à Lachute, utilisez le bouton « Demande en ligne » et décrivez vos besoins. Vous obtiendrez une réponse rapide, avec des recommandations adaptées à votre maison. Nous sommes prêts à vous aider à maintenir un extérieur propre, sécuritaire et accueillant tout au long de l’année, avec un service ponctuel et soigné.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Lachute",
      description:
        "Local, careful service for window washing, gutter cleaning, and exterior siding cleaning in Lachute.",
      paragraphs: [
        "In Lachute, weather and seasonal change leave their mark on exterior surfaces. Rain, pollen, snow, and road dust can dull a home’s curb appeal. Our team provides gentle, effective cleaning that restores brightness without harming the materials. Whether you live in a residential neighborhood or closer to rural stretches, we tailor each visit to protect the value of your property and keep the entrance looking clean and welcoming.",
        "We cover the core services that matter most for outdoor upkeep. Window washing removes buildup and leaves a clear, streak-free finish, even on hard-to-reach panes. Gutter cleaning keeps water flowing properly and reduces risks to the roofline and foundation. Exterior siding cleaning refreshes vinyl, wood, or aluminum so the color looks even and renewed. Each service is scheduled to minimize disruption and deliver visible results.",
        "Many Lachute properties have mature trees, which means leaves and debris often collect in gutters and along roof edges. We check the critical areas, secure the work zone, and make sure downspouts are clear. For multi-story homes, we use the right equipment to work safely at height and detail every section with care. The goal is a clean finish that lasts while respecting your landscaping.",
        "Clear communication is part of the experience. Before starting, we confirm priorities, surface types, and the areas you want to focus on. We explain how we approach each surface and share practical tips for maintaining results between visits. This makes it easier to plan recurring maintenance for windows, gutters, and siding so the exterior stays consistent throughout the year.",
        "To schedule service in Lachute, click the “Demande en ligne” button and tell us what you need. You’ll receive a fast reply with recommendations tailored to your home. We’re ready to keep your exterior clean, safe, and attractive year-round with punctual, detail-oriented service.",
      ],
    },
  },
  {
    slug: "saint-jerome",
    name: "Saint-Jérôme",
    fr: {
      title: "Services de nettoyage extérieur à Saint-Jérôme",
      description:
        "Des solutions professionnelles de lavage de vitres, vidange de gouttières et nettoyage de revêtement pour Saint-Jérôme.",
      paragraphs: [
        "Saint-Jérôme combine un centre urbain dynamique et des quartiers résidentiels variés, ce qui demande un service flexible et efficace. Nous intervenons avec une approche soignée pour garder les façades propres et les vitres impeccables, même lorsque la circulation, la poussière ou les intempéries s’accumulent rapidement. Chaque visite est adaptée à la réalité du secteur, qu’il s’agisse d’une maison familiale ou d’un petit immeuble.",
        "Le lavage de vitres est essentiel pour conserver une apparence lumineuse et professionnelle. Nous nettoyons les vitres intérieures et extérieures, les cadrages et les moustiquaires, avec une finition sans traces. La vidange de gouttières permet d’éviter les débordements et de protéger les fondations contre l’eau stagnante. Le nettoyage de revêtement (extérieur de la maison) enlève les résidus et uniformise la couleur des surfaces pour un résultat net.",
        "Les propriétés de Saint-Jérôme sont souvent exposées aux changements rapides de température. Cela peut laisser des traces sur les fenêtres et favoriser l’accumulation de débris dans les gouttières. Nous planifions le nettoyage au bon moment de la saison pour limiter l’usure et maximiser l’efficacité. Notre équipe se déplace avec l’équipement approprié, en respectant votre environnement et votre horaire.",
        "Nous aimons travailler avec une communication claire, de l’estimation jusqu’au rendu final. Nous prenons le temps d’identifier les zones les plus visibles et les surfaces qui demandent un traitement particulier. Si vous combinez nos services, nous coordonnons le travail pour que l’ensemble de l’extérieur ait un aspect uniforme et durable. Cette méthode simplifie aussi l’entretien futur.",
        "Pour une intervention à Saint-Jérôme, cliquez sur « Demande en ligne » et partagez quelques détails sur votre maison ou votre commerce. Nous vous répondrons rapidement avec une proposition adaptée. Notre objectif est de rendre votre extérieur propre, sécuritaire et agréable, tout en maintenant une expérience client simple et efficace.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Saint-Jérôme",
      description:
        "Professional window washing, gutter cleaning, and exterior siding cleaning for Saint-Jérôme homes and businesses.",
      paragraphs: [
        "Saint-Jérôme blends a busy downtown core with varied residential areas, so service needs to be flexible and efficient. We bring a careful approach that keeps facades clean and windows spotless, even when traffic dust and weather buildup appear quickly. Each visit is tailored to the property, whether it’s a family home or a small commercial building that needs to look sharp.",
        "Window washing keeps spaces bright and clear, and we handle interior and exterior panes, frames, and screens with a streak-free finish. Gutter cleaning helps prevent overflow and protects foundations from standing water. Exterior siding cleaning removes residue and evens out surface color for a polished look. Together, these services maintain curb appeal and prevent small issues from becoming costly maintenance later.",
        "Saint-Jérôme properties often face rapid temperature shifts, which can leave marks on glass and accelerate debris buildup. We schedule cleanings at the right time in the season to reduce wear and maximize effectiveness. Our team arrives with the proper equipment and a respect for your schedule, so the process stays efficient and low-impact.",
        "We focus on straightforward communication from estimate to final result. We identify the most visible areas and the surfaces that need special attention, then outline the best approach. If you bundle services, we coordinate them so the entire exterior has a consistent finish. This simplifies ongoing maintenance and keeps the property looking uniform throughout the year.",
        "For service in Saint-Jérôme, click the “Demande en ligne” button and share a few details about your home or business. We’ll respond quickly with a tailored proposal. Our goal is a clean, safe, and attractive exterior with a smooth and professional client experience.",
      ],
    },
  },
  {
    slug: "st-sauveur",
    name: "Saint-Sauveur",
    fr: {
      title: "Services de nettoyage extérieur à Saint-Sauveur",
      description:
        "Lavage de vitres, nettoyage de gouttières et entretien de revêtement à Saint-Sauveur pour garder votre propriété impeccable.",
      paragraphs: [
        "À Saint-Sauveur, les résidences profitent d’un cadre naturel qui apporte charme et tranquillité, mais aussi feuilles, pollen et poussière. Notre équipe propose un entretien extérieur minutieux pour préserver la clarté des fenêtres et l’apparence soignée de votre façade, tout en respectant les matériaux et l’aménagement paysager.",
        "Nous offrons un service complet qui inclut le lavage de vitres pour un rendu lumineux, le nettoyage de gouttières pour prévenir les débordements, et le nettoyage de revêtement pour raviver les surfaces exposées. Cette combinaison permet de maintenir une allure uniforme et d’éviter l’accumulation de saletés qui peuvent ternir votre maison.",
        "Les variations saisonnières de Saint-Sauveur rendent l’entretien régulier particulièrement utile. Nous planifions les interventions selon l’état des surfaces et vos priorités, avec un service ponctuel et une communication claire. L’objectif est un résultat durable qui met en valeur votre propriété toute l’année.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Saint-Sauveur",
      description:
        "Window cleaning, gutter cleaning, and exterior siding cleaning in Saint-Sauveur to keep your home looking its best.",
      paragraphs: [
        "In Saint-Sauveur, the natural landscape adds beauty and tranquility, but it also brings leaves, pollen, and dust. Our team delivers meticulous exterior care that keeps windows crystal clear and facades looking sharp while respecting the materials and landscaping around your property.",
        "We provide a complete lineup that includes window cleaning for bright, streak-free glass, gutter cleaning to prevent overflow, and exterior siding cleaning to refresh exposed surfaces. Together, these services maintain a uniform curb appeal and help prevent buildup that can dull your home’s exterior.",
        "Seasonal shifts in Saint-Sauveur make consistent upkeep especially valuable. We schedule visits based on surface conditions and your priorities, with punctual service and clear communication. The goal is a lasting result that highlights your property year-round.",
      ],
    },
  },
  {
    slug: "mirabel",
    name: "Mirabel",
    fr: {
      title: "Services de nettoyage extérieur à Mirabel",
      description:
        "Entretien extérieur complet à Mirabel : lavage de vitres, vidange de gouttières et nettoyage de revêtement.",
      paragraphs: [
        "À Mirabel, les propriétés sont souvent entourées d’espaces ouverts, ce qui peut exposer les maisons au vent, à la poussière et aux pollens. Nous proposons un service de nettoyage extérieur qui tient compte de ces conditions pour préserver l’apparence et la durabilité des surfaces. Qu’il s’agisse d’une maison neuve ou d’une propriété plus établie, nous travaillons avec précision pour un résultat uniforme et durable.",
        "Le lavage de vitres est l’une des meilleures façons d’améliorer immédiatement la luminosité d’une maison. Nous nettoyons les vitres, les cadres et les moustiquaires avec une finition soignée. La vidange de gouttières est essentielle pour éviter les accumulations de débris et protéger l’écoulement de l’eau. Le nettoyage de revêtement (extérieur de la maison) élimine les saletés et redonne une apparence nette aux surfaces exposées.",
        "Les maisons de Mirabel ont parfois de grandes façades et des sections difficiles d’accès. Nous planifions l’intervention pour couvrir chaque zone sans précipitation, en utilisant l’équipement approprié pour les hauteurs. L’objectif est d’obtenir un rendu impeccable, tout en maintenant un chantier sécuritaire et respectueux de votre environnement.",
        "Nous croyons qu’un entretien régulier est la clé pour conserver la valeur d’une propriété. En combinant nos services, vous réduisez les risques liés à l’humidité, aux salissures et à l’usure prématurée des matériaux. Nous vous conseillons sur la fréquence idéale selon l’exposition de votre maison, afin que les résultats restent visibles plus longtemps.",
        "Pour planifier un nettoyage extérieur à Mirabel, cliquez sur « Demande en ligne » et indiquez vos besoins. Nous vous répondrons rapidement avec des recommandations adaptées. Notre équipe est prête à prendre soin de vos vitres, gouttières et revêtement avec un service fiable et attentif.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Mirabel",
      description:
        "Complete exterior maintenance in Mirabel with window washing, gutter cleaning, and exterior siding cleaning.",
      paragraphs: [
        "In Mirabel, open spaces and changing winds can bring dust and pollen that settle on exteriors. Our cleaning service is designed for these conditions, preserving both appearance and durability. Whether the home is newly built or well established, we work with precision to deliver a consistent, long-lasting finish that enhances curb appeal and protects the surfaces you rely on every day.",
        "Window washing is one of the quickest ways to brighten a home, and we clean panes, frames, and screens with care. Gutter cleaning is essential for preventing debris buildup and ensuring water flows where it should. Exterior siding cleaning removes grime and refreshes the look of exposed materials. These three services work together to keep the property clean, safe, and well maintained.",
        "Many Mirabel homes feature large facades and taller sections that require specialized access. We plan each visit to cover every area without rushing, using the appropriate equipment for height and reach. The goal is a spotless result while keeping the worksite safe and respectful of your landscaping and outdoor spaces.",
        "We believe regular maintenance is the best way to protect property value. Bundling services helps reduce moisture-related risks, surface staining, and premature wear. We also share guidance on the best frequency based on exposure, so results remain visible for longer and your exterior stays consistent through the seasons.",
        "To schedule exterior cleaning in Mirabel, click the “Demande en ligne” button and tell us what you need. We’ll reply quickly with recommendations tailored to your home. Our team is ready to care for your windows, gutters, and siding with reliable, attentive service.",
      ],
    },
  },
  {
    slug: "blainville",
    name: "Blainville",
    fr: {
      title: "Services de nettoyage extérieur à Blainville",
      description:
        "Nettoyage extérieur à Blainville avec lavage de vitres, vidange de gouttières et entretien de revêtement.",
      paragraphs: [
        "Blainville se distingue par ses quartiers verdoyants et ses propriétés bien entretenues, ce qui rend la propreté extérieure encore plus importante. Nous aidons les propriétaires à conserver un aspect soigné en éliminant les traces laissées par la pluie, le pollen et les dépôts atmosphériques. Notre approche est méticuleuse, afin que chaque surface retrouve une apparence nette et uniforme, sans endommager les matériaux.",
        "Le lavage de vitres améliore la lumière et la visibilité, et nous traitons les fenêtres, les cadrages et les moustiquaires pour une finition sans traces. La vidange de gouttières évite les accumulations de feuilles et protège la toiture ainsi que les fondations. Le nettoyage de revêtement (extérieur de la maison) redonne une couleur équilibrée aux surfaces et élimine les saletés incrustées. Ensemble, ces services protègent l’investissement immobilier.",
        "Les arbres matures à Blainville peuvent provoquer une accumulation rapide de débris dans les gouttières, surtout après les vents et les orages. Nous nettoyons et vérifions l’écoulement afin de limiter les risques d’infiltration. Pour les façades plus hautes, nous intervenons avec l’équipement adapté afin d’assurer un travail sécuritaire et précis.",
        "Chaque projet débute par une évaluation claire des besoins. Nous identifions les zones prioritaires et proposons une stratégie pour un résultat homogène. En regroupant les services, vous optimisez votre entretien extérieur et vous réduisez les délais. Nous privilégions une communication simple et transparente pour que vous sachiez exactement à quoi vous attendre.",
        "Pour votre maison à Blainville, cliquez sur « Demande en ligne » et décrivez votre projet. Nous vous répondrons rapidement avec une estimation et des recommandations adaptées. Notre équipe est prête à offrir un service attentif et un extérieur propre et accueillant toute l’année.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Blainville",
      description:
        "Blainville exterior cleaning for window washing, gutter cleaning, and siding maintenance.",
      paragraphs: [
        "Blainville is known for green neighborhoods and well-kept properties, which makes exterior cleanliness even more important. We help homeowners maintain a polished look by removing the marks left by rain, pollen, and airborne residue. Our approach is detailed so every surface looks clean and consistent without harming the materials that protect your home.",
        "Window washing boosts light and visibility, and we handle panes, frames, and screens for a streak-free finish. Gutter cleaning prevents leaf buildup and protects the roofline and foundation. Exterior siding cleaning restores an even tone and removes embedded grime. Together, these services preserve curb appeal and help protect the long-term value of the property.",
        "Mature trees in Blainville can cause rapid gutter buildup, especially after wind and storms. We clear debris and verify water flow to reduce the risk of infiltration. For taller facades, we use the proper equipment to work safely and deliver a precise finish without disrupting your outdoor spaces.",
        "Every project starts with a clear assessment of what you need. We identify priority areas and propose a plan for a uniform result. When services are combined, exterior maintenance becomes more efficient and streamlined. We keep communication straightforward so you always know what to expect and when the work will be done.",
        "For your Blainville home, click the “Demande en ligne” button and describe your project. We’ll reply quickly with an estimate and tailored recommendations. Our team is ready to deliver attentive service and a clean, welcoming exterior all year long.",
      ],
    },
  },
  {
    slug: "laval",
    name: "Laval",
    fr: {
      title: "Services de nettoyage extérieur à Laval",
      description:
        "Service professionnel à Laval pour le lavage de vitres, la vidange de gouttières et le nettoyage de revêtement.",
      paragraphs: [
        "À Laval, l’environnement urbain et la proximité des grands axes routiers peuvent laisser des résidus sur les façades. Nous proposons un service de nettoyage extérieur conçu pour maintenir une apparence impeccable malgré la poussière et les variations climatiques. Que votre propriété soit un duplex, un condo ou une maison unifamiliale, notre équipe travaille avec soin pour restaurer la propreté des surfaces.",
        "Le lavage de vitres est essentiel pour garder la lumière naturelle et la transparence des vitrages. Nous nettoyons les vitres et les cadrages pour un rendu clair et sans traces. La vidange de gouttières aide à prévenir les débordements et protège les fondations, surtout lors des fortes pluies. Le nettoyage de revêtement (extérieur de la maison) enlève la saleté urbaine et redonne de l’éclat aux matériaux.",
        "Dans un contexte urbain comme Laval, l’efficacité et la ponctualité sont importantes. Nous planifions les interventions pour minimiser les perturbations, avec un service bien organisé et respectueux de votre horaire. Nous utilisons l’équipement adapté pour les surfaces en hauteur et pour les zones plus difficiles d’accès, tout en maintenant un chantier propre.",
        "Nous savons que chaque propriété a ses priorités. Certaines nécessitent un entretien plus fréquent des vitres, d’autres une attention accrue aux gouttières. Nous ajustons nos recommandations selon l’état des surfaces et l’exposition, afin d’obtenir un résultat durable. La coordination des services facilite aussi la planification et assure une apparence uniforme.",
        "Pour un nettoyage extérieur à Laval, cliquez sur « Demande en ligne » et précisez vos besoins. Nous vous répondons rapidement avec une estimation claire. Notre équipe est prête à offrir un service professionnel pour des vitres, gouttières et revêtements impeccables.",
      ],
    },
    en: {
      title: "Exterior cleaning services in Laval",
      description:
        "Professional Laval service for window washing, gutter cleaning, and exterior siding cleaning.",
      paragraphs: [
        "In Laval, the urban environment and nearby roadways can leave residue on exterior surfaces. We provide cleaning designed to keep properties looking sharp despite dust and shifting weather. Whether you own a duplex, condo, or single-family home, our team works carefully to restore the cleanliness and appeal of every surface without disrupting your daily routine.",
        "Window washing keeps natural light flowing and maintains clear views, so we clean panes and frames for a bright, streak-free finish. Gutter cleaning prevents overflow and protects foundations, especially during heavy rain. Exterior siding cleaning removes urban grime and refreshes the appearance of the materials. Together, these services help a property stay polished and well protected.",
        "In a city setting like Laval, efficiency and punctuality matter. We schedule work to minimize interruptions and arrive with a well-organized plan. Our team uses the appropriate equipment for height and access challenges, while keeping the worksite neat. The focus is on delivering consistent results without slowing your day down.",
        "Every property has different priorities. Some need more frequent window care, while others benefit from extra attention to gutters. We tailor recommendations to the condition of the surfaces and exposure so the results last longer. Coordinating services also makes planning easier and keeps the exterior looking uniform.",
        "For exterior cleaning in Laval, click the “Demande en ligne” button and share your needs. We respond quickly with a clear estimate and next steps. Our team is ready to provide professional service for spotless windows, gutters, and siding.",
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
