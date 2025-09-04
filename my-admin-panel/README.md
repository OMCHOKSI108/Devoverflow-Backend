# React + Vite

# DevOverflow Admin Panel

A minimal, clean admin panel for managing the DevOverflow Q&A platform.

## Features

### 📊 Dashboard
- **Real-time Statistics**: View total users, questions, answers, and reports
- **Activity Tracking**: Monitor daily, weekly, and monthly activity
- **User Analytics**: Track verification rates and user growth
- **Content Metrics**: Monitor question-answer ratios and engagement
- **System Health**: Overall platform health score

### 👥 User Management
- **User Search**: Find users by username or email
- **User Verification**: Verify/unverify user accounts
- **Admin Management**: Grant/remove admin privileges
- **User Suspension**: Suspend user accounts when needed
- **Pagination**: Handle large user bases efficiently

### 🚩 Content Moderation
- **Report Management**: View and manage user reports
- **Content Deletion**: Remove inappropriate content
- **Report Resolution**: Mark reports as resolved or dismissed
- **Content Filtering**: Filter reports by status and type

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Running DevOverflow backend server
- Admin user account

### Installation

1. **Navigate to admin panel directory:**
   ```bash
   cd my-admin-panel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

### Backend Setup

Make sure your backend server is running and accessible. The admin panel expects:

- **Backend URL**: `http://localhost:3000` (default)
- **Admin Routes**: Available at `/api/admin/*`
- **Authentication**: JWT token-based auth

## Usage

### 1. Admin Login
- Use your admin credentials to log in
- Only users with `isAdmin: true` can access the panel
- JWT token is stored locally for session management

### 2. Dashboard Overview
- View comprehensive platform statistics
- Monitor user growth and engagement
- Track content creation and moderation needs
- Check system health indicators

### 3. User Management
- Search and filter users
- Verify user accounts
- Manage admin privileges
- Handle user suspensions

### 4. Report Management
- Review user-submitted reports
- Take action on inappropriate content
- Resolve or dismiss reports
- Delete content when necessary

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - Admin login

### Dashboard
- `GET /api/admin/stats` - Comprehensive statistics

### User Management
- `GET /api/admin/users` - List users with pagination
- `PUT /api/admin/users/:id` - Update user status/privileges

### Report Management
- `GET /api/admin/reports` - List reports with pagination
- `PUT /api/admin/reports/:id/resolve` - Resolve/dismiss reports
- `DELETE /api/admin/content/:type/:id` - Delete reported content

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Admin-Only Access**: Restricted to admin users only
- **Token Storage**: Secure local storage with auto-cleanup
- **Input Validation**: Client-side validation for all forms
- **Error Handling**: Comprehensive error handling and user feedback

## Responsive Design

- **Desktop**: Full-featured layout with sidebar navigation
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Collapsible navigation and stacked layouts

## Technologies Used

- **React 19**: Modern React with hooks
- **Vite**: Fast development server and build tool
- **Axios**: HTTP client for API communication
- **Lucide React**: Beautiful, consistent icons
- **CSS Modules**: Scoped styling for components

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Structure

```
src/
├── components/
│   ├── Login.jsx/css      # Authentication component
│   ├── Sidebar.jsx/css    # Navigation sidebar
│   ├── Header.jsx/css     # Top header with actions
│   ├── Dashboard.jsx/css  # Main dashboard with stats
│   ├── Users.jsx/css      # User management interface
│   └── Reports.jsx/css    # Report management interface
├── App.jsx                # Main application component
├── App.css               # Global styles and layout
└── main.jsx              # Application entry point
```

## Contributing

1. Follow the existing code style and structure
2. Add proper error handling for all API calls
3. Include loading states for better UX
4. Test on multiple screen sizes
5. Update this README for any new features

## Troubleshooting

### Common Issues

1. **Login Issues**
   - Ensure backend server is running
   - Verify admin user credentials
   - Check network connectivity

2. **API Errors**
   - Verify backend URL configuration
   - Check JWT token validity
   - Review browser console for errors

3. **Styling Issues**
   - Clear browser cache
   - Check CSS imports in main.jsx
   - Verify responsive breakpoints

### Debug Mode

Enable debug logging by opening browser console and checking network requests.

## License

This project is part of the DevOverflow platform.
