# Player Mapping Troubleshooting Guide

## Quick Diagnosis

Use the `/testmapping` command to diagnose issues with specific player mappings:

```
/testmapping unique_id:12345
```

This will show you detailed information about what's happening with that specific mapping.

## Common Issues

### Issue: User Shows Username Instead of Nickname

**What you see:**
- `JerryTheGamer#1234 (Player_12345)` 
- Instead of: `Jerry (Player_12345)`

**Most common cause:** User is not a member of your Discord server

**Solution:**
1. Use `/testmapping 12345` to check
2. Look for "❌ Not a Member of" message
3. Invite the user to your Discord server

### Issue: Shows Raw Discord ID

**What you see:**
- `<@120343643381956608> (Player_12345)`

**Cause:** Invalid Discord User ID or user doesn't exist

**Solution:**
1. Copy the User ID again from Discord
2. Verify it's 17-19 digits
3. Update your `.env` file
4. Restart the bot

### Issue: Can't See Nicknames

**Cause:** Bot missing Server Members Intent

**Solution:**
1. Go to Discord Developer Portal
2. Your App → Bot section  
3. Enable "Server Members Intent"
4. Restart bot

## Using /testmapping Command

This admin-only command shows exactly what's happening:

```
/testmapping 12345
```

**What it shows:**
- ✅ If Discord user found
- ✅ If they're in the server
- ✅ Their nickname (if any)
- ✅ What will be displayed
- ❌ Specific error messages

## Console Logs Explained

When bot starts:
```
  12345 → JerryTheGamer#1234 (Discord User)
    └─ Bjs Town Server: "Jerry"              ← Has nickname
    └─ Gaming Hub: (no nickname, will show JerryTheGamer)  ← No nickname
    └─ Friends: (user not a member of this server)  ← Not in server
```

## Quick Fix Checklist

- [ ] User ID is correct (copy it again)
- [ ] User is in your Discord server
- [ ] Bot has Server Members Intent enabled
- [ ] `.env` file format is correct
- [ ] Bot restarted after changes

## Need More Help?

Run `/testmapping` on the problem user and share the output!
