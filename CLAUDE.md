# CLAUDE.md — Regler og viden for psykoterapeut.net

## 🔒 UFRAVIGELIGE REGLER

### Publicering
- **Sæt ALTID nye og ændrede sider til `draft`** — aldrig `publish` uden eksplicit godkendelse fra brugeren
- Spørg altid: "Vil du at jeg sætter siden live?" og vent på et klart "ja"

### Sletning
- **Spørg ALTID før du sletter noget** — sider, meta-felter, mediefiler eller andet
- Beskriv præcist hvad der vil blive slettet, og vent på bekræftelse

### Generelt
- Informér altid brugeren om hvad du er ved at gøre med sitet inden du gør det
- Ved tvivl: spørg frem for at handle

---

## 🌐 Site-information

| Felt | Værdi |
|---|---|
| URL | https://psykoterapeut.net |
| WordPress admin | https://psykoterapeut.net/wp-admin |
| Sitets navn | Psykoterapi ved Inger Marie Gravesen |
| Sprog | Dansk (da-DK) |
| Admin e-mail | ebbe.norgaard@gmail.com |

---

## 🎨 Teknisk setup

| Komponent | Detalje |
|---|---|
| Tema | Mental Care (CMSMasters) — klassisk tema, IKKE FSE |
| Page builder | Elementor Pro |
| Header/navigation | Bygget i Elementor Pro Theme Builder — **rør ikke ved WP-menusystemet**, det vises ikke på sitet |
| SEO plugin | Yoast SEO |
| Primærfarve | `#744245` (brun/rust) |
| Baggrundfarve | `#F4EBE4` (beige) |
| Fonte | Inter (primær), Cardo (serif/dekorativ) |

---

## 📄 Kendte side-IDs

| Side | ID | URL | Status |
|---|---|---|---|
| Terapi mod stress (original) | 39906 | /terapi-mod-stress/ | Live |
| Terapi mod depression | 40079 | /terapi-mod-depression/ | Live |
| Traumebehandling | 40083 | /traumebehandling/ | Live |
| Terapi mod angst | 39701 | /angst-behandling-i-aarhus-.../ | Live |
| Praktiske oplysninger | 2 | /praktiske-oplysninger/ | Kladde |
| Depression (gammel, custom HTML) | 40018 | — | Papirkurv |

---

## 🔧 MCP Plugin — Landing Page Abilities

Plugin-fil: `landing-page-abilities/landing-page-abilities.php`
Nuværende version: **1.4.0**

### REST API endpoints
```
POST /wp-json/lpa/v1/set-elementor-data  — Store Elementor JSON-filer
POST /wp-json/lpa/v1/upload-media        — Upload filer via base64
Auth: Basic (ichristoffer.larsen@gmail.com + application password)
```

### Abilities (17 i alt)
- `landing-pages/get-site-info`
- `landing-pages/list-pages`
- `landing-pages/get-page`
- `landing-pages/create-page`
- `landing-pages/update-page`
- `landing-pages/delete-page`
- `landing-pages/list-page-templates`
- `landing-pages/list-media`
- `landing-pages/update-media-meta`
- `landing-pages/set-featured-image`
- `landing-pages/get-seo`
- `landing-pages/update-seo`
- `landing-pages/list-menus`
- `landing-pages/add-page-to-menu`
- `landing-pages/get-elementor-data`
- `landing-pages/set-elementor-data`
- `landing-pages/clear-elementor-data`

### REST API endpoint (til store Elementor JSON-filer)
```
POST /wp-json/lpa/v1/set-elementor-data
Body: { id, elementor_data, elementor_page_settings?, template? }
Auth: Basic (Christoffer + application password)
```

### Workflow for nye landingssider
1. Hent Elementor JSON fra en eksisterende side med `get-elementor-data`
2. Tilpas JSON lokalt (skift tekster, bevar alle IDs og styling)
3. Gem tilpasset JSON i `/depression-elementor-data.json` el. lign.
4. Upload via `curl` til `/wp-json/lpa/v1/set-elementor-data` med `template: elementor_header_footer`
5. Sæt som kladde og bed brugeren om at forhåndsvise
6. Vent på godkendelse **før** `publish`

---

## 📚 Elementor Widget Library

Se `elementor-widget-library.md` for komplet dokumentation af alle kendte widget-typer med settings, eksempler og side-struktur. Opdateres løbende når nye moduler identificeres.

**Kendte widget-typer (9):** container, heading, cmsmasters-button, cmsmasters-featured-box, cmsmasters-icon-list, image, icon, html, cmsmasters-testimonials-slider

---

## ⚠️ Kendte begrænsninger

- MCP-protokollen har en størrelsesgrænse på output — Elementor JSON (~125.000 tegn) overskrider den, brug REST API endpoint i stedet
- `add-page-to-menu` ability virker teknisk men menuen vises ikke på sitet da Elementor Pro overtager headeren — menupunkter skal tilføjes manuelt i Elementor
- `get-page` ability returnerer for meget data på Elementor-sider pga. `_elementor_data` i meta — brug `get-elementor-data` i stedet til at hente Elementor-indhold
- Header/navigation skal redigeres manuelt i Elementor Pro Theme Builder — Claude kan ikke ændre menuen programmatisk
