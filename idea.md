frontend-template/
├── assets/
│   ├── css/
│   │   ├── tokens/
│   │   ├── base/
│   │   ├── components/
│   │   └── main.css
│   │
│   ├── js/
│   │   ├── core/               ← vanilla JS (gestión interna)
│   │   ├── components/         ← vanilla JS excepto interacción ligera
│   │   ├── modules/            ← vanilla JS
│   │   ├── utils/              ← vanilla JS
│   │   └── main.js             ← inicia todo
│   │
│   ├── alpine/                 ← aquí va Alpine.js aislado
│   │   ├── modals.js
│   │   ├── darkmode.js
│   │   ├── sidebar.js
│   │   └── index.js
│   │
│   ├── icons/
│   └── images/
│
├── templates/                  ← Jinja (sustituye "pages/")
│   ├── base.html               ← layout principal
│   ├── includes/
│   │   ├── head.html
│   │   ├── header.html
│   │   ├── sidebar.html
│   │   ├── footer.html
│   │   └── modals/
│   │       └── profile-info.html
│   │
│   ├── pages/
│   │   ├── index.html
│   │   ├── dashboard.html
│   │   └── about.html
│
├── docs/
│   ├── SETUP.md
│   └── COMPONENTS.md
│
├── app.py (si usas Flask)
└── README.md
