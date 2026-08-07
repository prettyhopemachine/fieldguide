import { useState } from 'react'
// import './Sidebar.css'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <div className="app">
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav>
          <ul>
            <li><a href="/plots">plots</a></li>
            <li><a href="/plants">plants</a></li>
            <li><a href="/field notes">field notes</a></li>
            <li><a href="/about">about</a></li>
            <li><a href="/settings">settings</a></li>
          </ul>
        </nav>
      </aside>

    </div>
  )
}