# BookBrew

BookBrew est un plugin Obsidian puissant conçu pour les auteurs, éditeurs et designers de livres qui exigent une précision dans la composition de documents. Il transforme vos notes Markdown en livres professionnellement composés en utilisant des techniques LaTeX avancées.

## Fonctionnalités

- 🎨 Utilisation de templates LaTeX personnalisables
- 📑 Imposition automatique des pages (incluant l'imposition à cheval)
- 📚 Génération automatique de couvertures avec calcul de l'épaisseur de la tranche
- 🔄 Champs dynamiques basés sur le YAML frontmatter
- 🌍 Interface multilingue (EN, FR, ES, DE)

## Prérequis

- Obsidian v0.15.0 ou supérieur
- Une distribution LaTeX installée sur votre système (TeX Live recommandé)
- Les packages LaTeX nécessaires (listés ci-dessous)

## Installation

1. Dans Obsidian, allez dans Paramètres > Plugins tiers
2. Cliquez sur "Parcourir" et recherchez "BookBrew"
3. Installez le plugin
4. Activez le plugin dans la liste des plugins installés

## Configuration

1. Allez dans les paramètres du plugin
2. Définissez la langue de l'interface
3. Configurez le template LaTeX par défaut
4. Définissez le chemin d'exportation par défaut
5. Ajustez les autres options selon vos besoins

## Utilisation

1. Ouvrez un fichier Markdown contenant votre manuscrit
2. Assurez-vous que le frontmatter YAML contient les champs nécessaires
3. Ouvrez le panneau BookBrew
4. Sélectionnez votre template et vos options
5. Cliquez sur "Exporter" pour générer votre PDF

### Structure YAML recommandée

```yaml
---
titre: Mon Livre
auteur: John Doe
edition: Première édition
imagecouv: chemin/vers/image.jpg
---
```

## Templates LaTeX

Les templates sont stockés dans le dossier `typeset/layout`. Vous pouvez ajouter vos propres templates en suivant la structure existante.

### Templates d'imposition

Les fichiers d'imposition sont stockés dans `typeset/impose`. Ils définissent comment les pages seront arrangées pour l'impression.

## Calculs d'épaisseur

Le plugin inclut des calculs automatiques pour :
- L'épaisseur de la tranche basée sur le nombre de pages et l'épaisseur du papier
- Les ajustements pour l'imposition à cheval

## Support

- [Documentation complète](https://github.com/votre-repo/bookbrew/wiki)
- [Signaler un problème](https://github.com/votre-repo/bookbrew/issues)
- [Forum de discussion](https://github.com/votre-repo/bookbrew/discussions)

## Licence

Ce projet est sous licence GNU GPL v3. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Remerciements

- L'équipe Obsidian pour leur excellent travail
- La communauté LaTeX pour leurs outils et documentation
- Tous les contributeurs au projet
