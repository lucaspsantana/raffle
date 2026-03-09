---
inclusion: auto
---

# Product Overview

Fique Ryco is an online raffle management system that enables administrators to create and manage raffles while allowing clients to purchase tickets.

## Core Features

- JWT-based authentication with role-based access (Admin/Client)
- Client registration with CPF validation
- Raffle CRUD operations (Admin only)
- Ticket purchasing with unique number assignment
- Concurrency control for ticket purchases
- Image upload for raffles
- Winner tracking and display

## User Roles

- Admin: Full raffle management, image uploads
- Client: View active raffles, purchase tickets, view own tickets

## Key Business Rules

- Each ticket has a unique number within a raffle
- Raffles have closing dates and maximum ticket limits
- CPF validation required for client registration
- Ticket purchases are protected against race conditions
