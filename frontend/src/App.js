import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import PromptLab from "@/pages/PromptLab";
import EvaluationPanel from "@/pages/EvaluationPanel";
import Analytics from "@/pages/Analytics";
import History from "@/pages/History";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<PromptLab />} />
            <Route path="evaluate/:responseId" element={<EvaluationPanel />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;