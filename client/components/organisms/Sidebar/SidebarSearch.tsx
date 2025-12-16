import * as React from "react";
import { Search, Users2, MessageSquare, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Input } from "@/components/atoms/Input";
import { Card } from "@/components/organisms/Card";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { apiClient } from "@/lib/api/core/client";

interface SidebarSearchProps {
  collapsed?: boolean;
}

export function SidebarSearch({ collapsed }: SidebarSearchProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery<{
    students: any[];
    counselingSessions: any[];
    surveys: any[];
    pages: any[];
  }>({
    queryKey: ["/api/search/global", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        return { students: [], counselingSessions: [], surveys: [], pages: [] };
      }
      return apiClient.get(
        `/api/search/global?q=${encodeURIComponent(searchQuery)}`,
        { showErrorToast: false }
      );
    },
    enabled: searchQuery.length >= 2,
  });

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  React.useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleOpenSearch = () => {
    setSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const renderSearchResults = () => (
    <ScrollArea className="h-full max-h-[400px]">
      {isSearchLoading && (
        <div className="p-8 text-sm text-muted-foreground text-center flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          Aranıyor...
        </div>
      )}
      {!isSearchLoading && searchResults && (
        <div className="p-2 space-y-2">
          {searchResults.students.length > 0 && (
            <div>
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Öğrenciler
              </div>
              {searchResults.students.slice(0, 5).map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleResultClick(`/ogrenci/${student.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                >
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                    <Users2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {student.name} {student.surname}
                    </div>
                    {student.class && (
                      <div className="text-xs text-muted-foreground">
                        {student.class}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.counselingSessions?.length > 0 && (
            <div>
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Görüşmeler
              </div>
              {searchResults.counselingSessions.slice(0, 3).map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleResultClick(`/gorusmeler`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                >
                  <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {session.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.surveys?.length > 0 && (
            <div>
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Anketler
              </div>
              {searchResults.surveys.slice(0, 3).map((survey) => (
                <button
                  key={survey.id}
                  onClick={() => handleResultClick(`/anketler`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                >
                  <div className="size-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium text-foreground truncate">
                    {survey.title}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.pages?.length > 0 && (
            <div>
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Sayfalar
              </div>
              {searchResults.pages.slice(0, 3).map((page) => (
                <button
                  key={page.path}
                  onClick={() => handleResultClick(page.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                >
                  <div className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 group-hover:scale-105 transition-transform">
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium text-foreground truncate">
                    {page.label}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.students.length === 0 &&
            searchResults.counselingSessions?.length === 0 &&
            searchResults.surveys?.length === 0 &&
            searchResults.pages?.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto rounded-full bg-muted/50 p-3 w-12 h-12 flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Sonuç bulunamadı</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Lütfen farklı bir terim deneyin</p>
              </div>
            )}
        </div>
      )}
    </ScrollArea>
  );

  return (
    <>
      <button
        onClick={handleOpenSearch}
        className={cn(
          "group flex items-center transition-all duration-300 ease-out relative overflow-hidden",
          collapsed
            ? "justify-center w-10 h-10 rounded-lg mx-auto text-muted-foreground hover:bg-muted hover:text-foreground"
            : "w-full gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        {/* Hover glow effect only when expanded */}
        {!collapsed && (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "rounded-lg"
            )}
          />
        )}

        <div className="relative z-10 shrink-0">
          <Search className={cn(
            "transition-colors",
            collapsed
              ? "h-5 w-5"
              : "text-sidebar-foreground/70 group-hover:text-primary h-4 w-4"
          )} />
        </div>

        <span
          className={cn(
            "flex-1 text-left truncate whitespace-nowrap overflow-hidden transition-all duration-300 relative z-10",
            collapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
          )}
        >
          Hızlı Arama
        </span>

        {!collapsed && (
          <div className="relative z-10 flex items-center gap-0.5 ml-auto">
            <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border border-sidebar-border/40 bg-sidebar/50 px-1 font-mono text-[10px] font-medium text-sidebar-foreground/40">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        )}
      </button>

      {/* Centered Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <div
            className="fixed inset-0 bg-background/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleCloseSearch}
          />
          <Card className="relative w-full max-w-lg overflow-hidden border-border/50 shadow-2xl backdrop-blur-xl bg-background/95 ring-1 ring-border/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Öğrenci, görüşme veya sayfa ara..."
                className="flex-1 h-9 border-0 bg-transparent text-base focus-visible:ring-0 placeholder:text-muted-foreground/50 px-0 shadow-none"
              />
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">ESC</span>
                </kbd>
                <button
                  onClick={handleCloseSearch}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {searchQuery && searchQuery.length >= 2 ? (
              renderSearchResults()
            ) : (
              <div className="p-12 text-center text-muted-foreground/60 text-sm">
                Aramaya başlamak için yazmaya devam edin...
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

export default SidebarSearch;
