import { useEffect, useState } from 'react'

const getBrowserVisibilityProp = () => {
  if (typeof document.hidden !== 'undefined') {
    return 'visibilityChange'
  } else if (typeof document.msHidden !== 'undefined') {
    return 'msvisibilityChange'
  } else if (typeof document.webkitHidden !== 'undefined') {
    return 'webkitvisibilityChange'
  }
}

const getBrowserDocumentHiddenProp = () => {
  if (typeof document.hidden !== 'undefined') {
    return 'hidden'
  } else if (typeof document.msHidden !== 'undefined') {
    return 'msHidden'
  } else if (typeof document.webkitHidden !== 'undefined') {
    return 'webkitHidden'
  }
}

const getIsDocumentHidden = () => {
  return !document[getBrowserDocumentHiddenProp()]
}

const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(getIsDocumentHidden())
  const onVisibilityChange = () => {
    setIsVisible(getIsDocumentHidden())
    console.log('Set is visible to ', getIsDocumentHidden())
  }

  useEffect(() => {
    const visibilityChange = getBrowserVisibilityProp()

    console.log('Adding event listener to event', visibilityChange)
    document.addEventListener(visibilityChange, onVisibilityChange, false)

    return () => {
      console.log('Removing event listener')
      document.removeEventListener(visibilityChange, onVisibilityChange)
    }
  })

  return isVisible
}

export default usePageVisibility