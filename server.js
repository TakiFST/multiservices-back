const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/*
=================================
DONNÉES STATIQUES (PAS DE DB)
=================================
*/

const prestationsNettoyage = [
  { id: 1, nom: "Nettoyage appartement", prix: "50€", description: "Nettoyage standard" },
  { id: 2, nom: "Nettoyage après déménagement", prix: "120€", description: "Nettoyage complet" },
  { id: 3, nom: "Nettoyage bureaux", prix: "80€", description: "Service professionnel" }
];

const prestationsBricolage = [
  { id: 1, nom: "Montage meubles", prix: "40€/h", description: "Montage meubles divers" },
  { id: 2, nom: "Installation luminaires", prix: "35€/h", description: "Pose plafonniers" },
  { id: 3, nom: "Petites réparations", prix: "30€/h", description: "Réparations maison" }
];

const prestationsCours = [
  { id: 1, nom: "Cours Mathématiques", prix: "30€/h", description: "Collège & Lycée" },
  { id: 2, nom: "Cours Anglais", prix: "25€/h", description: "Tous niveaux" },
  { id: 3, nom: "Cours Informatique", prix: "35€/h", description: "Initiation & programmation" }
];

/*
=================================
ROUTES API REST
=================================
*/

app.get("/", (req, res) => {
  res.json({ message: "API Multiservices opérationnelle" });
});

app.get("/api/nettoyage", (req, res) => {
  res.json(prestationsNettoyage);
});

app.get("/api/bricolage", (req, res) => {
  res.json(prestationsBricolage);
});

app.get("/api/cours", (req, res) => {
  res.json(prestationsCours);
});

/*
=================================
START SERVER
=================================
*/

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
