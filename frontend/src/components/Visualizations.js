import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieChartIcon,
  Activity, Globe, Coins, Zap, Filter
} from 'lucide-react';

const Visualizations = ({ priceData, isConnected }) => {
  const [chartData, setChartData] = useState([]);
  const [selectedView, setSelectedView] = useState('overview');

  // Update chart data when priceData changes
  useEffect(() => {
    const now = new Date();
    const newDataPoint = {
      timestamp: now.toLocaleTimeString(),
      time: now.getTime(),
    };
    Object.entries(priceData).forEach(([symbol, data]) => {
      if (data && data.price) {
        newDataPoint[symbol] = parseFloat(data.price);
      }
    });
    setChartData(prevData => {
      const updatedData = [...prevData, newDataPoint];
      return updatedData.slice(-30);
    });
  }, [priceData]);

  // Categorize symbols by type
  const categorizeSymbols = () => {
    const crypto = [];
    const forex = [];
    Object.keys(priceData).forEach(symbol => {
      if (symbol.includes('USDT') || symbol.includes('BTC') || symbol.includes('ETH')) {
        crypto.push(symbol);
      } else if (symbol.includes('/')) {
        forex.push(symbol);
      }
    });
    return { crypto, forex };
  };
  const { crypto, forex } = categorizeSymbols();

  // Color schemes
  const cryptoColors = ['#F7931A', '#627EEA', '#00D4AA', '#FF6B6B', '#4ECDC4', '#0033AD', '#E6007A', '#2A5ADA', '#BFBBBB', '#23292F'];
  const forexColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'];
  const allColors = [...cryptoColors, ...forexColors];

  // Memoized bar data
  const barData = useMemo(() => Object.entries(priceData).map(([symbol, data], index) => ({
    symbol,
    price: data && data.price ? parseFloat(data.price) : 0,
    color: allColors[index % allColors.length]
  })), [priceData]);
  const cryptoBarData = useMemo(() => barData.filter(item => crypto.includes(item.symbol)), [barData, crypto]);
  const forexBarData = useMemo(() => barData.filter(item => forex.includes(item.symbol)), [barData, forex]);

  // Pie data (fixed bug)
  const preparePieData = useMemo(() => {
    const pie = [];
    Object.entries(priceData).forEach(([symbol, data], index) => {
      if (data?.price) {
        pie.push({ name: symbol, value: parseFloat(data.price), color: allColors[index % allColors.length] });
      }
    });
    return pie;
  }, [priceData]);

  // Calculate real price change (%) from previous point
  const getPriceChange = (symbol) => {
    if (chartData.length < 2) return 0;
    const prev = chartData[chartData.length - 2][symbol];
    const curr = chartData[chartData.length - 1][symbol];
    if (prev && curr) {
      return ((curr - prev) / prev) * 100;
    }
    return 0;
  };

  // Render different chart views
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Feeds</p>
              <p className="text-2xl font-bold text-white">{Object.keys(priceData).length}</p>
            </div>
            <Activity className="text-blue-400" size={24} />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Crypto Pairs</p>
              <p className="text-2xl font-bold text-white">{crypto.length}</p>
            </div>
            <Coins className="text-yellow-400" size={24} />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Forex Pairs</p>
              <p className="text-2xl font-bold text-white">{forex.length}</p>
            </div>
            <Globe className="text-green-400" size={24} />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Feeds</p>
              <p className="text-2xl font-bold text-white">{Object.keys(priceData).length}</p>
            </div>
            <Zap className="text-purple-400" size={24} />
          </div>
        </div>
      </div>
      {/* Multi-line Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">All Price Feeds - Live Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <Legend />
            {Object.keys(priceData).map((symbol, index) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={allColors[index % allColors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderCryptoView = () => (
    <div className="space-y-6">
      {/* Crypto Line Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Crypto Price Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <Legend />
            {crypto.map((symbol, index) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={cryptoColors[index % cryptoColors.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Crypto Bar Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Current Crypto Prices</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cryptoBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="symbol" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <Bar dataKey="price" fill="#F7931A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderForexView = () => (
    <div className="space-y-6">
      {/* Forex Line Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Forex Price Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <Legend />
            {forex.map((symbol, index) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={forexColors[index % forexColors.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Forex Bar Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Current Forex Prices</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={forexBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="symbol" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <Bar dataKey="price" fill="#36A2EB" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderComparisonView = () => (
    <div className="space-y-6">
      {/* Price Comparison Bar */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Price Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="symbol" stroke="#9CA3AF" fontSize={10} angle={-45} textAnchor="end" />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <Bar dataKey="price" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Market Distribution Pie */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Market Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={[
                { name: 'Crypto', value: crypto.length, color: '#F7931A' },
                { name: 'Forex', value: forex.length, color: '#36A2EB' }
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {[
                { name: 'Crypto', value: crypto.length, color: '#F7931A' },
                { name: 'Forex', value: forex.length, color: '#36A2EB' }
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Market Visualizations
        </h1>
        <p className="text-gray-400">
          Comprehensive charts and analytics for all price feeds
        </p>
      </div>
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={20} />
            <select 
              value={selectedView} 
              onChange={(e) => setSelectedView(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
            >
              <option value="overview">Overview</option>
              <option value="crypto">Crypto Focus</option>
              <option value="forex">Forex Focus</option>
              <option value="comparison">Comparison</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-400">
            {Object.keys(priceData).length} active feeds
          </div>
        </div>
      </div>
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-red-400 font-semibold">Disconnected</span>
          </div>
          <p className="text-red-300 text-sm mt-1">
            No real-time data available. Please check your connection.
          </p>
        </div>
      )}
      {/* Chart Views */}
      {selectedView === 'overview' && renderOverview()}
      {selectedView === 'crypto' && renderCryptoView()}
      {selectedView === 'forex' && renderForexView()}
      {selectedView === 'comparison' && renderComparisonView()}
      {/* Empty State */}
      {Object.keys(priceData).length === 0 && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-400">
            {isConnected 
              ? 'Waiting for price feed data to generate visualizations...' 
              : 'Please connect to the backend to view market data'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Visualizations; 