import { useState, useEffect } from 'react';
import { Download, Bus, Activity } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi, type FleetVehicleDto } from '@/api/adminApi';

export default function FinancePage() {
  const [loading, setLoading] = useState(false);
  const [journeyData, setJourneyData] = useState<any[]>([]);
  const [loadingJourneys, setLoadingJourneys] = useState(true);

  const [fleetData, setFleetData] = useState<FleetVehicleDto[]>([]);
  const [loadingFleet, setLoadingFleet] = useState(true);

  const [activeDimension, setActiveDimension] = useState<'route' | 'payment'>('route');
  const [timeframe, setTimeframe] = useState('30days');

  // Refund state variables
  const [selectedTxId, setSelectedTxId] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Journeys (acting as ticket and revenue source)
      try {
        setLoadingJourneys(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7252/api';
        const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
        
        // Fetching from your Journey controller
        const resJourney = await fetch(`${API_BASE_URL}/Journey`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (resJourney.ok) {
          const data = await resJourney.json();
          setJourneyData(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Failed to load journeys:', err);
      } finally {
        setLoadingJourneys(false);
      }

      // 2. Fetch ALL Fleet records using adminApi.getAllFleet()
      try {
        setLoadingFleet(true);
        const data = await adminApi.getAllFleet();
        setFleetData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load fleet telemetry:', err);
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

  const handleProcessRefund = async () => {
    if (!selectedTxId) return;
    try {
      setIsRefunding(true);
      
      await adminApi.processRefund(selectedTxId);

      alert('Successfully processed journey refund and updated state.');
      setSelectedTxId('');
      setRefundAmount(0);

      // Refresh journey list
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7252/api';
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
      const resJourney = await fetch(`${API_BASE_URL}/Journey`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (resJourney.ok) {
        const data = await resJourney.json();
        setJourneyData(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (err) {
      console.error('Error processing refund:', err);
      alert('Failed to process refund on backend.');
    } finally {
      setIsRefunding(false);
    }
  };

  // Group journeys by date for the X-axis line chart
  const aggregatedJourneys = journeyData.reduce((acc: { [key: string]: number }, journey: any) => {
    const rawDate = journey.createdAt || journey.issueDate || new Date();
    const dateStr = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const cost = journey.totalCost || journey.price || journey.amount || 25.00;

    if (!acc[dateStr]) acc[dateStr] = 0;
    acc[dateStr] += cost;
    return acc;
  }, {});

  const chartPointsRaw = Object.keys(aggregatedJourneys).map(date => ({
    date,
    revenue: aggregatedJourneys[date]
  }));

  const chartWidth = 500;
  const chartHeight = 200;

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

  // Fixed syntax issue from original code snippet where array index calculation broke
  const areaPath = chartPoints.length > 0 
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight} L ${chartPoints[0].x} ${chartHeight} Z`
    : '';

  const formatCurrencyLabel = (val: number) => {
    if (val >= 1000) return `R${Math.round(val / 1000)}k`;
    return `R${val}`;
  };

  // Fleet Status Calculations capturing active and maintenance units safely
  const totalFleetCount = fleetData.length;

  const activeCount = fleetData.filter(v => {
    const s = String(v.status || '').toLowerCase();
    return s === 'active' || s === 'in_service' || s === '0' || (v.status as any) === 0 || v.isFixed === true;
  }).length;

  const maintenanceCount = fleetData.filter(v => {
    const s = String(v.status || '').toLowerCase();
    return s.includes('maint') || s === 'inmaintenance' || s === '1' || s === '2' || (v.status as any) === 1 || (v.status as any) === 2 || v.isFixed === false;
  }).length;

  const idleCount = Math.max(0, totalFleetCount - (activeCount + maintenanceCount));

  const activeRatio = totalFleetCount > 0 ? activeCount / totalFleetCount : 0;
  const idleRatio = totalFleetCount > 0 ? idleCount / totalFleetCount : 0;
  const maintRatio = totalFleetCount > 0 ? maintenanceCount / totalFleetCount : 0;

  const activePct = Math.round(activeRatio * 100);
  const idlePct = Math.round(idleRatio * 100);
  const maintPct = totalFleetCount > 0 ? 100 - (activePct + idlePct) : 0;

  const circumference = 2 * Math.PI * 60;
  const activeDash = activeRatio * circumference;
  const idleDash = idleRatio * circumference;
  const maintDash = maintRatio * circumference;

  // Dynamic calculations from Journey records
  const totalRevenueCalc = journeyData.reduce((sum, j) => sum + (j.totalCost || j.price || j.amount || 25.00), 0);
  
  const digitalRevenueCalc = journeyData
    .filter(j => {
      const method = (j.paymentMethod || j.method || '').toLowerCase();
      return !method.includes('cash');
    })
    .reduce((sum, j) => sum + (j.totalCost || j.price || j.amount || 25.00), 0);

  const cashRevenueCalc = totalRevenueCalc - digitalRevenueCalc;
  const totalTransactionsCount = journeyData.length;

  const routeBreakdown = journeyData.reduce((acc: { [key: string]: number }, j: any) => {
    const key = j.routeName || j.lineName || (j.endStopId ? `Route Destination #${j.endStopId}` : 'Standard Route');
    const amt = j.totalCost || j.price || j.amount || 25.00;
    acc[key] = (acc[key] || 0) + amt;
    return acc;
  }, {});

  const routeItems = Object.keys(routeBreakdown).map((name, idx) => {
    const amount = routeBreakdown[name];
    const pct = totalRevenueCalc > 0 ? Math.round((amount / totalRevenueCalc) * 100) : 0;
    const colors = ['bg-purple-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'];
    return { name, amount, pct, color: colors[idx % colors.length] };
  });

  const paymentBreakdown = journeyData.reduce((acc: { [key: string]: number }, j: any) => {
    const rawMethod = (j.paymentMethod || j.method || 'Digital SmartCard').toLowerCase();
    let key = 'NFC SmartCard';
    if (rawMethod.includes('cash')) key = 'Physical Cash';
    else if (rawMethod.includes('qr') || rawMethod.includes('app') || rawMethod.includes('mobile')) key = 'QR Mobile App';

    const amt = j.totalCost || j.price || j.amount || 25.00;
    acc[key] = (acc[key] || 0) + amt;
    return acc;
  }, {});

  const paymentMethods = ['NFC SmartCard', 'QR Mobile App', 'Physical Cash'].map(key => {
    const amount = paymentBreakdown[key] || 0;
    const pct = totalRevenueCalc > 0 ? Math.round((amount / totalRevenueCalc) * 100) : 0;
    return { name: key, amount, pct };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Finance &amp; Revenue Audit</h2>
        <p className="text-sm text-muted-foreground">Period: Today (live feed) &middot; Audit cycle: 06:00 - 18:00 UTC</p>
      </div>

      {/* DYNAMIC METRICS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="text-xl font-mono font-bold">
              R{totalRevenueCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>Digital: <strong className="text-foreground">R{digitalRevenueCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              <span>Cash: <strong className="text-foreground">R{cashRevenueCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
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
            <div className="text-xl font-mono font-bold">{totalTransactionsCount.toLocaleString()}</div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>Total recorded journeys</span>
              <span className="text-secondary">Live feed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="text-xl font-mono font-bold">
              {activeCount} <span className="text-xs text-muted-foreground">/ {totalFleetCount}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>Active fleet units</span>
              <span className="text-emerald-400">{activePct}% operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS GRID SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Over Time Chart Card */}
        <div className="bg-[#111C30] border border-[#1E2E4A] rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white tracking-wide">Revenue Over Time (Journey Data)</h3>
            <div className="flex items-center space-x-2">
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-[#0B1120] border border-[#1E2E4A] text-slate-300 text-xs rounded px-2.5 py-1.5 font-mono"
              >
                <option value="30days">Last 30 days</option>
                <option value="7days">Last 7 days</option>
                <option value="today">Today</option>
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
              {loadingJourneys ? (
                <span className="text-xs font-mono text-slate-400">Loading live journey records...</span>
              ) : chartPoints.length === 0 ? (
                <span className="text-xs font-mono text-slate-500 italic">No journey records found in the database.</span>
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
              {loadingJourneys ? (
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
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="60" stroke="#1E2E4A" strokeWidth="16" fill="transparent" />
                  
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

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono pointer-events-none">
                  <span className="text-[11px] text-slate-400 block">Total Fleet</span>
                  <span className="text-sm font-bold text-white">
                    {loadingFleet ? '...' : `${totalFleetCount} Units`}
                  </span>
                </div>
              </div>

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

      {/* REVENUE DIMENSIONS & BREAKDOWN SECTION */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-wider">Revenue Dimensions &amp; Journey Distribution</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span 
              onClick={() => setActiveDimension('route')}
              className={`cursor-pointer transition-colors ${activeDimension === 'route' ? 'text-purple-400 font-bold underline' : 'hover:text-foreground'}`}
            >
              By Route
            </span>
            <span 
              onClick={() => setActiveDimension('payment')}
              className={`cursor-pointer transition-colors ${activeDimension === 'payment' ? 'text-purple-400 font-bold underline' : 'hover:text-foreground'}`}
            >
              By Payment Method
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
            {routeItems.length > 0 ? (
              routeItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`h-full ${item.color} transition-all duration-500`} 
                  style={{ width: `${Math.max(item.pct, 5)}%` }}
                  title={`${item.name}: ${item.pct}%`}
                />
              ))
            ) : (
              <div className="w-full bg-purple-500/50 h-full" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loadingJourneys ? (
              <p className="text-xs font-mono text-muted-foreground">Loading route metrics...</p>
            ) : routeItems.length > 0 ? (
              routeItems.map((route) => (
                <div key={route.name} className="rounded-lg border border-border bg-muted/40 p-4 font-mono">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">{route.name}</p>
                  <p className="text-lg font-bold">
                    R{route.amount.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">({route.pct}%)</span>
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-4 rounded-lg border border-border bg-muted/20 p-4 text-center font-mono text-xs text-slate-400">
                Awaiting route transactions from backend journeys.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-3 text-xs font-mono text-muted-foreground">
            {paymentMethods.map((pm) => (
              <span key={pm.name}>
                {pm.name}: <strong className="text-foreground">{pm.pct}% (R{pm.amount.toFixed(2)})</strong>
              </span>
            ))}
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
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Select Journey Transaction</label>
              <select
                value={selectedTxId}
                onChange={(e) => {
                  const txId = e.target.value;
                  setSelectedTxId(txId);
                  const found = journeyData.find((j: any) => String(j.journeyID || j.id) === txId);
                  if (found) {
                    setRefundAmount(found.totalCost || found.price || found.amount || 25.00);
                  } else {
                    setRefundAmount(0);
                  }
                }}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-mono"
              >
                <option value="">-- Choose transaction --</option>
                {journeyData && journeyData.length > 0 ? (
                  journeyData.map((j: any) => {
                    const id = j.journeyID || j.id;
                    const label = j.ticketReference ? `Ticket Ref: ${j.ticketReference.substring(0, 8)}...` : `Journey #${id}`;
                    const amt = j.totalCost || j.price || j.amount || 25.00;
                    const dateStr = j.createdAt ? ` (${new Date(j.createdAt).toLocaleDateString()})` : '';
                    return (
                      <option key={id} value={id}>
                        {label} — R{amt.toFixed(2)} [Status: {j.status || 'Active'}]{dateStr}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No transactions available</option>
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount (ZAR)</label>
              <input
                type="text"
                readOnly
                value={refundAmount ? `R${refundAmount.toFixed(2)}` : 'R0.00'}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-mono"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleProcessRefund} 
              disabled={isRefunding || !selectedTxId}
            >
              {isRefunding ? 'Processing Refund...' : 'Issue fare credit / refund'}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">Conductor shift audit reports</CardTitle>
            <CardDescription>
              Compile daily financial transactions, journey reconciliations, and cash drop variances into a secure PDF
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