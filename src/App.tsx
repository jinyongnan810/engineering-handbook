import { Navigate, Route, Routes } from "react-router";
import { getDefaultPageSlug } from "./data/contentLoader";
import TopicPage from "./pages/TopicPage";
import IndexPage from "./pages/IndexPage";

function App() {
  const defaultSlug = getDefaultPageSlug();

  return (
    <div className="min-h-screen bg-white text-neutral-950 dark:bg-black dark:text-neutral-100">
      <Routes>
        <Route path="/" element={<IndexPage />} />
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
