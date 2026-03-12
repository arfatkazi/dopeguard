# DopeGuard — Security-Focused Full-Stack Platform

DopeGuard is a security-focused full-stack application built with separate frontend and backend services and containerized using Docker and Docker Compose for consistent development, testing, and deployment workflows.

This project is part of my DevOps learning journey, where I focus on building production-style applications with containerization, CI/CD readiness, cloud deployment preparation, and secure application delivery practices.

---

## Overview

DopeGuard is designed as a multi-service full-stack project with:

- **Frontend** for user-facing functionality
- **Backend** for application logic and APIs
- **Docker Compose** for multi-service orchestration
- **CI/CD-ready structure** for automation and deployment workflows

The project is built not only as an application, but also as a hands-on DevOps case study to practice:

- containerization
- deployment consistency
- service orchestration
- environment management
- CI/CD readiness
- cloud deployment workflows

---

## Key Features

- Full-stack project structure with separate frontend and backend services
- Containerized setup using Docker
- Multi-service orchestration using Docker Compose
- Consistent development and runtime environments
- CI/CD-ready repository structure
- Cloud and VPS deployment-friendly foundation
- Security-focused application direction for DevOps learning

---

## Tech Stack

### Frontend
- JavaScript
- HTML
- CSS

### Backend
- Backend service and API logic

### DevOps / Deployment
- Docker
- Docker Compose
- GitHub Actions
- CI/CD workflow foundation

---

## Project Goals

The main goals of DopeGuard are:

- Build and manage a **full-stack security-focused application**
- Practice **containerizing frontend and backend services**
- Improve **deployment consistency** across environments
- Create a base for **CI/CD pipeline automation**
- Prepare the project for **cloud and VPS deployment workflows**
- Strengthen hands-on DevOps skills using a real project

---

## Repository Structure
```bash

dopeguard/
├── .github/
│   └── workflows/          # CI/CD workflow files
├── backend/                # Backend service
├── frontend/               # Frontend service
├── docker-compose.yml      # Multi-service orchestration
├── .dockerignore
├── .gitignore
└── README.md
```

Architecture
```bash
User
  |
  v
Frontend
  |
  v
Backend / API
  |
  v
Application Services / Integrations

```

Getting Started
Prerequisites

Make sure you have installed:
```bash
Git

Docker

Docker Compose
```


Clone the repository
```bash
git clone https://github.com/arfatkazi/dopeguard.git
cd dopeguard
```
Run the project
```bash
docker compose up --build
```
Stop the project
```bash
docker compose down
```



Author

Arfat Kazi
```bash
GitHub: arfatkazi
```
