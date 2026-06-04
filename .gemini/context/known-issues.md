# Known Issues & Workarounds

## 1. Authentication Token Expiry
- **Issue**: Sometimes the token in `localStorage` persists but is invalid on the server.
- **Workaround**: The `api.request` method catches failures; if a 401 occurs, the UI should ideally redirect to `/login`. Current implementation needs better global interceptor for this.

## 2. Mobile Menu Transitions
- **Issue**: Sidebar transition on mobile can sometimes stutter on lower-end devices.
- **Workaround**: Simplified Framer Motion variants used; exploring CSS-only transitions for better performance.

## 3. Recharts Responsive Sizing
- **Issue**: Charts occasionally fail to resize when the window is resized rapidly.
- **Workaround**: Wrapped charts in `ResponsiveContainer` and added a `debounce` to the resize observer.
