import { useState, useEffect } from 'react'

const CookieBanner = () => {
  const [show, setShow] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    const termsConsent = localStorage.getItem('termsConsent')
    
    if (!cookieConsent) {
      setShow(true)
    }
    
    if (!termsConsent) {
      // Show terms banner after a delay if user accepted cookies
      const timer = setTimeout(() => {
        if (cookieConsent === 'accepted') {
          setShowTerms(true)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShow(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShow(false)
  }

  const handleReviewTerms = () => {
    localStorage.setItem('termsConsent', 'reviewed')
    setShowTerms(false)
    // Could navigate to terms page
  }

  if (!show && !showTerms) return null

  return (
    <>
      {/* Cookie Banner */}
      {show && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-title"
        >
          <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p id="cookie-title" className="text-sm text-text">
              We use cookies to enhance your experience.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-text border border-border rounded-md hover:bg-gray-50 transition-colors focus-ring"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent/90 transition-colors focus-ring"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Banner */}
      {showTerms && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 shadow-lg z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-title"
        >
          <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p id="terms-title" className="text-sm text-text">
              We've updated our Terms & Privacy Policy. By continuing to use our services, you agree to the updated policies.
            </p>
            <button
              onClick={handleReviewTerms}
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent/90 transition-colors focus-ring whitespace-nowrap"
            >
              Review Changes
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default CookieBanner

