import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wifi, WifiOff, Activity, TrendingUp, Settings, BarChart3, Calculator, Globe, Zap } from 'lucide-react';

const Navigation = ({ isConnected, systemStatus }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/prices', label: 'Price Feeds', icon: TrendingUp },
    { path: '/visualizations', label: 'Charts', icon: BarChart3 },
    { path: '/converter', label: 'Converter', icon: Calculator },
    { path: '/comparison', label: 'Analysis', icon: Globe },
    { path: '/hft', label: 'HFT Dashboard', icon: Zap },
    // Only show signals if we have signals data
    ...(systemStatus?.signals_count > 0 ? [{ path: '/signals', label: 'Signals', icon: TrendingUp }] : []),
    { path: '/rules', label: 'CEP Rules', icon: Settings },
  ];

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white">
              ASCEP
            </Link>
            <span className="ml-2 text-sm text-gray-400">
              Arbitrage Signal CEP
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="text-green-400" size={16} />
              ) : (
                <WifiOff className="text-red-400" size={16} />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* System Status */}
            {systemStatus.overall_status && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus.overall_status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-300">
                  {systemStatus.active_connections || 0} connections
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 