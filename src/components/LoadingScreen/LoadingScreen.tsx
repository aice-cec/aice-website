import { useEffect, useState } from 'react'
import styles from './LoadingScreen.module.css'
// Import the video file
import loadingVideo from '../../assets/loading.mp4'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // You can adjust the duration before fading out.
    // For now, let's wait 3.5 seconds before fading out.
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 3500)

    // Complete the loading process after the fade transition ends (1s)
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 4500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className={`${styles.loadingScreen} ${isFading ? styles.fadeOut : ''}`}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className={styles.video}
        src={loadingVideo}
      />
    </div>
  )
}
