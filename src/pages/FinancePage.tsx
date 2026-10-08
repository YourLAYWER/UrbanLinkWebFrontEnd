import { useState } from 'react';

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
