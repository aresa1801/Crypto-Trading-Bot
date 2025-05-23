// frontend/src/App.js
import React, { useEffect, useState } from 'react';

function App() {
  const [tokens, setTokens] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [exchangeData, setExchangeData] = useState({
    exchange: '',
    apiKey: '',
    secretKey: ''
  });
  const [notification, setNotification] = useState(null);
  const [lang, setLang] = useState('en');

  // Teks dalam dua bahasa
  const texts = {
    en: {
      title: "Aresa Crypto Trading",
      manualMode: "Manual Trading Mode",
      connectExchange: "Connect Exchange",
      tradeHistory: "Trade History"
    },
    id: {
      title: "Aresa Crypto Trading",
      manualMode: "Trading Manual",
      connectExchange: "Hubungkan Exchange",
      tradeHistory: "Riwayat Transaksi"
    }
  };

  const t = texts[lang];

  // Ambil data token & riwayat
  useEffect(() => {
    fetch('/api/tokens/manual')
      .then(res => res.json())
      .then(data => setTokens(data))
      .catch(err => console.error('Gagal ambil token:', err));

    fetch('/api/trade/history')
      .then(res => res.json())
      .then(data => setTradeHistory(data));
  }, []);

  // Handler form exchange
  const handleExchangeChange = (e) => {
    const { name, value } = e.target;
    setExchangeData((prev) => ({ ...prev, [name]: value }));
  };

  // Kirim ke backend
  const handleConnectExchange = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/exchange/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exchangeData)
      });

      const result = await res.json();

      if (result.status === 'success') {
        showNotification('Berhasil terhubung ke exchange.');
      } else {
        showNotification('Gagal terhubung ke exchange.', 'error');
      }

    } catch (err) {
      showNotification('Koneksi ke exchange gagal.', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Warna berdasarkan signal
  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'bg-green-100 text-green-800';
      case 'SELL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifikasi Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded shadow-lg z-50 transform transition-all duration-300 ease-in-out ${
          notification.type === 'error' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-blue-100 text-blue-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl mr-2">📘</span>
          <h1 className="text-xl font-semibold">{t.title}</h1>
        </div>
        <div className="space-x-2">
          <button onClick={() => setLang('en')} className="bg-white px-3 py-1 rounded hover:bg-blue-200">ENG</button>
          <button onClick={() => setLang('id')} className="bg-white px-3 py-1 rounded hover:bg-blue-200">IND</button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Profil Pengguna */}
        <section className="mb-8">
          <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">👤 Profil Pengguna</h2>
            <ul className="space-y-2 text-sm">
              <li><strong>Nama:</strong> Rahadhyan</li>
              <li><strong>Exchange Terhubung:</strong> MeXC</li>
              <li><strong>Login Terakhir:</strong> 2 menit lalu</li>
              <li><strong>Total Profit/Loss:</strong> <span className="font-bold text-green-600">+$2,500</span></li>
            </ul>
          </div>
        </section>

        {/* Token List */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t.manualMode}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.slice(0, 5).map((token, idx) => (
              <div key={idx} className={`p-4 rounded shadow hover:shadow-md transition-shadow ${getSignalColor(token.signal)} border border-opacity-20 border-gray-500`}>
                <h3 className="font-bold">{token.name}</h3>
                <p className="text-sm mt-1">Symbol: <strong>{token.symbol?.toUpperCase()}</strong></p>
                <p>Harga: <span className="font-mono">${token.current_price?.toLocaleString() || 'N/A'}</span></p>
                <p>Signal: <span className="font-semibold">{token.signal || 'HOLD'}</span></p>
              </div>
            ))}
          </div>
        </section>

        {/* Form Input Exchange */}
        <section className="mb-8">
          <div className="bg-white shadow rounded-lg p-6 max-w-lg mx-auto border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">{t.connectExchange}</h2>
            <form onSubmit={handleConnectExchange}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Exchange</label>
                <select
                  name="exchange"
                  value={exchangeData.exchange}
                  onChange={handleExchangeChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">Pilih Exchange</option>
                  <option value="binance">Binance</option>
                  <option value="mexc">MeXC</option>
                  <option value="kucoin">KuCoin</option>
                  <option value="bybit">Bybit</option>
                  <option value="gateio">Gate.io</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="text"
                  name="apiKey"
                  value={exchangeData.apiKey}
                  onChange={handleExchangeChange}
                  placeholder="Masukkan API Key"
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Secret Key</label>
                <input
                  type="text"
                  name="secretKey"
                  value={exchangeData.secretKey}
                  onChange={handleExchangeChange}
                  placeholder="Masukkan Secret Key"
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Hubungkan
              </button>
            </form>
          </div>
        </section>

        {/* Riwayat Transaksi */}
        <section>
          <h2 className="text-lg font-semibold mb-4">{t.tradeHistory}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-blue-50 text-blue-800">
                <tr>
                  <th className="py-2 px-4 text-left">Waktu</th>
                  <th className="py-2 px-4 text-left">Aksi</th>
                  <th className="py-2 px-4 text-left">Token</th>
                  <th className="py-2 px-4 text-left">Jumlah</th>
                  <th className="py-2 px-4 text-left">Harga</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.length > 0 ? (
                  tradeHistory.map((trade, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-t border-b">{new Date(trade.timestamp).toLocaleString()}</td>
                      <td className={`py-2 px-4 border-t border-b font-semibold ${
                        trade.action === 'BUY' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {trade.action}
                      </td>
                      <td className="py-2 px-4 border-t border-b">{trade.symbol}</td>
                      <td className="py-2 px-4 border-t border-b">{trade.quantity}</td>
                      <td className="py-2 px-4 border-t border-b">${parseFloat(trade.price).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 text-center py-3 text-gray-500 mt-8">
        &copy; 2025 Aresa Crypto Trading. All rights reserved.
      </footer>
    </div>
  );
}

export default App;