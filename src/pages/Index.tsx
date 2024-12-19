import { PromptSystem } from "../components/PromptSystem";
import { OllamaStatus } from "../components/StatusIndicator/OllamaStatus";

const Index = () => {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="fixed top-4 right-4">
        <OllamaStatus />
      </div>
      <PromptSystem />
    </div>
  );
};

export default Index;