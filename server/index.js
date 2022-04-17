
import path from 'path'
import express from 'express'
import os from 'os'
import { execa } from 'execa'

import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Can't use native __dirname in module
const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3031
const app = express()

const NUM_VOLUME_LEVEL_BARS = 16
const MAX_VOLUME = 100
const STEP_SIZE = MAX_VOLUME / NUM_VOLUME_LEVEL_BARS

var volume = 40
var isMuted = false
var pressSpaceCooldownPeriodExpired = true

const IS_MAC_OS = os.platform().toLowerCase() === 'darwin'
if (!IS_MAC_OS) {
  console.log(`System is running ${os.platform()}; volume control will be simulated`)
} else {
  console.log(`System is running Mac OS`)
}

const osascript = async (cmd) => {
  return (await execa('osascript', ['-e', cmd])).stdout
}

const getMacVolumeSettings = async () => {
  const str = (await osascript('get volume settings'))
  const parts = str.split(', ')
  const settings = {}
  for (var part of parts) {
    const setting = part.split(':')
    settings[setting[0]] = setting[1]
  }
  return {
    volume: Number(settings['output volume']),
    isMuted: settings['output muted'] === 'true'
  }
}

const getCurrentSettings = async () => {
  if (IS_MAC_OS) {
    return await getMacVolumeSettings()
  } else {
    return { volume, isMuted }
  }
}

const incrementVolume = async () => {
  const curSettings = await getCurrentSettings()
  let newVolume = Math.floor(curSettings.volume + STEP_SIZE)
  await setVolume(newVolume)
}

const decrementVolume = async () => {
  const curSettings = await getCurrentSettings()
  let newVolume = Math.floor(curSettings.volume - STEP_SIZE)
  await setVolume(newVolume)
}

// Set the volume from the UI by clicking on a bar.
// Since the bars are set based on their lowest possible
// value, we will ultimately add 1/2 of a bar to the volume
// before setting it, so we don't end up with weird
// behaviour at the limits.
const setVolumeLevel = async newVolumeLevel => {
  // put the volume in the middle of the bar rather than at the limit
  newVolumeLevel += 0.5 * STEP_SIZE
  await setVolume(newVolumeLevel)
}

// Set the absolute volume between 0 and 100
const setVolume = async newVolume => {
  if (newVolume < 0) {
    newVolume = 0
  } else if (newVolume > MAX_VOLUME) {
    newVolume = MAX_VOLUME
  } else {
    newVolume = Math.floor(newVolume)
  }

  if (IS_MAC_OS) {
    await osascript('set volume output volume ' + newVolume)
  } else {
    volume = newVolume
  }
}

const setIsMuted = async newIsMuted => {
  const newValue = !!newIsMuted

  if (IS_MAC_OS) {
     await osascript('set volume ' + (newValue ? 'with' : 'without') + ' output muted')
  } else {
    isMuted = newValue
  }
}

const pressSpace = async () => {
  if (IS_MAC_OS && pressSpaceCooldownPeriodExpired) {
    pressSpaceCooldownPeriodExpired = false
    // don't allow multiple space presses within 500 millis -- if the page is
    // running in the browser, clicking the space button will send a space
    // key, which will click the space button again, etc../
    setTimeout(() => {pressSpaceCooldownPeriodExpired = true}, 500)
    await osascript('tell application "System Events" to keystroke " "')
  } else if (IS_MAC_OS) {
    console.log(new Date().toLocaleString(), "Space press cooldown period not expired; skipping.")
  }
}

// Have Node serve the files for our React app
app.use(express.static(path.resolve(__dirname, '../volume-remote-ui/build')))
app.use(express.json())

app.get('/config', async (req, res) => {
  console.log(new Date().toLocaleString(), 'GET /config')
  const hostname = os.hostname().split('.')[0].replace(/-ethernet$/, '')

  let settings;
  if (IS_MAC_OS) {
    settings = await getMacVolumeSettings()
  } else {
    settings = {volume, isMuted}
  }

  res.json({
    hostname,
    numLevels: NUM_VOLUME_LEVEL_BARS,
    maxVolume: MAX_VOLUME,
    stepSize: STEP_SIZE,
    volume: settings.volume,
    isMuted: settings.isMuted,
  })
})

app.post('/volume', async (req, res) => {
  console.log(new Date().toLocaleString(), 'POST', req.body)
  const action = req.body.action
  if (action === 'INCREASE') {
    await incrementVolume()
  }
  if (action === 'DECREASE') {
    await decrementVolume()
  }
  if (action === 'MUTE') {
    await setIsMuted(true)
  }
  if (action === 'UNMUTE') {
    await setIsMuted(false)
  }
  if (action === 'SET_VOLUME') {
    await setVolumeLevel(req.body.volume)
  }
  if (action === 'PRESS_SPACE') {
    await pressSpace()
  }
  res.json(await getCurrentSettings())
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(
    path.resolve(__dirname, '../volume-remote-ui/build', 'index.html')
  )
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
