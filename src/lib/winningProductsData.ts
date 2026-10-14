export interface WinningProduct {
  id: string;
  title: string;
  category: 'beaute' | 'electromenager' | 'hightech' | 'mode_bagagerie';
  categoryLabel: string;
  description: string;
  whyItSellsInBenin: string;
  imageUrl: string;
  suggestedPriceCFA: number;
  marketPriceCFA: number;
  minQuantity: number;
  shippingMode: 'air' | 'sea';
  platform: 'shein' | '1688' | 'taobao' | 'temu' | 'aliexpress' | 'alibaba';
  variants: string[];
  targetAudience: string;
  profitMarginEstimateCFA: number;
  demandLevel: 'Ultra Élevée' | 'Très Forte' | 'Constante';
}

export const WINNING_PRODUCTS_BENIN: WinningProduct[] = [
  {
    id: 'wp-1',
    title: 'Perruque Glueless Bob 100% Cheveux Humains (Lace Frontale sans colle)',
    category: 'beaute',
    categoryLabel: 'Beauté & Cheveux',
    description: 'Perruque courte style Bob en cheveux naturels vierges, dentelle HD invisible pré-épilée avec élastique de maintien ajustable. Zéro colle nécessaire, pose en 2 minutes.',
    whyItSellsInBenin: 'C\'est le N°1 absolu des ventes auprès des femmes à Cotonou et Calavi. Les salons les revendent le double. Les clientes adorent la facilité de pose sans risque pour les tempes.',
    imageUrl: 'https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 19500,
    marketPriceCFA: 38000,
    minQuantity: 10,
    shippingMode: 'air',
    platform: '1688',
    variants: [
      'Bob Lisse Noir Naturel 10 pouces',
      'Bob Lisse Noir Naturel 12 pouces',
      'Deep Wave Ondulé Noir 12 pouces',
      'Bob Lisse Châtain Chocolat 10 pouces'
    ],
    targetAudience: 'Femmes actives, étudiantes, salons de coiffure de Cotonou',
    profitMarginEstimateCFA: 18500,
    demandLevel: 'Ultra Élevée'
  },
  {
    id: 'wp-2',
    title: 'Hachoir Électrique Multifonction Inox 2L (4 Lames Inox Renforcées)',
    category: 'electromenager',
    categoryLabel: 'Cuisine & Électroménager',
    description: 'Robot hachoir puissant 300W avec cuve incassable en acier inoxydable 2L, 4 lames rotatives biseautées et 2 vitesses. Hache piments, viandes, oignons, ail et herbes en 5 secondes.',
    whyItSellsInBenin: 'Indispensable dans la cuisine béninoise où piler les condiments au mortier prend du temps. Produit viral qui se vend toute l\'année auprès des ménagères et restauratrices.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 11500,
    marketPriceCFA: 22000,
    minQuantity: 12,
    shippingMode: 'air',
    platform: '1688',
    variants: [
      'Cuve Inox Renforcée 2 Litres',
      'Cuve Inox Grande Capacité 3 Litres (+2000 F)'
    ],
    targetAudience: 'Ménagères, mamans, restauratrices, étudiantes',
    profitMarginEstimateCFA: 10500,
    demandLevel: 'Ultra Élevée'
  },
  {
    id: 'wp-3',
    title: 'Gaine Amincissante 3-en-1 Latex & Corset Sculptant (Waist Trainer)',
    category: 'beaute',
    categoryLabel: 'Silhouette & Minceur',
    description: 'Corset réducteur de taille en latex naturel avec 9 baleines souples en acier et 3 rangées d\'agrafes réglables. Soutient le dos, affine immédiatement la silhouette sous les tenues.',
    whyItSellsInBenin: 'Forte demande pour les cérémonies de mariage, tenues de fête, remise en forme post-partum et tenues ajustées en wax. Vente impulsive très forte.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 7500,
    marketPriceCFA: 16000,
    minQuantity: 15,
    shippingMode: 'air',
    platform: 'shein',
    variants: [
      'Noir - Taille S (Taille 34-36)',
      'Noir - Taille M (Taille 38-40)',
      'Noir - Taille L (Taille 42-44)',
      'Noir - Taille XL (Taille 46)',
      'Noir - Taille XXL (Taille 48)',
      'Beige Nude - Taille M',
      'Beige Nude - Taille L'
    ],
    targetAudience: 'Femmes cherchant à sculpter leur taille, jeunes mamans',
    profitMarginEstimateCFA: 8500,
    demandLevel: 'Très Forte'
  },
  {
    id: 'wp-4',
    title: 'Power Bank Haute Capacité 30 000 mAh avec 4 Câbles Intégrés & Écran LED',
    category: 'hightech',
    categoryLabel: 'High-Tech & Mobile',
    description: 'Batterie externe compacte 30 000 mAh avec 4 câbles intégrés (Type-C, iPhone Lightning, Micro-USB, USB-A), double lampe torche LED et afficheur numérique précis du pourcentage.',
    whyItSellsInBenin: 'Essentiel pour tous les utilisateurs de smartphone à Cotonou souvent en déplacement ou confrontés à des baisses de tension. Les câbles intégrés évitent d\'oublier son fil.',
    imageUrl: 'https://images.unsplash.com/photo-1609592424367-93e1b782c5f1?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 9900,
    marketPriceCFA: 19000,
    minQuantity: 15,
    shippingMode: 'air',
    platform: '1688',
    variants: [
      'Noir Carbone Élégant',
      'Blanc Nacré'
    ],
    targetAudience: 'Tout public, étudiants, conducteurs, cadres, commerçants',
    profitMarginEstimateCFA: 9100,
    demandLevel: 'Ultra Élevée'
  },
  {
    id: 'wp-5',
    title: 'Montre Connectée Smartwatch Ultra Pro (Appels Bluetooth & Écran HD)',
    category: 'hightech',
    categoryLabel: 'High-Tech & Mobile',
    description: 'Montre intelligente boîtier titane résistant aux chocs, écran géant 2.0 pouces, micro & haut-parleur pour appels Bluetooth, notifications WhatsApp / SMS, suivi santé complet.',
    whyItSellsInBenin: 'Très grand succès auprès des jeunes et professionnels pour son design inspiré des montres haut de gamme à un tarif abordable. Permet de répondre aux appels à moto ou en voiture.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 12500,
    marketPriceCFA: 25000,
    minQuantity: 10,
    shippingMode: 'air',
    platform: 'aliexpress',
    variants: [
      'Boîtier Argent + Bracelet Orange Sport',
      'Boîtier Noir + Bracelet Noir Silicone',
      'Boîtier Titane + Bracelet Métal Acier (+2000 F)'
    ],
    targetAudience: 'Hommes et femmes, technophiles, conducteurs de moto',
    profitMarginEstimateCFA: 12500,
    demandLevel: 'Très Forte'
  },
  {
    id: 'wp-6',
    title: 'Mini Blender / Mixeur Portable Rechargeable USB-C (450 ml)',
    category: 'electromenager',
    categoryLabel: 'Cuisine & Nutrition',
    description: 'Bouteille mixeur personnelle sans fil équipée de 6 lames en acier 304, batterie rechargeable USB-C 4000mAh, bol étanche 450ml sans BPA avec dragonne de transport.',
    whyItSellsInBenin: 'Prisé pour les smoothies détox, les bouillies pour bébé au bureau ou à l\'école, et les jus de fruits naturels (ananas, pastèque, orange pressée fraîche).',
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 8500,
    marketPriceCFA: 15000,
    minQuantity: 15,
    shippingMode: 'air',
    platform: 'shein',
    variants: [
      'Rose Pastel Féminin',
      'Vert Menthe Fraîcheur',
      'Blanc Épuré',
      'Noir Mat Élégant'
    ],
    targetAudience: 'Jeunes femmes, sportifs, mamans avec nourrissons',
    profitMarginEstimateCFA: 6500,
    demandLevel: 'Constante'
  },
  {
    id: 'wp-7',
    title: 'Kit Ring Light 45cm avec Trépied Pro 2.1m & Télécommande',
    category: 'hightech',
    categoryLabel: 'Création de Contenu',
    description: 'Anneau lumineux LED géant 18 pouces (45cm) avec 3 supports téléphones orientables, variateur de température (chaud/naturel/froid) et trépied stable réglable jusqu\'à 2m10.',
    whyItSellsInBenin: 'Équipement incontournable pour les centaines de boutiques en ligne WhatsApp/TikTok, maquilleuses, tresseuses et créateurs de contenu de Cotonou.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 21000,
    marketPriceCFA: 35000,
    minQuantity: 10,
    shippingMode: 'air',
    platform: 'temu',
    variants: [
      'Pack Ring Light 45cm + Trépied 2.1m + Télécommande',
      'Pack Studio Pro (+ Double Micro Cravate Sans Fil)'
    ],
    targetAudience: 'E-commerçants, créateurs TikTok, instituts de beauté',
    profitMarginEstimateCFA: 14000,
    demandLevel: 'Très Forte'
  },
  {
    id: 'wp-8',
    title: 'Set de 2 Valises Rigides Incassables TSA Roues 360° (Grand & Moyen)',
    category: 'mode_bagagerie',
    categoryLabel: 'Bagagerie & Voyage',
    description: 'Ensemble de 2 valises rigides en polycarbonate haute résistance avec serrure à combinaison TSA, 4 roues doubles silencieuses 360° et poignée aluminium télescopique.',
    whyItSellsInBenin: 'Les voyages régionaux (Lomé, Lagos, Abidjan) et internationaux sont très fréquents. En groupage maritime (bateau), le coût d\'expédition devient dérisoire par rapport au prix boutique à Dantokpa.',
    imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 48000,
    marketPriceCFA: 80000,
    minQuantity: 8,
    shippingMode: 'sea',
    platform: 'alibaba',
    variants: [
      'Rose Gold Glamour (Grand 28" + Moyen 24")',
      'Noir Mat Luxueux (Grand 28" + Moyen 24")',
      'Gris Anthracite Métallisé (Grand 28" + Moyen 24")',
      'Bleu Nuit Chic (Grand 28" + Moyen 24")'
    ],
    targetAudience: 'Commerçantes voyageuses, vacanciers, étudiants en partance',
    profitMarginEstimateCFA: 32000,
    demandLevel: 'Constante'
  },
  {
    id: 'wp-9',
    title: 'Ventilateur Silencieux Rechargeable avec Éclairage LED d\'Urgence',
    category: 'electromenager',
    categoryLabel: 'Maison & Confort',
    description: 'Ventilateur sans fil 8 pouces à batterie lithium longue autonomie (8-12h), oscillation automatique, veilleuse LED et port USB pour recharger un smartphone.',
    whyItSellsInBenin: 'Climat chaud et humide à Cotonou + utilité immédiate lors des nuits chaudes ou des coupures de courant. Se vend facilement toute l\'année.',
    imageUrl: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 13500,
    marketPriceCFA: 24000,
    minQuantity: 10,
    shippingMode: 'air',
    platform: '1688',
    variants: [
      'Blanc Polaire Moderne',
      'Bleu Océan Discret'
    ],
    targetAudience: 'Familles, célibataires, chambres d\'étudiants',
    profitMarginEstimateCFA: 10500,
    demandLevel: 'Très Forte'
  },
  {
    id: 'wp-10',
    title: 'Kit Capillaire Pousse Intense à l\'Huile de Batana & Poudre de Chébé Pure',
    category: 'beaute',
    categoryLabel: 'Beauté & Cheveux',
    description: 'Lot complet pour le soin des cheveux crépus, frisés et cassants : 1 pot de crème nourrissante au Chébé 250g + 1 flacon d\'huile pure de Batana sauvage 100ml avec pipette.',
    whyItSellsInBenin: 'Engouement massif sur les réseaux sociaux pour les soins capillaires naturels stimulants. Fort taux de réachat et de recommandation entre copines.',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-0a69614f2e51?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 6500,
    marketPriceCFA: 13000,
    minQuantity: 20,
    shippingMode: 'air',
    platform: '1688',
    variants: [
      'Kit Duo : Crème Chébé 250g + Sérum Batana 100ml',
      'Kit Trio : Crème + Sérum + Shampoing Solide Fortifiant'
    ],
    targetAudience: 'Femmes portant leurs cheveux naturels ou défrisés',
    profitMarginEstimateCFA: 6500,
    demandLevel: 'Très Forte'
  },
  {
    id: 'wp-11',
    title: 'Robe de Soirée Satinée avec Fente & Dos Nu Drapé (Collection SHEIN BAE)',
    category: 'mode_bagagerie',
    categoryLabel: 'Mode Femme & Soirée',
    description: 'Superbe robe longue en satin soyeux haute brillance, coupe sirène flatteuse avec fente haute élégante et dos nu bénitier raffiné. Parfaite pour galas, mariages et fêtes à Cotonou.',
    whyItSellsInBenin: 'SHEIN est la référence absolue de la mode féminine chez les Béninoises. Ce modèle fait fureur sur les statuts WhatsApp et s\'arrache pour les cérémonies de dot et soirées chic.',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 12500,
    marketPriceCFA: 25000,
    minQuantity: 10,
    shippingMode: 'air',
    platform: 'shein',
    variants: [
      'Bordeaux Royal - Taille S',
      'Bordeaux Royal - Taille M',
      'Vert Émeraude - Taille M',
      'Vert Émeraude - Taille L',
      'Noir Intense - Taille M'
    ],
    targetAudience: 'Jeunes femmes, invitées de mariage, étudiantes chic',
    profitMarginEstimateCFA: 12500,
    demandLevel: 'Ultra Élevée'
  },
  {
    id: 'wp-12',
    title: 'Sac à Main Matelassé Fermoir Métal & Chaîne Dorée (Style Luxe SHEIN)',
    category: 'mode_bagagerie',
    categoryLabel: 'Maroquinerie & Luxe',
    description: 'Sac bandoulière iconique en similicuir grainé matelassé haute qualité, fermoir tournant en métal doré lourd et bandoulière réglable chaîne or entrelacée de cuir.',
    whyItSellsInBenin: 'L\'accessoire star des commandes SHEIN au Bénin. Léger, classe et ultra-polyvalent pour le travail comme pour le culte du dimanche ou les réceptions.',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 9500,
    marketPriceCFA: 18000,
    minQuantity: 12,
    shippingMode: 'air',
    platform: 'shein',
    variants: [
      'Noir Matelassé Chaîne Or',
      'Beige Crème Chaîne Or',
      'Rose Poudré Chaîne Or'
    ],
    targetAudience: 'Femmes actives, lycéennes, commerçantes, amatrices de mode',
    profitMarginEstimateCFA: 8500,
    demandLevel: 'Ultra Élevée'
  },
  {
    id: 'wp-13',
    title: 'Mini Vidéoprojecteur Portable Full HD 1080P WiFi & Bluetooth (Cinéma Mobile)',
    category: 'hightech',
    categoryLabel: 'High-Tech & Divertissement',
    description: 'Projecteur compact orientable à 180° intégrant Android, WiFi bi-bande et Bluetooth. Projette un écran géant jusqu\'à 130 pouces directement depuis un smartphone, clé USB ou console.',
    whyItSellsInBenin: 'C\'est LE gadget tech viral n°1 de TEMU sur TikTok et Facebook au Bénin. Permet de regarder les matchs de football, séries et films en famille sur mur blanc.',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 29500,
    marketPriceCFA: 55000,
    minQuantity: 8,
    shippingMode: 'air',
    platform: 'temu',
    variants: [
      'Blanc Pur - Pack Standard Télécommande',
      'Blanc Pur - Pack Cinéma (+ Trépied 1.2m)'
    ],
    targetAudience: 'Jeunes branchés, passionnés de football, familles, cinéastes amateurs',
    profitMarginEstimateCFA: 25500,
    demandLevel: 'Ultra Élevée'
  },
  {
    id: 'wp-14',
    title: 'Mini Compresseur d\'Air Sans Fil Portatif avec Manomètre Numérique LED',
    category: 'electromenager',
    categoryLabel: 'Auto & Moto Pratique',
    description: 'Gonfleur électrique portable puissant rechargeable USB-C avec arrêt automatique à la pression choisie, écran LCD rétroéclairé, torche LED de nuit et 4 embouts fournis.',
    whyItSellsInBenin: 'Sauve la vie des conducteurs de moto (Zemidjan, scooters) et automobilistes à Cotonou et Calavi lors d\'une crevaison lente ou perte de pression sans devoir chercher un vulcanisateur.',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 14500,
    marketPriceCFA: 27000,
    minQuantity: 10,
    shippingMode: 'air',
    platform: 'temu',
    variants: [
      'Pack Complet Embouts Moto/Voiture/Ballon',
      'Pack Deluxe Batterie Grande Autonomie 6000mAh'
    ],
    targetAudience: 'Conducteurs de moto, automobilistes, sportifs, livreurs',
    profitMarginEstimateCFA: 12500,
    demandLevel: 'Très Forte'
  },
  {
    id: 'wp-15',
    title: 'Brosse Chauffante Lissante Ionique Céramique Anti-Brûlure (Chauffe Rapide 30s)',
    category: 'beaute',
    categoryLabel: 'Coiffure Express',
    description: 'Brosse électrique à picots en céramique tourmaline 3D générant des ions négatifs pour détendre et lisser les mèches rebelles, défriser sans aplatir et éliminer l\'électricité statique.',
    whyItSellsInBenin: 'Gain de temps phénoménal le matin avant d\'aller au travail ou aux cours à l\'UAC. Remplace le fer à lisser traditionnel sans risquer de se brûler les oreilles ou le cuir chevelu.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 8900,
    marketPriceCFA: 18000,
    minQuantity: 12,
    shippingMode: 'air',
    platform: 'temu',
    variants: [
      'Noir Doré Premium',
      'Rose Métallisé Élégant',
      'Vert Forêt Luxueux'
    ],
    targetAudience: 'Femmes actives, étudiantes, salons de coiffure de quartier',
    profitMarginEstimateCFA: 9100,
    demandLevel: 'Très Forte'
  },
  {
    id: 'wp-16',
    title: 'Caméra de Sécurité Solaire 4G / WiFi 360° Vision Nocturne & Détecteur Humain',
    category: 'hightech',
    categoryLabel: 'Sécurité & Maison',
    description: 'Caméra motorisée PTZ étanche IP66 alimentée par panneau solaire et batterie intégrée. Alerte sur smartphone via application dédiée, audio bidirectionnel micro/haut-parleur et projecteur LED.',
    whyItSellsInBenin: 'Idéale pour sécuriser chantiers en construction, parcelles, fermes ou boutiques au Bénin même en l\'absence de raccordement électrique SBEE.',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
    suggestedPriceCFA: 34500,
    marketPriceCFA: 65000,
    minQuantity: 6,
    shippingMode: 'air',
    platform: 'temu',
    variants: [
      'Modèle WiFi Double Antenne + Panneau Solaire',
      'Modèle 4G Carte SIM Tout Opérateur (+5000 F)'
    ],
    targetAudience: 'Propriétaires de chantiers, commerçants, résidents de maisons individuelles',
    profitMarginEstimateCFA: 30500,
    demandLevel: 'Très Forte'
  }
];
