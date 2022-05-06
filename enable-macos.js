// Use this script to create a file that will cause the app to be launched on startup

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os'
import fs from 'fs'

// Can't use native __dirname in module
const __dirname = dirname(fileURLToPath(import.meta.url));
const homedir = os.homedir()
const launchpath = `${homedir}/Library/LaunchAgents/com.meryt.VolumeRemote.plist`

const contents = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>com.meryt.VolumeRemote</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/local/bin/node</string>
		<string>server/index.js</string>
	</array>
	<key>WorkingDirectory</key>
	<string>${__dirname}</string>
	<key>StandardErrorPath</key>
	<string>/tmp/com.meryt.VolumeRemote.err</string>
	<key>StandardOutPath</key>
	<string>/tmp/com.meryt.VolumeRemote.out</string>
</dict>
</plist>`

try {
  fs.writeFileSync(launchpath, contents);
  // file written successfully
} catch (err) {
  console.error(err);
}


