import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calculator, FileText, TrendingUp, Upload } from 'lucide-react';

export function QuickActions() {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-100">Quick Actions</CardTitle>
        <CardDescription className="text-slate-400">
          Common tasks and navigation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/rsu-entry">
            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add RSU Entry
            </Button>
          </Link>

          <Link href="/dashboard/import">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import CSV
            </Button>
          </Link>

          <Link href="/calculator">
            <Button
              variant="outline"
              className="w-full border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-slate-100 transition-all hover:scale-105"
            >
              <Calculator className="mr-2 h-4 w-4" />
              View Tax Summary
            </Button>
          </Link>

          <Link href="/forms">
            <Button
              variant="outline"
              className="w-full border-slate-700 hover:border-amber-500 hover:bg-slate-800 text-slate-100 transition-all hover:scale-105"
            >
              <FileText className="mr-2 h-4 w-4" />
              Required Forms
            </Button>
          </Link>

          <Link href="/insights">
            <Button
              variant="outline"
              className="w-full border-slate-700 hover:border-purple-500 hover:bg-slate-800 text-slate-100 transition-all hover:scale-105"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Tax Insights
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
