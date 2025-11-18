# Contributing to Motortown Discord Bot

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node.js version, OS, etc.)
- Relevant console logs or error messages

### Suggesting Features

Feature requests are welcome! Please include:
- Clear description of the feature
- Use case - why is this useful?
- Example of how it would work
- Any potential challenges or considerations

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Write clear, commented code
   - Follow existing code style
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "Add: description of your changes"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

### Code Style

- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Use descriptive variable names
- Follow existing patterns in the codebase

### Testing

Before submitting a PR:
- Test all affected commands
- Verify bot starts without errors
- Check console logs for issues
- Test with both slash and text commands

### Documentation

If your PR adds features or changes behavior:
- Update relevant documentation in `docs/`
- Update `README.md` if needed
- Add examples where helpful
- Update `CHANGELOG.md`

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/motortown-discord-bot.git
cd motortown-discord-bot

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your test server details

# Run in development mode
npm run dev
```

## Pull Request Guidelines

### PR Title Format
- `Add: description` - New features
- `Fix: description` - Bug fixes
- `Update: description` - Updates to existing features
- `Docs: description` - Documentation changes

### PR Description Should Include
- What changes were made
- Why these changes were needed
- Any breaking changes
- Screenshots (if UI changes)
- Testing performed

## Questions?

Feel free to open an issue for questions or join discussions!

Thank you for contributing! 🎉
