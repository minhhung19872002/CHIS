USE CHIS;
UPDATE Users SET PasswordHash = '$2a$11$rKN7CQ8HqJqN7vQDNGJj8.Yp1qKHvYqZL4.RXgGpI6xgVfOhNVcHq' WHERE Username = 'admin';
SELECT Username, PasswordHash FROM Users WHERE Username = 'admin';
