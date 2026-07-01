# Galerie Mariage

Site web pour votre mariage : vos invités scannent un QR code, prennent ou choisissent des photos depuis leur téléphone, et les photos apparaissent instantanément dans une galerie partagée.

## Fonctionnalités

- Page d'accueil mobile-friendly (idéale pour un QR code)
- Prise de photo via l'appareil photo du téléphone
- Import depuis la galerie photos
- Demande d'autorisation caméra / photos (gérée par le navigateur)
- Galerie en temps réel hébergée sur Supabase (gratuit)

## Prérequis

1. **Node.js 18+** — installez-le depuis [nodejs.org](https://nodejs.org)
2. **Compte Supabase gratuit** — [supabase.com](https://supabase.com)

## Installation

```bash
cd ~/Projects/mariage-galerie
npm install
cp .env.local.example .env.local
```

## Configuration Supabase

### 1. Créer un projet

1. Allez sur [supabase.com](https://supabase.com) et créez un projet
2. Dans **Project Settings → API**, copiez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Créer le bucket de stockage

Dans **Storage → New bucket** :
- Nom : `photos`
- Cochez **Public bucket**

### 3. Politiques d'accès (SQL Editor)

Exécutez ce script dans **SQL Editor** :

```sql
-- Lecture publique des photos
CREATE POLICY "Lecture publique des photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Upload autorisé pour tous (adapté à un mariage)
CREATE POLICY "Upload invités"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');
```

### 4. Personnaliser le titre

Dans `.env.local` :

```
NEXT_PUBLIC_WEDDING_TITLE=Marie & Pierre
```

## Lancer en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) sur votre téléphone (même réseau Wi-Fi) ou utilisez un tunnel comme [ngrok](https://ngrok.com) pour tester la caméra en HTTPS.

> **Important** : la caméra nécessite **HTTPS** en production (ou localhost en dev). Sur mobile, déployez le site avant le jour J.

## Déploiement (recommandé : Vercel)

1. Poussez le code sur GitHub
2. Importez le projet sur [vercel.com](https://vercel.com)
3. Ajoutez les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, etc.)
4. Déployez — vous obtiendrez une URL du type `https://mariage-galerie.vercel.app`

## QR Code

Une fois déployé, générez un QR code pointant vers votre URL :

- [qr-code-generator.com](https://www.qr-code-generator.com/)
- Ou imprimez-le depuis Canva / un outil de design

Placez le QR code sur les tables, près de l'entrée, ou sur les faire-parts.

## Structure du site

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Page scannée via QR code |
| Capture | `/capture` | Prendre ou choisir une photo |
| Galerie | `/galerie` | Voir toutes les photos |

## Note sur le micro

Pour des **photos**, seul l'accès à la **caméra** et à la **galerie** est nécessaire. Le micro n'est requis que si vous ajoutez des messages vidéo (non inclus pour l'instant).

## Support

En cas de problème sur iPhone : utilisez **Safari** ou **Chrome**, et l'option « Choisir depuis la galerie » si la caméra intégrée ne fonctionne pas.
