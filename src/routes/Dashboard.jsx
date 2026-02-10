import supabase from '../supabase-client';
import { useEffect, useState } from 'react';
import { Chart } from 'react-charts';
import Form from '../components/Form';
import { useTheme } from '../context/ThemeContext';

function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('deal-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_deals',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMetrics() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all sales deals with user info
      const { data: deals, error: fetchError } = await supabase
        .from('sales_deals')
        .select(`
          value,
          user_profiles (
            name
          )
        `);

      if (fetchError) {
        throw fetchError;
      }

      // Calculate sum per user manually
      const userTotals = {};
      
      if (deals && deals.length > 0) {
        deals.forEach((deal) => {
          const userName = deal.user_profiles?.name || 'Unknown';
          if (!userTotals[userName]) {
            userTotals[userName] = 0;
          }
          userTotals[userName] += parseFloat(deal.value) || 0;
        });
      }

      // Convert to array format
      const metricsArray = Object.entries(userTotals).map(([name, sum]) => ({
        name,
        sum,
      }));

      setMetrics(metricsArray);
    } catch (err) {
      console.error('Error fetching metrics:', err.message);
      setError('Failed to load sales data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }

  const chartData = [
    {
      data: metrics.map((m) => ({
        primary: m.name,
        secondary: m.sum || 0,
      })),
    },
  ];

  const primaryAxis = {
    getValue: (d) => d.primary,
    scaleType: 'band',
    padding: 0.2,
    position: 'bottom',
  };

  function calculateYMax() {
    if (metrics.length > 0) {
      const maxSum = Math.max(...metrics.map((m) => m.sum || 0));
      return maxSum > 0 ? maxSum + 2000 : 5000;
    }
    return 5000;
  }

  const secondaryAxes = [
    {
      getValue: (d) => d.secondary,
      scaleType: 'linear',
      min: 0,
      max: calculateYMax(),
      padding: {
        top: 20,
        bottom: 40,
      },
    },
  ];

  // Dynamic chart colors based on theme
  const chartColor = isDark ? '#5FD396' : '#3CAD6E';

  return (
    <div
      className="dashboard-wrapper"
      role="region"
      aria-label="Sales dashboard"
    >
      <div className="dashboard-container">
        <div
          className="chart-container"
          role="region"
          aria-label="Sales chart and data"
        >
          <h2>Total Sales This Quarter (USD)</h2>
          
          {isLoading ? (
            <div className="loading-container">
              <div>
                <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
                <p style={{ marginTop: '16px' }}>Loading sales data...</p>
              </div>
            </div>
          ) : error ? (
            <div role="alert" className="error-message" style={{ margin: 'auto' }}>
              {error}
            </div>
          ) : metrics.length === 0 ? (
            <div className="loading-container">
              <p>No sales data yet. Add your first deal below!</p>
            </div>
          ) : (
            <div className="chart-wrapper">
              <Chart
                options={{
                  data: chartData,
                  primaryAxis,
                  secondaryAxes,
                  type: 'bar',
                  defaultColors: [chartColor],
                  tooltip: {
                    show: true,
                  },
                }}
              />
            </div>
          )}
        </div>

        <Form />
      </div>
    </div>
  );
}

export default Dashboard;