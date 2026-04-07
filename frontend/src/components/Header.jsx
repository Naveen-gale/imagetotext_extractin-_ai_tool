import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">👁️</div>
        <span className="logo-text">VisionText</span>
        <span className="logo-badge">AI</span>
      </div>
      <div className="header-actions">
        <Link to="/aippt" className="ppt-btn" id="make-ppt-btn">
          📊 Make PPT with AI
        </Link>
      </div>
    </header>
  );
}
