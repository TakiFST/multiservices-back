const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/*
===============================
DONNÉES STATIQUES (SANS DB)
===============================
*/

const nettoyage = [
  {
    id: 1,
    nom: "Nettoyage appartement",
    prix: "50€",
    description: "Nettoyage standard à domicile"
  },
  {
    id: 2,
    nom: "Nettoyage après déménagement",
    prix: "120€",
    description: "Nettoyage complet"
  },
  {
    id: 3,
    nom: "Nettoyage bureaux",
    prix: "80€",
    description: "Service professionnel"
  }
];

const bricolage = [
  {
    id: 1,
    nom: "Montage meubles",
    prix: "40€/h",
    description: "Montage meubles toutes marques"
  },
  {
    id: 2,
    nom: "Installation luminaires",
    prix: "35€/h",
    description: "Pose plafonniers et lampes"
  },
  {
    id: 3,
    nom: "Petites réparations",
    prix: "30€/h",
    description: "Réparations domestiques"
  }
];

const cours = [
  {
    id: 1,
    nom: "Cours Mathématiques",
    prix: "30€/h",
    description: "Collège et lycée"
  },
  {
    id: 2,
    nom: "Cours Anglais",
    prix: "25€/h",
    description: "Tous niveaux"
  },
  {
    id: 3,
    nom: "Cours Informatique",
    prix: "35€/h",
    description: "Initiation et programmation"
  }
];

/*
===============================
ROUTES API REST
===============================
*/

app.get("/", (req, res) => {
  res.json({ message: "API Multiservices OK" });
});

app.get("/api/nettoyage", (req, res) => {
  res.json(nettoyage);
});

app.get("/api/bricolage", (req, res) => {
  res.json(bricolage);
});

app.get("/api/cours", (req, res) => {
  res.json(cours);
});

/*
===============================
START SERVER
===============================
*/

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
