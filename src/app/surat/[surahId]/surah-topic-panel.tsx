"use client";

import { useEffect, useRef, useState } from "react";

type TopicItem = {
  id: string;
  label: string;
};

type SurahTopicPanelProps = {
  topics: TopicItem[];
};

export function SurahTopicPanel({ topics }: SurahTopicPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topics.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    topics.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [topics]);

  useEffect(() => {
    if (!isOpen || !activeId) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-topic-id="${activeId}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isOpen, activeId]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  function scrollToTopic(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  }

  if (topics.length === 0) return null;

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-3 top-1/2 z-40 -translate-y-1/2 rounded-full border border-emerald-200/60 bg-white/90 p-2 text-emerald-700 shadow-[0_8px_30px_rgba(16,185,129,0.15)] backdrop-blur transition hover:bg-white hover:shadow-[0_12px_40px_rgba(16,185,129,0.22)]"
        aria-label="Daftar topik"
        title="Daftar topik"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-2"
        >
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[min(85vw,22rem)] border-l border-emerald-100 bg-white/95 shadow-[0_0_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-emerald-100 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Topik dalam Surat
            </p>
          </div>

          <div className="relative flex flex-1 overflow-hidden">
            {/* Close arrow on left edge of panel body */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-full border border-l-0 border-emerald-200 bg-white p-2 text-emerald-700 shadow-[0_4px_20px_rgba(16,185,129,0.15)] transition hover:bg-emerald-50"
              aria-label="Tutup panel"
              title="Tutup panel"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current stroke-2"
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-3 pl-10">
              <div className="flex flex-col gap-2">
                {topics.map((topic) => {
                  const isActive = activeId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      data-topic-id={topic.id}
                      type="button"
                      onClick={() => scrollToTopic(topic.id)}
                      className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
