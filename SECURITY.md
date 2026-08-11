# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

Versions before 2.0.0 shipped a real game server join password in `bot.js`. If you ever ran one
of those versions with your own password substituted in, rotate it.

## Reporting a Vulnerability

If you discover a security vulnerability, please do the following:

1. **Do NOT** open a public issue
2. Contact coreframework on Discord
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
   - **Never forward the Web API port to the public internet.** The API is plain HTTP and the
     password is sent in the URL on every request, so anyone who can observe the traffic can
     read it and then kick, ban, or announce on your server.
   - Best: run the bot on the same machine as the dedicated server with `API_HOST=127.0.0.1`
   - Otherwise: keep both ends on a LAN or private VPN
   - On newer server builds, use `HostWebAPIDisabledCommands` to switch off API commands you
     don't need
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
   - Transmitted over plain HTTP as a URL query parameter — it is not encrypted, and it appears
     in full in any traffic capture or intermediate proxy log
   - This is a limitation of the Motor Town Web API itself, not of this bot
   - Keep the API on localhost or a private network; use an HTTPS reverse proxy if you must
     expose it, and restrict access by IP

3. **Admin Permissions**
   - Admin commands can kick/ban players
   - Only grant to trusted Discord users
   - Regularly review admin list

## Updates

Security updates will be released as soon as possible. Watch this repository for updates.
