# Elementor Widget Library — psykoterapeut.net

> Dokumenteret fra stress-landingssiden (ID 39906) og forsiden (ID 38067).
> Opdateret: 2026-03-26

---

## Oversigt

| Widget Type | Antal på stress-side | Beskrivelse |
|---|---|---|
| `container` | 29x | Flexbox layout-container |
| `heading` | 18x | Overskrifter (h1-h6) |
| `cmsmasters-featured-box` | 13x | Boks med titel + beskrivelse + valgfrit ikon/billede |
| `image` | 11x | Billeder og dekorative SVG-elementer |
| `cmsmasters-button` | 3x | Knapper med link, ikon og styling |
| `html` | 2x | Custom HTML (symptom-kort grid, dekorative elementer) |
| `icon` | 2x | Enkelte ikoner (dekorative SVG) |
| `cmsmasters-icon-list` | 1x | Liste med ikoner (fx terapiformer i hero) |
| `cmsmasters-testimonials-slider` | 1x | Testimonial-slider med citater, navne, avatarer og rating |
| `counter` | 4x | Animeret tæller (tal der tæller op) — fra forsiden |
| `testimonial` | 1x | Enkelt testimonial-blok (uden slider) — fra forsiden |
| `cmsmasters-blog-grid` | 1x | Blog/post grid med custom template — fra forsiden |

**Total: 189 elementer, 12 unikke widget-typer**

---

## Site-standarder (genbruges på tværs af alle widgets)

```json
{
  "primærfarve": "#744245",
  "hover_farve": "#A47764",
  "baggrund": "#F4EBE4",
  "tekst_hvid": "#FFFFFF",
  "font_primær": "Inter",
  "font_serif": "Cardo",
  "border_radius_knapper": "30px",
  "ribbon_title": "New"
}
```

---

## 1. Container

**Elementor type:** `elType: "container"`

Bruges til al layout. Kan nestes uendeligt. Flex-baseret.

### Nøgle-settings:
```json
{
  "content_width": "boxed" | "full",
  "flex_direction": "row" | "column",
  "flex_gap": { "unit": "px", "size": 20 },
  "padding": { "unit": "px", "top": "80", "right": "0", "bottom": "80", "left": "0", "isLinked": false },
  "background_background": "classic",
  "background_color": "#F4EBE4",
  "background_image": { "id": 12345, "url": "https://..." }
}
```

### Responsive settings (suffix):
- `_tablet`, `_mobile`, `_widescreen`
- Eksempel: `padding_mobile`, `flex_direction_mobile`

---

## 2. Heading

**Elementor type:** `widgetType: "heading"`

### Nøgle-settings:
```json
{
  "title": "Stress behandling gennem <b><i>terapi</i></b>",
  "header_size": "h1",
  "align": "center",
  "align_mobile": "center",
  "content_width": "full",
  "_animation": "fadeIn"
}
```

### Bemærkninger:
- Understøtter inline HTML: `<b>`, `<i>`, `<br>`
- `header_size`: "h1" til "h6" eller "div"
- Animation: "fadeIn", "zoomIn" mv.

---

## 3. CMSMasters Button

**Elementor type:** `widgetType: "cmsmasters-button"`

### Komplet eksempel:
```json
{
  "text": "Book møde",
  "link": {
    "url": "https://mental-care.cmsmasters.net/main/appointment/",
    "is_external": "",
    "nofollow": "",
    "custom_attributes": ""
  },
  "selected_icon": {
    "value": "cmsmsdemo-icon- cmsms-demo-icon-arrow-curved",
    "library": "Local-Icons"
  },
  "icon_align": "right",
  "button_text_color": "#FFFFFF",
  "background_color": "#744245",
  "button_border_color": "#744245",
  "button_border_radius": {
    "unit": "px", "top": "30", "right": "30", "bottom": "30", "left": "30", "isLinked": true
  },
  "hover_color": "#FFFFFF",
  "button_background_hover_color": "#A47764",
  "button_hover_border_color": "#A47764"
}
```

### Standardværdier for sitet:
- Baggrund: `#744245` (primærfarve)
- Hover: `#A47764`
- Tekst: hvid
- Border-radius: 30px (afrundet)
- Ikon: pil-ikon til højre

---

## 4. CMSMasters Featured Box

**Elementor type:** `widgetType: "cmsmasters-featured-box"`

Fleksibel boks med titel, beskrivelse og valgfrit ikon/billede/link.

### Eksempel (telefon-CTA):
```json
{
  "alignment": "left",
  "title": "giv mig et kald:",
  "title_tag": "div",
  "description": "29930110",
  "link": {
    "url": "tel:+4529930110",
    "is_external": "",
    "nofollow": "",
    "custom_attributes": ""
  },
  "link_type": "link-box",
  "graphic_image": { "url": "", "id": "", "size": "" },
  "wrapper_border_border": "solid",
  "wrapper_border_width": { "unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "0", "isLinked": false },
  "text_padding": { "unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "0", "isLinked": true },
  "title_spacing": { "unit": "px", "size": 2, "sizes": [] },
  "_padding": { "unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "30", "isLinked": false },
  "_element_width": "initial",
  "_border_border": "solid",
  "_border_width": { "unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "1", "isLinked": false }
}
```

### Bruges også til:
- Terapimetoder (med ikon og beskrivelse)
- Fokusområder
- Kontaktinfo

---

## 5. CMSMasters Icon List

**Elementor type:** `widgetType: "cmsmasters-icon-list"`

Liste med ikoner — bruges til terapiformer i hero-sektionen.

### Eksempel:
```json
{
  "content_width": "full",
  "icon_list": [
    {
      "text": "Samtale terapi",
      "_id": "54fd73d",
      "icon_type": "custom",
      "icon": {
        "value": {
          "url": "https://www.psykoterapeut.net/wp-content/uploads/2024/08/home-3-svg-4.svg",
          "id": 38623
        },
        "library": "svg"
      }
    },
    {
      "text": "Kropslig terapi",
      "_id": "6a17359",
      "icon_type": "custom",
      "icon": {
        "value": {
          "url": "https://www.psykoterapeut.net/wp-content/uploads/2024/08/home-3-svg-4.svg",
          "id": 38623
        },
        "library": "svg"
      }
    }
  ],
  "item_layout": "column",
  "columns": 2,
  "columns_mobile": 1,
  "icon_size": { "unit": "px", "size": 60 },
  "text_indent": { "unit": "px", "size": 15 },
  "_animation": "fadeIn",
  "_animation_delay": 600
}
```

---

## 6. Image

**Elementor type:** `widgetType: "image"`

### Eksempel (dekorativ SVG-linje):
```json
{
  "content_width": "full",
  "image": {
    "id": 39186,
    "url": "https://www.psykoterapeut.net/wp-content/uploads/2024/08/line-1.svg",
    "alt": "",
    "source": "library"
  },
  "align": "left",
  "_element_width": "initial",
  "_element_custom_width": { "unit": "px", "size": 801 },
  "_element_custom_width_tablet": { "unit": "px", "size": 450 },
  "_element_custom_width_mobile": { "unit": "px", "size": 220 },
  "_position": "absolute",
  "_offset_x": { "unit": "%", "size": "" },
  "_offset_y": { "unit": "%", "size": 110 }
}
```

### Scroll-effekter:
```json
{
  "cms_effect_type": "scroll",
  "cms_scroll_effects": ["opacity"],
  "cms_scroll_opacity_timing": "quadOut"
}
```

---

## 7. Icon

**Elementor type:** `widgetType: "icon"`

Enkeltstående ikon — bruges dekorativt.

### Eksempel:
```json
{
  "content_width": "full",
  "selected_icon": {
    "value": {
      "url": "https://www.psykoterapeut.net/wp-content/uploads/2024/08/home-2-line-3.svg",
      "id": 38791
    },
    "library": "svg"
  },
  "size": { "unit": "px", "size": 30 },
  "size_tablet": { "unit": "px", "size": 15 },
  "fit_to_size": "yes",
  "_element_width": "auto",
  "hide_mobile": "hidden-mobile",
  "_animation": "zoomIn"
}
```

### Floating-effekt:
```json
{
  "cms_effect_type": "floating",
  "cms_floating_translate_toggle": "yes",
  "cms_floating_translate_x": { "unit": "px", "sizes": { "from": -10, "to": 10 } },
  "cms_floating_scale": { "unit": "x", "sizes": { "from": 0.8, "to": 1 } }
}
```

---

## 8. Custom HTML

**Elementor type:** `widgetType: "html"`

Bruges til komplekse moduler der kræver custom CSS/HTML.

### Symptom-kort modul:
Indeholder:
- CSS grid layout (3 kolonner → 2 → 1 responsivt)
- Kort med ikon, titel, beskrivelse
- Hover-effekter (translateY, box-shadow)
- CTA-sektion med knap
- Fuldt responsivt

### CSS-klasser brugt:
```
.im-symptoms-section
.im-symptoms-container
.im-symptoms-header
.im-symptoms-grid
.im-symptom-card
.im-card-header
```

### Styling-principper:
- Kort: `background: #fff`, `border-radius: 16px`, `box-shadow: 0 18px 45px rgba(0,0,0,0.06)`
- Hover: `transform: translateY(-6px)`
- Grid gap: `28px`
- Padding: `32px 28px`

---

## 9. CMSMasters Testimonials Slider

**Elementor type:** `widgetType: "cmsmasters-testimonials-slider"`

### Eksempel:
```json
{
  "items": [
    {
      "text": "Hej Inger Marie\nJeg har aldrig fået så meget ud af terapi...",
      "author_name": "Mand 41 år",
      "author_subtitle": "",
      "_id": "de35a26",
      "avatar": {
        "id": 38277,
        "url": "https://www.psykoterapeut.net/wp-content/uploads/2024/07/client-3.webp"
      },
      "rating": 5
    }
  ]
}
```

### Bemærkninger:
- Hvert item: text, author_name, author_subtitle, avatar, rating
- Rating: 1-5 (stjerner)
- Avatar: billede fra mediebiblioteket
- Unik `_id` per item

---

## 10. Counter (animeret tæller)

**Elementor type:** `widgetType: "counter"`
**Kilde:** Forsiden (ID 38067)

Animeret tal der tæller op til en målværdi. Bruges til statistik/nøgletal.

### Eksempel:
```json
{
  "ending_number": 10,
  "title": "",
  "number_position": "center",
  "number_position_mobile": "center",
  "cmsmasters_ribbon_title": "New"
}
```

### Nøgle-settings:
- `ending_number`: Tallet der tælles op til
- `starting_number`: Starttal (default 0)
- `title`: Tekst under tallet
- `number_position`: "center", "left", "right"
- `prefix`: Tekst før tallet (fx "+" eller "over ")
- `suffix`: Tekst efter tallet (fx "%" eller "+")

---

## 11. Testimonial (enkelt)

**Elementor type:** `widgetType: "testimonial"`
**Kilde:** Forsiden (ID 38067)

Enkelt testimonial-blok — bruges til et fremhævet citat (ikke slider).

### Eksempel:
```json
{
  "content_width": "full",
  "testimonial_content": "We have handpicked a brilliant talented team of expert psychologists...",
  "testimonial_image": { "url": "", "id": "", "size": "" },
  "testimonial_name": "",
  "testimonial_job": "",
  "cmsmasters_ribbon_title": "New"
}
```

### Nøgle-settings:
- `testimonial_content`: Citatteksten
- `testimonial_name`: Afsender
- `testimonial_job`: Undertitel/jobtitel
- `testimonial_image`: Avatar-billede

### Forskel fra testimonials-slider:
- Viser ét citat (ikke flere i slider)
- Simplere styling
- Bruges typisk som intro-citat til en sektion

---

## 12. CMSMasters Blog Grid

**Elementor type:** `widgetType: "cmsmasters-blog-grid"`
**Kilde:** Forsiden (ID 38067)

Dynamisk grid der viser posts fra en bestemt post-type.

### Eksempel:
```json
{
  "content_width": "full",
  "blog_layout": "custom",
  "blog_template_id": "722",
  "blog_post_type": "cmsms_doctor",
  "posts_per_page": 4,
  "columns": "2",
  "columns_tablet": "1",
  "post_gap_row": { "unit": "px", "size": 30 },
  "post_gap_column": { "unit": "px", "size": 30 },
  "pagination_show": "",
  "_element_width": "inherit",
  "lazyload_widget_status": "enable"
}
```

### Nøgle-settings:
- `blog_post_type`: Post-type ("post", "page", "cmsms_doctor" osv.)
- `blog_template_id`: ID på custom template til visning
- `posts_per_page`: Antal posts
- `columns`: Antal kolonner
- `blog_layout`: "custom" (bruger template) eller standard layouts
- `pagination_show`: "" (skjult) eller "yes"

### Lazyload-settings:
- `lazyload_widget_status`: "enable"
- `lazyload_widget_preloader_type`: "grid"
- Har mange preloader-styling settings (ikon, farve, border-radius)

---

## Kendte medie-assets (ID → URL)

| ID | Fil | Bruges til |
|---|---|---|
| 38623 | home-3-svg-4.svg | Icon-list ikoner (blad) |
| 38791 | home-2-line-3.svg | Dekorativt ikon |
| 39186 | line-1.svg | Dekorativ linje |
| 38277 | client-3.webp | Testimonial avatar |
| 38275 | client-2.webp | Testimonial avatar |
| 38345 | home-3-logo.svg | Dekorativt logo-ikon (forside) |
| 38685 | play-icon-2.svg | Play-ikon (video featured box) |
| 38844 | home-3-3.webp | Billede (forside sektion) |
| 39555 | preloader.svg | Preloader ikon til blog grid |

---

## Side-struktur (typisk landingsside)

```
container (root - fuld bredde)
├── container (hero-sektion)
│   ├── container (tekst-kolonne)
│   │   ├── heading (h1 - sidetitel)
│   │   ├── cmsmasters-icon-list (terapiformer)
│   │   └── container (CTA-række)
│   │       ├── cmsmasters-button (Book møde)
│   │       └── cmsmasters-featured-box (telefon)
│   └── container (billede-kolonne)
│       └── image (hero-billede)
├── container (intro-tekst sektion)
│   └── heading + heading (overskrift + brødtekst)
├── html (symptom-kort grid)
├── container (metode-sektion)
│   ├── heading (sektions-overskrift)
│   └── container (3-kolonne grid)
│       ├── cmsmasters-featured-box × 3 (metoder)
├── container (testimonials)
│   └── cmsmasters-testimonials-slider
├── container (CTA-sektion)
│   ├── heading
│   └── cmsmasters-button
└── dekorative elementer (image, icon - absolut positioneret)
```
