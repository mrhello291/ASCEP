import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const PriceFeed = ({ priceData, isConnected }) => {
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(6) : 'N/A';
  };

  const getPriceChange = (price) => {
    // Mock price change for demo
    return Math.random() > 0.5 ? 'up' : 'down';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Price Feeds
        </h1>
        <p className="text-gray-400">
          Real-time market data from multiple sources
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className={`text-lg font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-gray-400">
            {Object.keys(priceData).length} active feeds
          </div>
        </div>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(priceData).map(([symbol, data]) => {
          const priceChange = getPriceChange(data.price);
          return (
            <div key={symbol} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{symbol}</h3>
                    <p className="text-gray-400 text-sm">Live Price</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${
                  priceChange === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {priceChange === 'up' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <p className="text-2xl font-bold text-white">
                    {formatPrice(data.price)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Last Update</p>
                  <p className="text-white">
                    {new Date(data.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(priceData).length === 0 && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Price Data Available
          </h3>
          <p className="text-gray-400">
            {isConnected 
              ? 'Waiting for price feed data...' 
              : 'Please check your connection to the backend'
            }
          </p>
        </div>
      )}

      {/* Feed Sources */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Data Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Mock Feed</h3>
            <p className="text-gray-400 text-sm">Simulated price data for testing</p>
            <div className="mt-2">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Binance WebSocket</h3>
            <p className="text-gray-400 text-sm">Real-time crypto price feeds</p>
            <div className="mt-2">
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              <span className="text-gray-400 text-sm">Configured</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Alpha Vantage</h3>
            <p className="text-gray-400 text-sm">Forex and stock market data</p>
            <div className="mt-2">
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              <span className="text-gray-400 text-sm">Configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceFeed; 