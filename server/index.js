// server/index.js
const path = require('path')
const express = require('express')
const os = require('os')
const PORT = process.env.PORT || 3031
const app = express()

const NUM_VOLUME_LEVEL_BARS = 16
const MAX_VOLUME = 100
const STEP_SIZE = MAX_VOLUME / NUM_VOLUME_LEVEL_BARS

const IS_MAC_OS = os.platform() === 'Darwin'

var volume = 40
var isMuted = false

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../volume-remote-ui/build')))
app.use(express.json())

const getCurrentSettings = () => {
  if (IS_MAC_OS) {
    // TODO
  } else {
    return { volume, isMuted }
  }
}

const incrementVolume = () => {
  let newVolume = Math.floor(getCurrentSettings().volume + STEP_SIZE)
  setVolume(newVolume)
}

const decrementVolume = () => {
  let newVolume = Math.floor(getCurrentSettings().volume - STEP_SIZE)
  setVolume(newVolume)
}

// Set the volume from the UI by clicking on a bar.
// Since the bars are set based on their lowest possible
// value, we will ultimately add 1/2 of a bar to the volume
// before setting it, so we don't end up with weird
// behaviour at the limits.
const setVolumeLevel = newVolumeLevel => {
  // put the volume in the middle of the bar rather than at the limit
  newVolumeLevel += 0.5 * STEP_SIZE
  setVolume(newVolumeLevel)
}

// Set the absolute volume between 0 and 100
const setVolume = newVolume => {
  if (newVolume < 0) {
    newVolume = 0
  } else if (newVolume > MAX_VOLUME) {
    newVolume = MAX_VOLUME
  } else {
    newVolume = Math.floor(newVolume)
  }

  if (IS_MAC_OS) {
    // TODO
  } else {
    volume = newVolume
  }
}

const setIsMuted = newIsMuted => {
  const newValue = !!newIsMuted

  if (IS_MAC_OS) {
    // TODO
  } else {
    isMuted = newValue
  }
}

app.get('/config', (req, res) => {
  console.log('GET /config')
  const hostname = os.hostname().split('.')[0]
  res.json({
    hostname,
    numLevels: NUM_VOLUME_LEVEL_BARS,
    maxVolume: MAX_VOLUME,
    stepSize: STEP_SIZE,
    volume,
    isMuted,
  })
})

app.post('/volume', (req, res) => {
  console.log('POST', req.body)
  const action = req.body.action
  if (action === 'INCREASE') {
    incrementVolume()
  }
  if (action === 'DECREASE') {
    decrementVolume()
  }
  if (action === 'MUTE') {
    setIsMuted(true)
  }
  if (action === 'UNMUTE') {
    setIsMuted(false)
  }
  if (action === 'SET_VOLUME') {
    setVolumeLevel(req.body.volume)
  }
  res.json(getCurrentSettings())
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
