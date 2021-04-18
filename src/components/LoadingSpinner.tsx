import "./LoadingSpinner.css"

const LoadingSpinner = () => (
  <div className="loading-block-container">
    <div key={1} className="loading-block" />
    <div key={2} className="loading-block" />
    <div key={3} className="loading-block" />
  </div>
)
export default LoadingSpinner
