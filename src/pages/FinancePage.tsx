import { useState } from 'react';
import { Download } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/api/adminApi';

export default function FinancePage() {
  const [loading, setLoading] = useState(false);

  const handleExportReport = async () => {
    try {
      setLoading(true);
      const blob = await adminApi.generateShiftReport(new Date().toISOString().split('T')[0]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UrbanLink_Shift_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not generate PDF report from backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Finance &amp; Revenue Audit</h2>
        <p className="text-sm text-muted-foreground">Period: Today (live feed) &middot; Audit cycle: 06:00 - 18:00 UTC</p>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="text-xl font-mono font-bold">R142,860.50</div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>Digital: <strong className="text-foreground">R112,420.00</strong></span>
              <span>Cash: <strong className="text-foreground">R30,440.50</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="text-xl font-mono font-bold text-destructive">-R142.20</div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>Tolerable rate: 0.20%</span>
              <span className="font-bold text-destructive">Action req.</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="text-xl font-mono font-bold">48,920</div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>Peak load: 114 tx/min</span>
              <span className="text-secondary">14:15 peak</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="text-xl font-mono font-bold">
              7 <span className="text-xs text-muted-foreground">/ 42</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>Pending audits: 4</span>
              <span className="text-amber-400">03h 27m left</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS GRID SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Over Time Chart Card */}
        <div className="bg-[#111C30] border border-[#1E2E4A] rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white tracking-wide">Revenue Over Time</h3>
            <div className="flex items-center space-x-2">
              <select className="bg-[#0B1120] border border-[#1E2E4A] text-slate-300 text-xs rounded px-2.5 py-1.5 font-mono">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Today</option>
              </select>
              <button className="bg-[#0B1120] border border-[#1E2E4A] hover:bg-[#192642] text-slate-300 text-xs px-3 py-1.5 rounded flex items-center space-x-1 font-mono">
                <Download size={12} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Line Chart Visual Representation */}
          <div className="h-64 flex flex-col justify-between relative pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-600 w-full"></div>
              <div className="border-b border-slate-600 w-full"></div>
              <div className="border-b border-slate-600 w-full"></div>
              <div className="border-b border-slate-600 w-full"></div>
              <div className="border-b border-slate-600 w-full"></div>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500 absolute left-0 -top-1 h-full flex-col pointer-events-none">
              <span>$120k</span>
              <span>$100k</span>
              <span>$80k</span>
              <span>$60k</span>
              <span>$40k</span>
              <span>$20k</span>
            </div>

            {/* SVG Wave Line */}
            <div className="w-full h-48 pl-10 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 160 Q 100 120 200 110 T 400 60 T 480 30 L 480 200 L 0 200 Z" fill="url(#revenueGradient)" />
                <path d="M 0 160 Q 100 120 200 110 T 400 60 T 480 30" fill="none" stroke="#c084fc" strokeWidth="3" />
                <circle cx="0" cy="160" r="4" fill="#c084fc" />
                <circle cx="160" cy="115" r="4" fill="#c084fc" />
                <circle cx="320" cy="85" r="4" fill="#c084fc" />
                <circle cx="480" cy="30" r="5" fill="#ffffff" stroke="#c084fc" strokeWidth="2" />
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pl-10 pt-2 border-t border-[#1E2E4A]">
              <span>Sep 1</span>
              <span>Sep 7</span>
              <span>Sep 14</span>
              <span>Sep 21</span>
              <span>Sep 28</span>
              <span>Oct 5</span>
            </div>
          </div>
        </div>

        {/* Traffic Sources Doughnut Chart Card */}
        <div className="bg-[#111C30] border border-[#1E2E4A] rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-6">Traffic Sources</h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-4">
              {/* Doughnut Graphic Representation */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-[16px] border-purple-500 border-t-indigo-600 border-r-purple-400 border-b-indigo-900 flex items-center justify-center shadow-inner">
                  <div className="text-center font-mono">
                    <span className="text-xs text-slate-400 block">Visits</span>
                    <span className="text-sm font-bold text-white">18,204</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-900 inline-block"></span>
                  <span className="text-slate-300">Direct • <strong className="text-white">45%</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
                  <span className="text-slate-300">Organic • <strong className="text-white">32%</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-purple-300 inline-block"></span>
                  <span className="text-slate-300">Referral • <strong className="text-white">23%</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#1E2E4A] font-mono text-xs">
            <span className="text-slate-400">Total visits: <strong className="text-white">18,204</strong></span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">+3.4%</span>
          </div>
        </div>
      </div>

      {/* Revenue Dimensions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-wider">Revenue dimensions &amp; multi-stream distribution</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="cursor-pointer text-secondary hover:underline">By route</span>
            <span className="cursor-pointer hover:text-foreground">By conductor</span>
            <span className="cursor-pointer hover:text-foreground">By payment method</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="w-[32%] bg-secondary" />
            <div className="w-[27%] bg-primary" />
            <div className="w-[20%] bg-accent" />
            <div className="w-[21%] bg-secondary/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Line 4 Crosstown', amount: 'R46,210.00', pct: '32%' },
              { name: 'Line 2 Metro', amount: 'R38,940.00', pct: '27%' },
              { name: 'Line 1 Loop', amount: 'R28,420.50', pct: '20%' },
              { name: 'Suburban Feeders', amount: 'R29,290.00', pct: '21%' },
            ].map((route) => (
              <div key={route.name} className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">{route.name}</p>
                <p className="text-lg font-bold">
                  {route.amount} <span className="text-xs font-normal text-muted-foreground">({route.pct})</span>
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>NFC SmartCard: <strong className="text-foreground">58% (R82.8k)</strong></span>
            <span>QR Mobile App: <strong className="text-foreground">21% (R30.0k)</strong></span>
            <span>Physical Cash: <strong className="text-foreground">21% (R30.4k)</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Refunds & Audit Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">Process commuter refund</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Transaction ID / Hash</label>
              <input
                type="text"
                readOnly
                value="TX-904812"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount (ZAR)</label>
              <input
                type="text"
                readOnly
                value="0.00"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              />
            </div>
            <Button className="w-full">Issue fare credit / refund</Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">Conductor shift audit reports</CardTitle>
            <CardDescription>
              Compile daily financial transactions, ticket reconciliations, and cash drop variances into a secure PDF
              pulled directly from the backend server.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleExportReport} disabled={loading}>
              {loading ? 'Generating PDF...' : 'Download shift report PDF'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}