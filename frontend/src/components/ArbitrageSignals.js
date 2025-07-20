import React from 'react';
import { AlertTriangle, TrendingUp, Clock, DollarSign } from 'lucide-react';

const ArbitrageSignals = ({ signals, isConnected }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatSpread = (spread) => {
    return typeof spread === 'number' ? spread.toFixed(6) : 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Arbitrage Signals
        </h1>
        <p className="text-gray-400">
          Real-time detection of arbitrage opportunities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Total Signals</p>
              <p className="text-2xl font-bold text-white">{signals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-white">
                {signals.filter(s => s.severity === 'high').length}
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
              <p className="text-gray-400 text-sm">Avg Spread</p>
              <p className="text-2xl font-bold text-white">
                {signals.length > 0 
                  ? (signals.reduce((sum, s) => sum + (s.spread || 0), 0) / signals.length).toFixed(6)
                  : '0.000000'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="text-white" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Last Signal</p>
              <p className="text-lg font-semibold text-white">
                {signals.length > 0 
                  ? new Date(signals[0].timestamp).toLocaleTimeString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CEP Rule Statistics */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">CEP Rule Performance</h2>
        
        {(() => {
          // Calculate rule statistics
          const ruleStats = {};
          signals.forEach(signal => {
            if (signal.rule_id) {
              if (!ruleStats[signal.rule_id]) {
                ruleStats[signal.rule_id] = {
                  rule_id: signal.rule_id,
                  rule_name: signal.rule_name || `Rule #${signal.rule_id}`,
                  pattern: signal.pattern || 'Unknown',
                  count: 0,
                  avg_spread: 0,
                  total_spread: 0,
                  last_triggered: null
                };
              }
              ruleStats[signal.rule_id].count++;
              ruleStats[signal.rule_id].total_spread += signal.spread_percentage || 0;
              ruleStats[signal.rule_id].avg_spread = ruleStats[signal.rule_id].total_spread / ruleStats[signal.rule_id].count;
              
              const signalTime = new Date(signal.timestamp);
              if (!ruleStats[signal.rule_id].last_triggered || signalTime > new Date(ruleStats[signal.rule_id].last_triggered)) {
                ruleStats[signal.rule_id].last_triggered = signal.timestamp;
              }
            }
          });

          const ruleStatsArray = Object.values(ruleStats).sort((a, b) => b.count - a.count);

          return ruleStatsArray.length > 0 ? (
            <div className="space-y-4">
              {ruleStatsArray.map((rule, index) => (
                <div key={rule.rule_id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{rule.rule_name}</h3>
                        <p className="text-gray-400 text-sm">Pattern: {rule.pattern}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-400">{rule.count}</p>
                      <p className="text-gray-400 text-sm">signals</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Average Spread</p>
                      <p className="text-lg font-semibold text-white">
                        {rule.avg_spread.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Rule ID</p>
                      <p className="text-lg font-semibold text-white">#{rule.rule_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Last Triggered</p>
                      <p className="text-lg font-semibold text-white">
                        {rule.last_triggered ? new Date(rule.last_triggered).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No CEP Rules Triggered Yet</h3>
              <p className="text-gray-400">
                Create and enable CEP rules to see their performance statistics here
              </p>
            </div>
          );
        })()}
      </div>

      {/* Signals List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Signals</h2>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>

        {signals.length > 0 ? (
          <div className="space-y-4">
            {signals.map((signal, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {signal.type === 'cep_signal' 
                          ? `${signal.rule_name || 'CEP Signal'}`
                          : signal.symbols?.join(' vs ') || 'Arbitrage Opportunity'
                        }
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(signal.severity)}`}>
                        {signal.severity || 'medium'}
                      </span>
                      {signal.type === 'cep_signal' && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                          CEP
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {signal.type === 'cep_signal' ? (
                        <>
                          <div>
                            <p className="text-gray-400 text-sm">Pattern</p>
                            <p className="text-lg font-semibold text-white">
                              {signal.pattern || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Rule ID</p>
                            <p className="text-lg font-semibold text-white">
                              #{signal.rule_id || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Symbol</p>
                            <p className="text-lg font-semibold text-white">
                              {signal.symbols?.[0] || 'Unknown'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-gray-400 text-sm">Spread</p>
                            <p className="text-lg font-semibold text-white">
                              {formatSpread(signal.spread)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Spread %</p>
                            <p className="text-lg font-semibold text-white">
                              {signal.spread_percentage ? `${signal.spread_percentage.toFixed(2)}%` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Type</p>
                            <p className="text-lg font-semibold text-white">
                              {signal.type || 'arbitrage'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* CEP Rule Information */}
                    {signal.rule_id && (
                      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <p className="text-blue-400 text-sm font-medium">Triggered by CEP Rule</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400">Rule Name:</p>
                            <p className="text-white font-medium">{signal.rule_name || `Rule #${signal.rule_id}`}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Pattern:</p>
                            <p className="text-white font-medium">{signal.pattern || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Rule ID:</p>
                            <p className="text-white font-medium">#{signal.rule_id}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Severity:</p>
                            <p className="text-white font-medium">{signal.severity || 'medium'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Detected</p>
                    <p className="text-white">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(signal.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Signals Detected
            </h3>
            <p className="text-gray-400">
              {isConnected 
                ? 'Waiting for arbitrage opportunities...' 
                : 'Please check your connection to the backend'
              }
            </p>
          </div>
        )}
      </div>

      {/* Signal Types */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Signal Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <h3 className="font-semibold text-white">High Priority</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Spread &gt; 0.005 (5 pips) - Immediate action required
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <h3 className="font-semibold text-white">Medium Priority</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Spread &gt; 0.001 (1 pip) - Monitor closely
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <h3 className="font-semibold text-white">Low Priority</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Spread &gt; 0.0005 (0.5 pips) - Informational
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArbitrageSignals; 