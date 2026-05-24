# Shop Admin Panel (Next.js + Material UI)

This is a mock admin panel for the **Studio Graaphics** Shop Boxes module, built with **Next.js (App Router)** and **Material UI**.

It implements:

- Admin authentication (login, forgot password) with role-based access control
- Permission-based sidebar (menus come from the login API response)
- Route-level guards using a `ProtectedRoute` wrapper
- Shop Box Manager:
  - List / view / add / edit boxes
  - Upload box images (stored in-memory)
  - Define dimensions (L × W × H)
  - Set material & GSM
  - Set base cost
  - Enable / disable: logo upload, text printing, color selection
  - Select finish types (plain / single color / full print)
  - Activate / deactivate box

The data layer uses **mock APIs** in `lib/mockApi.ts` so you can replace them with real backend calls later.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000` in your browser.

## Demo credentials

- Super admin (full permissions):
  - Email: `admin@studio.com`
  - Password: `admin123`
- Shop manager (no create):
  - Email: `manager@studio.com`
  - Password: `manager123`

The login mock API returns:

- `user` (with `role` and `permissions`)
- `token`
- `menu` items for the sidebar

The sidebar reads directly from this `menu`, and route guards use the `permissions` array.

## Replacing mock APIs

All mock logic is in `lib/mockApi.ts`. To hook up a real backend:

- Replace the functions like `loginApi`, `listBoxes`, `createBox`, `updateBox`, `setBoxActive`, etc., with `fetch`/`axios` calls to your real endpoints.
- Keep the TypeScript types (`User`, `MenuItem`, `Box`, etc.) aligned with your backend responses.

