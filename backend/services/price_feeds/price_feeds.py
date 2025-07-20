"""
ASCEP Data Ingestion - Price Feed Connectors
Multi-source price feed integration for real-time market data
"""

import os
import json
import time
import logging
import asyncio
import websocket
import requests
from datetime import datetime
from typing import Dict, List, Callable
import threading
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PriceFeed:
    """Base class for price feed connectors"""
    
    def __init__(self, name: str, symbols: List[str]):
        self.name = name
        self.symbols = symbols
        self.is_connected = False
        self.last_prices = {}
        self.callbacks = []
        
    def add_callback(self, callback: Callable):
        """Add callback for price updates"""
        self.callbacks.append(callback)
    
    def notify_callbacks(self, symbol: str, price: float, timestamp: str):
        """Notify all callbacks with price update"""
        for callback in self.callbacks:
            try:
                callback(symbol, price, timestamp)
            except Exception as e:
                logger.error(f"Error in callback: {e}")
    
    def connect(self):
        """Connect to price feed"""
        raise NotImplementedError
    
    def disconnect(self):
        """Disconnect from price feed"""
        raise NotImplementedError

class BinanceWebSocketFeed(PriceFeed):
    """Binance WebSocket price feed connector"""
    
    def __init__(self, symbols: List[str]):
        super().__init__("Binance", symbols)
        self.ws = None
        self.ws_thread = None
        
    def connect(self):
        """Connect to Binance WebSocket"""
        try:
            # Convert symbols to Binance format (e.g., EUR/USD -> EURUSDT)
            binance_symbols = []
            for symbol in self.symbols:
                if '/' in symbol:
                    binance_symbol = symbol.replace('/', '').lower()
                    binance_symbols.append(binance_symbol)
                else:
                    binance_symbols.append(symbol.lower())
            
            # Create WebSocket URL - use combined streams endpoint for better performance
            streams = [f"{symbol}@ticker" for symbol in binance_symbols]
            
            # If we have too many streams, use the combined streams endpoint
            if len(streams) > 5:
                # Use the combined streams endpoint which is more efficient
                ws_url = f"wss://stream.binance.com:9443/stream?streams={'/'.join(streams)}"
            else:
                # For fewer streams, use the regular endpoint
                ws_url = f"wss://stream.binance.com:9443/ws/{'/'.join(streams)}"
            
            logger.info(f"Connecting to Binance WebSocket with {len(streams)} streams")
            logger.info(f"WebSocket URL length: {len(ws_url)} characters")
            
            # Check if URL is too long (should be under 2048 characters for most servers)
            if len(ws_url) > 2000:
                logger.warning(f"WebSocket URL is very long ({len(ws_url)} chars). Consider reducing number of symbols.")
            
            # Create WebSocket connection
            self.ws = websocket.WebSocketApp(
                ws_url,
                on_open=self.on_open,
                on_message=self.on_message,
                on_error=self.on_error,
                on_close=self.on_close
            )
            
            # Start WebSocket in separate thread
            self.ws_thread = threading.Thread(target=self.ws.run_forever)
            self.ws_thread.daemon = True
            self.ws_thread.start()
            
            self.is_connected = True
            logger.info("Connected to Binance WebSocket")
            
        except Exception as e:
            logger.error(f"Error connecting to Binance: {e}")
            self.is_connected = False
    
    def disconnect(self):
        """Disconnect from Binance WebSocket"""
        if self.ws:
            self.ws.close()
        self.is_connected = False
        logger.info("Disconnected from Binance WebSocket")
    
    def on_open(self, ws):
        """WebSocket open handler"""
        logger.info("Binance WebSocket opened")
    
    def on_message(self, ws, message):
        """WebSocket message handler"""
        try:
            data = json.loads(message)
            
            # Handle combined streams format (data is wrapped in a 'data' field)
            if 'data' in data:
                data = data['data']
            
            if 's' in data and 'c' in data:  # Symbol and close price
                symbol = data['s']
                price = float(data['c'])
                timestamp = datetime.utcnow().isoformat()
                
                # Convert back to standard format (e.g., EURUSDT -> EUR/USD)
                if len(symbol) == 6 and symbol.endswith('USDT'):
                    base = symbol[:3]
                    quote = symbol[3:6]
                    standard_symbol = f"{base}/{quote}"
                else:
                    standard_symbol = symbol
                
                self.last_prices[standard_symbol] = price
                self.notify_callbacks(standard_symbol, price, timestamp)
                
        except Exception as e:
            logger.error(f"Error processing Binance message: {e}")
            logger.debug(f"Raw message: {message}")
    
    def on_error(self, ws, error):
        """WebSocket error handler"""
        logger.error(f"Binance WebSocket error: {error}")
        self.is_connected = False
    
    def on_close(self, ws, close_status_code, close_msg):
        """WebSocket close handler"""
        logger.info("Binance WebSocket closed")
        self.is_connected = False

class AlphaVantageFeed(PriceFeed):
    """Alpha Vantage REST API price feed connector"""
    
    def __init__(self, symbols: List[str], api_key: str = None):
        super().__init__("Alpha Vantage", symbols)
        self.api_key = api_key or os.getenv('ALPHA_VANTAGE_API_KEY')
        self.base_url = "https://www.alphavantage.co/query"
        self.update_interval = 60  # 60 seconds (free tier limit)
        self.update_thread = None
        
    def connect(self):
        """Connect to Alpha Vantage API"""
        if not self.api_key:
            logger.error("Alpha Vantage API key not provided")
            return
        
        logger.info("Starting Alpha Vantage price feed")
        self.is_connected = True
        
        # Start update thread
        self.update_thread = threading.Thread(target=self._update_loop)
        self.update_thread.daemon = True
        self.update_thread.start()
    
    def disconnect(self):
        """Disconnect from Alpha Vantage API"""
        self.is_connected = False
        logger.info("Stopped Alpha Vantage price feed")
    
    def _update_loop(self):
        """Main update loop"""
        while self.is_connected:
            try:
                for symbol in self.symbols:
                    self._fetch_price(symbol)
                
                # Wait for next update
                time.sleep(self.update_interval)
                
            except Exception as e:
                logger.error(f"Error in Alpha Vantage update loop: {e}")
                time.sleep(10)  # Wait before retry
    
    def _fetch_price(self, symbol: str):
        """Fetch price for a symbol"""
        try:
            # Convert symbol format (e.g., EUR/USD -> EURUSD)
            fx_symbol = symbol.replace('/', '')
            
            params = {
                'function': 'CURRENCY_EXCHANGE_RATE',
                'from_currency': fx_symbol[:3],
                'to_currency': fx_symbol[3:6],
                'apikey': self.api_key
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'Realtime Currency Exchange Rate' in data:
                rate_data = data['Realtime Currency Exchange Rate']
                price = float(rate_data['5. Exchange Rate'])
                timestamp = rate_data['6. Last Refreshed']
                
                self.last_prices[symbol] = price
                self.notify_callbacks(symbol, price, timestamp)
                
        except Exception as e:
            logger.error(f"Error fetching price for {symbol}: {e}")

class MockPriceFeed(PriceFeed):
    """Mock price feed for testing and development"""
    
    def __init__(self, symbols: List[str]):
        super().__init__("Mock", symbols)
        self.update_thread = None
        
        # Initialize with mock prices
        for symbol in symbols:
            if 'EUR/USD' in symbol:
                self.last_prices[symbol] = 1.0850
            elif 'USD/EUR' in symbol:
                self.last_prices[symbol] = 0.9217
            elif 'GBP/USD' in symbol:
                self.last_prices[symbol] = 1.2650
            else:
                self.last_prices[symbol] = 1.0000
    
    def connect(self):
        """Start mock price feed"""
        logger.info("Starting mock price feed")
        self.is_connected = True
        
        # Start update thread
        self.update_thread = threading.Thread(target=self._update_loop)
        self.update_thread.daemon = True
        self.update_thread.start()
    
    def disconnect(self):
        """Stop mock price feed"""
        self.is_connected = False
        logger.info("Stopped mock price feed")
    
    def _update_loop(self):
        """Mock price update loop"""
        import random
        
        while self.is_connected:
            try:
                for symbol in self.symbols:
                    # Generate random price movement
                    current_price = self.last_prices.get(symbol, 1.0000)
                    change = random.uniform(-0.001, 0.001)  # Small random change
                    new_price = current_price + change
                    
                    # Ensure price stays reasonable
                    if 'EUR/USD' in symbol:
                        new_price = max(1.0500, min(1.1200, new_price))
                    elif 'USD/EUR' in symbol:
                        new_price = max(0.8900, min(0.9500, new_price))
                    elif 'GBP/USD' in symbol:
                        new_price = max(1.2000, min(1.3300, new_price))
                    
                    timestamp = datetime.utcnow().isoformat()
                    self.last_prices[symbol] = new_price
                    self.notify_callbacks(symbol, new_price, timestamp)
                
                # No sleep - run as fast as possible for real-time performance
                
            except Exception as e:
                logger.error(f"Error in mock update loop: {e}")
                time.sleep(0.1)  # Minimal sleep on error to prevent infinite loops

class PriceFeedManager:
    """Manager for multiple price feeds"""
    
    def __init__(self):
        self.feeds = {}
        self.price_callbacks = []
        
    def add_feed(self, feed: PriceFeed):
        """Add a price feed"""
        self.feeds[feed.name] = feed
        feed.add_callback(self._on_price_update)
        logger.info(f"Added price feed: {feed.name}")
    
    def remove_feed(self, feed_name: str):
        """Remove a price feed"""
        if feed_name in self.feeds:
            self.feeds[feed_name].disconnect()
            del self.feeds[feed_name]
            logger.info(f"Removed price feed: {feed_name}")
    
    def connect_all(self):
        """Connect to all price feeds"""
        for feed in self.feeds.values():
            feed.connect()
    
    def disconnect_all(self):
        """Disconnect from all price feeds"""
        for feed in self.feeds.values():
            feed.disconnect()
    
    def add_price_callback(self, callback: Callable):
        """Add callback for price updates from any feed"""
        self.price_callbacks.append(callback)
    
    def _on_price_update(self, symbol: str, price: float, timestamp: str):
        """Handle price updates from feeds"""
        for callback in self.price_callbacks:
            try:
                callback(symbol, price, timestamp)
            except Exception as e:
                logger.error(f"Error in price callback: {e}")
    
    def get_all_prices(self) -> Dict[str, float]:
        """Get all current prices from all feeds"""
        all_prices = {}
        for feed in self.feeds.values():
            all_prices.update(feed.last_prices)
        return all_prices
    
    def get_feed_status(self) -> Dict[str, bool]:
        """Get connection status of all feeds"""
        return {name: feed.is_connected for name, feed in self.feeds.items()}

# Example usage
if __name__ == "__main__":
    # Create price feed manager
    manager = PriceFeedManager()
    
    # Add mock feed for testing
    mock_feed = MockPriceFeed(['EUR/USD', 'USD/EUR', 'GBP/USD'])
    manager.add_feed(mock_feed)
    
    # Add callback to print price updates
    def print_price_update(symbol, price, timestamp):
        print(f"{timestamp} - {symbol}: {price}")
    
    manager.add_price_callback(print_price_update)
    
    # Connect and run
    manager.connect_all()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        manager.disconnect_all()
        print("Stopped price feeds") 