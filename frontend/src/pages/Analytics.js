import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { TrendingUp, AlertTriangle, Shield, Users } from "lucide-react";
import { API_BASE_URL } from "../apiConfig";
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
  const response = await axios.get(`${API_BASE_URL}/api/analytics`);
  setAnalytics(response.data);
} catch (error) {
  console.error(error);
} finally {
  setLoading(false);
}

  };
  
  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }
  
  if (!analytics || analytics.total_evaluations === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No evaluations yet. Start by generating and evaluating responses.</p>
      </div>
    );
  }
  
  const scoreData = {
    labels: ['Helpfulness', 'Accuracy', 'Clarity'],
    datasets: [{
      label: 'Average Score',
      data: [analytics.avg_helpfulness, analytics.avg_accuracy, analytics.avg_clarity],
      backgroundColor: 'hsl(221, 83%, 53%)',
      borderRadius: 6
    }]
  };
  
  const issueData = {
    labels: ['Hallucination Rate', 'Safety Issues'],
    datasets: [{
      data: [analytics.hallucination_rate, analytics.safety_issue_rate],
      backgroundColor: ['hsl(0, 84.2%, 60.2%)', 'hsl(38, 92%, 50%)'],
      borderWidth: 0
    }]
  };
  
  const lengthData = {
    labels: ['Original Response', 'Improved Response'],
    datasets: [{
      label: 'Avg Word Count',
      data: [analytics.avg_original_length, analytics.avg_improved_length],
      backgroundColor: ['hsl(210, 40%, 96.1%)', 'hsl(221, 83%, 53%)'],
      borderRadius: 6
    }]
  };
  
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold heading-font tracking-tight" data-testid="analytics-title">Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-2">Insights from {analytics.total_evaluations} evaluations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card data-testid="metric-helpfulness">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Helpfulness</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold heading-font">{analytics.avg_helpfulness}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
          </CardContent>
        </Card>
        
        <Card data-testid="metric-accuracy">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold heading-font">{analytics.avg_accuracy}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
          </CardContent>
        </Card>
        
        <Card data-testid="metric-clarity">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Clarity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold heading-font">{analytics.avg_clarity}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
          </CardContent>
        </Card>
        
        <Card data-testid="metric-hallucinations">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hallucination Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold heading-font">{analytics.hallucination_rate}%</div>
            <p className="text-xs text-muted-foreground mt-1">of responses</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2" data-testid="chart-scores">
          <CardHeader>
            <CardTitle className="heading-font">Quality Scores</CardTitle>
            <CardDescription>Average ratings across all evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={scoreData} options={{ responsive: true, scales: { y: { beginAtZero: true, max: 5 } } }} />
          </CardContent>
        </Card>
        
        <Card data-testid="chart-issues">
          <CardHeader>
            <CardTitle className="heading-font">Issue Rates</CardTitle>
            <CardDescription>Percentage of problematic responses</CardDescription>
          </CardHeader>
          <CardContent>
            <Doughnut data={issueData} options={{ responsive: true }} />
          </CardContent>
        </Card>
        
        <Card data-testid="chart-lengths">
          <CardHeader>
            <CardTitle className="heading-font">Response Length</CardTitle>
            <CardDescription>Original vs Improved</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={lengthData} options={{ responsive: true }} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 lg:col-span-4" data-testid="evaluator-stats">
          <CardHeader>
            <CardTitle className="heading-font flex items-center gap-2">
              <Users className="w-5 h-5" />
              Evaluator Statistics
            </CardTitle>
            <CardDescription>Performance by evaluator ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.evaluator_stats).map(([id, stats]) => (
                <div key={id} className="p-4 border rounded-lg bg-muted/30">
                  <p className="font-semibold mono">{id}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.count} evaluation{stats.count !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm mt-1">
                    Avg Rating: <span className="font-bold">{stats.avg_rating.toFixed(2)}/5</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}