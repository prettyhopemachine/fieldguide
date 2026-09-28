import { useEffect, useRef, useState } from 'react'
// import './Sidebar.css'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef(null)

  const toggleSidebar = () => setIsOpen((current) => !current)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!isOpen) return

      const target = event.target
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen])

  return (
    <div ref={sidebarRef} style={{ position: 'relative' }}>
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={{
          width: 42,
          height: 42,
          borderRadius: 0,
          border: '2px solid #2a1311',
          background: '#f4ded7',
          fontSize: 22,
          color: '#2a1311',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 31,
          boxShadow: 'none',
          transition: 'transform 0.12s ease-out, background 0.12s ease-out, filter 0.12s ease-out',
          transform: isOpen ? 'translateX(2px)' : 'translateX(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e8cdbd'
          e.currentTarget.style.transform = 'translateY(1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f4ded7'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        ☰
      </button>

      <aside
        style={{
          position: 'absolute',
          top: 50,
          left: 0,
          width: 220,
          background: '#f4ded7',
          border: '2px solid #2a1311',
          borderRadius: 0,
          padding: 12,
          boxShadow: 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(-102%)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.18s ease-out, opacity 0.12s ease-out',
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 30,
        }}
      >
        <nav>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
            {[
              ['home', '/'],
              ['plots', '/plots'],
              ['my plants', '/plants'],
              ['field notes', '/fieldnotes'],
              ['about', '/about'],
              ['settings', '/settings'],
            ].map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  style={{
                    display: 'block',
                    padding: '6px 8px',
                    color: '#111827',
                    textDecoration: 'none',
                    background: 'transparent',
                    transition: 'background 0.12s ease-out, color 0.12s ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e8cdbd'
                    e.currentTarget.style.color = '#2a1311'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#111827'
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  )
}