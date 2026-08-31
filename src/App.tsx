import { Navigate, Route, Routes } from "react-router";
import { LanguageProvider } from "./context/LanguageProvider";
import { getDefaultPageSlug } from "./data/contentLoader";
import IndexPage from "./pages/IndexPage";
import TopicPage from "./pages/TopicPage";

function App() {
  const defaultSlug = getDefaultPageSlug();

  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}

export default App;
