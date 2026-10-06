export interface DeliveredOrder {
  id: string;
  ticketId: string;
  clientName: string;
  location: string;
  platform: 'Shein' | 'Temu' | 'Alibaba' | 'Autre';
  shippingMode: 'air' | 'sea';
  transitDays: number;
  deliveryDate: string;
  title: string;
  itemsSummary: string;
  rating: number;
  review: string;
  imageUrl: string;
  verified: boolean;
}

export const DELIVERED_ORDERS_MOCK: DeliveredOrder[] = [
  {
    id: 'rec-1',
    ticketId: 'CS-784210',
    clientName: 'Nadège G.',
    location: 'Cotonou (Akpakpa)',
    platform: 'Shein',
    shippingMode: 'air',
    transitDays: 18,
    deliveryDate: 'Reçu il y a 3 jours',
    title: 'Robes de Soirée & Escarpins Strass',
    itemsSummary: '2 Robes gala satin + 1 Paire d’escarpins dorés',
    rating: 5,
    review: 'Articles magnifiques et emballage soigné. Reçu pile avant mon événement familial, je recommande vivement Christaline Shop !',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    id: 'rec-2',
    ticketId: 'CS-652190',
    clientName: 'Marc D.',
    location: 'Cotonou (Cadjehoun)',
    platform: 'Temu',
    shippingMode: 'air',
    transitDays: 16,
    deliveryDate: 'Reçu il y a 5 jours',
    title: 'Sneakers & Tenues Sportswear',
    itemsSummary: '2 Baskets running + 3 Ensembles training respirants',
    rating: 5,
    review: 'Chiffrage en FCFA transparent dès la commande, acompte réglé par MTN MoMo et colis reçu directement à Cadjehoun.',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    id: 'rec-3',
    ticketId: 'CS-551202',
    clientName: 'Gervais A.',
    location: 'Porto-Novo (Centre)',
    platform: 'Alibaba',
    shippingMode: 'sea',
    transitDays: 75,
    deliveryDate: 'Reçu la semaine dernière',
    title: 'Set de Valises Voyage Trolley TSA',
    itemsSummary: 'Set de 2 valises grand format rigides incassables',
    rating: 5,
    review: 'Expédition maritime très économique pour du gros volume. Dédouanement au port de Cotonou géré de A à Z par Christaline.',
    imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    id: 'rec-4',
    ticketId: 'CS-918234',
    clientName: 'Aïcha K.',
    location: 'Abomey-Calavi (Arconville)',
    platform: 'Shein',
    shippingMode: 'air',
    transitDays: 19,
    deliveryDate: 'Reçu il y a 6 jours',
    title: 'Sacs à Main Luxe & Maroquinerie',
    itemsSummary: '1 Sac bandoulière cuir camel + 2 Pochettes habillées',
    rating: 5,
    review: 'La finition est identique aux photos. Le suivi régulier sur la plateforme m’a apporté une vraie tranquillité d’esprit.',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    id: 'rec-5',
    ticketId: 'CS-442890',
    clientName: 'Sophie Y.',
    location: 'Cotonou (Fidjrossè)',
    platform: 'Temu',
    shippingMode: 'air',
    transitDays: 15,
    deliveryDate: 'Reçu il y a 1 semaine',
    title: 'Kits Maquillage & Accessoires Beauté',
    itemsSummary: 'Kit 32 pinceaux professionnels + 1 Miroir LED',
    rating: 5,
    review: 'Tous les pinceaux et le miroir sont arrivés en parfait état, aucune casse. Équipe Christaline toujours disponible sur WhatsApp.',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    id: 'rec-6',
    ticketId: 'CS-334912',
    clientName: 'Carine Z.',
    location: 'Cotonou (Haie Vive)',
    platform: 'Shein',
    shippingMode: 'air',
    transitDays: 17,
    deliveryDate: 'Reçu il y a 10 jours',
    title: 'Blazers Cintrés & Tenues Chic',
    itemsSummary: '2 Blazers élégants + 1 Pantalon palazzo + 2 Tops',
    rating: 5,
    review: 'Superbe expérience shopping international ! Les coupes et les matières sont parfaites pour le travail.',
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    id: 'rec-7',
    ticketId: 'CS-889104',
    clientName: 'Rodrigue T.',
    location: 'Parakou',
    platform: 'Temu',
    shippingMode: 'air',
    transitDays: 20,
    deliveryDate: 'Reçu il y a 2 semaines',
    title: 'Montres & Gadgets Électroniques',
    itemsSummary: '2 Smartwatches étanches + 1 Casque Bluetooth ANC',
    rating: 5,
    review: 'Réexpédition sécurisée jusqu’à Parakou. Carton bien cerclé et emballage protecteur triple couche.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    id: 'rec-8',
    ticketId: 'CS-612048',
    clientName: 'Grace B.',
    location: 'Cotonou (Ménontin)',
    platform: 'Shein',
    shippingMode: 'air',
    transitDays: 15,
    deliveryDate: 'Reçu il y a 2 semaines',
    title: 'Colis Prêt-à-Porter & Chaussures',
    itemsSummary: 'Carton complet de 10 articles mode d’été',
    rating: 5,
    review: 'Livraison en main propre par le coursier à Ménontin. Je n’achète plus à l’étranger sans passer par Christaline Shop !',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    verified: true
  }
];
