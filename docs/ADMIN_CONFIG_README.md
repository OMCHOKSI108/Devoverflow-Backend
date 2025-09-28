# Admin User Configuration

The DevOverflow backend allows you to configure the admin user credentials via environment variables. This makes it easy to change admin credentials without modifying code.

## Environment Variables

Add these variables to your `.env` file to create a custom admin user:

```env
# Admin User Configuration (Optional)
ADMIN_NAME=Your Admin Name
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
ADMIN_LOCATION=Your City
```

## Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ADMIN_NAME` | Full name of the admin user | "DevOverflow Admin" | No |
| `ADMIN_USERNAME` | Username for admin login | "admin" | No |
| `ADMIN_EMAIL` | Email address for admin user | "admin@devoverflow.com" | Yes* |
| `ADMIN_PASSWORD` | Password for admin login | "admin123" | Yes* |
| `ADMIN_LOCATION` | Admin user's location | "Mumbai" | No |

*Required if you want to create a custom admin user

## How It Works

1. **With Admin Variables**: If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, a dedicated admin user is created with these credentials
2. **Without Admin Variables**: The first mock user (Arjun Sharma) becomes the admin automatically
3. **Admin Privileges**: The admin user has full access to all administrative features

## Example Configuration

```env
# Custom Admin User
ADMIN_NAME=John Doe
ADMIN_USERNAME=johndoe
ADMIN_EMAIL=john.doe@company.com
ADMIN_PASSWORD=mySecurePass123!
ADMIN_LOCATION=New Delhi
```

## Security Notes

- **Change Default Password**: Never use the default password in production
- **Strong Password**: Use a complex password with uppercase, lowercase, numbers, and symbols
- **Environment Specific**: Use different admin credentials for development, staging, and production
- **Secure Storage**: Keep your `.env` file secure and never commit it to version control

## Running the Seeder

After configuring the environment variables, run the database seeder:

```bash
node seedDatabase.js
```

The admin user will be created with the specified credentials and full administrative privileges.

## Verification

You can verify the admin user was created correctly by running:

```bash
node checkDataIntegrity.js
```

This will show you the admin user's details and confirm they have admin privileges.