# Motortown Discord Bot

A comprehensive Discord bot for monitoring and managing Motor Town: Behind The Wheel game servers. Control your server, track players, and manage your community directly from Discord!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)

## ✨ Features

### 🎮 Server Management
- **Real-time Monitoring** - Check server status, player count, and version
- **Player List** - See who's online with locations, vehicles, and AFK status
- **Player Search** - Find a player by name and get their ID with `/find`
- **Delivery Tracking** - Monitor delivery sites and cargo
- **Housing Info** - View property ownership and expiration
- **Company Profit** - Read server economy figures with `/company`

### 👥 Player Administration
- **Kick/Ban System** - Remove or ban players with optional duration and reasons
- **Ban Management** - View and manage the server ban list
- **In-Game Roles** - Grant and revoke admin/police roles with `/addrole` and `/removerole`
- **Name Autocomplete** - Start typing a player's name and pick them from a live list; no copying IDs

### 🔒 Advanced Features
- **Player Mapping** - Link game player IDs to Discord users with automatic nickname detection
- **Dual Command System** - Use `/` slash commands or `!!` text commands
- **Admin Permissions** - Secure Discord User ID-based permission system, persisted across restarts
- **Multi-Server Support** - Works across multiple Discord servers with per-server nicknames
- **Server Announcements** - Send messages and announcements to the game server
- **Raw API Access** - Call any Web API endpoint with `/apiraw` to explore new game updates

### 💬 Communication
- **In-Game Chat** - Send colored messages to game server
- **Announcements** - Broadcast important messages to all players
- **Status Updates** - Bot shows live player count as its activity

### 🏙️ Server Monitor
A real-time dashboard the bot maintains in a channel of your choosing.
- **Auto-Setup**: The bot posts its own monitor message on first run; no manual message ID copying.
- **Persistence**: Saves to `monitor_data.json` so it keeps editing the same message after a restart.
- **Offline Tracking**: If the game server goes down, the embed turns red and shows **Last Seen Online**.
- **Peak Tracking**: Displays the highest player count reached today.
- **Efficient**: Refreshes on an interval you control, using a compact layout built for busy servers.

### 🚪 Player Join/Leave Feed
Optional live feed posting when players connect and disconnect. The Motor Town Web API still
has no endpoint for reading in-game chat, so this is the closest thing to a live chat mirror.
It survives server restarts without spamming, and stays quiet while the server is unreachable.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Configuration](#️-configuration)
- [Commands](#-commands)
- [Player Mapping](#-player-mapping)
- [Security](#-security)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **Discord Bot Token** ([Create Bot](https://discord.com/developers/applications))
- **Motor Town Dedicated Server** with Web API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BJDevelopes/motortown-discord-bot.git
   cd motortown-discord-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and fill in your Discord token, client ID, and server API details.
   The `.env` file must sit next to `bot.js`.

4. **Start the bot**
   ```bash
   npm start
   ```

If anything required is missing, the bot tells you exactly which variables to set and exits
rather than failing with a cryptic error.

See the [Installation Guide](docs/INSTALLATION.md) for detailed setup instructions.

## ⚙️ Configuration

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Enable the **Message Content Intent** privileged gateway intent (needed for `!!` commands)
5. Copy the bot token

### Game Server Setup

Edit your `DedicatedServerConfig.json`:

```json
{
  "bEnableHostWebAPIServer": true,
  "HostWebAPIServerPassword": "your_secure_password",
  "HostWebAPIServerPort": 8080
}
```

> ⚠️ **Do not open the Web API port to the public internet.** The API is plain HTTP and the
> password is sent in the URL in cleartext, so anyone who can see the traffic can take over
> your server. Run the bot on the same machine or LAN as the game server, or put the API
> behind an HTTPS reverse proxy. See [Security](#-security).

### Environment Variables

```env
# Discord (required)
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_application_client_id
BOT_NICKNAME=Server Monitor

# Server API (required)
API_HOST=your.server.ip.address
API_PORT=8080
API_PASSWORD=your_api_password
API_TIMEOUT=10000

# Admin users (comma-separated Discord User IDs, required)
ADMIN_USER_IDS=your_discord_user_id

# /join instructions (optional)
JOIN_SERVER_NAME=Example Town
JOIN_PASSWORD=
JOIN_LINK=

# Player mapping (optional)
PLAYER_MAPPING=gameID:discordUserID|gameID:name

# Server monitor (optional)
MONITOR_CHANNEL_ID=
MONITOR_INTERVAL=60
SERVER_NAME=Example Town
LOGO_URL=https://example.com/logo.png

# Player join/leave feed (optional)
PLAYER_FEED_CHANNEL_ID=
PLAYER_FEED_INTERVAL=60
```

Every variable is documented in [.env.example](.env.example) and the
[Configuration Guide](docs/CONFIGURATION.md).

## 📖 Commands

### General Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/help` | Show all available commands | `/help` |
| `/join` | Get instructions to join the server | `/join` |
| `/status` | Server status overview | `/status` |
| `/players` | List online players | `/players` |
| `/find` | Search for a player by name | `/find <name>` |
| `/playercount` | Number of players online | `/playercount` |
| `/version` | Server version | `/version` |
| `/deliveries` | Delivery site information | `/deliveries` |
| `/housing` | Housing information | `/housing` |
| `/company` | Company profit figures | `/company [days]` |
| `/banlist` | View banned players | `/banlist` |
| `/admins` | List server administrators | `/admins` |
| `/police` | List server police | `/police` |
| `/playermapping` | View player ID mappings | `/playermapping` |

### Admin Commands (Requires Permission)

| Command | Description | Usage |
|---------|-------------|-------|
| `/kick` | Kick a player | `/kick <unique_id>` |
| `/ban` | Ban a player | `/ban <unique_id> [hours] [reason]` |
| `/unban` | Unban a player | `/unban <unique_id>` |
| `/announce` | Send server announcement | `/announce <message>` |
| `/serverchat` | Send colored chat message | `/serverchat <message> [color]` |
| `/addrole` | Grant an in-game role | `/addrole <admin\|police> <unique_id>` |
| `/removerole` | Revoke an in-game role | `/removerole <admin\|police> <unique_id>` |
| `/apiraw` | Call any Web API endpoint | `/apiraw <endpoint> [key=value ...]` |
| `/addadmin` | Add bot admin | `/addadmin @user` |
| `/removeadmin` | Remove bot admin | `/removeadmin @user` |
| `/listadmins` | View bot admins | `/listadmins` |
| `/testmapping` | Test player mapping | `/testmapping <unique_id>` |

**Tip:** `/kick`, `/ban`, `/unban`, `/addrole` and `/removerole` autocomplete player names from
the live server, so you can pick a player instead of hunting for their ID. `/unban` autocompletes
from the ban list.

### Text Commands

All commands also work with the `!!` prefix:
```
!!help
!!status
!!players
!!find jerry
!!kick 12345
!!ban 12345 24 Cheating
!!addrole police 12345
!!apiraw /company/profit days=7
```

Perfect for when slash commands are slow to load.

## 🎮 Player Mapping

Link game player IDs to Discord users for easy identification:

```env
PLAYER_MAPPING=12345:120343643381956608|67890:Bob
```

**Features:**
- Automatic Discord username lookup
- Server nickname priority (shows the name they use in your Discord)
- Multi-server support (different nicknames per server)
- Fallback to username if no nickname set
- Applies to `/players`, `/housing`, `/find`, and the join/leave feed

**Example:**

Without mapping:
```
Player_12345
ID: 12345
```

With mapping:
```
Jerry (Player_12345)  ← Shows their Discord server nickname!
ID: 12345
```

See the [Player Mapping Guide](docs/PLAYER_MAPPING.md) for detailed setup.

## 🔐 Security

The Motor Town Web API has no encryption. The password is sent as a plain query parameter over
plain HTTP on every single request, which means anyone able to observe the traffic can read it
and then issue their own kick, ban, and announce commands against your server.

**Recommended setup:**
- Run the bot on the same machine as the dedicated server and point `API_HOST` at `127.0.0.1`.
- If the bot runs elsewhere, keep both ends on a private network or VPN.
- Do not forward the Web API port on your router.
- If you must expose it, put an HTTPS reverse proxy in front and restrict access by IP.
- Newer server builds support a `HostWebAPIDisabledCommands` option in `DedicatedServerConfig.json`
  to switch off individual API commands you don't need.

Your `.env` holds a live Discord token and your API password. It is gitignored; keep it that way,
and rotate both if it is ever exposed.

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed setup instructions
- **[Configuration Reference](docs/CONFIGURATION.md)** - All environment variables explained
- **[Command Reference](docs/COMMANDS.md)** - Complete command documentation
- **[Player Mapping Guide](docs/PLAYER_MAPPING.md)** - Setup player ID to Discord user mapping
- **[Admin Guide](docs/ADMIN_GUIDE.md)** - Managing bot administrators
- **[Text Commands Guide](docs/TEXT_COMMANDS.md)** - Using `!!` prefix commands
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🔧 Troubleshooting

### Bot doesn't respond to commands
- Wait 1-2 minutes for Discord to register slash commands
- Check bot has correct permissions in Discord server
- Verify bot is online

### "Invalid password" on announce, chat, kick or ban
This was a bug in versions before 2.0.0: parameters for POST requests were sent in the request
body, but the Motor Town API only reads them from the query string. Update to the latest version.
If it persists, confirm `API_PASSWORD` matches `HostWebAPIServerPassword` exactly.

### Can't connect to game server
- Check `API_HOST` and `API_PORT` are correct
- Verify game server Web API is enabled
- Ensure the bot can reach that host and port

### A command says the endpoint isn't available
Some endpoints (like `/company/profit`) only exist on newer dedicated server builds. Update your
server, or use `/apiraw <endpoint>` to check what your build actually responds with.

### Player nicknames not showing
- Verify users are members of your Discord server
- Use `/testmapping <id>` to diagnose specific issues

See the [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for more help.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** - Open an issue with details
2. **Suggest features** - Share your ideas
3. **Submit pull requests** - Help improve the bot
4. **Improve documentation** - Help others understand features

### Development Setup

```bash
git clone https://github.com/BJDevelopes/motortown-discord-bot.git
cd motortown-discord-bot
npm install
cp .env.example .env
npm run dev
```

`npm run dev` runs the bot under nodemon and restarts it whenever you save.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## 🙏 Credits

- **Discord.js** - Discord API library
- **Axios** - HTTP client for API requests
- **Motor Town: Behind The Wheel** - The game this bot is built for
- **[Motor Town Web API docs](https://docs.motortown.info/)** - Community API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Full documentation](docs/)
- **Issues**: [Report a bug](https://github.com/BJDevelopes/motortown-discord-bot/issues)
- **Discussions**: [Ask questions](https://github.com/BJDevelopes/motortown-discord-bot/discussions)
- **Web API Reference**: [docs.motortown.info](https://docs.motortown.info/)

## ⚠️ Disclaimer

This is an unofficial community-made bot. Not affiliated with or endorsed by the Motor Town developers.

## 🌟 Support

If you find this bot useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📖 Improving documentation
- 🔀 Contributing code

---

**Made with ❤️ for the Motor Town community**
