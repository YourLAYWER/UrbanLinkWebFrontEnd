import { useEffect, useState } from 'react';
import { BroadcastForm } from '@/features/broadcast/BroadcastForm';
import { fetchBroadcastHistory, type BroadcastHistoryItem } from '@/api/broadcast';

export default function BroadcastAlertPage() {
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBroadcastHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch broadcast history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Broadcast Alert</h2>
        <p className="text-sm text-muted-foreground">
          Push a message to all users, or to commuters currently ticketed on a specific route segment.
        </p>
      </div>

      <BroadcastForm />

      {/* Broadcast History Section */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium tracking-tight">Recent Broadcasts</h3>
          <button 
            onClick={loadHistory}
            className="text-sm px-4 py-2 border rounded-md hover:bg-slate-100 transition-colors"
          >
            Refresh History
          </button>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">Message & Timestamp</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-right">Recipients</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">Loading history...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">No broadcasts sent yet.</td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">{item.message}</td>
                    <td className="px-4 py-3 text-right font-medium">{item.recipientCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}