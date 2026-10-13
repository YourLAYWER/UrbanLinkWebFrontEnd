import { useState, useEffect } from 'react';
import { Download, Bus, Activity } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/api/adminApi';

export default function FinancePage() {
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Fleet data states
  const [fleetData, setFleetData] = useState<any[]>([]);
  const [loadingFleet, setLoadingFleet] = useState(true);

  // Fetch live tickets and fleet records from backend on mount
  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7252/api';

    async function fetchData() {
      // 1. Fetch Tickets
      try {
        setLoadingTickets(true);
        const resTicket = await fetch(`${API_BASE_URL}/Ticket`);
        if (resTicket.ok) {
          const data = await resTicket.json();
          setTicketData(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
      } finally {
        setLoadingTickets(false);
      }

      // 2. Fetch Fleet / Bus records from backend
      try {
        setLoadingFleet(true);
        // Change '/Bus' if your backend controller route is named differently (e.g., '/Buses' or '/Vehicle')
        const resFleet = await fetch(`${API_BASE_URL}/Bus`);
        if (resFleet.ok) {
          const data = await resFleet.json();
          setFleetData(Array.isArray(data) ? data : (data.data || []));
        } else {
          setFleetData([]);
        }
      } catch (err) {
        console.error('Failed to load fleet data from backend:', err);
        setFleetData([]);
      } finally {
        setLoadingFleet(false);
      }
    }

    fetchData();
  }, []);

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

  // Group tickets by date for the X-axis
  const aggregatedTickets = ticketData.reduce((acc: { [key: string]: number }, ticket: any) => {
    const rawDate = ticket.createdAt || ticket.issueDate || new Date();
    const dateStr = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const price = ticket.price || ticket.amount || 25.00;

    if (!acc[dateStr]) acc[dateStr] = 0;
    acc[dateStr] += price;
    return acc;
  }, {});

  const chartPointsRaw = Object.keys(aggregatedTickets).map(date => ({
    date,
    revenue: aggregatedTickets[date]
  }));

  const chartWidth = 500;
  const chartHeight = 200;

  // Dynamic Y-axis scale calculation
  const peakRevenue = Math.max(...chartPointsRaw.map(p => p.revenue), 100);
  const maxScaleValue = Math.ceil(peakRevenue * 1.2 / 10000) * 10000 || 50000;
  const yAxisTicks = [maxScaleValue, maxScaleValue * 0.75, maxScaleValue * 0.5, maxScaleValue * 0.25, 0];

  const chartPoints = chartPointsRaw.map((pt, index) => {
    const x = chartPointsRaw.length > 1 
      ? (index / (chartPointsRaw.length - 1)) * chartWidth 
      : 0; 
    const normalizedRatio = Math.min(pt.revenue / maxScaleValue, 1);
    const y = chartHeight - (normalizedRatio * chartHeight);
    return { ...pt, x, y };
  });

  const linePath = chartPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = chartPoints.length > 0 
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight} L ${chartPoints[0].x} ${chartHeight} Z`
    : '';

  const formatCurrencyLabel = (val: number) => {
    if (val >= 1000) return `R${Math.round(val / 1000)}k`;
    return `R${val}`;
  };

  // Calculate dynamic fleet status counts directly from backend records
  const totalFleetCount = fleetData.length;
  const activeCount = fleetData.filter(b => b.status === 'Active' || b.status === 1 || b.status === 'active').length;
  const idleCount = fleetData.filter(b => b.status === 'Idle' || b.status === 2 || b.status === 'idle').length;
  const maintenanceCount = fleetData.filter(b => b.status === 'Maintenance' || b.status === 3 || b.status === 'maintenance').length;

  const activeRatio = totalFleetCount > 0 ? activeCount / totalFleetCount : 0;
  const idleRatio = totalFleetCount > 0 ? idleCount / totalFleetCount : 0;
  const maintRatio = totalFleetCount > 0 ? maintenanceCount / totalFleetCount : 0;

  const activePct = Math.round(activeRatio * 100);
  const idlePct = Math.round(idleRatio * 100);
  const maintPct = totalFleetCount > 0 ? 100 - (activePct + idlePct) : 0;

  // SVG Doughnut Arc Circumference Calculations (Radius = 60 => Circumference ~ 376.99)
  const circumference = 2 * Math.PI * 60;
  const activeDash = activeRatio * circumference;
  const idleDash = idleRatio * circumference;
  const maintDash = maintRatio * circumference;

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

          <div className="h-64 flex flex-col justify-between relative pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-600 w-full"></div>
              <div className="border-b border-slate-600 w-full"></div>
              <div className="border-b border-slate-600 w-full"></div>
              <div className="border-b border-slate-600 w-full"></div>
              <div className="border-b border-slate-600 w-full"></div>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500 absolute left-0 -top-1 h-full flex-col pointer-events-none">
              {yAxisTicks.map((val, idx) => (
                <span key={idx}>{formatCurrencyLabel(val)}</span>
              ))}
            </div>

            <div className="w-full h-48 pl-12 relative flex items-center justify-center">
              {loadingTickets ? (
                <span className="text-xs font-mono text-slate-400">Loading live records...</span>
              ) : chartPoints.length === 0 ? (
                <span className="text-xs font-mono text-slate-500 italic">No ticket records found in the database.</span>
              ) : (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {areaPath && <path d={areaPath} fill="url(#revenueGradient)" />}
                  {linePath && <path d={linePath} fill="none" stroke="#c084fc" strokeWidth="3" />}

                  {chartPoints.map((pt, idx) => (
                    <circle 
                      key={idx} 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={idx === chartPoints.length - 1 ? "5" : "4"} 
                      fill={idx === chartPoints.length - 1 ? "#ffffff" : "#c084fc"} 
                      stroke="#c084fc" 
                      strokeWidth={idx === chartPoints.length - 1 ? "2" : "0"} 
                    />
                  ))}
                </svg>
              )}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 pl-12 pt-2 border-t border-[#1E2E4A]">
              {loadingTickets ? (
                <span>Loading...</span>
              ) : chartPoints.length > 0 ? (
                chartPoints.map((pt, idx) => (
                  <span key={idx}>{pt.date}</span>
                ))
              ) : (
                <span>Awaiting transaction data</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Fleet Status Doughnut Chart Card */}
        <div className="bg-[#111C30] border border-[#1E2E4A] rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Bus size={16} className="text-purple-400" />
                Fleet Status (Live Feed)
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-4">
              {/* Fully Dynamic SVG Doughnut Chart */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="60" stroke="#1E2E4A" strokeWidth="16" fill="transparent" />
                  
                  {/* Active Segment */}
                  {activeDash > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      stroke="#10b981"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${activeDash} ${circumference}`}
                      strokeDashoffset="0"
                    />
                  )}
                  {/* Idle Segment */}
                  {idleDash > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      stroke="#a855f7"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${idleDash} ${circumference}`}
                      strokeDashoffset={`-${activeDash}`}
                    />
                  )}
                  {/* Maintenance Segment */}
                  {maintDash > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      stroke="#f59e0b"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${maintDash} ${circumference}`}
                      strokeDashoffset={`-${activeDash + idleDash}`}
                    />
                  )}
                </svg>

                {/* Inner Overlay Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono pointer-events-none">
                  <span className="text-[11px] text-slate-400 block">Total Fleet</span>
                  <span className="text-sm font-bold text-white">
                    {loadingFleet ? '...' : `${totalFleetCount} Units`}
                  </span>
                </div>
              </div>

              {/* Dynamic Legend */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-300">
                    Active / Route • <strong className="text-white">{loadingFleet ? '...' : `${activeCount} (${activePct}%)`}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
                  <span className="text-slate-300">
                    Idle / Depôt • <strong className="text-white">{loadingFleet ? '...' : `${idleCount} (${idlePct}%)`}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-slate-300">
                    Maintenance • <strong className="text-white">{loadingFleet ? '...' : `${maintenanceCount} (${maintPct}%)`}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#1E2E4A] font-mono text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity size={12} className="text-emerald-400" />
              Operational status: <strong className="text-emerald-400">Optimal</strong>
            </span>
            <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-bold">Live sync</span>
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