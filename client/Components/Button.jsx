import React from 'react'
export default function Button({ children, onClick, disabled, type = 'button', className = '' }){
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}