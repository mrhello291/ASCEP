import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Save, Plus, Trash2, Code, Settings } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CEPRules = ({ isConnected }) => {
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    pattern: '',
    action: '',
    conditions: {},
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConditions, setShowConditions] = useState(false);
  const [conditionsText, setConditionsText] = useState('{}');

  // Fetch rules from backend
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/rules`);
        const data = await res.json();
        setRules(data.rules || []);
      } catch (err) {
        setError('Failed to fetch rules');
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  // Add new rule
  const handleSaveRule = async () => {
    if (!newRule.name || !newRule.pattern || !newRule.action) {
      alert('Please provide name, pattern, and action');
      return;
    }

    // Parse conditions if provided
    let conditions = {};
    if (showConditions && conditionsText.trim() !== '{}') {
      try {
        conditions = JSON.parse(conditionsText);
      } catch (err) {
        alert('Invalid JSON in conditions field');
        return;
      }
    }

    const ruleToCreate = {
      ...newRule,
      conditions
    };

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleToCreate)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (data.rule) {
        setRules(rules => [...rules, data.rule]);
        setNewRule({ name: '', pattern: '', action: '', conditions: {}, enabled: true });
        setConditionsText('{}');
        setShowConditions(false);
        setSuccess(`✅ Rule "${data.rule.name}" added successfully`);
        console.log(`✅ Rule "${data.rule.name}" added successfully`);
      }
    } catch (err) {
      console.error('Add rule error:', err);
      setError(`Failed to add rule: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Enable/disable rule
  const handleToggleRule = async (rule) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/rules/${rule.rule_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !rule.enabled })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (data.rule) {
        setRules(rules => rules.map(r => r.rule_id === rule.rule_id ? data.rule : r));
        setSuccess(`✅ Rule ${rule.name} ${!rule.enabled ? 'enabled' : 'disabled'} successfully`);
        console.log(`✅ Rule ${rule.name} ${!rule.enabled ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (err) {
      console.error('Toggle rule error:', err);
      setError(`Failed to ${!rule.enabled ? 'enable' : 'disable'} rule: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete rule
  const handleDeleteRule = async (rule) => {
    if (!window.confirm(`Are you sure you want to delete rule "${rule.name}"?`)) {
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/rules/${rule.rule_id}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      setRules(rules => rules.filter(r => r.rule_id !== rule.rule_id));
      if (selectedRule?.rule_id === rule.rule_id) setSelectedRule(null);
      setSuccess(`✅ Rule "${rule.name}" deleted successfully`);
      console.log(`✅ Rule "${rule.name}" deleted successfully`);
    } catch (err) {
      console.error('Delete rule error:', err);
      setError(`Failed to delete rule: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Save changes to rule (e.g., after editing)
  const handleSaveChanges = async () => {
    if (!selectedRule) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/rules/${selectedRule.rule_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRule)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (data.rule) {
        setRules(rules => rules.map(r => r.rule_id === data.rule.rule_id ? data.rule : r));
        setSuccess(`✅ Rule "${selectedRule.name}" updated successfully`);
        console.log(`✅ Rule "${selectedRule.name}" updated successfully`);
      }
    } catch (err) {
      console.error('Save changes error:', err);
      setError(`Failed to save changes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle editor changes
  const handleEditorChange = (value) => {
    setSelectedRule({ ...selectedRule, pattern: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          CEP Rules Engine
        </h1>
        <p className="text-gray-400">
          Define and manage Complex Event Processing rules
        </p>
      </div>

      {error && (
        <div className="bg-red-800 text-red-200 p-4 rounded-lg flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError('')}
            className="text-red-300 hover:text-red-100 ml-4"
          >
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-800 text-green-200 p-4 rounded-lg flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">Success</p>
            <p className="text-sm">{success}</p>
          </div>
          <button 
            onClick={() => setSuccess('')}
            className="text-green-300 hover:text-green-100 ml-4"
          >
            ✕
          </button>
        </div>
      )}
      
      {loading && (
        <div className="bg-blue-800 text-blue-200 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-200 mr-2"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Rules</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div 
                key={rule.rule_id} 
                className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRule?.rule_id === rule.rule_id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600'
                }`}
                onClick={() => setSelectedRule(rule)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-white">{rule.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rule.enabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{rule.pattern}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Created: {rule.created_at ? new Date(rule.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleToggleRule(rule);
                      }}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        rule.enabled 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleDeleteRule(rule);
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Rule Form */}
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Rule</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Rule Name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Pattern</label>
                <input
                  type="text"
                  value={newRule.pattern}
                  onChange={(e) => setNewRule({...newRule, pattern: e.target.value})}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Pattern (e.g. price_spike)"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Action</label>
                <input
                  type="text"
                  value={newRule.action}
                  onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Action (e.g. create_signal)"
                />
              </div>
              
              {/* Conditions Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showConditions"
                  checked={showConditions}
                  onChange={(e) => setShowConditions(e.target.checked)}
                  className="rounded border-gray-500"
                />
                <label htmlFor="showConditions" className="text-gray-400 text-sm">
                  Add custom conditions (optional)
                </label>
              </div>

              {/* Conditions Field */}
              {showConditions && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Conditions (JSON)</label>
                  <textarea
                    value={conditionsText}
                    onChange={(e) => setConditionsText(e.target.value)}
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none font-mono text-sm"
                    rows={4}
                    placeholder='{"price_change_threshold": 3.0}'
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Example: {'{"price_change_threshold": 3.0}'} for price_spike pattern
                  </p>
                </div>
              )}

              <button
                onClick={handleSaveRule}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                <Plus size={16} />
                <span>Add Rule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rule Editor */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Rule Editor</h2>
            <div className="flex items-center space-x-2">
              <Code size={20} className="text-gray-400" />
              <span className="text-gray-400 text-sm">Monaco Editor</span>
            </div>
          </div>

          {selectedRule ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{selectedRule.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{selectedRule.pattern}</p>
              </div>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <Editor
                  height="400px"
                  defaultLanguage="javascript"
                  value={selectedRule.pattern}
                  theme="vs-dark"
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedRule.enabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {selectedRule.enabled ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ID: {selectedRule.rule_id}
                  </span>
                </div>
                <button
                  onClick={handleSaveChanges}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) :
            <div className="text-center py-12">
              <Settings className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">
                Select a Rule
              </h3>
              <p className="text-gray-400">
                Choose a rule from the list to edit its definition
              </p>
            </div>
          }
        </div>
      </div>

      {/* Rule Templates */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Rule Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Price Spike (3% threshold)</h3>
            <p className="text-gray-400 text-sm mb-2">Name: Price Spike Detection</p>
            <p className="text-gray-400 text-sm mb-2">Pattern: price_spike</p>
            <p className="text-gray-400 text-sm mb-2">Action: create_signal</p>
            <p className="text-gray-400 text-sm mb-2">Conditions: {'{"price_change_threshold": 3.0}'}</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Volume Surge</h3>
            <p className="text-gray-400 text-sm mb-2">Name: High Volume Alert</p>
            <p className="text-gray-400 text-sm mb-2">Pattern: volume_surge</p>
            <p className="text-gray-400 text-sm mb-2">Action: send_alert</p>
            <p className="text-gray-400 text-sm mb-2">Conditions: {'{"volume_threshold": 2000000}'}</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Arbitrage Opportunity</h3>
            <p className="text-gray-400 text-sm mb-2">Name: Arbitrage Detection</p>
            <p className="text-gray-400 text-sm mb-2">Pattern: arbitrage_opportunity</p>
            <p className="text-gray-400 text-sm mb-2">Action: create_signal</p>
            <p className="text-gray-400 text-sm mb-2">Conditions: {'{"spread_threshold": 0.2}'}</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Custom Pattern</h3>
            <p className="text-gray-400 text-sm mb-2">Name: Custom Alert</p>
            <p className="text-gray-400 text-sm mb-2">Pattern: my_custom_pattern</p>
            <p className="text-gray-400 text-sm mb-2">Action: log_event</p>
            <p className="text-gray-400 text-sm mb-2">Conditions: {'{"custom_condition": "BTC"}'}</p>
          </div>
        </div>
      </div>

      {/* Supported Patterns and Actions */}
      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Supported Patterns & Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supported Patterns */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-3">Supported Patterns</h3>
            <div className="space-y-2">
              <div className="bg-gray-700 rounded p-3">
                <code className="text-green-400 font-mono">price_spike</code>
                <p className="text-gray-400 text-sm mt-1">Detects sudden price movements</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-green-400 font-mono">volume_surge</code>
                <p className="text-gray-400 text-sm mt-1">Detects unusual trading volume</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-green-400 font-mono">arbitrage_opportunity</code>
                <p className="text-gray-400 text-sm mt-1">Detects price differences across exchanges</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-green-400 font-mono">trend_reversal</code>
                <p className="text-gray-400 text-sm mt-1">Detects trend direction changes</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-green-400 font-mono">support_resistance</code>
                <p className="text-gray-400 text-sm mt-1">Detects support/resistance level breaks</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-green-400 font-mono">custom_pattern</code>
                <p className="text-gray-400 text-sm mt-1">Your own custom pattern name</p>
              </div>
            </div>
          </div>

          {/* Supported Actions */}
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Supported Actions</h3>
            <div className="space-y-2">
              <div className="bg-gray-700 rounded p-3">
                <code className="text-purple-400 font-mono">create_signal</code>
                <p className="text-gray-400 text-sm mt-1">Creates a trading signal</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-purple-400 font-mono">send_alert</code>
                <p className="text-gray-400 text-sm mt-1">Sends notification alert</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-purple-400 font-mono">log_event</code>
                <p className="text-gray-400 text-sm mt-1">Logs the event to system</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-purple-400 font-mono">trigger_order</code>
                <p className="text-gray-400 text-sm mt-1">Triggers automated order</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-purple-400 font-mono">update_dashboard</code>
                <p className="text-gray-400 text-sm mt-1">Updates dashboard display</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <code className="text-purple-400 font-mono">custom_action</code>
                <p className="text-gray-400 text-sm mt-1">Your own custom action name</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Conditions */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">Common Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <code className="text-yellow-400 font-mono">{"price_change_threshold"}</code>
              <p className="text-gray-400 text-sm mt-1">Percentage threshold for price changes (e.g., 3.0 for 3%)</p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <code className="text-yellow-400 font-mono">{"volume_threshold"}</code>
              <p className="text-gray-400 text-sm mt-1">Minimum volume required (e.g., 2000000)</p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <code className="text-yellow-400 font-mono">{"spread_threshold"}</code>
              <p className="text-gray-400 text-sm mt-1">Minimum spread for arbitrage (e.g., 0.2)</p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <code className="text-yellow-400 font-mono">{"symbol"}</code>
              <p className="text-gray-400 text-sm mt-1">Specific trading pair (e.g., "BTC/USD")</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Pattern Instructions */}
      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Creating Custom Patterns</h2>
        
        <div className="space-y-6">
          {/* Step-by-Step Guide */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-400 mb-3">Step-by-Step Guide</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="text-white font-medium text-start">Choose a Pattern Name</p>
                  <p className="text-gray-400 text-sm">Use a descriptive name like <code className="text-green-400">btc_price_alert</code> or <code className="text-green-400">volume_spike_detection</code></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="text-white font-medium text-start">Select an Action</p>
                  <p className="text-gray-400 text-sm">Choose what happens when your pattern is detected: <code className="text-purple-400">create_signal</code>, <code className="text-purple-400">send_alert</code>, or <code className="text-purple-400">log_event</code></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="text-white font-medium text-start">Define Custom Conditions</p>
                  <p className="text-gray-400 text-sm">Specify the exact conditions that trigger your pattern using JSON format</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                <div>
                  <p className="text-white font-medium text-start">Test Your Rule</p>
                  <p className="text-gray-400 text-sm">Enable the rule and monitor the signals page to see when it triggers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Pattern Examples */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">Custom Pattern Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-gray-800 rounded p-3">
                <h4 className="font-semibold text-white mb-2">BTC Price Alert</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">Pattern:</span> <code className="text-green-400">btc_price_alert</code></p>
                  <p><span className="text-gray-400">Action:</span> <code className="text-purple-400">create_signal</code></p>
                  <p><span className="text-gray-400">Conditions:</span></p>
                  <pre className="text-yellow-400 bg-gray-900 p-2 rounded text-start text-xs overflow-x-auto">
{`{
  "symbol": "BTC/USDT",
  "price_threshold": 50000,
  "direction": "above"
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-gray-800 rounded p-3">
                <h4 className="font-semibold text-white mb-2">Volume Spike Detection</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">Pattern:</span> <code className="text-green-400">volume_spike</code></p>
                  <p><span className="text-gray-400">Action:</span> <code className="text-purple-400">send_alert</code></p>
                  <p><span className="text-gray-400">Conditions:</span></p>
                  <pre className="text-yellow-400 bg-gray-900 p-2 rounded text-xs overflow-x-auto">
{`{
    "volume_threshold": 5000000,
    "timeframe": "5m",
    "symbols": ["ETH/USDT", "BTC/USDT"]
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-gray-800 rounded p-3">
                <h4 className="font-semibold text-white mb-2">Cross-Exchange Arbitrage</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">Pattern:</span> <code className="text-green-400">cross_exchange_arb</code></p>
                  <p><span className="text-gray-400">Action:</span> <code className="text-purple-400">create_signal</code></p>
                  <p><span className="text-gray-400">Conditions:</span></p>
                  <pre className="text-yellow-400 bg-gray-900 text-start p-2 rounded text-xs overflow-x-auto">
{`{
    "exchanges": ["binance", "coinbase"],
    "spread_threshold": 0.5,
    "symbol": "BTC/USDT"
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-gray-800 rounded p-3">
                <h4 className="font-semibold text-white mb-2">Trend Reversal Alert</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">Pattern:</span> <code className="text-green-400">trend_reversal</code></p>
                  <p><span className="text-gray-400">Action:</span> <code className="text-purple-400">log_event</code></p>
                  <p><span className="text-gray-400">Conditions:</span></p>
                  <pre className="text-yellow-400 bg-gray-900 text-start p-2 rounded text-xs overflow-x-auto">
{`{
    "ma_short": 10,
    "ma_long": 50,
    "symbol": "EUR/USD",
    "threshold": 0.1
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Customization */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Advanced Customization</h3>
            <div className="space-y-3">
              <div className='text-start'>
                <p className="text-white font-medium mb-2">Custom Condition Variables</p>
                <p className="text-gray-400 text-sm mb-2">You can use these variables in your conditions:</p>
                <ul className="text-gray-400 text-sm space-y-1 ml-4">
                  <li>• <code className="text-yellow-400">price</code> - Current price of the symbol</li>
                  <li>• <code className="text-yellow-400">volume</code> - Trading volume</li>
                  <li>• <code className="text-yellow-400">spread</code> - Price spread between exchanges</li>
                  <li>• <code className="text-yellow-400">timestamp</code> - Event timestamp</li>
                  <li>• <code className="text-yellow-400">symbol</code> - Trading pair symbol</li>
                </ul>
              </div>
              
              <div className='text-start'>
                <p className="text-white font-medium mb-2">Condition Operators</p>
                <p className="text-gray-400 text-sm mb-2">Supported comparison operators:</p>
                <ul className="text-gray-400 text-sm space-y-1 ml-4">
                  <li>• <code className="text-yellow-400">==</code> - Equal to</li>
                  <li>• <code className="text-yellow-400">!=</code> - Not equal to</li>
                  <li>• <code className="text-yellow-400">&gt;</code> - Greater than</li>
                  <li>• <code className="text-yellow-400">&lt;</code> - Less than</li>
                  <li>• <code className="text-yellow-400">&gt;=</code> - Greater than or equal</li>
                  <li>• <code className="text-yellow-400">&lt;=</code> - Less than or equal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tips and Best Practices */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Tips & Best Practices</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">💡</span>
                <p className="text-gray-400">Start with simple conditions and gradually add complexity</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">💡</span>
                <p className="text-gray-400">Use descriptive pattern names that clearly indicate the purpose</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">💡</span>
                <p className="text-gray-400">Test your rules with small thresholds first to avoid false positives</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">💡</span>
                <p className="text-gray-400">Monitor the signals page to see which rules are triggering most often</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">💡</span>
                <p className="text-gray-400">Use <code className="text-purple-400">log_event</code> action for testing before switching to <code className="text-purple-400">create_signal</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEPRules; 