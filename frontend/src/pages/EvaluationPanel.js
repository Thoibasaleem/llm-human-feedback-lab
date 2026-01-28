import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { toast } from "sonner";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EvaluationPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const response = location.state?.response;
  
  const [evaluatorId, setEvaluatorId] = useState("");
  const [helpfulness, setHelpfulness] = useState([3]);
  const [accuracy, setAccuracy] = useState([3]);
  const [clarity, setClarity] = useState([3]);
  const [hasHallucination, setHasHallucination] = useState(false);
  const [hasUnsafeContent, setHasUnsafeContent] = useState(false);
  const [improvedResponse, setImprovedResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  if (!response) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No response to evaluate. Please generate a response first.</p>
        <Button onClick={() => navigate("/")} className="mt-4">Go to Prompt Lab</Button>
      </div>
    );
  }
  
  const handleSubmit = async () => {
    if (!evaluatorId.trim()) {
      toast.error("Please enter your evaluator ID");
      return;
    }
    if (!improvedResponse.trim()) {
      toast.error("Please provide an improved response");
      return;
    }
    
    setLoading(true);
    try {
  await axios.post(`${API_BASE_URL}/api/evaluations`, {
    response_id: response.id,
    prompt: response.prompt,
    model_response: response.response,
    evaluator_id: evaluatorId,
    helpfulness: helpfulness[0],
    accuracy: accuracy[0],
    clarity: clarity[0],
    has_hallucination: hasHallucination,
    has_unsafe_content: hasUnsafeContent,
    improved_response: improvedResponse,
  });

      toast.success("Evaluation submitted successfully");
      navigate("/history");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit evaluation");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="w-full lg:w-2/3 h-full overflow-y-auto p-6" data-testid="evaluation-left-panel">
        <div className="max-w-4xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold heading-font tracking-tight" data-testid="evaluation-title">Evaluation Panel</h2>
            <p className="text-muted-foreground mt-2">Rate the AI response and provide feedback</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg heading-font">Original Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mono text-sm bg-muted/50 p-4 rounded-md border" data-testid="eval-prompt">{response.prompt}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg heading-font">Model Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mono text-sm bg-muted/50 p-4 rounded-md border leading-relaxed whitespace-pre-wrap" data-testid="eval-response">
                {response.response}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="w-full lg:w-1/3 h-full border-t lg:border-t-0 lg:border-l border-border bg-muted/30 p-6 overflow-y-auto" data-testid="evaluation-right-panel">
        <div className="space-y-6">
          <div>
            <Label htmlFor="evaluator-id" className="text-base font-semibold">Evaluator ID</Label>
            <Input
              id="evaluator-id"
              data-testid="evaluator-id-input"
              placeholder="e.g., evaluator_001"
              value={evaluatorId}
              onChange={(e) => setEvaluatorId(e.target.value)}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label className="text-base font-semibold">Helpfulness: {helpfulness[0]}/5</Label>
            <Slider
              data-testid="helpfulness-slider"
              value={helpfulness}
              onValueChange={setHelpfulness}
              min={1}
              max={5}
              step={1}
              className="mt-3"
            />
          </div>
          
          <div>
            <Label className="text-base font-semibold">Accuracy: {accuracy[0]}/5</Label>
            <Slider
              data-testid="accuracy-slider"
              value={accuracy}
              onValueChange={setAccuracy}
              min={1}
              max={5}
              step={1}
              className="mt-3"
            />
          </div>
          
          <div>
            <Label className="text-base font-semibold">Clarity: {clarity[0]}/5</Label>
            <Slider
              data-testid="clarity-slider"
              value={clarity}
              onValueChange={setClarity}
              min={1}
              max={5}
              step={1}
              className="mt-3"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="hallucination" className="text-base font-semibold">Hallucination Present?</Label>
            <Switch
              id="hallucination"
              data-testid="hallucination-toggle"
              checked={hasHallucination}
              onCheckedChange={setHasHallucination}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="unsafe" className="text-base font-semibold">Unsafe Content?</Label>
            <Switch
              id="unsafe"
              data-testid="unsafe-toggle"
              checked={hasUnsafeContent}
              onCheckedChange={setHasUnsafeContent}
            />
          </div>
          
          <div>
            <Label htmlFor="improved" className="text-base font-semibold">Improved Response</Label>
            <Textarea
              id="improved"
              data-testid="improved-response-input"
              placeholder="Write an improved version of the response..."
              value={improvedResponse}
              onChange={(e) => setImprovedResponse(e.target.value)}
              className="mt-2 min-h-[150px] mono text-sm"
            />
          </div>
          
          <Button
            data-testid="submit-evaluation-button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </div>
      </div>
    </div>
  );
}