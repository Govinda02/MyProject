# Khelcha Nepal - Sports Community Platform

A modern, dynamic Progressive Web App (PWA) connecting athletes and sports enthusiasts across rural and urban areas of Nepal.

## 🏆 Overview

Khelcha Nepal is a comprehensive sports platform that enables athletes, organizers, and fans to discover events, compete, and support local sports culture across Nepal.

## ✨ Key Features

### For Players/Athletes
- **Discover Events**: Browse and filter sports events by location, sport type, and date
- **Event Registration**: Join events with a single click
- **Leaderboard**: Track your ranking against other athletes across Nepal
- **Personal Dashboard**: View your stats, registered events, and achievements
- **Donate**: Support events and sports clubs

### For Organizers
- **Create Events**: Host football, volleyball, badminton, marathon, e-sports, and more
- **Manage Participants**: Track registrations and communicate with participants
- **Collect Donations**: Receive community support through integrated payment methods

### For Admins
- **Event Moderation**: Approve and manage all platform events
- **Platform Analytics**: View comprehensive stats on users, events, and donations

## 🛠️ Tech Stack

- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + MongoDB + JWT Authentication
- **Infrastructure**: Kubernetes with Nginx ingress

## 🚀 Quick Start

### Test Accounts
```
Player: ram.player@khelcha.com / password123
Organizer: club.organizer@khelcha.com / password123
Admin: admin@khelcha.com / admin123
```

### Key API Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/events` - List events
- `POST /api/registrations` - Register for event
- `GET /api/leaderboard` - View rankings

## 📱 PWA Features

- Offline support with service workers
- Installable on mobile devices
- Fast, app-like experience

## 🎨 Design

- Colors inspired by Nepal's flag (Red #DC143C, Blue #1E3A8A)
- Space Grotesk for headings, Inter for body
- Mobile-first responsive design

---

**Khelcha Nepal - Connect. Compete. Conquer Together.**
