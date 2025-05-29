#!/bin/bash
# Backup MongoDB Atlas to local MongoDB

ATLAS_URI="mongodb+srv://ttechnetmyanmar:QCZ5L1BzyKzhneVd@cluster0.une0gxi.mongodb.net/"
LOCAL_URI="mongodb://localhost:27017/test_RBAC"

# Dump Atlas DB
mongodump --uri="$ATLAS_URI" --out=/tmp/mongodump

# Restore to local (overwrite)
mongorestore --drop --uri="$LOCAL_URI" /tmp/mongodump/yourdb

# Clean up
rm -rf /tmp/mongodump
