import { useState, useCallback } from 'react'

const useHttp = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const sendRequest = useCallback(async (requestConfig, applyData) => {
    setIsLoading(true)
    setLoadError('')

    const opts = {
      method: requestConfig.method ? requestConfig.method : 'GET',
      headers: requestConfig.headers ? requestConfig.headers : {},
      body: requestConfig.body ? JSON.stringify(requestConfig.body) : null,
    }

    try {
      const response = await fetch(requestConfig.url, opts)

      if (!response.ok) {
        throw new Error(`${opts.method} ${requestConfig.url} failed. Server responded with ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      applyData(data)

    } catch (err) {
      setLoadError(err.message)
    }

    setIsLoading(false)
  }, [])

  return {
    isLoading,
    loadError,
    sendRequest
  }
}

export default useHttp
