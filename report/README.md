# CipherFlow — Centre des rapports d'avancement

> Point d'entrée de la documentation de suivi du projet. Les rapports sont destinés à être transmis périodiquement à l'enseignant.

## Rapports

| Rapport | Document | Source LaTeX | État |
|---|---|---|---|
| 01 | [PDF](./CipherFlow_EtatAvancement.pdf) | [report.tex](./report.tex) | Réalisé |
| 02 | [PDF](./CipherFlow_EtatAvancement_V2.pdf) | [main.tex](./main.tex) | Réalisé |
| 03 | [Dossier Rapport_03](./Rapport_03/) | À compléter | À préparer |
| 04 | [Dossier Rapport_04](./Rapport_04/) | À compléter | À préparer |
| 05 | [Dossier Rapport_05](./Rapport_05/) | À compléter | À préparer |

Les deux premiers rapports restent à leurs emplacements historiques. Les ressources graphiques partagées sont centralisées dans le dossier assets.

## Organisation des ressources

```text
report/
├── assets/
│   ├── images/       # Captures d'écran et illustrations des rapports
│   └── branding/     # Logos institutionnels et fond de page de garde
├── Rapport_01/      # Espace d'archivage du rapport 01
├── Rapport_02/      # Espace d'archivage du rapport 02
├── Rapport_03/
├── Rapport_04/
├── Rapport_05/
├── CipherFlow_EtatAvancement.pdf
├── CipherFlow_EtatAvancement_V2.pdf
├── report.tex       # Source du rapport 01
└── main.tex         # Source du rapport 02
```

## Catalogue des images

| Fichier | Description |
|---|---|
| [github-repository.png](./assets/images/github-repository.png) | Dépôt GitHub et documentation |
| [workbench-initial.png](./assets/images/workbench-initial.png) | Interface principale du workbench |
| [pipeline-caesar.png](./assets/images/pipeline-caesar.png) | Exemple d'exécution Caesar |
| [pipeline-multistep.png](./assets/images/pipeline-multistep.png) | Pipeline composé de plusieurs opérations |

Les noms sont descriptifs et stables. Les captures destinées à un rapport futur doivent être placées dans le dossier images de ce rapport lorsqu'elles lui sont spécifiques.

## Règles de gestion

1. Ne jamais écraser un rapport déjà transmis : créer une nouvelle version numérotée.
2. Conserver les sources LaTeX avec le PDF correspondant.
3. Centraliser les ressources graphiques communes dans assets/.
4. Stocker les captures propres à un rapport dans son dossier images/.
5. Utiliser des noms explicites, minuscules et séparés par des tirets.
6. Ne déclarer comme réalisé que ce qui est vérifiable dans le code, les tests ou les captures.
7. Avant transmission, vérifier la compilation LaTeX et ouvrir le PDF généré.

## Calendrier de suivi

Les dates exactes de remise sont à confirmer avec l'enseignant. Les rapports 03 à 05 seront préparés progressivement jusqu'au 1er janvier 2027.