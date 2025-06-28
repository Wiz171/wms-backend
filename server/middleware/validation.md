# Validation Middleware (`validation.js`)

This file provides input validation middleware for the warehouse management system backend, ensuring that incoming data is well-formed and secure.

---

## Line-by-Line Explanation

```js
const { body, param, validationResult } = require('express-validator');
```
- Imports validation utilities from express-validator.

---

### userValidation, productValidation, customerValidation
- Define validation rules for user, product, and customer creation and update.
- Use `body()` and `param()` to specify required fields, types, and constraints.

---

### validate
- Middleware to run the specified validation rules.
- If validation fails, returns a 400 error with details.
- If validation passes, calls `next()`.

---

## Exported Functions
- `validate`: Runs validation rules and handles errors.
- `userValidation`, `productValidation`, `customerValidation`: Validation rule sets for different resources.

---

## Summary Table
| Function         | What it does                        | Returns/Effect    |
|------------------|-------------------------------------|-------------------|
| validate         | Runs validation and handles errors   | Calls next() or 400|
| userValidation   | User input validation rules          | Used in routes    |
| productValidation| Product input validation rules       | Used in routes    |
| customerValidation| Customer input validation rules     | Used in routes    |

---

## Notes
- Used to ensure data integrity and prevent invalid or malicious input.
- Works with express-validator for declarative validation.
