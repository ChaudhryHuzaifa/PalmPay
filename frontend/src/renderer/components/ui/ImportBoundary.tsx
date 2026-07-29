import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ImportBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          background: 'rgba(255,0,0,0.1)', 
          border: '1px solid red',
          borderRadius: '8px',
          margin: '20px',
          color: 'white'
        }}>
          <h3>❌ Failed to load {this.props.name} component</h3>
          <pre style={{ color: 'red', fontSize: '12px' }}>
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}