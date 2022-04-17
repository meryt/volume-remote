import { useEffect, useState } from 'react'
import './App.scss'

import { Button, Spinner } from 'react-bootstrap'

import useHttp from './hooks/use-http'
import usePageVisibility from './hooks/use-page-visibility'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.scss'

function App() {
  const [hostname, setHostname] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [levels, setLevels] = useState([0])
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0)
  const [needsRefresh, setNeedsRefresh] = useState(true)

  const { sendRequest } = useHttp()

  const isVisible = usePageVisibility()
  /*
  if (isVisible) {
    document.title = 'Active'
  } else {
    document.title = 'Inactive'
  }
  */

  useEffect(() => {
    console.log(isVisible ? 'Page is visible' : 'Page is not visible')
  }, [isVisible])

  useEffect(() => {
    if (needsRefresh) {
      setIsLoading(true)
      fetch('/config')
        .then(res => res.json())
        .then(data => {
          console.log(data)
          setIsLoading(false)
          setHostname(data.hostname)
          const tmpLevels = []
          for (let i = 0; i < data.numLevels; i++) {
            tmpLevels.push(i * (data.maxVolume / data.numLevels))
          }
          setLevels(tmpLevels)
          setVolume(data.volume)
          setIsMuted(data.isMuted)
          setIsLoading(false)
        })
      setNeedsRefresh(false)
    }
  }, [needsRefresh])

  const postVolume = body => {
    sendRequest(
      {
        url: '/volume',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      },
      data => {
        setIsMuted(data.isMuted)
        setVolume(data.volume)
      }
    )
  }

  const handleMuteButtonClick = event => {
    event.preventDefault()
    event.currentTarget.blur()
    if (isMuted) {
      postVolume({ action: 'UNMUTE' })
    } else {
      postVolume({ action: 'MUTE' })
    }
  }

  const handleVolumeDownClick = event => {
    event.preventDefault()
    event.currentTarget.blur()
    postVolume({ action: 'DECREASE' })
  }

  const handleVolumeUpClick = event => {
    event.preventDefault()
    event.currentTarget.blur()
    postVolume({ action: 'INCREASE' })
  }

  const handleRefreshClick = event => {
    event.preventDefault()
    event.currentTarget.blur()
    setNeedsRefresh(true)
  }

  const setVolumeLevel = level => {
    postVolume({ action: 'SET_VOLUME', volume: level })
  }

  const handleSpaceClick = event => {
    event.preventDefault()
    event.currentTarget.blur()
    postVolume({ action: 'PRESS_SPACE' })
  }

  return (
    <div className="App container">
      <div className="row mt-3 mb-5">
        <h1>{isLoading ? 'Loading...' : hostname}</h1>
      </div>
      <div className="container">
        <div className="row mb-5">
          <Button
            disabled={isLoading}
            onClick={handleMuteButtonClick}
            variant={isLoading || isMuted ? 'secondary' : 'primary'}>
            <p>
              <i
                className={`${
                  isLoading || isMuted ? 'bi-volume-mute' : 'bi-volume-off'
                }`}></i>
            </p>
            <p>Sound {isLoading ? 'Loading...' : isMuted ? 'Off' : 'On'}</p>
            <p>
              {isLoading ? '...' : `Click to ${isMuted ? 'unmute' : 'mute'}`}
            </p>
          </Button>
        </div>

        <div className="row mb-5">
          {levels.map(e => {
            return (
              <div className="col vol-level-col" key={`volume-level-${e}`}>
                <Button
                  disabled={isLoading}
                  onClick={() => {
                    setVolumeLevel(e)
                  }}
                  variant={
                    !isMuted && volume > e ? 'primary' : 'secondary'
                  }></Button>
              </div>
            )
          })}
        </div>

        <div className="row mb-5">
          <div className="col me-3">
            <div className="row">
              <Button
                onClick={handleVolumeDownClick}
                disabled={isLoading}
                variant={isMuted || isLoading ? 'secondary' : 'primary'}>
                <i className="bi-volume-down"></i>
              </Button>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <Button
                onClick={handleVolumeUpClick}
                disabled={isLoading}
                variant={isMuted || isLoading ? 'secondary' : 'primary'}>
                <i className="bi-volume-up"></i>
              </Button>
            </div>
          </div>
        </div>

        <div className="row mb-5 play-pause">
          <Button variant="primary" onClick={handleSpaceClick}>
            {isLoading && (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}
            {!isLoading && (
              <div>
                <i className="bi-play-btn"></i>
                <span> </span>
                <i className="bi-pause-btn"></i>
              </div>
            )}
          </Button>
        </div>

        <div className="row mb-3">
          <Button variant="primary" onClick={handleRefreshClick}>
            {isLoading && (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}
            {!isLoading && <i className="bi-arrow-clockwise"></i>}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
