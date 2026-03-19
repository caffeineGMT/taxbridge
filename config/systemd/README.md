# Systemd Service Configuration

This directory contains systemd service files for running TaxBridge monitoring as a background service.

## Setup Instructions

### 1. Edit the Service File

Edit `taxbridge-health-monitor.service` and update:

```bash
# Replace with your actual Slack webhook URL
Environment="SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Replace with your actual project path
WorkingDirectory=/path/to/cross-border-tax
```

### 2. Install the Service

**For user services (recommended):**
```bash
# Create user systemd directory if it doesn't exist
mkdir -p ~/.config/systemd/user/

# Copy service file
cp config/systemd/taxbridge-health-monitor.service ~/.config/systemd/user/

# Reload systemd
systemctl --user daemon-reload

# Enable service (start on boot)
systemctl --user enable taxbridge-health-monitor

# Start service now
systemctl --user start taxbridge-health-monitor
```

**For system-wide services (requires sudo):**
```bash
# Copy service file
sudo cp config/systemd/taxbridge-health-monitor.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable taxbridge-health-monitor

# Start service
sudo systemctl start taxbridge-health-monitor
```

### 3. Verify Service is Running

```bash
# Check status
systemctl --user status taxbridge-health-monitor

# View logs
journalctl --user -u taxbridge-health-monitor -f

# Check recent logs
journalctl --user -u taxbridge-health-monitor -n 50
```

### 4. Manage the Service

```bash
# Stop service
systemctl --user stop taxbridge-health-monitor

# Restart service
systemctl --user restart taxbridge-health-monitor

# Disable service (won't start on boot)
systemctl --user disable taxbridge-health-monitor

# Remove service
systemctl --user stop taxbridge-health-monitor
systemctl --user disable taxbridge-health-monitor
rm ~/.config/systemd/user/taxbridge-health-monitor.service
systemctl --user daemon-reload
```

## Troubleshooting

### Service won't start
```bash
# Check service status
systemctl --user status taxbridge-health-monitor

# View detailed logs
journalctl --user -u taxbridge-health-monitor -xe

# Common issues:
# 1. Wrong WorkingDirectory path
# 2. npm not in PATH (use full path: /usr/local/bin/npm)
# 3. Missing SLACK_WEBHOOK_URL
# 4. Permission issues
```

### Service crashes on startup
```bash
# Test the command manually first
cd /path/to/cross-border-tax
npm run health-check:watch

# If that works, check systemd environment
systemctl --user show-environment

# You may need to add Node.js to PATH in the service file:
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
```

### Logs not appearing
```bash
# Check if journald is running
systemctl status systemd-journald

# View all journal logs for your user
journalctl --user -f
```

## macOS Note

macOS uses `launchd` instead of `systemd`. For macOS, use this plist file:

**~/Library/LaunchAgents/com.taxbridge.health-monitor.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.taxbridge.health-monitor</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/npm</string>
        <string>run</string>
        <string>health-check:watch</string>
    </array>

    <key>WorkingDirectory</key>
    <string>/path/to/cross-border-tax</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>SLACK_WEBHOOK_URL</key>
        <string>https://hooks.slack.com/services/YOUR/WEBHOOK/URL</string>
        <key>PRODUCTION_URL</key>
        <string>https://taxbridge.vercel.app</string>
    </dict>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>StandardOutPath</key>
    <string>/tmp/taxbridge-health-monitor.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/taxbridge-health-monitor.error.log</string>
</dict>
</plist>
```

**Load the service:**
```bash
# Load service
launchctl load ~/Library/LaunchAgents/com.taxbridge.health-monitor.plist

# Check if running
launchctl list | grep taxbridge

# View logs
tail -f /tmp/taxbridge-health-monitor.log

# Unload service
launchctl unload ~/Library/LaunchAgents/com.taxbridge.health-monitor.plist
```

## Alternative: Cron

If you prefer cron (simpler but less robust):

```bash
crontab -e

# Add this line (runs every 5 minutes):
*/5 * * * * cd /path/to/cross-border-tax && npm run health-check >> /tmp/taxbridge-health-check.log 2>&1
```

**View logs:**
```bash
tail -f /tmp/taxbridge-health-check.log
```

## Recommended Approach

**For production servers:**
- Use systemd (Linux) or launchd (macOS) for reliable service management
- Services auto-restart on failure
- Better logging and monitoring

**For development/testing:**
- Use cron for simplicity
- Or run manually: `npm run health-check:watch`

**For most users:**
- Use external monitoring (BetterStack/UptimeRobot)
- No server/service management required
- Free tier is sufficient
