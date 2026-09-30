# AdminHub

A responsive Admin Dashboard built with Next.js, React, TypeScript, Tailwind CSS, TanStack Query, and Redux Toolkit.

## Features

- Responsive Admin Dashboard
- Users management
- Transactions management
- Bookings management
- User, transaction, and booking details
- Search, filters, sorting, and pagination
- KPI cards and revenue chart
- Loading, error, empty, and success states
- Responsive desktop and mobile layouts
- Interactive dashboard tabs
- Simulated actions such as user updates, refunds, and booking changes

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Redux Toolkit
- Lucide React
- DummyJSON API

## Data & State Management

DummyJSON provides users and products.

Transactions and bookings are derived from the API data using deterministic mapping logic.

### TanStack Query

Used for server/API state:

- Users
- Transactions
- Bookings
- Dashboard data
- Loading and error states
- Caching and refetching

### Redux Toolkit

Used for client/UI state:

- Dashboard tabs
- Filters
- Navigation state
- Modals
- Notifications

## API

Base API:

`https://dummyjson.com`

Main endpoints:

- `/users`
- `/products`

## Project Structure

```text
