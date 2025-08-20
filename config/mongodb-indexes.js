// MongoDB Indexes for User collection
db.users.createIndex({ "email": 1 });
db.users.createIndex({ "passwordResetToken": 1 });
db.users.createIndex({ "passwordResetExpires": 1 });
