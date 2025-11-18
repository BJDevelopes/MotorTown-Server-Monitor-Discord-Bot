# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.5.x   | :white_check_mark: |
| < 1.5   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please do the following:

1. **Do NOT** open a public issue
2. Email the details to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Best Practices

### For Users

1. **Protect your .env file**
   - Never commit `.env` to git
   - Never share your Discord token or API password
   - Use strong, unique passwords

2. **Keep dependencies updated**
   ```bash
   npm update
   ```

3. **Review bot permissions**
   - Only grant necessary Discord permissions
   - Limit admin access to trusted users

4. **Secure your server**
   - Use firewall rules for API port
   - Don't expose API to public internet
   - Use strong API passwords

### For Contributors

1. **Never commit secrets**
   - Check for tokens before committing
   - Use `.gitignore` properly

2. **Validate user input**
   - Sanitize all inputs
   - Validate data types and ranges

3. **Handle errors securely**
   - Don't expose sensitive info in errors
   - Log securely without leaking data

## Known Security Considerations

1. **Discord Token Security**
   - The bot token grants full access to the bot
   - Keep it secret and rotate periodically

2. **API Password**
   - Transmitted over HTTP (not HTTPS)
   - Use a firewall to restrict access
   - Consider using a VPN for remote access

3. **Admin Permissions**
   - Admin commands can kick/ban players
   - Only grant to trusted Discord users
   - Regularly review admin list

## Updates

Security updates will be released as soon as possible. Watch this repository for updates.
