import React from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon" style={{ fontSize: "28px" }}>
              !
            </div>
            <h1>Something went wrong</h1>
            <p className="error-message">
              We're sorry for the inconvenience. An unexpected error occurred.
            </p>

            {import.meta.env.DEV && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-stack">
                  {this.state.error && (
                    <>
                      <p>
                        <strong>Error:</strong> {this.state.error.toString()}
                      </p>
                      <pre>{this.state.errorInfo?.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleReset}
                className="error-button-primary"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="error-button-secondary"
              >
                Go Home
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <p className="error-warning">
                Multiple errors detected. Please refresh the page or clear your
                browser cache.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
