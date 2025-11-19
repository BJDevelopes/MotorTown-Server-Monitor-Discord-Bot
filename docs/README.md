# Motortown Discord Bot

A comprehensive Discord bot for monitoring and managing Motortown game servers. Control your server, track players, and manage your community directly from Discord!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.9.0-brightgreen)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)

## ✨ Features

### 🎮 Server Management
- **Real-time Monitoring** - Check server status, player count, and version
- **Player List** - See who's online with locations and vehicles
- **Delivery Tracking** - Monitor delivery sites and cargo
- **Housing Info** - View property ownership and expiration

### 👥 Player Administration
- **Kick/Ban System** - Remove or ban players with optional duration and reasons
- **Ban Management** - View and manage the server ban list
- **Role Viewing** - See server admins and police officers

### 🔒 Advanced Features
- **Player Mapping** - Link game player IDs to Discord users with automatic nickname detection
- **Dual Command System** - Use `/` slash commands or `!!` text commands
- **Admin Permissions** - Secure Discord User ID-based permission system
- **Multi-Server Support** - Works across multiple Discord servers with per-server nicknames
- **Server Announcements** - Send messages and announcements to the game server

### 💬 Communication
- **In-Game Chat** - Send colored messages to game server
- **Announcements** - Broadcast important messages to all players
- **Dynamic Status** - Bot shows live player count (updates every 60 seconds)
- **Chat Channel** - Optional integration to mirror in-game chat to Discord

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Commands](#-commands)
- [Player Mapping](#-player-mapping)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.9.0 or higher ([Download](https://nodejs.org/))
- **Discord Bot Token** ([Create Bot](https://discord.com/developers/applications))
- **Motortown Dedicated Server** with Web API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/motortown-discord-bot.git
   cd motortown-discord-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

See [Installation Guide](docs/INSTALLATION.md) for detailed setup instructions.

## ⚙️ Configuration

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Enable these Privileged Gateway Intents:
   - **Message Content Intent**
   - **Server Members Intent** (for nickname features)
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

Make sure port 8080 is open in your firewall.

### Environment Variables

```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_application_client_id
BOT_NICKNAME=Server Monitor

# Chat Integration (Optional)
CHAT_CHANNEL_ID=1234567890123456789

# Server API Configuration
API_HOST=your.server.ip.address
API_PORT=8080
API_PASSWORD=your_api_password

# Admin Users (comma-separated Discord User IDs)
ADMIN_USER_IDS=your_discord_user_id

# Player Mapping (optional)
PLAYER_MAPPING=gameID:discordUserID|gameID:name
```

See [Configuration Guide](docs/CONFIGURATION.md) for all options.

## 📖 Commands

### General Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/help` | Show all available commands | `/help` |
| `/join` | Get instructions to join the server | `/join` |
| `/status` | Server status overview | `/status` |
| `/players` | List online players | `/players` |
| `/playercount` | Number of players online | `/playercount` |
| `/version` | Server version | `/version` |
| `/deliveries` | Delivery site information | `/deliveries` |
| `/housing` | Housing information | `/housing` |
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
| `/addadmin` | Add bot admin (temporary) | `/addadmin @user` |
| `/removeadmin` | Remove bot admin (temporary) | `/removeadmin @user` |
| `/listadmins` | View bot admins | `/listadmins` |
| `/testmapping` | Test player mapping | `/testmapping <unique_id>` |

### Text Commands

All commands also work with `!!` prefix:
```
!!help
!!status
!!players
!!kick 12345
```

Perfect for when slash commands are slow to load!

## 🎮 Player Mapping

Link game player IDs to Discord users for easy identification:

```env
PLAYER_MAPPING=12345:120343643381956608|67890:987654321098765432
```

**Features:**
- Automatic Discord username lookup
- Server nickname priority (shows the name they use in your Discord)
- Multi-server support (different nicknames per server)
- Fallback to username if no nickname set

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

See [Player Mapping Guide](docs/PLAYER_MAPPING.md) for detailed setup.

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

### Can't connect to game server
- Check `API_HOST` and `API_PORT` are correct
- Verify game server Web API is enabled
- Ensure firewall port is open

### Player nicknames not showing
- Enable **Server Members Intent** in Discord Developer Portal
- Verify users are members of your Discord server
- Use `/testmapping <id>` to diagnose specific issues

See [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for more help.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** - Open an issue with details
2. **Suggest features** - Share your ideas
3. **Submit pull requests** - Help improve the bot
4. **Improve documentation** - Help others understand features

### Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/motortown-discord-bot.git
cd motortown-discord-bot

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your test server details

# Run in development mode with auto-restart
npm run dev
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## 🙏 Credits

- **Discord.js** - Discord API library
- **Axios** - HTTP client for API requests
- **Motortown** - The game this bot is built for

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Full documentation](docs/)
- **Issues**: [Report a bug](https://github.com/yourusername/motortown-discord-bot/issues)
- **Discussions**: [Ask questions](https://github.com/yourusername/motortown-discord-bot/discussions)
- **Motortown**: [Game Website](https://motortown-game.com/)

## ⚠️ Disclaimer

This is an unofficial community-made bot. Not affiliated with or endorsed by the Motortown developers.

## 🌟 Support

If you find this bot useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📖 Improving documentation
- 🔀 Contributing code

---

**Made with ❤️ for the Motortown community**