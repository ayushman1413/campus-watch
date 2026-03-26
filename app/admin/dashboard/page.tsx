'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { analyticsAPI } from '@/lib/api/analytics';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, Users, Package, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any>(null);
  const [locationStats, setLocationStats] = useState<any>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any>(null);
  const [lostFoundRatio, setLostFoundRatio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [dashStats, catStats, locStats, trends, ratio] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getCategoryStats(),
        analyticsAPI.getLocationStats(),
        analyticsAPI.getMonthlyTrends(6),
        analyticsAPI.getLostFoundRatio(),
      ]);

      setStats(dashStats);
      setCategoryStats(catStats);
      setLocationStats(locStats);
      setMonthlyTrends(trends);
      setLostFoundRatio(ratio);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Loading dashboard..." />;
  }



  
  const categoryData = categoryStats
    ? Object.entries(categoryStats).map(([name, count]) => ({ name, value: count }))
    : [];

  const locationData = locationStats
    ? Object.entries(locationStats).map(([name, count]) => ({ name, value: count }))
    : [];

  const monthlyData = monthlyTrends
    ? Object.entries(monthlyTrends).map(([month, count]) => ({ month, items: count }))
    : [];

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Campus-wide analytics and insights</p>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <MetricCard
              title="Total Items Lost"
              value={stats.total_items_lost}
              icon={<Package className="w-5 h-5 text-red-500" />}
            />
            <MetricCard
              title="Total Items Found"
              value={stats.total_items_found}
              icon={<Package className="w-5 h-5 text-green-500" />}
            />
            <MetricCard
              title="Items Claimed"
              value={stats.total_items_claimed}
              icon={<CheckCircle2 className="w-5 h-5 text-blue-500" />}
            />
            <MetricCard
              title="Active Users"
              value={stats.active_users}
              icon={<Users className="w-5 h-5 text-purple-500" />}
            />
          </div>
        )}

        <div className="grid gap-6 mb-8 md:grid-cols-2">
          {/* Success Rate */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {stats.claim_success_rate}%
                  </div>
                  <p className="text-muted-foreground">
                    {stats.active_claims} successful claims
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lost/Found Ratio */}
          {lostFoundRatio && (
            <Card>
              <CardHeader>
                <CardTitle>Lost vs Found Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Lost', value: lostFoundRatio.lost },
                        { name: 'Found', value: lostFoundRatio.found },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          {/* Top Categories */}
          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Item Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top Locations */}
          {locationData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Items by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={locationData}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Monthly Trend */}
        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Items Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="items"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Items"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
