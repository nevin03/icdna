'use client'

import React, { useEffect, useState } from 'react'
import { stores } from '@/stores'

type Props = {
  children: React.ReactNode
}

export const AppEntrance: React.FC<Props> = ({ children }) => {
  // const [ready,setReady] = useState<boolean>(false)
  const { isFirstTime, updateFirstTimeVisitFlag } = stores.useGlobalStore()
  const [showStore, setShowStore] = useState(false)

  useEffect(() => {
    if (isFirstTime) {
      // Show "Store" text after 1.5 seconds
      const storeTimer = setTimeout(() => {
        setShowStore(true)
      }, 1500)

      // Hide the entire loading screen after 2.5 seconds
      const hideTimer = setTimeout(() => {
        updateFirstTimeVisitFlag()
      }, 2500)

      return () => {
        clearTimeout(storeTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [isFirstTime, updateFirstTimeVisitFlag])

  return (
    <>
      {!isFirstTime ? (
        children
      ) : (
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: 'center',
            justifyContent: 'center',
            width: "100%",
            gap: "20px"
          }}
        >
          <h1
            className="moving-gradient-btn"
            style={{
              fontSize: "64px",
              fontWeight: "700",
              margin: "0",
              textAlign: "center",
              fontFamily: "var(--font-outfit), sans-serif",
              opacity: showStore ? 1 : 0,
              transform: showStore ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
              letterSpacing: '4px',
              textTransform: 'uppercase',
              background: 'linear-gradient(to right, var(--main-turquoise), var(--main-dark), var(--main-turquoise))',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            ICDNA
          </h1>
        </div>
      )}
    </>
  )
}

export default AppEntrance
