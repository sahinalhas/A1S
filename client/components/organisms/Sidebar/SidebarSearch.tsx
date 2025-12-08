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
        if (!searchOpen) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
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

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleOpenSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const renderSearchResults = () => (
    <ScrollArea className="h-full max-h-[300px]">
      {isSearchLoading && (
        <div className="p-4 text-xs text-sidebar-foreground/60 text-center flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
          Aranıyor...
        </div>
      )}
      {!isSearchLoading && searchResults && (
        <>
          {searchResults.students.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Öğrenciler
              </div>
              {searchResults.students.slice(0, 3).map((student) => (
                <button
                  key={student.id}
                  onMouseDown={() =>
                    handleResultClick(`/ogrenci/${student.id}`)
                  }
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-sidebar-accent/50 transition-colors"
                >
                  <Users2 className="h-3.5 w-3.5 text-sidebar-foreground/50" />
                  <div className="flex-1 text-xs">
                    <div className="text-sidebar-foreground">
                      {student.name} {student.surname}
                    </div>
                    {student.class && (
                      <div className="text-[10px] text-sidebar-foreground/50">
                        {student.class}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {searchResults.counselingSessions?.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Görüşmeler
              </div>
              {searchResults.counselingSessions
                .slice(0, 3)
                .map((session) => (
                  <button
                    key={session.id}
                    onMouseDown={() => handleResultClick(`/gorusmeler`)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-sidebar-accent/50 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-sidebar-foreground/50" />
                    <div className="flex-1 text-xs text-sidebar-foreground">
                      {session.title}
                    </div>
                  </button>
                ))}
            </div>
          )}
          {searchResults.surveys?.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Anketler
              </div>
              {searchResults.surveys.slice(0, 3).map((survey) => (
                <button
                  key={survey.id}
                  onMouseDown={() => handleResultClick(`/anketler`)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-sidebar-accent/50 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-sidebar-foreground/50" />
                  <div className="text-xs text-sidebar-foreground">
                    {survey.title}
                  </div>
                </button>
              ))}
            </div>
          )}
          {searchResults.pages?.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Sayfalar
              </div>
              {searchResults.pages.slice(0, 3).map((page) => (
                <button
                  key={page.path}
                  onMouseDown={() => handleResultClick(page.path)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-sidebar-accent/50 transition-colors"
                >
                  <Search className="h-3.5 w-3.5 text-sidebar-foreground/50" />
                  <div className="text-xs text-sidebar-foreground">
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
              <div className="p-4 text-xs text-sidebar-foreground/50 text-center">
                Sonuç bulunamadı
              </div>
            )}
        </>
      )}
    </ScrollArea>
  );

  if (collapsed) {
    return (
      <div className="relative">
        <button
          onClick={handleOpenSearch}
          className={cn(
            "flex items-center justify-center w-full h-9 rounded-lg",
            "bg-sidebar-accent/30 hover:bg-sidebar-accent/50",
            "text-sidebar-foreground/60 hover:text-sidebar-foreground",
            "transition-all duration-200"
          )}
        >
          <Search className="h-4 w-4" />
        </button>

        {searchOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={handleCloseSearch}
            />
            <Card className="fixed left-16 top-24 w-72 max-h-[400px] overflow-hidden border-sidebar-border/50 z-50 shadow-xl">
              <div className="p-3 border-b border-sidebar-border/30">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-sidebar-foreground/50" />
                  <Input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ara..."
                    className="flex-1 h-8 border-0 bg-transparent text-sm focus-visible:ring-0 placeholder:text-sidebar-foreground/40"
                  />
                  <button
                    onClick={handleCloseSearch}
                    className="p-1 rounded hover:bg-sidebar-accent/50 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {searchQuery && searchQuery.length >= 2 && renderSearchResults()}
              {(!searchQuery || searchQuery.length < 2) && (
                <div className="p-4 text-xs text-sidebar-foreground/50 text-center">
                  Aramak için en az 2 karakter girin
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-2 h-9 px-3 rounded-lg",
          "bg-sidebar-accent/30 hover:bg-sidebar-accent/50",
          "border border-sidebar-border/50",
          "transition-all duration-200 cursor-text"
        )}
        onClick={handleOpenSearch}
      >
        <Search className="h-3.5 w-3.5 text-sidebar-foreground/50" />
        {!searchOpen ? (
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs text-sidebar-foreground/50">Ara...</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border/50 bg-sidebar px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/50">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        ) : (
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ara..."
            className="flex-1 h-6 p-0 border-0 bg-transparent text-xs focus-visible:ring-0 placeholder:text-sidebar-foreground/40"
            onBlur={() => {
              setTimeout(() => {
                setSearchOpen(false);
                setSearchQuery("");
              }, 200);
            }}
          />
        )}
      </div>

      {searchQuery && searchQuery.length >= 2 && (
        <Card className="absolute top-11 left-0 right-0 max-h-[300px] overflow-hidden border-sidebar-border/50 z-50 shadow-lg">
          {renderSearchResults()}
        </Card>
      )}
    </div>
  );
}

export default SidebarSearch;
