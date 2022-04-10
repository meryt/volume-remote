// server/index.js
const path = require('path')
const express = require('express')
const os = require('os')
const PORT = process.env.PORT || 3031
const app = express()

const NUM_VOLUME_LEVEL_BARS = 16
const MAX_VOLUME = 100
const STEP_SIZE = MAX_VOLUME / NUM_VOLUME_LEVEL_BARS

var volume = 40
var isMuted = false

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../volume-remote-ui/build')))
app.use(express.json())

const getCurrentVolume = () => {
  return volume
}

const getIsMuted = () => {
  return isMuted
}

const incrementVolume = () => {
  volume += STEP_SIZE
  if (volume > MAX_VOLUME) {
    volume = MAX_VOLUME
  }
}

const decrementVolume = () => {
  volume -= STEP_SIZE
  if (volume < 0) {
    volume = 0
  }
}

const setVolume = (newVolume) => {
  // put the volume in the middle of the bar rather than at the limit
  newVolume += (0.5 * STEP_SIZE)
  console.log('Setting volume to', newVolume)
  if (newVolume < 0) {
    volume = 0
  } else if (newVolume > MAX_VOLUME) {
    volume = MAX_VOLUME
  } else {
    volume = Math.floor(newVolume)
  }
}

const setIsMuted = newMuted => {
  isMuted = !(!newMuted)
}

app.get('/config', (req, res) => {
  const hostname = os.hostname().split('.')[0]
  res.json({
    hostname,
    numLevels: NUM_VOLUME_LEVEL_BARS,
    maxVolume: MAX_VOLUME,
    stepSize: STEP_SIZE,
    volume,
    isMuted
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
    setVolume(req.body.volume)
  }
  res.json({
    volume,
    isMuted
  })
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
