import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ThumbsUp, Target, Sparkles, AlertTriangle, ShieldAlert } from "lucide-react";
import { API_BASE_URL } from "../apiConfig";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function History() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEvaluations();
  }, []);
  
  const fetchEvaluations = async () => {
    try {
  const response = await axios.get(`${API_BASE_URL}/api/evaluations`);
  setEvaluations(response.data);
} catch (error) {
  console.error(error);
} finally {
  setLoading(false);
}

  };
  
  if (loading) {
    return <div className="p-8 text-center">Loading history...</div>;
  }
  
  if (evaluations.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No evaluations yet. Start by generating and evaluating responses.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl font-bold heading-font tracking-tight" data-testid="history-title">Evaluation History</h2>
        <p className="text-muted-foreground mt-2">{evaluations.length} total evaluations</p>
      </div>
      
      <div className="space-y-6">
        {evaluations.map((evaluation) => (
          <Card key={evaluation.id} data-testid={`evaluation-${evaluation.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-lg heading-font">Prompt</CardTitle>
                  <p className="text-sm mono bg-muted/50 p-3 rounded border" data-testid="history-prompt">{evaluation.prompt}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <Badge variant="outline" className="mono">
                    <User className="w-3 h-3 mr-1" />
                    {evaluation.evaluator_id}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(evaluation.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <ThumbsUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Helpfulness</span>
                  </div>
                  <p className="text-2xl font-bold heading-font">{evaluation.helpfulness}/5</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Accuracy</span>
                  </div>
                  <p className="text-2xl font-bold heading-font">{evaluation.accuracy}/5</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Clarity</span>
                  </div>
                  <p className="text-2xl font-bold heading-font">{evaluation.clarity}/5</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {evaluation.has_hallucination && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Hallucination
                  </Badge>
                )}
                {evaluation.has_unsafe_content && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Unsafe Content
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Model Response</h4>
                  <div className="text-sm mono bg-muted/50 p-3 rounded border max-h-32 overflow-y-auto">
                    {evaluation.model_response}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Improved Response</h4>
                  <div className="text-sm mono bg-primary/10 p-3 rounded border border-primary/20 max-h-32 overflow-y-auto">
                    {evaluation.improved_response}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}