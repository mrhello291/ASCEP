import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, 
  PieChart as PieChartIcon, Activity, Target, Zap, Globe, Coins,
  ArrowUpRight, ArrowDownRight, Minus, Maximize2, Minimize2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Scatter
} from 'recharts';

const MarketComparison = ({ priceData, isConnected }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [chartData, setChartData] = useState([]);
  const [correlationMatrix, setCorrelationMatrix] = useState({});
  const [volatilityData, setVolatilityData] = useState({});

  // Update chart data when priceData changes
  useEffect(() => {
    const now = new Date();
    const newDataPoint = {
      timestamp: now.toLocaleTimeString(),
      time: now.getTime(),
    };

    // Add all price data
    Object.entries(priceData).forEach(([symbol, data]) => {
      if (data && data.price) {
        newDataPoint[symbol] = parseFloat(data.price);
      }
    });

    setChartData(prevData => {
      const updatedData = [...prevData, newDataPoint];
      return updatedData.slice(-50); // Keep last 50 data points
    });
  }, [priceData]);

  // Categorize symbols
  const categorizeSymbols = () => {
    const crypto = [];
    const forex = [];
    
    Object.keys(priceData).forEach(symbol => {
      if (symbol.includes('USDT')) {
        crypto.push(symbol);
      } else if (symbol.includes('/')) {
        forex.push(symbol);
      }
    });
    
    return { crypto, forex };
  };

  const { crypto, forex } = categorizeSymbols();

  // Calculate correlation matrix
  useEffect(() => {
    if (chartData.length < 10) return;

    const symbols = Object.keys(priceData);
    const matrix = {};

    symbols.forEach(symbol1 => {
      matrix[symbol1] = {};
      symbols.forEach(symbol2 => {
        if (symbol1 === symbol2) {
          matrix[symbol1][symbol2] = 1;
        } else {
          const correlation = calculateCorrelation(symbol1, symbol2);
          matrix[symbol1][symbol2] = correlation;
        }
      });
    });

    setCorrelationMatrix(matrix);
  }, [chartData, priceData]);

  // Calculate correlation between two symbols
  const calculateCorrelation = (symbol1, symbol2) => {
    const prices1 = chartData.map(point => point[symbol1]).filter(p => p !== undefined);
    const prices2 = chartData.map(point => point[symbol2]).filter(p => p !== undefined);
    
    if (prices1.length < 5 || prices2.length < 5) return 0;

    const returns1 = calculateReturns(prices1);
    const returns2 = calculateReturns(prices2);

    if (returns1.length !== returns2.length) return 0;

    const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
    const mean2 = returns2.reduce((a, b) => a + b, 0) / returns2.length;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(denominator1 * denominator2);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Calculate returns from prices
  const calculateReturns = (prices) => {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  };

  // Calculate volatility
  useEffect(() => {
    const volatility = {};
    Object.keys(priceData).forEach(symbol => {
      const prices = chartData.map(point => point[symbol]).filter(p => p !== undefined);
      if (prices.length > 5) {
        const returns = calculateReturns(prices);
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        volatility[symbol] = Math.sqrt(variance) * 100; // Annualized volatility
      }
    });
    setVolatilityData(volatility);
  }, [chartData, priceData]);

  // Color schemes
  const cryptoColors = ['#F7931A', '#627EEA', '#00D4AA', '#FF6B6B', '#4ECDC4'];
  const forexColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
  const allColors = [...cryptoColors, ...forexColors];

  // Prepare data for different chart types
  const prepareMarketStructureData = () => {
    return [
      { name: 'Crypto', value: crypto.length, color: '#F7931A', type: 'Digital Assets' },
      { name: 'Forex', value: forex.length, color: '#36A2EB', type: 'Fiat Currencies' }
    ];
  };

  const prepareVolatilityData = () => {
    return Object.entries(volatilityData).map(([symbol, vol], index) => ({
      symbol,
      volatility: vol,
      color: allColors[index % allColors.length],
      type: symbol.includes('USDT') ? 'Crypto' : 'Forex'
    }));
  };

  const prepareCorrelationData = () => {
    const data = [];
    Object.keys(correlationMatrix).forEach(symbol1 => {
      Object.keys(correlationMatrix[symbol1]).forEach(symbol2 => {
        if (symbol1 !== symbol2) {
          data.push({
            symbol1,
            symbol2,
            correlation: correlationMatrix[symbol1][symbol2],
            strength: Math.abs(correlationMatrix[symbol1][symbol2])
          });
        }
      });
    });
    return data.sort((a, b) => b.strength - a.strength).slice(0, 10);
  };

  // Get market statistics
  const getMarketStats = () => {
    const totalPairs = Object.keys(priceData).length;
    const avgVolatility = Object.values(volatilityData).reduce((a, b) => a + b, 0) / Object.keys(volatilityData).length || 0;
    const highCorrelationPairs = Object.values(correlationMatrix).flat().filter(corr => Math.abs(corr) > 0.7).length;
    
    return {
      totalPairs,
      avgVolatility: avgVolatility.toFixed(2),
      highCorrelationPairs,
      cryptoCount: crypto.length,
      forexCount: forex.length
    };
  };

  const marketStats = getMarketStats();

  // Render different views
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Pairs</p>
              <p className="text-2xl font-bold text-white">{marketStats.totalPairs}</p>
            </div>
            <Globe className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Volatility</p>
              <p className="text-2xl font-bold text-white">{marketStats.avgVolatility}%</p>
            </div>
            <Activity className="text-yellow-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Correlation</p>
              <p className="text-2xl font-bold text-white">{marketStats.highCorrelationPairs}</p>
            </div>
            <Target className="text-green-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Crypto Pairs</p>
              <p className="text-2xl font-bold text-white">{marketStats.cryptoCount}</p>
            </div>
            <Coins className="text-orange-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Forex Pairs</p>
              <p className="text-2xl font-bold text-white">{marketStats.forexCount}</p>
            </div>
            <TrendingUp className="text-purple-400" size={24} />
          </div>
        </div>
      </div>

      {/* All Markets Line Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">All Markets - Price Movement</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {Object.keys(priceData).map((symbol, index) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={allColors[index % allColors.length]}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderCorrelationAnalysis = () => (
    <div className="space-y-6">
      {/* Correlation Matrix Heatmap */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Correlation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-gray-400 p-2"></th>
                {Object.keys(correlationMatrix).map(symbol => (
                  <th key={symbol} className="text-center text-gray-400 p-2">{symbol}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(correlationMatrix).map(symbol1 => (
                <tr key={symbol1}>
                  <td className="text-gray-400 p-2 font-medium">{symbol1}</td>
                  {Object.keys(correlationMatrix[symbol1]).map(symbol2 => {
                    const correlation = correlationMatrix[symbol1][symbol2];
                    const intensity = Math.abs(correlation);
                    const color = correlation > 0 ? 
                      `rgba(34, 197, 94, ${intensity})` : 
                      `rgba(239, 68, 68, ${intensity})`;
                    
                    return (
                      <td key={symbol2} className="text-center p-2">
                        <div 
                          className="w-8 h-8 mx-auto rounded"
                          style={{ backgroundColor: color }}
                        >
                          <span className="text-xs text-white flex items-center justify-center h-full">
                            {correlation.toFixed(2)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Correlations */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Top Correlations</h3>
        <div className="space-y-3">
          {prepareCorrelationData().map((item, index) => (
            <div key={index} className="bg-gray-700 rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">
                    {item.symbol1} ↔ {item.symbol2}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Correlation: {item.correlation.toFixed(3)}
                  </p>
                </div>
                <div className={`flex items-center space-x-1 ${
                  item.correlation > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {item.correlation > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span className="text-sm font-semibold">
                    {Math.abs(item.correlation).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVolatilityAnalysis = () => (
    <div className="space-y-6">
      {/* Volatility Bar Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Volatility Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={prepareVolatilityData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="symbol" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="volatility" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Volatility Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Crypto Volatility</h3>
          <div className="space-y-3">
            {prepareVolatilityData()
              .filter(item => item.type === 'Crypto')
              .sort((a, b) => b.volatility - a.volatility)
              .map((item, index) => (
                <div key={index} className="bg-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{item.symbol}</span>
                    <span className="text-yellow-400 font-semibold">
                      {item.volatility.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Forex Volatility</h3>
          <div className="space-y-3">
            {prepareVolatilityData()
              .filter(item => item.type === 'Forex')
              .sort((a, b) => b.volatility - a.volatility)
              .map((item, index) => (
                <div key={index} className="bg-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{item.symbol}</span>
                    <span className="text-blue-400 font-semibold">
                      {item.volatility.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMarketStructure = () => (
    <div className="space-y-6">
      {/* Market Structure Pie Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Market Structure</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={prepareMarketStructureData()}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {prepareMarketStructureData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Market Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Crypto Markets</h3>
          <div className="space-y-3">
            {crypto.map((symbol, index) => {
              const data = priceData[symbol];
              const volatility = volatilityData[symbol] || 0;
              return (
                <div key={symbol} className="bg-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{symbol}</p>
                      <p className="text-gray-400 text-sm">
                        {data ? parseFloat(data.price).toFixed(4) : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-semibold">
                        {volatility.toFixed(2)}%
                      </p>
                      <p className="text-gray-400 text-xs">Volatility</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Forex Markets</h3>
          <div className="space-y-3">
            {forex.map((symbol, index) => {
              const data = priceData[symbol];
              const volatility = volatilityData[symbol] || 0;
              return (
                <div key={symbol} className="bg-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{symbol}</p>
                      <p className="text-gray-400 text-sm">
                        {data ? parseFloat(data.price).toFixed(4) : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-semibold">
                        {volatility.toFixed(2)}%
                      </p>
                      <p className="text-gray-400 text-xs">Volatility</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Market Comparison & Analysis
        </h1>
        <p className="text-gray-400">
          Advanced market analysis with correlation, volatility, and structure insights
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="text-gray-400" size={20} />
            <select 
              value={selectedView} 
              onChange={(e) => setSelectedView(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
            >
              <option value="overview">Market Overview</option>
              <option value="correlation">Correlation Analysis</option>
              <option value="volatility">Volatility Analysis</option>
              <option value="structure">Market Structure</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Activity className="text-gray-400" size={20} />
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded text-sm"
            >
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">1 Day</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-400">
            {Object.keys(priceData).length} markets analyzed
          </div>
        </div>
      </div>

      {/* Chart Views */}
      {selectedView === 'overview' && renderOverview()}
      {selectedView === 'correlation' && renderCorrelationAnalysis()}
      {selectedView === 'volatility' && renderVolatilityAnalysis()}
      {selectedView === 'structure' && renderMarketStructure()}

      {/* Empty State */}
      {Object.keys(priceData).length === 0 && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Market Data Available
          </h3>
          <p className="text-gray-400">
            {isConnected 
              ? 'Waiting for market data to perform analysis...' 
              : 'Please connect to the backend to analyze markets'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketComparison; 