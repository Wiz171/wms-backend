# Database Connection (`connection.js`)

This file handles the connection to the MongoDB database for the warehouse management system backend.

---

## Line-by-Line Explanation

```js
const mongoose = require('mongoose');
```
- Imports the Mongoose library for MongoDB object modeling.

---

```js
const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${con.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
```
- Defines an async function to connect to MongoDB using the URI from environment variables.
- Uses options for compatibility and stability.
- Logs a success message on connection.
- Logs and exits the process on error.

---

```js
module.exports = connectDB;
```
- Exports the connection function for use in the main server file.

---

## Summary Table
| Function   | What it does                        | Returns           |
|------------|-------------------------------------|-------------------|
| connectDB  | Connects to MongoDB                 | None (side effect)|

---

## Notes
- Used at server startup to ensure the database is available.
- Exits the process if the connection fails.
