# Rate Limiter Middleware (`rateLimiter.js`)

This file provides rate limiting middleware for the warehouse management system backend, protecting the API from abuse and brute-force attacks.

---

## Line-by-Line Explanation

```js
const rateLimit = require('express-rate-limit');
```
- Imports the express-rate-limit library.

---

### apiLimiter
- Configures a rate limiter for API routes.
- Limits the number of requests per IP in a given time window (e.g., 100 requests per 15 minutes).
- Returns a 429 Too Many Requests error if the limit is exceeded.

---

## Exported Functions
- `apiLimiter`: Middleware to apply rate limiting to API routes.

---

## Summary Table
| Function   | What it does                        | Returns/Effect    |
|------------|-------------------------------------|-------------------|
| apiLimiter | Limits API requests per IP           | Calls next() or 429|

---

## Notes
- Used to protect sensitive endpoints (e.g., login, registration, all /api/ routes).
- Helps prevent brute-force and denial-of-service attacks.
