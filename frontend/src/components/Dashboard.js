import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, AlertTriangle, Activity, DollarSign, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const Dashboard = ({ priceData, signals, isConnected, systemStatus }) => {
  const [chartData, setChartData] = useState([]);
  const [selectedSymbols, setSelectedSymbols] = useState(['BTCUSDT', 'ETHUSDT', 'EUR/USD']);
  const [selectedChartType, setSelectedChartType] = useState('line');

  // Update chart data when priceData changes
  useEffect(() => {
    const now = new Date();
    const newDataPoint = {
      timestamp: now.toLocaleTimeString(),
      time: now.getTime(),
    };

    // Add price data for selected symbols
    selectedSymbols.forEach(symbol => {
      if (priceData[symbol]) {
        newDataPoint[symbol] = parseFloat(priceData[symbol].price);
      }
    });

    setChartData(prevData => {
      const updatedData = [...prevData, newDataPoint];
      // Keep only last 20 data points for better visualization
      return updatedData.slice(-20);
    });
  }, [priceData, selectedSymbols]);

  // Get recent signals
  const recentSignals = signals.slice(0, 5);

  // Available symbols for selection
  const availableSymbols = Object.keys(priceData).sort();

  // Color scheme for different symbols
  const symbolColors = {
    'BTCUSDT': '#F7931A',
    'ETHUSDT': '#627EEA',
    'EUR/USD': '#00D4AA',
    'GBP/USD': '#FF6B6B',
    'USD/JPY': '#4ECDC4',
    'ADAUSDT': '#0033AD',
    'DOTUSDT': '#E6007A',
    'LINKUSDT': '#2A5ADA',
    'LTCUSDT': '#BFBBBB',
    'XRPUSDT': '#23292F'
  };

  // Categorize symbols
  const crypto = Object.keys(priceData).filter(symbol => symbol.includes('USDT'));
  const forex = Object.keys(priceData).filter(symbol => symbol.includes('/'));

  // Prepare data for different chart types
  const preparePieData = () => {
    return [
      { name: 'Crypto', value: crypto.length, color: '#F7931A' },
      { name: 'Forex', value: forex.length, color: '#36A2EB' }
    ];
  };

  const prepareBarData = () => {
    // For bar chart, show only selected symbols
    return selectedSymbols.map(symbol => {
      const data = priceData[symbol];
      return {
        symbol,
        price: data && data.price ? parseFloat(data.price) : 0,
        color: symbolColors[symbol] || '#8884d8'
      };
    });
  };

  // Filter available symbols to exclude already selected ones
  const getAvailableSymbolsForIndex = (index) => {
    return availableSymbols.filter(symbol => 
      !selectedSymbols.includes(symbol) || selectedSymbols[index] === symbol
    );
  };

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
              {signals.length === 0 && (
                <p className="text-gray-500 text-xs">Monitoring for opportunities...</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">System Status</p>
              <p className={`text-lg font-semibold ${
                systemStatus.status === 'healthy' ? 'text-green-400' : 'text-red-400'
              }`}>
                {systemStatus.status || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Live Price Chart</h2>
            <div className="flex gap-2">
              <select 
                value={selectedChartType} 
                onChange={(e) => setSelectedChartType(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
              <select 
                value={selectedSymbols[0]} 
                onChange={(e) => setSelectedSymbols([e.target.value, selectedSymbols[1], selectedSymbols[2]])}
                className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                {getAvailableSymbolsForIndex(0).map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
              <select 
                value={selectedSymbols[1]} 
                onChange={(e) => setSelectedSymbols([selectedSymbols[0], e.target.value, selectedSymbols[2]])}
                className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                {getAvailableSymbolsForIndex(1).map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
              <select 
                value={selectedSymbols[2]} 
                onChange={(e) => setSelectedSymbols([selectedSymbols[0], selectedSymbols[1], e.target.value])}
                className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                {getAvailableSymbolsForIndex(2).map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>
          </div>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {selectedChartType === 'line' && (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#9CA3AF"
                    interval="preserveStartEnd"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 0.1', 'dataMax + 0.1']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Legend />
                  {selectedSymbols.map(symbol => (
                    <Line 
                      key={symbol}
                      type="monotone" 
                      dataKey={symbol} 
                      stroke={symbolColors[symbol] || '#3B82F6'} 
                      strokeWidth={2}
                      dot={{ fill: symbolColors[symbol] || '#3B82F6', r: 3 }}
                      activeDot={{ r: 5 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              )}
              
              {selectedChartType === 'bar' && (
                <BarChart data={prepareBarData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="symbol" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="price" fill="#8884d8" />
                </BarChart>
              )}
              
              {selectedChartType === 'pie' && (
                <PieChart>
                  <Pie
                    data={preparePieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Waiting for price data...</p>
            </div>
          )}
          
          {/* Current Prices Display */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {selectedSymbols.map(symbol => {
              const data = priceData[symbol];
              return (
                <div key={symbol} className="bg-gray-700 rounded p-3">
                  <p className="text-gray-400 text-xs">{symbol}</p>
                  <p className="text-white font-semibold">
                    {data ? parseFloat(data.price).toFixed(4) : 'N/A'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {data ? new Date(data.timestamp).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }) + ' UTC' : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Signals - Only show if we have signals */}
        {signals.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Signals</h2>
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
                        {new Date(signal.timestamp).toLocaleTimeString('en-US', {
                          hour12: false,
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })} UTC
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Time</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
            <p className="text-gray-400 text-sm">Current Time (UTC)</p>
            <div className="text-lg font-semibold text-white">
              {new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
          {/* <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Last Signal Update (UTC)</p>
            <div className="text-lg font-semibold text-white">
              {systemStatus.timestamp ? 
                new Date(systemStatus.timestamp).toLocaleTimeString('en-US', {
                  hour12: false,
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }) : 
                'N/A'
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {systemStatus.timestamp ? 
                `${Math.floor((Date.now() - new Date(systemStatus.timestamp + 'Z').getTime()) / 1000)}s ago` : 
                ''
              }
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 