import React, { useState, useEffect } from 'react';
import { 
  Zap, Target, TrendingUp, TrendingDown, Activity, Clock, 
  AlertTriangle, DollarSign, BarChart3, Gauge, Shield, 
  ArrowUpRight, ArrowDownRight, Minus, Maximize2, Minimize2,
  Cpu, Wifi, Database, Server
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, ComposedChart, Scatter
} from 'recharts';

const HFTDashboard = ({ priceData, isConnected }) => {
  const [orderBook, setOrderBook] = useState({});
  const [latencyMetrics, setLatencyMetrics] = useState({});
  const [riskMetrics, setRiskMetrics] = useState({});
  const [tradingSignals, setTradingSignals] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [chartData, setChartData] = useState([]);

  // Update chart data when priceData changes
  useEffect(() => {
    const now = new Date();
    const newDataPoint = {
      timestamp: now.toLocaleTimeString(),
      time: now.getTime(),
    };

    // Add price data for selected symbol
    if (priceData[selectedSymbol]) {
      newDataPoint[selectedSymbol] = parseFloat(priceData[selectedSymbol].price);
    }

    setChartData(prevData => {
      const updatedData = [...prevData, newDataPoint];
      return updatedData.slice(-100); // Keep last 100 data points
    });
  }, [priceData, selectedSymbol]);

  // Simulate order book data
  useEffect(() => {
    const generateOrderBook = (symbol) => {
      const basePrice = priceData[symbol]?.price || 100;
      const bids = [];
      const asks = [];
      
      // Generate bid orders (buy orders)
      for (let i = 0; i < 10; i++) {
        const price = basePrice * (1 - (i + 1) * 0.001);
        const size = Math.random() * 100 + 10;
        bids.push({ price: price.toFixed(4), size: size.toFixed(2) });
      }
      
      // Generate ask orders (sell orders)
      for (let i = 0; i < 10; i++) {
        const price = basePrice * (1 + (i + 1) * 0.001);
        const size = Math.random() * 100 + 10;
        asks.push({ price: price.toFixed(4), size: size.toFixed(2) });
      }
      
      return { bids: bids.reverse(), asks };
    };

    setOrderBook(generateOrderBook(selectedSymbol));
  }, [selectedSymbol, priceData]);

  // Simulate latency metrics
  useEffect(() => {
    const generateLatencyMetrics = () => {
      return {
        networkLatency: Math.random() * 5 + 1, // 1-6ms
        orderLatency: Math.random() * 10 + 5, // 5-15ms
        marketDataLatency: Math.random() * 2 + 0.5, // 0.5-2.5ms
        totalLatency: Math.random() * 15 + 8, // 8-23ms
        uptime: 99.99 - Math.random() * 0.1, // 99.89-99.99%
        throughput: Math.random() * 10000 + 50000 // 50k-60k orders/sec
      };
    };

    setLatencyMetrics(generateLatencyMetrics());
  }, [priceData]);

  // Calculate risk metrics
  useEffect(() => {
    const calculateRiskMetrics = () => {
      const prices = chartData.map(point => point[selectedSymbol]).filter(p => p !== undefined);
      if (prices.length < 10) return {};

      const returns = [];
      for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
      }

      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance) * 100;

      // Calculate Value at Risk (VaR)
      const sortedReturns = returns.sort((a, b) => a - b);
      const var95 = sortedReturns[Math.floor(sortedReturns.length * 0.05)] * 100;

      // Calculate Sharpe Ratio (assuming risk-free rate of 2%)
      const sharpeRatio = (mean * 252 - 0.02) / (volatility * Math.sqrt(252));

      return {
        volatility: volatility.toFixed(2),
        var95: var95.toFixed(2),
        sharpeRatio: sharpeRatio.toFixed(2),
        maxDrawdown: calculateMaxDrawdown(prices).toFixed(2),
        beta: calculateBeta(returns).toFixed(2),
        correlation: calculateCorrelation(returns).toFixed(2)
      };
    };

    setRiskMetrics(calculateRiskMetrics());
  }, [chartData, selectedSymbol]);

  const calculateMaxDrawdown = (prices) => {
    let maxDrawdown = 0;
    let peak = prices[0];
    
    for (let price of prices) {
      if (price > peak) peak = price;
      const drawdown = (peak - price) / peak * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    return maxDrawdown;
  };

  const calculateBeta = (returns) => {
    // Simplified beta calculation
    return Math.random() * 2 - 1; // -1 to 1
  };

  const calculateCorrelation = (returns) => {
    // Simplified correlation calculation
    return Math.random() * 2 - 1; // -1 to 1
  };

  // Generate trading signals
  useEffect(() => {
    const generateSignals = () => {
      const signals = [];
      const signalTypes = ['BUY', 'SELL', 'HOLD'];
      const strategies = ['Momentum', 'Mean Reversion', 'Arbitrage', 'Statistical Arbitrage'];
      
      for (let i = 0; i < 5; i++) {
        signals.push({
          id: i + 1,
          symbol: selectedSymbol,
          type: signalTypes[Math.floor(Math.random() * signalTypes.length)],
          strategy: strategies[Math.floor(Math.random() * strategies.length)],
          confidence: (Math.random() * 30 + 70).toFixed(1), // 70-100%
          timestamp: new Date(Date.now() - Math.random() * 60000).toISOString(),
          pnl: (Math.random() * 1000 - 500).toFixed(2) // -500 to +500
        });
      }
      
      return signals;
    };

    setTradingSignals(generateSignals());
  }, [selectedSymbol, priceData]);

  // System health monitoring
  useEffect(() => {
    const generateSystemHealth = () => {
      return {
        cpu: (Math.random() * 20 + 60).toFixed(1), // 60-80%
        memory: (Math.random() * 30 + 50).toFixed(1), // 50-80%
        network: (Math.random() * 10 + 90).toFixed(1), // 90-100%
        disk: (Math.random() * 15 + 70).toFixed(1), // 70-85%
        ordersPerSecond: Math.floor(Math.random() * 1000 + 5000), // 5k-6k
        activeConnections: Math.floor(Math.random() * 50 + 100) // 100-150
      };
    };

    setSystemHealth(generateSystemHealth());
  }, [priceData]);

  // Prepare data for charts
  const prepareLatencyChartData = () => {
    return [
      { metric: 'Network', latency: latencyMetrics.networkLatency || 0 },
      { metric: 'Order', latency: latencyMetrics.orderLatency || 0 },
      { metric: 'Market Data', latency: latencyMetrics.marketDataLatency || 0 },
      { metric: 'Total', latency: latencyMetrics.totalLatency || 0 }
    ];
  };

  const prepareSystemHealthData = () => {
    return [
      { component: 'CPU', usage: systemHealth.cpu || 0 },
      { component: 'Memory', usage: systemHealth.memory || 0 },
      { component: 'Network', usage: systemHealth.network || 0 },
      { component: 'Disk', usage: systemHealth.disk || 0 }
    ];
  };

  const getHealthColor = (value) => {
    if (value < 70) return 'text-green-400';
    if (value < 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSignalColor = (type) => {
    switch (type) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSignalIcon = (type) => {
    switch (type) {
      case 'BUY': return <ArrowUpRight size={16} />;
      case 'SELL': return <ArrowDownRight size={16} />;
      default: return <Minus size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          HFT Trading Dashboard
        </h1>
        <p className="text-gray-400">
          High-Frequency Trading System with Real-time Monitoring & Risk Management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Latency</p>
              <p className="text-2xl font-bold text-white">
                {latencyMetrics.totalLatency?.toFixed(1) || '0'}ms
              </p>
            </div>
            <Clock className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Throughput</p>
              <p className="text-2xl font-bold text-white">
                {(latencyMetrics.throughput / 1000)?.toFixed(1) || '0'}k/s
              </p>
            </div>
            <Zap className="text-green-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Uptime</p>
              <p className="text-2xl font-bold text-white">
                {latencyMetrics.uptime?.toFixed(3) || '0'}%
              </p>
            </div>
            <Shield className="text-purple-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Signals</p>
              <p className="text-2xl font-bold text-white">{tradingSignals.length}</p>
            </div>
            <Target className="text-orange-400" size={24} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Book */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Order Book - {selectedSymbol}
          </h2>
          
          <div className="space-y-2">
            {/* Asks (Sell Orders) */}
            <div className="space-y-1">
              <p className="text-red-400 text-sm font-medium">Asks</p>
              {orderBook.asks?.map((ask, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-red-400">{ask.price}</span>
                  <span className="text-gray-400">{ask.size}</span>
                </div>
              ))}
            </div>
            
            <hr className="border-gray-600" />
            
            {/* Bids (Buy Orders) */}
            <div className="space-y-1">
              <p className="text-green-400 text-sm font-medium">Bids</p>
              {orderBook.bids?.map((bid, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-green-400">{bid.price}</span>
                  <span className="text-gray-400">{bid.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latency Monitoring */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="mr-2" size={20} />
            Latency Analysis
          </h2>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={prepareLatencyChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="latency" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Metrics */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            Risk Metrics
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Volatility</span>
              <span className="text-white font-semibold">{riskMetrics.volatility}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VaR (95%)</span>
              <span className="text-white font-semibold">{riskMetrics.var95}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sharpe Ratio</span>
              <span className="text-white font-semibold">{riskMetrics.sharpeRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Drawdown</span>
              <span className="text-white font-semibold">{riskMetrics.maxDrawdown}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Beta</span>
              <span className="text-white font-semibold">{riskMetrics.beta}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Correlation</span>
              <span className="text-white font-semibold">{riskMetrics.correlation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Signals & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Signals */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2" size={20} />
            Trading Signals
          </h2>
          
          <div className="space-y-3">
            {tradingSignals.map((signal) => (
              <div key={signal.id} className="bg-gray-700 rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={getSignalColor(signal.type)}>
                        {getSignalIcon(signal.type)}
                      </span>
                      <span className="text-white font-medium">
                        {signal.symbol} {signal.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{signal.strategy}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{signal.confidence}%</p>
                    <p className={`text-sm ${parseFloat(signal.pnl) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.pnl}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Server className="mr-2" size={20} />
            System Health
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Resource Usage</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={prepareSystemHealthData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="component" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="usage" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded p-3">
                <p className="text-gray-400 text-sm">Orders/sec</p>
                <p className="text-white font-semibold">{systemHealth.ordersPerSecond}</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <p className="text-gray-400 text-sm">Connections</p>
                <p className="text-white font-semibold">{systemHealth.activeConnections}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Price Chart - {selectedSymbol}</h2>
          <select 
            value={selectedSymbol} 
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
          >
            {Object.keys(priceData).map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
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
            <Line 
              type="monotone" 
              dataKey={selectedSymbol} 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HFTDashboard; 