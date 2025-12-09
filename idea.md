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

✅ Guía oficial de arquitectura Frontend (Alpine + Vanilla + Jinja + Tailwind + CSS estático)
🎯 Objetivo

Mantener un frontend minimalista, estable y sin dependencias que cambian constantemente, donde cada tecnología tiene un rol delimitado y no se solapa con las otras.

1️⃣ Jinja — Para estructurar el HTML y reutilizar componentes

Usar Jinja exclusivamente para:

✔ Plantillas, layouts y páginas

base.html, layouts globales

Partials: header.html, footer.html, sidebar.html, navbar.html

✔ Incluir HTML repetido
{% include "partials/header.html" %}

✔ Loop y render de datos
{% for item in items %}
  <p>{{ item.name }}</p>
{% endfor %}

✔ Estado en el servidor, no en el navegador

Datos de usuario

Variables de backend

Flags de autenticación

2️⃣ Tailwind CSS — Para el 95% del estilo

Usar Tailwind para:

✔ Diseño general y layout

grids

spacing

colores

tipografías

responsive

✔ Estados simples
<button class="hover:bg-gray-100 dark:hover:bg-gray-800">

✔ Paleta de colores oficial del proyecto
✔ Estilos rápidos que no requieren mantenimiento
3️⃣ CSS estático — Para lo que debe ser estable y no dependa de clases

Usar CSS puro solo en estos casos:

✔ Elementos que NO quieres que cambien si Tailwind cambia

(ej. en caso de actualizar Tailwind)

Loader

Animaciones personalizadas

Estilos muy personalizados

Elementos del branding

Correcciones pequeñas que no quieres resolver con clases largas

Ejemplo:
.brand-shadow {
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

4️⃣ Alpine.js — Para interacción ligera en el frontend

Usar Alpine SOLO para:

✔ Abrir/cerrar elementos

Sidebar

Modal

Dropdown

Tabs

Tooltips simples

✔ Estados pequeños y temporales

No persistentes, no complejos.

Ejemplos:
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Contenido</div>
</div>

✔ Pequeñas reacciones del DOM
<div x-data="{ darkMode: true }" :class="darkMode ? 'dark' : ''"></div>

5️⃣ JavaScript Vanilla — Para todo lo que sea serio

Usar JS puro cuando:

✔ Se tocan APIs externas
✔ Se manipula mucho el DOM
✔ Hay cálculos, validaciones, formularios avanzados
✔ Eventos globales (scroll, resize, performance)
✔ Integraciones externas:

analytics

telemetry

SEO scripts

tracking

webhooks

fetch()

Ejemplo:
document.querySelector("#saveBtn").addEventListener("click", () => {
  fetch("/api/save", { method: "POST" })
});

✔ Lógica que NO debe ir en Alpine

Cuando ves que Alpine se vuelve largo → pásalo a JS vanilla.

6️⃣ Qué NO debe hacer Alpine (lista de prohibidos)

Para evitar problemas y mantener la simplicidad:

🚫 No manejar formularios grandes
🚫 No gestionar lógica de negocio
🚫 No hacer fetch complejos
🚫 No crear componentes grandes
🚫 No procesar datos
🚫 No almacenar estado global
🚫 No coordinar varias partes de la página
🚫 No ejecutar timers complejos
🚫 No reemplazar JS vanilla

7️⃣ Ejemplo de separación perfecta (todo ordenado)
✔ Jinja

Define la estructura:

{% extends "base.html" %}
{% block content %}
  <div id="profile-card"></div>
{% endblock %}

✔ Tailwind

El diseño:

<div class="p-6 bg-white shadow rounded-xl dark:bg-gray-900">

✔ Alpine

Abrir/cerrar modal:

<div x-data="{ open:false }">
  <button @click="open=true">Edit</button>
  <div x-show="open">Modal</div>
</div>

✔ JS Vanilla

Acciones reales:

document.getElementById("saveProfile").onclick = async () => {
  const data = {...};
  await fetch("/api/profile", { method: "POST", body: JSON.stringify(data) });
};

✔ CSS estático

Algo totalmente estable:

.loader-spin {
  animation: spin 1s linear infinite;
}

🎁 Resumen rápido (para pegar en tu README)
Jinja → estructura
Tailwind → estilo
CSS → estética fija
Alpine → interacción simple
JS Vanilla → lógica real