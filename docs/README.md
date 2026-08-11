# Documentation

Everything you need to install, configure, and run the Motor Town Discord bot.

New here? Start with the [Installation Guide](INSTALLATION.md), then come back for the rest.

## Guides

| Guide | What's in it |
|-------|--------------|
| [Installation](INSTALLATION.md) | Prerequisites, Discord bot creation, game server setup, first run |
| [Configuration](CONFIGURATION.md) | Every environment variable, with examples and security guidance |
| [Commands](COMMANDS.md) | Full reference for every slash command |
| [Text Commands](TEXT_COMMANDS.md) | Using the `!!` prefix instead of slash commands |
| [Player Mapping](PLAYER_MAPPING.md) | Showing Discord names instead of raw game IDs |
| [Admin Guide](ADMIN_GUIDE.md) | Managing bot admins and in-game roles |
| [Troubleshooting](TROUBLESHOOTING.md) | Fixes for common problems |

## Quick answers

**Which commands exist?** See [Commands](COMMANDS.md). Everything also works with a `!!` prefix —
see [Text Commands](TEXT_COMMANDS.md).

**Where do I put my settings?** In a file named exactly `.env`, in the same folder as `bot.js`.
Copy [`.env.example`](../.env.example) to get started. Every option is explained in
[Configuration](CONFIGURATION.md).

**Something says "Invalid password".** If it only affects `/announce`, `/serverchat`, `/kick`,
`/ban` and `/unban` while `/status` works, you're on a version older than 2.0.0 — that was a bot
bug, fixed in 2.0.0. See [Troubleshooting](TROUBLESHOOTING.md).

**A command says the endpoint isn't available.** Your dedicated server build is probably older
than the endpoint. Use `/apiraw <endpoint>` to see what your server actually returns.

**Is the Web API safe to expose?** No. It is plain HTTP and the password travels in the URL in
cleartext. Keep it on localhost or a private network — see the security section in
[Configuration](CONFIGURATION.md).

## Reference

- [Changelog](../CHANGELOG.md) — version history
- [Main README](../README.md) — project overview and feature list
- [Motor Town Web API docs](https://docs.motortown.info/) — the community-maintained API reference
