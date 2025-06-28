# Log Controller (`logController.js`)

This controller provides API endpoints for retrieving system logs in the warehouse management system backend. Logs are used for auditing and monitoring user actions.

---

## Line-by-Line Explanation

```js
const Log = require('../model/log');
```
- Imports the Log Mongoose model, which stores log entries for actions performed in the system.

---

### getLogs
```js
exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching logs: ' + err.message });
    }
};
```
- Fetches the most recent 100 log entries from the database, sorted by timestamp (most recent first).
- Returns the logs as a JSON array.
- If an error occurs, returns a 500 error with a message.

---

## Exported Functions
- `getLogs`: Returns a list of recent log entries for auditing and monitoring.

---

## Summary Table
| Function   | What it does                        | Returns           |
|------------|-------------------------------------|-------------------|
| getLogs    | Returns recent log entries          | Array of logs     |

---

## Notes
- All functions use `try/catch` for error handling.
- Designed for system auditing and monitoring.
- Only fetches a limited number of logs for performance.
