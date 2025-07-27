import React, { useState, useEffect } from 'react'

function Popup() {
  const [popupData, setPopupData] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Remove this line after testing:
    // localStorage.removeItem('popupClosed')
    
    // Check if popup was previously closed and when
    const popupClosedAt = localStorage.getItem('popupClosedAt')
    let shouldShowPopup = true
    if (popupClosedAt) {
      const lastClosed = parseInt(popupClosedAt, 10)
      const now = Date.now()
      // 4 hours = 4 * 60 * 60 * 1000 = 14,400,000 ms
      if (now - lastClosed < 4 * 60 * 60 * 1000) {
        shouldShowPopup = false
      }
    }
    console.log('Popup closed at:', popupClosedAt, 'Should show:', shouldShowPopup)
    
    if (shouldShowPopup) {
      // Fetch popup ads data
      const fetchPopupAds = async () => {
        try {
          console.log('Fetching popup ads...')
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/popup-ads/`, {
            headers: {
              'accept': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('Popup data received:', data)
            if (data && data.length > 0) {
              setPopupData(data[0]) // Get the first element
              console.log('Setting popup data:', data[0])
              setTimeout(() => {
                console.log('Setting popup visible')
                setIsVisible(true)
              }, 0)
            } else {
              console.log('No popup data found')
            }
          } else {
            console.log('API response not ok:', response.status)
          }
        } catch (error) {
          console.error('Error fetching popup ads:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchPopupAds()
    } else {
      console.log('Popup was recently closed, not showing')
      setIsLoading(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Store timestamp in localStorage so popup doesn't show again for 4 hours
    localStorage.setItem('popupClosedAt', Date.now().toString())
  }

  // Debug info
  console.log('Popup state:', { isLoading, popupData, isVisible })

  if (isLoading || !popupData || !isVisible) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300 ease-out"
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        className="relative max-w-md max-h-[80vh] overflow-hidden rounded-lg shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 ease-out"
        style={{
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        {/* Popup image */}
        <img
          src={popupData.image_url}
          alt={popupData.title}
          className="w-full h-auto object-contain"
          onError={(e) => {
            console.log('Image failed to load:', popupData.image_url)
            e.target.style.display = 'none'
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', popupData.image_url)
          }}
        />
      </div>
    </div>
  )
}

export default Popup