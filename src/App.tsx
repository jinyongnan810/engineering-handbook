import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import LocalEditorPage from "./pages/LocalEditorPage";
import TopicPage from "./pages/TopicPage";

function App() {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/page/:slug" element={<TopicPage />} />
        <Route path="/local/edit" element={<LocalEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
