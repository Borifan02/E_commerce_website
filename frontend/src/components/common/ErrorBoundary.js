import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log to error tracking service (e.g., Sentry) in production
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            sx={{ py: 8 }}
          >
            <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
              We're sorry, but something unexpected happened. Please try refreshing the page or
              contact support if the problem persists.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  bgcolor: 'error.light',
                  borderRadius: 1,
                  textAlign: 'left',
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <details style={{ marginTop: '10px' }}>
                      <summary>Stack Trace</summary>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </details>
                  )}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={this.handleReset}>
                Go to Homepage
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

