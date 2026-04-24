import { Navigate, Route, Routes } from "react-router";
import { getDefaultPageSlug } from "./data/contentLoader";
import TopicPage from "./pages/TopicPage";

function App() {
  const defaultSlug = getDefaultPageSlug();

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/page/${defaultSlug}`} replace />}
        />
        <Route path="/page/:slug" element={<TopicPage />} />
        <Route
          path="*"
          element={<Navigate to={`/page/${defaultSlug}`} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
