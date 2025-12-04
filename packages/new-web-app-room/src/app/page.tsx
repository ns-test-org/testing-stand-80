'use client';

import { useEffect, useState } from 'react';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export default function CryptoPriceTracker() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use a more reliable API endpoint with proper headers and error handling
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Add cache busting to avoid stale data
          cache: 'no-cache'
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate the response data structure
      if (!data.bitcoin || !data.ethereum) {
        throw new Error('Invalid response format from API');
      }
      
      // Transform the data to match our interface
      const transformedData: CryptoData[] = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: data.bitcoin?.usd || 0,
          price_change_percentage_24h: data.bitcoin?.usd_24h_change || 0,
          image: '₿'
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          current_price: data.ethereum?.usd || 0,
          price_change_percentage_24h: data.ethereum?.usd_24h_change || 0,
          image: 'Ξ'
        }
      ];
      
      setCryptoData(transformedData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError(err instanceof Error ? err.message : 'Unable to fetch crypto prices');
      
      // Set fallback demo data so the app still shows something useful
      setCryptoData([
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: 43250.00,
          price_change_percentage_24h: 2.45,
          image: '₿'
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          current_price: 2580.50,
          price_change_percentage_24h: -1.23,
          image: 'Ξ'
        }
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading crypto data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={fetchCryptoData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Crypto Price Tracker
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time Bitcoin and Ethereum prices
          </p>
          {lastUpdated && (
            <p className="text-gray-400 text-sm mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Crypto Cards */}
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          {cryptoData.map((crypto) => (
            <div
              key={crypto.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{crypto.image}</div>
                  <div>
                    <h3 className="text-xl font-semibold">{crypto.name}</h3>
                    <p className="text-gray-400 text-sm">{crypto.symbol}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <p className="text-3xl font-bold">{formatPrice(crypto.current_price)}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">24h Change</p>
                  <p className={`text-xl font-semibold ${
                    crypto.price_change_percentage_24h >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchCryptoData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Refresh Prices
          </button>
        </div>
      </div>
    </div>
  );
}


