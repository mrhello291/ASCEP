import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Activity, DollarSign } from 'lucide-react';

const Dashboard = ({ priceData, signals, isConnected, systemStatus }) => {
  // Convert price data to chart format
  const chartData = Object.entries(priceData).map(([symbol, data]) => ({
    symbol,
    price: data.price,
    timestamp: new Date(data.timestamp).toLocaleTimeString(),
  }));

  // Get recent signals
  const recentSignals = signals.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          ASCEP Dashboard
        </h1>
        <p className="text-gray-400">
          Real-time Complex Event Processing for Arbitrage Signals
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Connection Status</p>
              <p className={`text-lg font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Active Price Feeds</p>
              <p className="text-lg font-semibold text-white">
                {Object.keys(priceData).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Total Signals</p>
              <p className="text-lg font-semibold text-white">
                {signals.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Active Connections</p>
              <p className="text-lg font-semibold text-white">
                {systemStatus.active_connections || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Price Trends</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No price data available</p>
            </div>
          )}
        </div>

        {/* Recent Signals */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Signals</h2>
          {recentSignals.length > 0 ? (
            <div className="space-y-3">
              {recentSignals.map((signal, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">
                        {signal.symbols?.join(' vs ') || 'Arbitrage Signal'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Spread: {signal.spread?.toFixed(6) || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        signal.severity === 'high' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-yellow-500 text-black'
                      }`}>
                        {signal.severity || 'medium'}
                      </span>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No signals detected yet</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`text-lg font-semibold ${
              systemStatus.overall_status === 'healthy' ? 'text-green-400' : 'text-red-400'
            }`}>
              {systemStatus.overall_status || 'Unknown'}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Price Feeds</p>
            <p className="text-lg font-semibold text-white">
              {systemStatus.price_feeds || 0}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Last Update</p>
            <p className="text-lg font-semibold text-white">
              {systemStatus.timestamp ? 
                new Date(systemStatus.timestamp).toLocaleTimeString() : 
                'N/A'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 