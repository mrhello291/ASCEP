import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, RefreshCw, TrendingUp, TrendingDown, 
  Calculator, Coins, DollarSign, Zap, Target, BarChart3, Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CurrencyConverter = ({ priceData, isConnected }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [conversionHistory, setConversionHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPair, setSelectedPair] = useState('USD/EUR');
  const [timeframe, setTimeframe] = useState('1h');

  // Get all available currencies and cryptos
  const getAllCurrencies = () => {
    const currencies = [];
    Object.keys(priceData).forEach(symbol => {
      if (symbol.includes('/')) {
        // Forex pairs
        const [base, quote] = symbol.split('/');
        if (!currencies.includes(base)) currencies.push(base);
        if (!currencies.includes(quote)) currencies.push(quote);
      } else if (symbol.includes('USDT')) {
        // Crypto pairs
        const crypto = symbol.replace('USDT', '');
        if (!currencies.includes(crypto)) currencies.push(crypto);
        if (!currencies.includes('USDT')) currencies.push('USDT');
      }
    });
    return currencies.sort();
  };

  const currencies = getAllCurrencies();

  // Calculate conversion rate
  useEffect(() => {
    if (!priceData || !fromCurrency || !toCurrency) return;

    let rate = 0;
    
    // Direct conversion if available
    if (fromCurrency === toCurrency) {
      rate = 1;
    } else if (priceData[`${fromCurrency}/${toCurrency}`]) {
      rate = priceData[`${fromCurrency}/${toCurrency}`].price;
    } else if (priceData[`${toCurrency}/${fromCurrency}`]) {
      rate = 1 / priceData[`${toCurrency}/${fromCurrency}`].price;
    } else {
      // Cross-currency conversion via USD
      let fromRate = 1;
      let toRate = 1;
      
      if (fromCurrency === 'USD') {
        fromRate = 1;
      } else if (priceData[`${fromCurrency}/USD`]) {
        fromRate = priceData[`${fromCurrency}/USD`].price;
      } else if (priceData[`USD/${fromCurrency}`]) {
        fromRate = 1 / priceData[`USD/${fromCurrency}`].price;
      } else if (priceData[`${fromCurrency}USDT`]) {
        fromRate = priceData[`${fromCurrency}USDT`].price;
      }
      
      if (toCurrency === 'USD') {
        toRate = 1;
      } else if (priceData[`${toCurrency}/USD`]) {
        toRate = priceData[`${toCurrency}/USD`].price;
      } else if (priceData[`USD/${toCurrency}`]) {
        toRate = 1 / priceData[`USD/${toCurrency}`].price;
      } else if (priceData[`${toCurrency}USDT`]) {
        toRate = priceData[`${toCurrency}USDT`].price;
      }
      
      rate = toRate / fromRate;
    }

    setConversionRate(rate);
    setConvertedAmount(amount * rate);

    // Add to conversion history
    if (rate > 0) {
      const newConversion = {
        from: fromCurrency,
        to: toCurrency,
        amount: amount,
        converted: amount * rate,
        rate: rate,
        timestamp: new Date().toISOString(),
        pair: `${fromCurrency}/${toCurrency}`
      };
      
      setConversionHistory(prev => [newConversion, ...prev.slice(0, 9)]);
    }
  }, [fromCurrency, toCurrency, amount, priceData]);

  // Get price change percentage (mock for now)
  const getPriceChange = (symbol) => {
    return Math.random() * 10 - 5; // Random change between -5% and +5%
  };

  // Prepare data for charts
  const prepareConversionChartData = () => {
    return conversionHistory.map((conversion, index) => ({
      time: new Date(conversion.timestamp).toLocaleTimeString(),
      rate: conversion.rate,
      amount: conversion.amount,
      converted: conversion.converted
    }));
  };

  // Get popular currency pairs
  const getPopularPairs = () => {
    const pairs = [];
    Object.keys(priceData).forEach(symbol => {
      if (symbol.includes('/') || symbol.includes('USDT')) {
        pairs.push(symbol);
      }
    });
    return pairs.slice(0, 8); // Top 8 pairs
  };

  const popularPairs = getPopularPairs();

  // Calculate arbitrage opportunities
  /**
 * Calculate top N triangular arbitrage opportunities, removing duplicates (rotations/reversals).
 * @param {string[]} currencies - Array of currency codes, e.g. ['EUR', 'USD', 'JPY']
 * @param {function(string,string): number} getRate - Function returning exchange rate from currency1 to currency2
 * @param {object} options
 * @param {number} options.threshold - Minimum profit percentage to consider (e.g. 0.1 for 0.1%)
 * @param {number} options.topN - Number of top opportunities to return
 * @returns {Array<{path: string, profit: number, rates: number[]}>}
 */
  function calculateArbitrage(currencies, getRate, options = {}) {
    const { threshold = 0.1, topN = 5 } = options;
    const opportunities = [];
    const seen = new Set();

    // Helper to canonicalize a cycle (ignoring rotations and direction)
    function canonicalCycle([a, b, c]) {
      const variants = [
        [a, b, c],
        [b, c, a],
        [c, a, b]
      ].map(arr => arr.join('→'));
      const rev = [c, b, a];
      const revVariants = [
        [c, b, a],
        [b, a, c],
        [a, c, b]
      ].map(arr => arr.join('→'));
      return Math.min(...variants.concat(revVariants));
    }

    currencies.forEach(c1 => {
      currencies.forEach(c2 => {
        currencies.forEach(c3 => {
          if (c1 === c2 || c2 === c3 || c1 === c3) return;

          // canonical key to avoid duplicates
          const key = canonicalCycle([c1, c2, c3]);
          if (seen.has(key)) return;
          seen.add(key);

          const rate1 = getRate(c1, c2);
          const rate2 = getRate(c2, c3);
          const rate3 = getRate(c3, c1);
          if (rate1 <= 0 || rate2 <= 0 || rate3 <= 0) return;

          const profit = (rate1 * rate2 * rate3 - 1) * 100;
          if (profit > threshold) {
            opportunities.push({
              path: `${c1}→${c2}→${c3}→${c1}`,
              profit,
              rates: [rate1, rate2, rate3]
            });
          }
        });
      });
    });

    // Sort by descending profit and return top N
    return opportunities
      .sort((a, b) => b.profit - a.profit)
      .slice(0, topN);
  }

  const getRate = (from, to) => {
    if (from === to) return 1;
    
    if (priceData[`${from}/${to}`]) {
      return priceData[`${from}/${to}`].price;
    } else if (priceData[`${to}/${from}`]) {
      return 1 / priceData[`${to}/${from}`].price;
    } else if (priceData[`${from}USDT`] && priceData[`${to}USDT`]) {
      return priceData[`${to}USDT`].price / priceData[`${from}USDT`].price;
    }
    
    return 0;
  };

  const arbitrageOpportunities = calculateArbitrage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Real-Time Currency Converter
        </h1>
        <p className="text-gray-400">
          Advanced conversion tool with arbitrage detection and market analysis
        </p>
      </div>

      {/* Main Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Converter Interface */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Calculator className="mr-2" size={20} />
            Currency Converter
          </h2>
          
          <div className="space-y-4">
            {/* From Currency */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">From</label>
              <div className="flex gap-2">
                <select 
                  value={fromCurrency} 
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                  placeholder="Amount"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setFromCurrency(toCurrency);
                  setToCurrency(fromCurrency);
                }}
                className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="text-white" size={20} />
              </button>
            </div>

            {/* To Currency */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">To</label>
              <div className="flex gap-2">
                <select 
                  value={toCurrency} 
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
                <div className="flex-1 bg-gray-700 text-white px-3 py-2 rounded flex items-center">
                  <span className="font-semibold">
                    {convertedAmount.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Exchange Rate</p>
              <p className="text-white font-semibold">
                1 {fromCurrency} = {conversionRate.toFixed(6)} {toCurrency}
              </p>
              <p className="text-gray-400 text-sm">
                1 {toCurrency} = {(1 / conversionRate).toFixed(6)} {fromCurrency}
              </p>
            </div>
          </div>
        </div>

        {/* Popular Pairs */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Popular Pairs
          </h2>
          
          <div className="space-y-3">
            {popularPairs.map(pair => {
              const data = priceData[pair];
              const change = getPriceChange(pair);
              return (
                <div key={pair} className="bg-gray-700 rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{pair}</p>
                    <p className="text-gray-400 text-sm">
                      {data ? parseFloat(data.price).toFixed(4) : 'N/A'}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-sm">{Math.abs(change).toFixed(2)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          {/* <h2 className="text-xl font-semibold text-white flex items-center">
            <Zap className="mr-2" size={20} />
            Advanced Features
          </h2> */}
          {/* <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-400 hover:text-blue-300"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button> */}
        </div>

        <div className="space-y-6">
          {/* Conversion History Chart */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Conversion History</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={prepareConversionChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Arbitrage Opportunities */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Target className="mr-2" size={18} />
              Arbitrage Opportunities
            </h3>
            {arbitrageOpportunities.length > 0 ? (
              <div className="space-y-2">
                {arbitrageOpportunities.map((opp, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{opp.path}</p>
                        <p className="text-gray-400 text-sm">
                          Rates: {opp.rates.map(r => r.toFixed(4)).join(' × ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">
                          +{opp.profit.toFixed(3)}%
                        </p>
                        <p className="text-gray-400 text-sm">Profit</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-700 rounded p-4 text-center">
                <p className="text-gray-400">No significant arbitrage opportunities detected</p>
              </div>
            )}
          </div>

          {/* Market Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <BarChart3 className="mr-2" size={18} />
              Market Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded p-3">
                <p className="text-gray-400 text-sm">Total Pairs</p>
                <p className="text-white font-semibold text-xl">{Object.keys(priceData).length}</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <p className="text-gray-400 text-sm">Active Currencies</p>
                <p className="text-white font-semibold text-xl">{currencies.length}</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <p className="text-gray-400 text-sm">Conversion Rate</p>
                <p className="text-white font-semibold text-xl">
                  {conversionRate > 0 ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Conversions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="mr-2" size={20} />
          Recent Conversions
        </h2>
        
        <div className="space-y-3">
          {conversionHistory.map((conversion, index) => (
            <div key={index} className="bg-gray-700 rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">
                    {conversion.amount} {conversion.from} → {conversion.converted.toFixed(6)} {conversion.to}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Rate: {conversion.rate.toFixed(6)} | {new Date(conversion.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">
                    {conversion.pair}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter; 