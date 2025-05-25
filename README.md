# 🌍ÅpenMeet

**ÅpenMeet** es una aplicación móvil multiplataforma diseñada para conectar personas a través de planes y eventos sociales en su ciudad. Ideal para estudiantes, expatriados o cualquier persona que quiera ampliar su círculo social de forma moderna, fluida y segura.

---

## Tabla de Contenidos

1. [Introducción](#introducción)  
2. [Motivación](#motivación)  
3. [Objetivos](#objetivos)  
4. [Requisitos](#requisitos)  
5. [Arquitectura](#arquitectura)  
6. [Tecnologías](#tecnologías)  
7. [Funcionalidades clave](#funcionalidades-clave)  
8. [Roadmap](#roadmap)  
9. [Instalación rápida](#instalación-rápida)  
10. [Licencia](#licencia)

---

## 🚀Introducción

**ÅpenMeet** nace con el propósito de crear una experiencia social moderna, intuitiva y accesible. Permite descubrir planes, chatear en tiempo real y unirse a eventos locales de manera rápida y sencilla. Está pensada especialmente para quienes llegan nuevos a una ciudad y quieren integrarse socialmente.

---

## Motivación

Durante experiencias de movilidad internacional como Erasmus, es común sentirse desconectado o sin saber cómo integrarse en el entorno local. ApenMeet surge para resolver esta problemática, proporcionando una herramienta útil, atractiva y fácil de usar para hacer nuevos contactos y descubrir actividades.

---

## Objetivos

- Facilitar la búsqueda de planes y eventos por ciudad y nombre.
- Fomentar nuevas conexiones entre personas con intereses comunes.
- Crear una app multilingüe, moderna y con experiencia de usuario profesional.
- Garantizar una arquitectura escalable y mantenible.

---

## Requisitos

- Node.js >= 18.x  
- npm >= 9.x  
- Expo CLI  
- PostgreSQL  
- Docker (opcional)

---

## 🛠️Arquitectura

ApenMeet utiliza una arquitectura cliente-servidor moderna y modular:

### Frontend (`ApenMeetExpo/ApenMeet`)

- React Native + Expo
- Redux Toolkit para gestión global del estado
- React Navigation para navegación
- i18next para internacionalización (ES / EN)
- React Native Paper para UI accesible
- Axios para peticiones HTTP

### Backend (`RestApi/ApenMeet`)

- Node.js + Express (con TypeScript)
- PostgreSQL como base de datos relacional
- JWT para autenticación
- Multer para gestión de imágenes
- Helmet + CORS para seguridad

---

## ⚙️Tecnologías

| Área     | Tecnologías principales                                                             |
|----------|--------------------------------------------------------------------------------------|
| Frontend | React Native, Expo, Redux Toolkit, React Navigation, i18next, Axios                 |
| Backend  | Node.js, Express, TypeScript, PostgreSQL, JWT, Multer, Helmet                       |
| DevOps   | Docker, ESLint, Prettier, GitHub Actions (CI/CD)                                    |

---

## Funcionalidades clave

- Registro y login con JWT
- Creación, edición y eliminación de planes
- Búsqueda avanzada por ciudad y nombre
- Chat en tiempo real por plan (Socket.IO)
- Mapa interactivo con geolocalización
- Notificaciones instantáneas (en desarrollo)
- Gestión de administradores de planes
- App multilingüe (español / inglés)
- Validación y seguridad de usuarios

---

## Instalación rápida

### Frontend

```bash
cd ApenMeetExpo/ApenMeet
npm install
npm start
```

### Backend

```bash
cd RestApi/ApenMeet
npm install
npm run dev
```

### 📝Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

### 👤Autor

Desarrollado por Leonardo como parte del proyecto final del Grado Superior de Desarrollo de Aplicaciones Multiplataforma (DAM).

