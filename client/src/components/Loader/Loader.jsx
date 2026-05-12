import './Loader.css';

export default function Loader({ fullScreen = true }) {
  if (fullScreen) {
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <div className="spinner" />
          <p className="loader-text">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="loader-inline">
      <div className="spinner-sm" />
    </div>
  );
}
