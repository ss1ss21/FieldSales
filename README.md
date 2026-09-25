# 🌍 Field Operations & Visit Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![.NET Core](https://img.shields.io/badge/.NET_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Entity Framework](https://img.shields.io/badge/Entity_Framework-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

An enterprise-grade web application engineered for the end-to-end management of 
field operations, customer visits, and personnel shift cycles, heavily augmented 
with Geographic Information System (GIS) capabilities. Developed with 
high-performance rendering optimizations, a self-healing database architecture, 
and a strictly modular user interface.

## 🚀 Executive Summary

This system is designed to optimize daily routing for field personnel, enable 
real-time operational tracking for administrators via interactive map interfaces, 
and enforce absolute data integrity. The application operates across two primary 
roles: `Admin` and `Personnel`.

The development lifecycle adheres strictly to **Clean Code** principles. UI 
components (Modals, Popups, Map Layers) are decoupled into independent, reusable 
modules, establishing a highly maintainable and scalable architectural foundation.

## 🧠 Architecture & Tech Stack

### Frontend (Client-Side)
*   **React & TypeScript:** Ensures strict type-safety, predictable state 
    management, and robust component architecture.
*   **Leaflet.js & React-Leaflet:** Provides dynamic map integration, smooth 
    `flyTo` coordinate animations, and custom marker rendering.
*   **OSRM (Open Source Routing Machine):** Calculates and draws optimal driving 
    routes based on real-time GPS telemetry.
*   **Tailwind CSS:** Delivers a modern, responsive, and cohesive UX/UI aligned 
    with enterprise standards.

### Backend (Server-Side) & Database
*   **C# .NET Core Web API:** Implements a RESTful architecture with highly 
    optimized async/await operation management.
*   **Entity Framework Core:** Utilizes a Code-First approach for seamless 
    Object-Relational Mapping (ORM).
*   **Smart Database Management (SQLite):** Overcomes native SQLite date-constraint 
    limitations through advanced in-memory LINQ evaluations, systematically 
    preventing duplicate record generation.

## ⚡ Core Features

### 1. Self-Healing Data Architecture
*   The backend features an automated sanitation algorithm (`CleanDuplicatesSafely`) 
    that proactively detects and purges redundant or orphaned records before 
    client hydration.
*   Absolute Data Integrity: The API strictly blocks the creation of duplicate 
    work orders (same date, same personnel, same client) at the operational level.

### 2. Smart GIS & Route Optimization
*   Incorporates a robust `Geolocation Error Handler` to gracefully manage 
    OS-level and browser-level GPS timeouts or permission restrictions.
*   Dynamically sorts pending visits based on real-time proximity to the 
    personnel's current coordinates using advanced distance calculations 
    (Haversine formula).
*   Selecting a task from the sidebar seamlessly triggers a geographical focus 
    animation (`flyTo`) on the active map layer.

### 3. State Management & Business Rules
*   **Locked Shift Cycles:** Executing the "End Day" action irreversibly locks 
    the daily shift, automatically cascading all remaining pending visits to a 
    `Postponed` status.
*   Post-shift state immutability is guaranteed through a hybrid approach 
    utilizing client-side `Local Storage` locks combined with strict backend 
    validation.

### 4. Advanced UX/UI Implementation
*   Completely deprecates native browser dialogs (`alert`, `confirm`).
*   All user feedback, warnings, and confirmations are orchestrated through 
    custom-built, aesthetically cohesive **Global InfoPopup** and **AlertPopup** 
    components.

## 🛠 Getting Started

Follow these instructions to set up and run the project in your local 
development environment.

### Prerequisites
*   Node.js (v16 or higher)
*   .NET 8.0 SDK
*   Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/project-name.git](https://github.com/yourusername/project-name.git)
   cd project-name
