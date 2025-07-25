import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import PriceFeed from './components/PriceFeed';
import Visualizations from './components/Visualizations';
import CurrencyConverter from './components/CurrencyConverter';
import MarketComparison from './components/MarketComparison';
import HFTDashboard from './components/HFTDashboard';
import ArbitrageSignals from './components/ArbitrageSignals';
import CEPRules from './components/CEPRules';
import Navigation from './components/Navigation';
import './App.css';

console.log(process.env.REACT_APP_API_URL);

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [priceData, setPriceData] = useState({});
  const [signals, setSignals] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});

  useEffect(() => {
    // Initialize Socket.IO connection
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to ASCEP backend');
      setIsConnected(true);
      
      // Subscribe to price updates
      newSocket.emit('subscribe_prices', { symbols: ['EUR/USD', 'USD/EUR', 'GBP/USD'] });
      
      // Subscribe to arbitrage signals
      newSocket.emit('subscribe_signals');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from ASCEP backend');
      setIsConnected(false);
    });

    newSocket.on('price_update', (data) => {
      setPriceData(prev => ({
        ...prev,
        [data.symbol]: {
          price: data.price,
          timestamp: data.timestamp
        }
      }));
    });

    newSocket.on('arbitrage_signal', (signal) => {
      setSignals(prev => [signal, ...prev.slice(0, 49)]); // Keep last 50 signals
    });

    // Listen for system status updates via WebSocket
    newSocket.on('system_status', (status) => {
      setSystemStatus(status);
    });

    newSocket.on('connected', (data) => {
      console.log('Backend message:', data.message);
    });

    newSocket.on('subscription_confirmed', (data) => {
      console.log('Subscription confirmed:', data);
    });

    // Fetch initial data (bootstrapping)
    fetchInitialData();

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const fetchSignals = async () => {
    try {
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const signalsResponse = await fetch(`${backendUrl}/api/signals`);
      const signalsData = await signalsResponse.json();
      setSignals(signalsData.signals || []);
    } catch (error) {
      console.error('Error fetching signals:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const healthResponse = await fetch(`${backendUrl}/api/health`);
      const healthData = await healthResponse.json();
      setSystemStatus(healthData);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Fetch current prices
      const pricesResponse = await fetch(`${backendUrl}/api/prices`);
      const pricesData = await pricesResponse.json();
      setPriceData(pricesData.prices || {});

      // Fetch recent signals
      const signalsResponse = await fetch(`${backendUrl}/api/signals`);
      const signalsData = await signalsResponse.json();
      setSignals(signalsData.signals || []);

      // Fetch system status
      const healthResponse = await fetch(`${backendUrl}/api/health`);
      const healthData = await healthResponse.json();
      setSystemStatus(healthData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  return (
    <Router>
      <div className="App bg-gray-900 text-white min-h-screen">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151'
            }
          }}
        />
        
        <Navigation isConnected={isConnected} systemStatus={systemStatus} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  priceData={priceData}
                  signals={signals}
                  isConnected={isConnected}
                  systemStatus={systemStatus}
                />
              } 
            />
            <Route 
              path="/prices" 
              element={
                <PriceFeed 
                  priceData={priceData}
                  isConnected={isConnected}
                />
              } 
            />
            <Route 
              path="/visualizations" 
              element={
                <Visualizations 
                  priceData={priceData}
                  isConnected={isConnected}
                />
              } 
            />
            <Route 
              path="/converter" 
              element={
                <CurrencyConverter 
                  priceData={priceData}
                  isConnected={isConnected}
                />
              } 
            />
            <Route 
              path="/comparison" 
              element={
                <MarketComparison 
                  priceData={priceData}
                  isConnected={isConnected}
                />
              } 
            />
            <Route 
              path="/hft" 
              element={
                <HFTDashboard 
                  priceData={priceData}
                  isConnected={isConnected}
                />
              } 
            />
            <Route 
              path="/signals" 
              element={
                <ArbitrageSignals 
                  signals={signals}
                  isConnected={isConnected}
                />
              } 
            />
            <Route 
              path="/rules" 
              element={
                <CEPRules 
                  isConnected={isConnected}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 