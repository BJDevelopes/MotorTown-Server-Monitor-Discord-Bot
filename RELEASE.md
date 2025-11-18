# Release Checklist

## Pre-Release

- [x] All features tested and working
- [x] Documentation complete and accurate
- [x] CHANGELOG.md updated
- [x] README.md reflects current features
- [x] .env.example has all variables
- [x] All dependencies up to date
- [x] No sensitive data in code
- [x] .gitignore properly configured

## Files Included

### Core Files
- [x] bot.js - Main bot code
- [x] package.json - Dependencies
- [x] .env.example - Configuration template
- [x] .gitignore - Git ignore rules
- [x] .npmrc - NPM configuration

### Documentation
- [x] README.md - Main documentation
- [x] CHANGELOG.md - Version history
- [x] LICENSE - MIT License
- [x] CONTRIBUTING.md - Contribution guidelines
- [x] SECURITY.md - Security policy
- [x] docs/README.md - Documentation index
- [x] docs/INSTALLATION.md - Setup guide
- [x] docs/CONFIGURATION.md - Config reference
- [x] docs/COMMANDS.md - Command documentation
- [x] docs/PLAYER_MAPPING.md - Player mapping guide
- [x] docs/ADMIN_GUIDE.md - Admin management
- [x] docs/TEXT_COMMANDS.md - Text command guide
- [x] docs/TROUBLESHOOTING.md - Common issues

### Setup Scripts
- [x] setup.sh - Linux/Mac setup
- [x] setup.bat - Windows setup

### GitHub Files
- [x] .github/ISSUE_TEMPLATE/bug_report.md
- [x] .github/ISSUE_TEMPLATE/feature_request.md
- [x] .github/pull_request_template.md

## Version Information

**Current Version:** 1.5.2

**Release Name:** Server Nickname Priority & Enhanced Diagnostics

**Key Features:**
- Discord User ID to player mapping
- Server nickname priority (per-guild)
- Dual command system (slash + text)
- Admin permission system
- Comprehensive error handling
- Diagnostic tools (/testmapping)

## Release Steps

1. **Update version in package.json**
2. **Tag the release**
   ```bash
   git tag -a v1.5.2 -m "Release v1.5.2"
   git push origin v1.5.2
   ```
3. **Create GitHub release**
   - Use CHANGELOG.md for release notes
   - Attach any additional files
4. **Update documentation links**
   - Replace "yourusername" with actual username
   - Update repository URLs
5. **Announce release**
   - Post in discussions
   - Update any related forums/communities

## Post-Release

- [ ] Monitor for issues
- [ ] Respond to questions
- [ ] Update documentation as needed
- [ ] Plan next version features

## Notes for Next Release

**Potential Features:**
- Automated player ID to Discord mapping (reduce manual config)
- Dashboard/web interface
- Scheduled announcements
- Player statistics tracking
- Multi-language support
- Voice channel integration

**Known Issues:**
- None currently

## Support Channels

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and community support
- Documentation: Comprehensive guides

---

**Ready for release! 🚀**
