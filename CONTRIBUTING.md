# Contributing to E-Commerce Platform

First off, thank you for considering contributing to this project! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repository**
2. **Create a new branch** from `develop`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Follow the coding standards** (see below)
5. **Write or update tests** if applicable
6. **Update documentation** if needed
7. **Commit your changes** with clear messages:
   ```bash
   git commit -m "Add amazing feature"
   ```
8. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
9. **Open a Pull Request**

## Development Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions.

Quick start:
```bash
# Clone your fork
git clone https://github.com/your-username/ecommerce-platform.git
cd ecommerce-platform

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment variables
cp backend/.env.example backend/.env
# Edit .env with your configuration

# Start development servers
cd backend && npm run dev
cd frontend && npm start
```

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused
- Use async/await over promises

### Code Formatting

We use ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Naming Conventions

- **Files**: camelCase for utilities, PascalCase for components
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Components**: PascalCase
- **Functions**: camelCase, descriptive verbs
- **CSS Classes**: kebab-case or BEM

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

Examples:
```
feat: Add user authentication
fix: Resolve cart calculation bug
docs: Update API documentation
style: Format code with prettier
refactor: Simplify product controller
test: Add tests for order service
chore: Update dependencies
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

Examples:
- `feature/add-wishlist`
- `fix/cart-total-calculation`
- `docs/update-readme`

## Project Structure

```
backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Helper functions
└── server.js       # Entry point

frontend/
└── src/
    ├── components/ # Reusable components
    ├── pages/      # Page components
    ├── store/      # Redux store
    └── utils/      # Helper functions
```

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Aim for high code coverage
- Test edge cases and error scenarios

Example test:
```javascript
describe('Product Controller', () => {
  it('should get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
  });
});
```

## Documentation

- Update README.md for major changes
- Document new API endpoints
- Add JSDoc comments for functions
- Update CHANGELOG.md

### API Documentation

Document new endpoints:
```javascript
/**
 * @route   GET /api/products
 * @desc    Get all products with filtering
 * @access  Public
 * @param   {string} category - Filter by category
 * @param   {number} page - Page number
 * @returns {Object} Products array and pagination info
 */
```

## Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** from at least one maintainer
5. **Merge** into develop branch

## Release Process

1. Features merged into `develop`
2. Testing on `develop` branch
3. Create release branch: `release/v1.x.x`
4. Final testing and bug fixes
5. Merge into `main`
6. Tag release: `v1.x.x`
7. Deploy to production

## Getting Help

- 📖 Read the [documentation](README.md)
- 💬 Join our [Discord community](#)
- 📧 Email: support@example.com
- 🐛 Open an [issue](https://github.com/username/repo/issues)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🙏
