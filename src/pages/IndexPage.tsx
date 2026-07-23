import { useState } from "react";
import { Link } from "react-router";
import SiteHeader from "../components/SiteHeader";
import TopicSidebar, { MobileTopicSidebar } from "../components/TopicSidebar";
import { getAllPageMetas } from "../data/contentLoader";

export default function IndexPage() {
  const [isMobileTopicSidebarOpen, setIsMobileTopicSidebarOpen] =
    useState(false);
  const allPages = getAllPageMetas();

  const groups: string[] = [];

  // Group pages by their tag (preserving appearance order)
  const groupedPages = allPages.reduce(
    (acc, page) => {
      const groupName = page.tag || "General";
      if (!acc[groupName]) {
        acc[groupName] = [];
        groups.push(groupName);
      }
      acc[groupName].push(page);
      return acc;
    },
    {} as Record<string, typeof allPages>,
  );

  return (
    <>
      <SiteHeader
        isTopicsOpen={isMobileTopicSidebarOpen}
        onOpenTopics={() =>
          setIsMobileTopicSidebarOpen((currentIsOpen) => !currentIsOpen)
        }
      />
      <MobileTopicSidebar
        isOpen={isMobileTopicSidebarOpen}
        onClose={() => setIsMobileTopicSidebarOpen(false)}
      />
      <div className="mx-auto grid w-full max-w-[1440px] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <TopicSidebar />
        <main className="min-w-0 px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
          {/* Hero Section */}
          <section className="mb-16 max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-6xl md:text-7xl">
              Engineering Handbook
            </h1>
            <p className="text-xl text-neutral-500 dark:text-neutral-400 md:text-2xl leading-relaxed">
              In-depth resources, principles, and best practices for normal
              engineer.
            </p>
          </section>

          {/* Categories / Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {groups.map((group) => {
              const firstPage = groupedPages[group][0];
              const pageCount = groupedPages[group].length;

              return (
                <Link
                  key={group}
                  to={`/page/${firstPage.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-neutral-100 p-8 transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-200 hover:shadow-lg dark:bg-neutral-900 dark:hover:bg-neutral-800"
                >
                  <div>
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                      {group}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {pageCount} {pageCount === 1 ? "article" : "articles"}
                    </p>
                  </div>

                  {/* A subtle arrow indicator that appears on hover, similar to Apple interfaces */}
                  <div className="mt-8 flex items-center justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-sm dark:bg-neutral-700 dark:text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
