export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  categorySlug: string;
  image: string;
  /** Visuel détouré (fond transparent) pour les cartes façon studio */
  imageCutout?: string;
  /** Tarif €/jour basse saison (mai → novembre) */
  priceLow: number;
  /** Tarif €/jour haute saison (20 décembre → 20 avril) */
  priceHigh: number;
  seats: number;
  transmission: 'Automatique' | 'Manuelle';
  fuel: string;
  doors: number;
  /** Nombre de valises (estimation coffre), affiché sur les cartes */
  bags: number;
  ac: boolean;
  description: string;
  /** Description longue orientée SEO, affichée sur la fiche */
  seoDescription: string;
  /** Meta description (~155 caractères) pour le référencement */
  metaDescription: string;
  features: string[];
  techSpecs: { label: string; value: string }[];
  badge?: string;
  available: boolean;
}

/**
 * Remises longue durée (appliquées automatiquement) :
 * -5% dès 7 jours (1 semaine), -10% dès 14 jours (2 semaines), -15% dès 28 jours (1 mois).
 */
export const LONG_STAY_TIERS = [
  { minDays: 28, rate: 0.15 },
  { minDays: 14, rate: 0.1 },
  { minDays: 7, rate: 0.05 },
];

/** Taux de remise longue durée pour une durée donnée (0 si < 7 jours) */
export function longStayRate(days: number): number {
  for (const tier of LONG_STAY_TIERS) {
    if (days >= tier.minDays) return tier.rate;
  }
  return 0;
}

/** Forfait livraison : +50€ si l'aéroport Pôle Caraïbes est choisi (départ ou retour) */
export const AIRPORT_FEE = 50;
export const AIRPORT_AGENCE_ID = 'aeroport-pole-caraibes';

/**
 * Haute saison : 20 décembre → 20 avril. Basse saison : le reste de l'année.
 */
export function isHighSeason(d: Date): boolean {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  if (month === 12) return day >= 20;
  if (month < 4) return true;
  if (month === 4) return day <= 20;
  return false;
}

export const seasonLabel = {
  high: 'Haute saison (20 déc. → 20 avril)',
  low: 'Basse saison (mai → novembre)',
};

export const categories = [
  { id: 'all', label: 'Tous', icon: '🚗' },
  { id: 'citadine', label: 'Citadines', icon: '🏙️' },
  { id: 'suv', label: 'SUV urbains', icon: '🚙' },
];

export const vehicles: Vehicle[] = [
  {
    id: 'suzuki-swift-gl-plus',
    name: 'Suzuki Swift GL+',
    brand: 'Suzuki',
    model: 'Swift GL Plus 2026',
    category: 'Citadine',
    categorySlug: 'citadine',
    image: '/images/vehicles/suzuki-swift.jpg',
    imageCutout: '/images/vehicles/cutout-suzuki-swift.webp',
    priceLow: 32,
    priceHigh: 48,
    seats: 5,
    transmission: 'Manuelle',
    fuel: 'Essence',
    doors: 5,
    bags: 2,
    ac: true,
    description: 'Citadine récente (2026) en finition GL Plus, agile et économe. Parfaite pour circuler en ville comme sur les routes côtières de l\'île.',
    seoDescription: 'La Suzuki Swift GL Plus 2026 est la citadine idéale pour un séjour en Guadeloupe : compacte pour se garer facilement à Pointe-à-Pitre ou au Gosier, sobre en carburant pour les allers-retours entre Grande-Terre et Basse-Terre, et suffisamment vive pour les montées vers la route de la Traversée. Sa motorisation hybride légère consomme environ 4,4 l/100 km : sur une semaine de location, la différence se sent à la pompe. À bord : climatisation, caméra de recul et compatibilité Apple CarPlay / Android Auto pour suivre votre itinéraire sans data supplémentaire.',
    metaDescription: 'Louez une Suzuki Swift GL Plus 2026 en Guadeloupe dès 32€/jour. Citadine hybride économe, clim, CarPlay, kilométrage illimité. Jusqu\'à -15% en longue durée.',
    features: ['Climatisation', 'Bluetooth / CarPlay', 'Caméra de recul', 'Kilométrage illimité'],
    techSpecs: [
      { label: 'Motorisation', value: '1.2 Dualjet mild-hybrid, 83 ch' },
      { label: 'Boîte de vitesses', value: 'Manuelle, 5 rapports' },
      { label: 'Consommation mixte', value: '≈ 4,4 l/100 km' },
      { label: 'Volume de coffre', value: '265 litres' },
      { label: 'Connectivité', value: 'Apple CarPlay / Android Auto' },
      { label: 'Aides à la conduite', value: 'Caméra de recul, régulateur' },
    ],
    badge: 'Populaire',
    available: true,
  },
  {
    id: 'fiat-500-lounge',
    name: 'Fiat 500 Lounge',
    brand: 'Fiat',
    model: '500 Lounge 2018',
    category: 'Citadine',
    categorySlug: 'citadine',
    image: '/images/vehicles/fiat-500.jpg',
    imageCutout: '/images/vehicles/cutout-fiat-500.webp',
    priceLow: 28,
    priceHigh: 42,
    seats: 4,
    transmission: 'Manuelle',
    fuel: 'Essence',
    doors: 3,
    bags: 1,
    ac: true,
    description: 'L\'iconique citadine italienne en finition Lounge, coloris noir. Compacte, stylée et facile à garer partout en Guadeloupe.',
    seoDescription: 'Notre Fiat 500 Lounge noire (2018) est le meilleur prix de la flotte — et sûrement la voiture la plus facile à vivre de l\'île. Avec ses 3,57 m, elle se gare dans les ruelles de Saint-François ou sur les parkings bondés de la plage de la Caravelle quand les autres renoncent. Son toit panoramique en verre fait entrer la lumière des Antilles à bord, et sa boîte 5 souple pardonne tout dans les embouteillages de Pointe-à-Pitre. Idéale pour un couple qui voyage léger, moins adaptée si vous partez à 4 avec les valises.',
    metaDescription: 'Fiat 500 Lounge noire à louer en Guadeloupe dès 28€/jour. Toit panoramique, clim, stationnement facile. Le meilleur prix Adventura, jusqu\'à -15% en longue durée.',
    features: ['Climatisation', 'Toit panoramique', 'Bluetooth', 'Kilométrage illimité'],
    techSpecs: [
      { label: 'Motorisation', value: '1.2 8v essence, 69 ch' },
      { label: 'Boîte de vitesses', value: 'Manuelle, 5 rapports' },
      { label: 'Consommation mixte', value: '≈ 5,1 l/100 km' },
      { label: 'Volume de coffre', value: '185 litres' },
      { label: 'Longueur', value: '3,57 m — la plus facile à garer' },
      { label: 'Toit', value: 'Panoramique en verre (fixe)' },
    ],
    badge: 'Meilleur prix',
    available: true,
  },
  {
    id: 'kia-stonic',
    name: 'Kia Stonic',
    brand: 'Kia',
    model: 'Stonic',
    category: 'SUV urbain',
    categorySlug: 'suv',
    image: '/images/vehicles/kia-stonic.jpg',
    imageCutout: '/images/vehicles/cutout-kia-stonic.webp',
    priceLow: 39,
    priceHigh: 58,
    seats: 5,
    transmission: 'Manuelle',
    fuel: 'Essence',
    doors: 5,
    bags: 3,
    ac: true,
    description: 'SUV urbain coloris blanc, position de conduite surélevée et grand coffre. Le bon compromis confort / budget pour les familles.',
    seoDescription: 'Le Kia Stonic blanc est le choix des familles et des voyageurs chargés : 352 litres de coffre — deux grosses valises plus les sacs de plage —, une garde au sol surélevée appréciable sur les routes dégradées de la côte sous le vent, et une position de conduite haute qui rassure sur les ronds-points guadeloupéens. Son moteur 1.0 turbo de 100 ch emmène 5 personnes sans forcer, y compris dans les lacets qui montent vers les Chutes du Carbet. Climatisation efficace, CarPlay et régulateur de série.',
    metaDescription: 'Louez un Kia Stonic (SUV urbain) en Guadeloupe dès 39€/jour. Grand coffre 352L, 5 places, position haute, clim. Idéal familles, jusqu\'à -15% en longue durée.',
    features: ['Climatisation', 'Bluetooth / CarPlay', 'Régulateur de vitesse', 'Kilométrage illimité'],
    techSpecs: [
      { label: 'Motorisation', value: '1.0 T-GDi turbo, 100 ch' },
      { label: 'Boîte de vitesses', value: 'Manuelle, 6 rapports' },
      { label: 'Consommation mixte', value: '≈ 5,5 l/100 km' },
      { label: 'Volume de coffre', value: '352 litres — 2 grandes valises' },
      { label: 'Connectivité', value: 'Apple CarPlay / Android Auto' },
      { label: 'Aides à la conduite', value: 'Régulateur, aide au démarrage en côte' },
    ],
    badge: 'Confort',
    available: true,
  },
];

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: number;
  slug: string;
  content: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 'guide-location-voiture-guadeloupe',
    title: "Location de voiture en Guadeloupe : le guide pour payer le juste prix",
    excerpt: "Tarifs réels selon la saison, caution, assurance, pièges à éviter : tout ce qu'on explique chaque semaine à nos clients, réuni dans un seul guide.",
    metaDescription: "Combien coûte vraiment une location de voiture en Guadeloupe ? Tarifs par saison, caution, assurance, frais cachés : le guide complet par un loueur local.",
    image: '/images/hero-beach.jpg',
    category: 'Conseils',
    author: "L'équipe Adventura",
    date: '2026-07-10',
    readTime: 8,
    slug: 'guide-location-voiture-guadeloupe',
    content: [
      {
        paragraphs: [
          "Chaque semaine à l'agence, on nous pose les mêmes questions : pourquoi les prix doublent en décembre, à quoi sert la caution, qu'est-ce qui est vraiment inclus. Plutôt que de répondre client par client, voici tout ce qu'il faut savoir avant de réserver une voiture sur l'archipel — y compris ce que certains loueurs préfèrent ne pas écrire noir sur blanc.",
        ],
      },
      {
        heading: 'Les vrais prix, saison par saison',
        paragraphs: [
          "En Guadeloupe, la location suit deux saisons bien distinctes. De mai à novembre (basse saison), une citadine correcte se loue entre 25 et 40€ par jour. Du 20 décembre au 20 avril, la demande explose avec les vols depuis la métropole : comptez 40 à 60€ pour le même véhicule. Chez Adventura, notre Fiat 500 passe par exemple de 28€ à 42€ par jour entre les deux périodes — et nous appliquons automatiquement une remise longue durée : -5% dès 7 jours, -10% dès 14 jours et -15% dès 28 jours, toute l'année.",
          "Un conseil que peu de gens suivent : si vos dates sont flexibles, décaler votre séjour de fin décembre à mi-janvier ne change presque rien au climat, mais beaucoup à la facture.",
        ],
      },
      {
        heading: "Caution et assurance : ce qui est inclus, ce qui ne l'est pas",
        paragraphs: [
          "La caution n'est pas un paiement : c'est une empreinte bancaire, débloquée à la restitution si le véhicule revient dans l'état du départ. Vérifiez toujours le montant avant de réserver — il varie du simple au triple selon les loueurs de l'île.",
          "Côté assurance, le tiers, le vol et l'incendie sont inclus dans nos tarifs. La question à poser partout : quelle est la franchise en cas de dommage ? Une assurance tous risques à quelques euros par jour se rentabilise dès la première rayure sur un parking de plage — et des rayures sur les parkings de Sainte-Anne, on en voit passer toutes les semaines.",
        ],
      },
      {
        heading: 'Les pièges classiques à éviter',
        paragraphs: [
          "Le kilométrage limité d'abord : sur une île où l'on fait facilement 80 km par jour entre plages et randonnées, un forfait de 100 km/jour se dépasse sans s'en rendre compte. Exigez l'illimité.",
          "Le carburant ensuite : la règle correcte est « plein au départ, plein au retour ». Méfiez-vous des formules « plein prépayé » facturées au-dessus du prix à la pompe — le litre de SP95 est réglementé en Guadeloupe et affiché dans toutes les stations, il est donc facile de comparer. Enfin, photographiez le véhicule sous tous les angles au moment de la prise en charge, même chez nous : c'est votre meilleure protection et ça prend deux minutes.",
        ],
      },
      {
        heading: 'Réserver au bon moment',
        paragraphs: [
          "Pour un séjour entre décembre et avril, réservez dès que vos billets d'avion sont pris : les petites flottes locales comme la nôtre affichent complet des semaines à l'avance sur ces dates. En basse saison, une réservation quelques jours avant suffit généralement — mais le choix du modèle sera plus limité.",
          "Dernier point : privilégiez un loueur qui affiche le prix total avec les dates réelles avant paiement, annulation gratuite incluse. Si vous devez attendre le comptoir pour connaître le montant final, c'est mauvais signe.",
        ],
      },
    ],
  },
  {
    id: 'location-voiture-aeroport-pole-caraibes',
    title: "Louer une voiture à l'aéroport Pôle Caraïbes : ce qui vous attend à l'arrivée",
    excerpt: "Vol de nuit, valises, fatigue du décalage : voici comment se passe concrètement la remise des clés à l'aéroport, étape par étape.",
    metaDescription: "Location de voiture à l'aéroport de Guadeloupe Pôle Caraïbes : livraison 24h/24, documents à préparer, état des lieux. Le déroulé complet étape par étape.",
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    category: 'Conseils',
    author: "L'équipe Adventura",
    date: '2026-06-28',
    readTime: 6,
    slug: 'location-voiture-aeroport-pole-caraibes',
    content: [
      {
        paragraphs: [
          "La plupart de nos clients atterrissent à Pointe-à-Pitre entre 16h et 20h, après 8 heures de vol depuis Paris. À ce moment-là, personne n'a envie de chercher une navette ou de négocier un contrat. Voici exactement comment se déroule une remise de véhicule à l'aéroport Pôle Caraïbes, et comment la préparer pour qu'elle prenne dix minutes montre en main.",
        ],
      },
      {
        heading: 'Avant le départ : trois documents, pas plus',
        paragraphs: [
          "Préparez votre permis de conduire (valide depuis plus de 2 ans), une pièce d'identité et la carte bancaire au nom du conducteur principal pour la caution. Gardez-les dans votre bagage cabine : si votre valise arrive en retard — ça arrive plus souvent qu'on ne le croit sur les vols transatlantiques — vous pourrez quand même repartir avec la voiture.",
        ],
      },
      {
        heading: "À l'atterrissage : comment ça se passe",
        paragraphs: [
          "Chez Adventura, la livraison à l'aéroport est gratuite et fonctionne 24h/24, y compris pour les vols retardés : nous suivons votre numéro de vol, pas l'heure prévue sur le billet. Une fois vos bagages récupérés, un message vous indique le point de rendez-vous, à quelques minutes à pied du hall d'arrivée.",
          "L'état des lieux se fait ensemble, photos à l'appui, avant la signature. Prenez le temps de faire le tour du véhicule même si la nuit tombe — l'éclairage du parking suffit largement, et c'est dans votre intérêt autant que dans le nôtre.",
        ],
      },
      {
        heading: 'Le premier trajet : à savoir avant de démarrer',
        paragraphs: [
          "Depuis l'aéroport, comptez environ 20 minutes vers Le Gosier, 45 minutes vers Sainte-Anne et une bonne heure vers Deshaies par la Basse-Terre. Évitez si possible de traverser Pointe-à-Pitre entre 16h et 18h30 : c'est l'heure de pointe locale et les Abymes se traversent alors au pas.",
          "Un dernier réflexe : réglez votre GPS avant de quitter le parking et téléchargez la carte de la Guadeloupe hors ligne. La couverture mobile est bonne sur Grande-Terre, plus capricieuse dans les hauteurs de Basse-Terre.",
        ],
      },
      {
        heading: "Le retour : aussi simple que l'aller",
        paragraphs: [
          "Pour la restitution, prévoyez de faire le plein dans l'une des stations proches de l'aéroport — il y en a plusieurs sur la N5 aux Abymes — puis retrouvez-nous au même point de rendez-vous, une heure avant votre enregistrement. Le contrôle prend cinq minutes, la caution est libérée, et vous partez embarquer sans stress.",
        ],
      },
    ],
  },
  {
    id: 'citadine-ou-suv-guadeloupe',
    title: "Citadine ou SUV : quelle voiture louer pour votre séjour en Guadeloupe ?",
    excerpt: "On loue les deux toute l'année, alors on vous répond franchement : ça dépend de trois choses — où vous logez, à combien vous voyagez, et ce que vous voulez voir.",
    metaDescription: "Citadine ou SUV pour un séjour en Guadeloupe ? Comparatif honnête selon votre hébergement, le nombre de passagers et vos excursions, par un loueur local.",
    image: '/images/guadeloupe-aerial.jpg',
    category: 'Guide',
    author: "L'équipe Adventura",
    date: '2026-06-12',
    readTime: 7,
    slug: 'citadine-ou-suv-guadeloupe',
    content: [
      {
        paragraphs: [
          "C'est la question qu'on entend le plus au moment de réserver. Et la réponse honnête d'un loueur qui propose les deux : il n'y a pas de meilleur choix dans l'absolu, il y a le bon choix pour votre séjour. Voici comment on aide nos clients à trancher, en trois questions.",
        ],
      },
      {
        heading: 'Question 1 : où logez-vous ?',
        paragraphs: [
          "Si votre hébergement est sur Grande-Terre — Le Gosier, Sainte-Anne, Saint-François —, les routes sont plates et les parkings de plage se remplissent vite : une citadine comme notre Suzuki Swift ou notre Fiat 500 s'y faufile et s'y gare bien plus facilement. Le dimanche à la Caravelle ou à Bois Jolan, une petite voiture trouve une place là où un SUV repart bredouille.",
          "Si vous logez côté Basse-Terre — Deshaies, Bouillante, Trois-Rivières —, les accès sont plus pentus et certaines routes secondaires plus abîmées : la garde au sol du Kia Stonic et son couple à bas régime rendent le quotidien nettement plus confortable.",
        ],
      },
      {
        heading: 'Question 2 : à combien voyagez-vous ?',
        paragraphs: [
          "À deux avec des bagages cabine, tout fonctionne — prenez le meilleur prix. À deux avec deux grosses valises, la Swift et ses 265 litres suffisent, la Fiat 500 devient juste. À quatre ou en famille, la question est réglée : les 352 litres de coffre du Stonic absorbent valises, glacière et parasol sans jouer au Tetris sur la banquette.",
        ],
      },
      {
        heading: 'Question 3 : que voulez-vous voir ?',
        paragraphs: [
          "Pour un séjour plages, marchés et restaurants, la citadine gagne sur toute la ligne : consommation, stationnement, budget. Pour un programme randonnées — la Soufrière, les Chutes du Carbet, la route de la Traversée —, les routes restent goudronnées et une citadine y monte sans problème, mais le SUV apporte un vrai confort dans les virages serrés et sur les parkings en terre des départs de sentiers.",
          "Le point important : aucune de nos voitures n'est autorisée sur les pistes non goudronnées, SUV compris. Pour les traces en 4x4, c'est à pied que ça se passe — et franchement, c'est mieux ainsi.",
        ],
      },
      {
        heading: 'Notre grille de décision, en résumé',
        paragraphs: [
          "Couple + Grande-Terre + budget serré : Fiat 500 Lounge, dès 28€/jour. Couple ou trio + programme mixte : Suzuki Swift, le meilleur équilibre de la flotte. Famille, gros bagages ou logement sur Basse-Terre : Kia Stonic, dès 39€/jour. Et dans tous les cas, la remise longue durée s'applique automatiquement : -5% dès 7 jours, -10% dès 14 jours, -15% dès 28 jours.",
        ],
      },
    ],
  },
  {
    id: 'road-trip-7-jours-guadeloupe',
    title: "Road trip de 7 jours en Guadeloupe : l'itinéraire qu'on conseille à nos clients",
    excerpt: "Jour par jour, l'itinéraire que nous recommandons depuis des années : temps de route réels, bons créneaux pour éviter la foule, et où faire le plein.",
    metaDescription: "Itinéraire road trip 7 jours en Guadeloupe avec voiture de location : étapes jour par jour, temps de trajet réels, conseils d'un loueur local. Jusqu'à -15% en longue durée.",
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    category: 'Itinéraires',
    author: "L'équipe Adventura",
    date: '2026-05-30',
    readTime: 9,
    slug: 'road-trip-7-jours-guadeloupe',
    content: [
      {
        paragraphs: [
          "Sept jours, c'est la durée idéale pour un premier séjour : assez pour voir les deux ailes du papillon sans courir, et c'est justement à partir de 7 jours que notre remise longue durée s'applique (-5%, puis -10% dès 14 jours et -15% dès 28 jours). Voici l'itinéraire que nous conseillons à nos clients, affiné au fil de leurs retours. Les temps de route sont réels, pas ceux du GPS un jour sans trafic.",
        ],
      },
      {
        heading: 'Jours 1-2 : Grande-Terre, lagons et bourgs',
        paragraphs: [
          "Installez-vous côté Gosier ou Sainte-Anne. Premier matin à la plage de Bois Jolan tôt (avant 9h, lumière superbe et parking facile), après-midi au bourg de Sainte-Anne et son marché. Deuxième jour : la Pointe des Châteaux au lever du soleil — 25 minutes depuis Saint-François, et vous aurez le panorama presque pour vous —, puis la Porte d'Enfer d'Anse-Bertrand par la côte nord, quasi déserte.",
        ],
      },
      {
        heading: 'Jours 3-4 : la traversée vers Basse-Terre',
        paragraphs: [
          "Comptez 1h15 de route entre Sainte-Anne et Deshaies, dont la fameuse route de la Traversée : arrêtez-vous à la Cascade aux Écrevisses (10 minutes de marche, y aller avant 10h) et à la Maison de la Forêt. Installez-vous ensuite deux nuits vers Deshaies ou Bouillante.",
          "Le lendemain, Grande-Anse de Deshaies le matin, puis la réserve Cousteau à Malendure l'après-midi pour le snorkeling — les bateaux à fond de verre partent toute la journée, la lumière sous l'eau est meilleure avant 14h.",
        ],
      },
      {
        heading: 'Jours 5-6 : volcan, chutes et sud sauvage',
        paragraphs: [
          "Jour 5, la Soufrière : départ des Bains Jaunes, à 950 m d'altitude — partez de votre hébergement avant 7h30, le sommet se couvre presque tous les jours en fin de matinée. Prévoyez un coupe-vent : il fait 15 degrés là-haut quand il en fait 30 à la plage. Jour 6, les Chutes du Carbet (la deuxième chute est la plus accessible) puis la côte sud par Trois-Rivières et ses roches gravées.",
          "Sur ces deux jours, faites le plein à Basse-Terre ville ou à Capesterre : les stations se font rares sur les hauteurs, et rouler léger en carburant dans les lacets n'a aucun intérêt.",
        ],
      },
      {
        heading: 'Jour 7 : retour en douceur',
        paragraphs: [
          "Redescendez vers Grande-Terre par la côte au vent, arrêt au Jardin Botanique de Deshaies ou dans une distillerie selon vos goûts, dernier plongeon à la plage du Souffleur de Port-Louis — souvent oubliée des itinéraires, à tort. Plein à proximité de l'aéroport aux Abymes, restitution une heure avant l'enregistrement, et c'est plié.",
          "Au total : environ 450 km sur la semaine. Avec une citadine sobre, le budget carburant reste raisonnable — et le kilométrage illimité fait le reste.",
        ],
      },
    ],
  },
  {
    id: 'conduire-en-guadeloupe-conseils',
    title: "Conduire en Guadeloupe : 12 choses à savoir avant de prendre le volant",
    excerpt: "Le code est le même qu'en métropole, mais la route ne se vit pas pareil. Ronds-points, pluies tropicales, heures de pointe : nos conseils de terrain.",
    metaDescription: "Conduire en Guadeloupe : ronds-points, heures de pointe, pluies tropicales, stationnement aux plages. 12 conseils concrets d'un loueur de voitures local.",
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    category: 'Conseils',
    author: "L'équipe Adventura",
    date: '2026-05-15',
    readTime: 7,
    slug: 'conduire-en-guadeloupe-conseils',
    content: [
      {
        paragraphs: [
          "Bonne nouvelle : on conduit à droite, les panneaux sont français et votre permis suffit. Mais après des années à remettre des clés à des visiteurs, on sait exactement ce qui surprend les conducteurs fraîchement débarqués. Voici l'essentiel, sans détour.",
        ],
      },
      {
        heading: 'Le trafic : anticipez les heures de pointe',
        paragraphs: [
          "L'agglomération de Pointe-à-Pitre concentre l'essentiel des embouteillages de l'île : évitez de la traverser entre 6h30 et 8h30, puis entre 16h et 18h30 en semaine. Un trajet Gosier-aéroport qui prend 20 minutes le dimanche peut en prendre 50 le vendredi soir. Planifiez vos grandes traversées en milieu de journée, tout simplement.",
          "Les ronds-points sont partout et fonctionnent comme en métropole — priorité à ceux qui sont engagés. La particularité locale, c'est leur fréquence : entre l'aéroport et Sainte-Anne, vous en enchaînerez une bonne dizaine.",
        ],
      },
      {
        heading: 'La météo : respectez la pluie tropicale',
        paragraphs: [
          "Une averse tropicale peut déverser en vingt minutes ce qu'un mois de pluie métropolitaine étale sur des semaines. La route devient glissante, la visibilité tombe : ralentissez franchement, allumez vos feux, et si c'est vraiment le déluge, arrêtez-vous cinq minutes — ça passe aussi vite que c'est arrivé.",
          "Sur les routes de Basse-Terre, méfiez-vous des chaussées humides en permanence sous la canopée, notamment sur la route de la Traversée : elles restent grasses même quand il n'a pas plu depuis des heures.",
        ],
      },
      {
        heading: 'Le stationnement : tôt le matin, tout est simple',
        paragraphs: [
          "La règle d'or des plages : arriver avant 9h30 ou après 15h30. Entre les deux, les parkings de la Caravelle, de Grande-Anse ou de la Datcha débordent, et c'est là que naissent les rayures de portière. Ne laissez jamais rien de visible dans l'habitacle, même pour dix minutes — c'est le conseil que nous répétons le plus.",
        ],
      },
      {
        heading: 'Le carburant et les distances',
        paragraphs: [
          "Le prix des carburants est réglementé et identique dans toute l'île, donc inutile de chercher la station la moins chère : prenez celle qui est sur votre route. Les stations sont nombreuses sur Grande-Terre, plus espacées sur les hauteurs de Basse-Terre — redescendez du volcan avec au moins un quart de réservoir.",
          "Enfin, recalibrez vos distances : l'île paraît petite sur la carte, mais 60 km s'y parcourent rarement en moins d'une heure. C'est le rythme des Antilles — autant l'adopter dès le premier jour, fenêtres ouvertes.",
        ],
      },
    ],
  },
];

export interface Agence {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
  badge?: string;
}

export const agences: Agence[] = [
  {
    id: 'aeroport-pole-caraibes',
    name: 'Aéroport Pôle Caraïbes',
    address: 'Aéroport Pôle Caraïbes, 97139 Les Abymes',
    hours: '24h/24 - 7j/7',
    phone: '06 90 48 47 76',
    lat: 16.2653,
    lng: -61.5321,
    badge: 'Livraison gratuite',
  },
  {
    id: 'petit-canal',
    name: 'Petit-Canal',
    address: 'Centre-ville de Petit-Canal, 97131 Petit-Canal',
    hours: '9h - 18h, Lun - Sam',
    phone: '06 90 48 47 76',
    lat: 16.3767,
    lng: -61.4933,
    badge: 'Livraison',
  },
  {
    id: 'pointe-a-pitre',
    name: 'Pointe-à-Pitre Centre',
    address: '12 Rue Frébault, 97110 Pointe-à-Pitre',
    hours: '8h - 19h, Lun - Sam',
    phone: '06 90 48 47 76',
    lat: 16.2415,
    lng: -61.5331,
  },
  {
    id: 'le-gosier',
    name: 'Le Gosier',
    address: 'Avenue de l\'Europe, 97190 Le Gosier',
    hours: '8h - 18h, Lun - Sam',
    phone: '06 90 48 47 76',
    lat: 16.2077,
    lng: -61.4967,
    badge: 'Populaire',
  },
  {
    id: 'saint-francois',
    name: 'Saint-François',
    address: 'Marina de Saint-François, 97118 Saint-François',
    hours: '9h - 18h, Lun - Sam',
    phone: '06 90 48 47 76',
    lat: 16.2534,
    lng: -61.2661,
  },
  {
    id: 'basse-terre',
    name: 'Basse-Terre',
    address: '5 Boulevard du Général de Gaulle, 97100 Basse-Terre',
    hours: '8h30 - 17h30, Lun - Ven',
    phone: '06 90 48 47 76',
    lat: 15.9989,
    lng: -61.7285,
  },
  {
    id: 'deshaies',
    name: 'Deshaies',
    address: 'Route de la Plage, 97126 Deshaies',
    hours: '9h - 17h, Mar - Sam',
    phone: '06 90 48 47 76',
    lat: 16.3049,
    lng: -61.7936,
    badge: 'Nouveau',
  },
];

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  vehicle?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Camille Rousseau',
    location: 'Paris, France',
    rating: 5,
    text: 'Réservation en 2 minutes, voiture livrée directement à l\'aéroport avec le plein fait. Le Kia Stonic nous a permis de tout voir, jusqu\'aux routes de Basse-Terre, sans souci.',
    avatar: 'https://i.pravatar.cc/100?img=47',
    vehicle: 'Kia Stonic',
  },
  {
    id: 't2',
    name: 'Marc & Élodie Petit',
    location: 'Lyon, France',
    rating: 5,
    text: 'Kilométrage illimité, aucun frais caché contrairement à d\'autres loueurs sur l\'île. La Fiat 500 était impeccable, parfaite pour longer la côte.',
    avatar: 'https://i.pravatar.cc/100?img=12',
    vehicle: 'Fiat 500 Lounge',
  },
  {
    id: 't3',
    name: 'Julien Fontaine',
    location: 'Bruxelles, Belgique',
    rating: 5,
    text: 'Service client réactif par WhatsApp même le dimanche. Annulation gratuite jusqu\'à 48h, ça rassure pour planifier un voyage aux Antilles.',
    avatar: 'https://i.pravatar.cc/100?img=33',
    vehicle: 'Suzuki Swift GL+',
  },
  {
    id: 't4',
    name: 'Sophie Marchand',
    location: 'Montréal, Canada',
    rating: 5,
    text: 'Meilleur prix trouvé sur l\'île pour un séjour de 10 jours. La Fiat 500 a été fiable du premier au dernier kilomètre.',
    avatar: 'https://i.pravatar.cc/100?img=25',
    vehicle: 'Fiat 500 Lounge',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const faqs: FaqItem[] = [
  {
    category: 'Réservation',
    question: 'Quels documents dois-je présenter pour louer une voiture ?',
    answer: 'Une pièce d\'identité valide, un permis de conduire valide depuis plus de 2 ans et une carte bancaire au nom du conducteur principal pour la caution. Le conducteur doit avoir au moins 21 ans (surcharge jeune conducteur possible entre 21 et 24 ans).',
  },
  {
    category: 'Réservation',
    question: 'Puis-je annuler ou modifier ma réservation gratuitement ?',
    answer: 'Oui, l\'annulation est gratuite jusqu\'à 48h avant le début de la location. Passé ce délai, des frais peuvent s\'appliquer selon le tarif choisi. La modification de dates est gratuite sous réserve de disponibilité.',
  },
  {
    category: 'Livraison',
    question: 'Livrez-vous le véhicule à l\'aéroport Pôle Caraïbes ?',
    answer: 'Oui, la livraison et la récupération à l\'aéroport Pôle Caraïbes sont incluses gratuitement, 24h/24 et 7j/7, y compris pour les vols de nuit ou retardés.',
  },
  {
    category: 'Tarifs',
    question: 'Le kilométrage est-il vraiment illimité ?',
    answer: 'Oui, tous nos véhicules sont loués avec un kilométrage illimité, sans exception et sans surcoût, quelle que soit la durée de votre séjour.',
  },
  {
    category: 'Tarifs',
    question: 'Y a-t-il des frais cachés à la restitution du véhicule ?',
    answer: 'Aucun frais caché. Le seul point de vigilance est le niveau de carburant : le véhicule doit être restitué avec le même niveau qu\'au départ, sinon le plein est facturé au tarif local + frais de service.',
  },
  {
    category: 'Assurance',
    question: 'Quelles assurances sont incluses dans le prix ?',
    answer: 'L\'assurance au tiers, le vol et l\'incendie sont inclus. Une assurance tous risques avec franchise réduite est proposée en option lors de la réservation.',
  },
  {
    category: 'Conduite',
    question: 'Puis-je traverser vers les Saintes ou Marie-Galante avec le véhicule ?',
    answer: 'Le véhicule n\'est pas autorisé à monter sur les ferries. Nous recommandons de le laisser dans une de nos agences (Saint-François ou Pointe-à-Pitre) et de louer un scooter sur place pour explorer ces îles.',
  },
];

export interface BookingStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export const bookingSteps: BookingStep[] = [
  {
    step: 1,
    title: 'Choisissez vos dates & lieu',
    description: 'Sélectionnez votre agence de départ, vos dates et heures de prise en charge et de retour.',
    icon: 'calendar',
  },
  {
    step: 2,
    title: 'Sélectionnez votre véhicule',
    description: 'Comparez notre flotte filtrée selon vos besoins : citadine, SUV, cabriolet ou électrique.',
    icon: 'car',
  },
  {
    step: 3,
    title: 'Confirmez & payez en ligne',
    description: 'Paiement sécurisé, confirmation immédiate par email et SMS, sans frais cachés.',
    icon: 'card',
  },
  {
    step: 4,
    title: 'Roulez l\'esprit libre',
    description: 'Récupérez votre véhicule à l\'agence ou faites-vous livrer, assurance et kilométrage illimité inclus.',
    icon: 'key',
  },
];
