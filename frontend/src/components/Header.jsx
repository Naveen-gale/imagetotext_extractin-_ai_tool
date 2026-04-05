export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">👁️</div>
        <span className="logo-text">VisionText</span>
        <span className="logo-badge">AI</span>
      </div>
      <div className="header-actions">
        <button className="ppt-soon-btn">
          📊 Make PPT with AI <span style={{ fontSize: '0.65rem', opacity: 0.8, marginLeft: 4 }}>[Coming Soon]</span>
        </button>
      </div>
    </header>
  );
}
