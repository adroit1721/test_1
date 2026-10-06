import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { getBackendBaseUrl, setCustomBackendUrl } from '../config/api';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  customBackendUrl: string;
  savedStatus: string | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    customBackendUrl: typeof window !== 'undefined' ? getBackendBaseUrl() : '',
    savedStatus: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RootErrorBoundary] Unhandled frontend exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetCache = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = window.location.pathname;
      }
    } catch {
      window.location.reload();
    }
  };

  private handleSaveBackend = () => {
    try {
      setCustomBackendUrl(this.state.customBackendUrl);
      this.setState({ savedStatus: 'Backend URL updated! Reloading...' });
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch {}
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcf9f3] text-[#1c1c18] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white border border-[#cdc6b3] rounded-3xl p-7 shadow-xl space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1c1c18]">Portal Recovery Assistant</h2>
                <p className="text-xs text-[#7c7767]">NGDC BNCC Platoon Frontend Engine</p>
              </div>
            </div>

            <p className="text-xs text-[#4a4738] leading-relaxed">
              A temporary initialization exception occurred during startup. You can reload the app, clear browser cache, or check your Render backend configuration below.
            </p>

            {this.state.error && (
              <div className="p-3.5 bg-[#181816] text-[#eedc82] rounded-xl text-[11px] font-mono overflow-x-auto">
                <p className="font-bold text-red-400">Error: {this.state.error.message}</p>
              </div>
            )}

            {/* Quick Backend Connector */}
            <div className="p-4 bg-[#f9f6ef] rounded-2xl border border-[#cdc6b3]/60 space-y-3">
              <label className="text-xs font-bold text-[#1c1c18] block">
                Render Backend URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={this.state.customBackendUrl}
                  onChange={(e) => this.setState({ customBackendUrl: e.target.value })}
                  placeholder="https://your-service.onrender.com"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#cdc6b3] text-[#1c1c18] focus:outline-none focus:border-[#6b5e10]"
                />
                <button
                  type="button"
                  onClick={this.handleSaveBackend}
                  className="px-4 py-2 bg-[#6b5e10] hover:bg-[#52480c] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
              {this.state.savedStatus && (
                <p className="text-xs text-emerald-600 font-medium">{this.state.savedStatus}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-[#6b5e10] hover:bg-[#52480c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Portal
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                className="flex-1 py-2.5 px-4 bg-[#f0ebd9] hover:bg-[#e6deca] text-[#1c1c18] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#cdc6b3]"
              >
                Clear Cache &amp; Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
