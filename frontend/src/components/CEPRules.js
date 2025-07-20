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
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      const data = await res.json();
      if (data.rule) setRules(rules => [...rules, data.rule]);
      setNewRule({ name: '', pattern: '', action: '', conditions: {}, enabled: true });
    } catch (err) {
      setError('Failed to add rule');
    } finally {
      setLoading(false);
    }
  };

  // Enable/disable rule
  const handleToggleRule = async (rule) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rules/${rule.rule_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !rule.enabled })
      });
      const data = await res.json();
      if (data.rule) setRules(rules => rules.map(r => r.rule_id === rule.rule_id ? data.rule : r));
    } catch (err) {
      setError('Failed to update rule');
    } finally {
      setLoading(false);
    }
  };

  // Delete rule
  const handleDeleteRule = async (rule) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/rules/${rule.rule_id}`, { method: 'DELETE' });
      setRules(rules => rules.filter(r => r.rule_id !== rule.rule_id));
      if (selectedRule?.rule_id === rule.rule_id) setSelectedRule(null);
    } catch (err) {
      setError('Failed to delete rule');
    } finally {
      setLoading(false);
    }
  };

  // Save changes to rule (e.g., after editing)
  const handleSaveChanges = async () => {
    if (!selectedRule) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rules/${selectedRule.rule_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRule)
      });
      const data = await res.json();
      if (data.rule) setRules(rules => rules.map(r => r.rule_id === data.rule.rule_id ? data.rule : r));
    } catch (err) {
      setError('Failed to save changes');
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

      {error && <div className="bg-red-800 text-red-200 p-2 rounded">{error}</div>}
      {loading && <div className="text-gray-400">Loading...</div>}

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
            <h3 className="font-semibold text-white mb-2">Basic Arbitrage</h3>
            <pre className="text-gray-300 text-sm bg-gray-800 p-3 rounded overflow-x-auto">
{`IF price('EUR/USD') - price('USD/EUR') > 0.001 
THEN ARBITRAGE_SIGNAL`}
            </pre>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Volume Threshold</h3>
            <pre className="text-gray-300 text-sm bg-gray-800 p-3 rounded overflow-x-auto">
{`IF volume('EUR/USD') > 1000000 AND 
   price('EUR/USD') > 1.1000 
THEN HIGH_VOLUME_SIGNAL`}
            </pre>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Price Movement</h3>
            <pre className="text-gray-300 text-sm bg-gray-800 p-3 rounded overflow-x-auto">
{`IF price_change('EUR/USD', '5m') > 0.005 
THEN PRICE_SPIKE_SIGNAL`}
            </pre>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Cross-Pair Correlation</h3>
            <pre className="text-gray-300 text-sm bg-gray-800 p-3 rounded overflow-x-auto">
{`IF correlation('EUR/USD', 'GBP/USD') > 0.8 
THEN CORRELATION_SIGNAL`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEPRules; 