import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PromptLab() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setLoading(true);
    try {
      const result = await axios.post(`${API}/generate`, { prompt });
      setResponse(result.data);
      toast.success("Response generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate response");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEvaluate = () => {
    if (response) {
      navigate(`/evaluate/${response.id}`, { state: { response } });
    }
  };
  
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-4xl font-bold heading-font tracking-tight" data-testid="prompt-lab-title">Prompt Lab</h2>
        <p className="text-muted-foreground mt-2">Generate AI responses and evaluate their quality</p>
      </div>
      
      <Card data-testid="prompt-input-card">
        <CardHeader>
          <CardTitle className="heading-font">Enter Your Prompt</CardTitle>
          <CardDescription>Ask a question or provide a task for the AI model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            data-testid="prompt-input"
            placeholder="E.g., Explain quantum computing in simple terms..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none mono"
          />
          <Button
            data-testid="generate-button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full md:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? "Generating..." : "Generate Response"}
          </Button>
        </CardContent>
      </Card>
      
      {response && (
        <Card data-testid="response-card">
          <CardHeader>
            <CardTitle className="heading-font">Generated Response</CardTitle>
            <CardDescription>Review the AI-generated output</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {response.quality_warnings && response.quality_warnings.length > 0 && (
              <Alert variant="destructive" data-testid="quality-warnings">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quality Warnings:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {response.quality_warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="p-4 bg-muted/50 rounded-md border border-border">
              <p className="mono text-sm leading-relaxed whitespace-pre-wrap" data-testid="model-response">
                {response.response}
              </p>
            </div>
            
            <Button
              data-testid="evaluate-button"
              onClick={handleEvaluate}
              className="w-full md:w-auto"
            >
              Evaluate This Response
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}