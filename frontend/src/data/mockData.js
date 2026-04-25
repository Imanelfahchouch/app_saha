export const mockEtablissements = [
  { id: 1, nom: "Pharmacie Al Amal", type: "pharmacie", adresse: "12 Avenue Mohammed V, Casablanca", latitude: 33.5731, longitude: -7.5898, etat: "ouvert", rating: 4.5, reviews: 23, horaire: "08:00 - 22:00", telephone: "+212 522-123456" },
  { id: 2, nom: "Clinique Badr", type: "clinique", adresse: "45 Rue Hassan II, Rabat", latitude: 34.0209, longitude: -6.8417, etat: "ouvert", rating: 4.2, reviews: 18, horaire: "24h/24", telephone: "+212 537-654321" },
  { id: 3, nom: "Hôpital Ibn Sina", type: "hopital", adresse: "Boulevard Ibn Sina, Rabat", latitude: 34.0078, longitude: -6.8498, etat: "ouvert", rating: 3.8, reviews: 45, horaire: "24h/24", telephone: "+212 537-777888" },
  { id: 4, nom: "Pharmacie Centrale", type: "pharmacie", adresse: "8 Place de la Liberté, Fès", latitude: 34.0331, longitude: -5.0003, etat: "ferme", rating: 4.7, reviews: 31, horaire: "09:00 - 20:00", telephone: "+212 535-111222" },
  { id: 5, nom: "Clinique Atlas", type: "clinique", adresse: "22 Boulevard Zerktouni, Marrakech", latitude: 31.6295, longitude: -7.9811, etat: "ouvert", rating: 4.0, reviews: 12, horaire: "07:00 - 21:00", telephone: "+212 524-333444" },
  { id: 6, nom: "Hôpital Cheikh Zaid", type: "hopital", adresse: "Quartier Souissi, Rabat", latitude: 33.9716, longitude: -6.8498, etat: "ouvert", rating: 4.3, reviews: 67, horaire: "24h/24", telephone: "+212 537-555666" },
  { id: 7, nom: "Pharmacie du Soleil", type: "pharmacie", adresse: "5 Rue de Fès, Tanger", latitude: 35.7595, longitude: -5.8340, etat: "ferme", rating: 4.1, reviews: 9, horaire: "08:30 - 21:30", telephone: "+212 539-777888" },
  { id: 8, nom: "Clinique Nour", type: "clinique", adresse: "18 Avenue des FAR, Agadir", latitude: 30.4278, longitude: -9.5981, etat: "ouvert", rating: 3.9, reviews: 15, horaire: "06:00 - 23:00", telephone: "+212 528-999000" },
  { id: 9, nom: "Pharmacie Hay Hassani", type: "pharmacie", adresse: "33 Rue 15, Hay Hassani, Casablanca", latitude: 33.5500, longitude: -7.6700, etat: "ouvert", rating: 4.6, reviews: 28, horaire: "08:00 - 00:00", telephone: "+212 522-444555" },
  { id: 10, nom: "Hôpital Militaire", type: "hopital", adresse: "Avenue des FAR, Rabat", latitude: 34.0150, longitude: -6.8350, etat: "ouvert", rating: 3.5, reviews: 22, horaire: "24h/24", telephone: "+212 537-123789" },
  { id: 11, nom: "Clinique Al Farabi", type: "clinique", adresse: "7 Rue Oued Fès, Meknès", latitude: 33.8935, longitude: -5.5472, etat: "ferme", rating: 4.4, reviews: 19, horaire: "08:00 - 20:00", telephone: "+212 535-222333" },
  { id: 12, nom: "Pharmacie Oasis", type: "pharmacie", adresse: "25 Avenue Moulay Youssef, Oujda", latitude: 34.6814, longitude: -1.9086, etat: "ouvert", rating: 4.0, reviews: 7, horaire: "09:00 - 22:00", telephone: "+212 536-444555" },
];

export const mockReviews = [
  { id: 1, user: "Ahmed B.", rating: 5, text: "Excellent service, personnel très professionnel et accueillant.", date: "2 jours ago" },
  { id: 2, user: "Fatima Z.", rating: 4, text: "Très bonne clinique, temps d'attente un peu long mais résultat impeccable.", date: "1 semaine ago" },
  { id: 3, user: "Mohammed R.", rating: 5, text: "Je recommande vivement, équipements modernes et propres.", date: "2 semaines ago" },
  { id: 4, user: "Sara K.", rating: 3, text: "Correct, mais pourrait améliorer l'accueil téléphonique.", date: "1 mois ago" },
];

export const typeIcons = { pharmacie: "bi-capsule", clinique: "bi-building", hopital: "bi-hospital" };
export const typeLabels = { pharmacie: "Pharmacie", clinique: "Clinique", hopital: "Hôpital" };
export const typeBg = { pharmacie: "bg-pharmacie", clinique: "bg-clinique", hopital: "bg-hopital" };
export const typeBadge = { pharmacie: "badge-pharmacie", clinique: "badge-clinique", hopital: "badge-hopital" };
export const typeMarker = { pharmacie: "marker-pharmacie", clinique: "marker-clinique", hopital: "marker-hopital" };