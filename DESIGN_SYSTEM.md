# Design System - Toudoux

## 🎨 Palette de Couleurs - Monochrome Élégant

### Couleurs Primaires

- **Primaire** : `#1a1a1a` (Noir profond)
  - Utilisé pour : Boutons principaux, texte primaire, accents
- **Primaire Hover** : `#333333` (Gris anthracite)
  - Utilisé pour : État hover des boutons
- **Primaire Active** : `#000000` (Noir pur)
  - Utilisé pour : État actif/pressed

### Couleurs de Statut

- **Success** : `#22c55e` (Vert moderne)
- **Warning** : `#f59e0b` (Orange sophistiqué)
- **Error** : `#ef4444` (Rouge élégant)
- **Info** : `#0ea5e9` (Bleu ciel)

### Couleurs de Fond

- **Container** : `#FFFFFF` (Blanc - Cards)
- **Layout** : `#fafafa` (Gris très clair - Background)
- **Elevated** : `#FFFFFF` (Blanc - Modales)

### Couleurs de Texte

- **Texte Primaire** : `#1a1a1a` (Noir profond)
- **Texte Secondaire** : `#666666` (Gris moyen)
- **Texte Tertiaire** : `#999999` (Gris clair)

### Bordures

- **Border** : `#e5e5e5` (Bordure claire)
- **Border Secondary** : `#f0f0f0` (Bordure très claire)

## 📐 Typographie

- **Font Size** : 14px (base)
- **Heading 1** : 32px
- **Heading 2** : 24px
- **Heading 3** : 20px
- **Font Weight Strong** : 600

## 🎯 Layout

- **Border Radius** : 8px (standard)
- **Border Radius Large** : 12px
- **Border Radius Small** : 6px

## 💫 Ombres

- **Primary Shadow** : `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
- **Secondary Shadow** : `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`

## 🎨 Philosophie de Design

**Style** : Minimaliste, élégant, professionnel

**Inspirations** : Apple, Vercel, Linear

**Principes** :

- Contraste élevé pour une meilleure accessibilité
- Palette monochrome pour mettre en valeur le contenu
- Utilisation minimale de la couleur pour les actions importantes
- Design intemporel et professionnel

## 📝 Usage

La configuration du thème se trouve dans `/inertia/app/app.tsx`.

Pour utiliser les couleurs :

```tsx
// Bouton primaire (noir avec texte blanc)
<Button type="primary">Action</Button>

// Texte avec couleur primaire
<span style={{ color: '#1a1a1a' }}>Texte important</span>

// Succès
<Alert type="success" message="Opération réussie" />
```

## 🔄 Dernière Mise à Jour

Date : 2026-02-08
Version : 1.0.0
