import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Development-only error boundary that catches and suppresses non-critical errors
 * to prevent console spam while still allowing the app to function
 */
export class ErrorBoundaryDev extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Only catch development-related errors
    if (import.meta.env.DEV) {
      const errorMessage = error.message.toLowerCase();
      
      // Suppress known development noise
      if (
        errorMessage.includes('cross-origin') ||
        errorMessage.includes('postmessage') ||
        errorMessage.includes('unable to post') ||
        errorMessage.includes('frame with origin')
      ) {
        return { hasError: false }; // Don't treat as error
      }
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log significant errors in development
    if (import.meta.env.DEV) {
      const errorMessage = error.message.toLowerCase();
      
      if (
        !errorMessage.includes('cross-origin') &&
        !errorMessage.includes('postmessage') &&
        !errorMessage.includes('unable to post')
      ) {
        console.error('Significant error caught by dev boundary:', error, errorInfo);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.props.children;
    }

    return this.props.children;
  }
}

// Export as default for easier importing
export default ErrorBoundaryDev;