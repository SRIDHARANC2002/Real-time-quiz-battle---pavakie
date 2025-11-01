import React from 'react'

export default function Loader() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <div className="loader"></div>
      <span>Loading...</span>
    </div>
  )
}
