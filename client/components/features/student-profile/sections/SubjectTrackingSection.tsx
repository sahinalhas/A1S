import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/organisms/Accordion";
import {
  loadSubjects,
  loadSubjectsAsync,
  loadTopics,
  loadTopicsAsync,
  getProgressByStudent,
  loadProgressAsync,
  ensureProgressForStudent,
  setCompletedFlag,
  saveProgress,
  loadProgress,
} from "@/lib/storage";
import { CheckCircle2, Circle, BookOpen, Target } from "lucide-react";
import { Label } from "@/components/atoms/Label";

interface SubjectTrackingSectionProps {
  studentId: string;
  onUpdate: () => void;
}

export default function SubjectTrackingSection({
  studentId,
  onUpdate,
}: SubjectTrackingSectionProps) {
  const [subjects, setSubjects] = useState<Awaited<ReturnType<typeof loadSubjects>>>([]);
  const [topics, setTopics] = useState<Awaited<ReturnType<typeof loadTopics>>>([]);
  const [progress, setProgress] = useState<Awaited<ReturnType<typeof getProgressByStudent>>>([]);
  const [refresh, setRefresh] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadSubjectsAsync(),
        loadTopicsAsync(),
        ensureProgressForStudent(studentId).then(() => loadProgressAsync())
      ]);

      setSubjects(loadSubjects());
      setTopics(loadTopics());
      setProgress(getProgressByStudent(studentId));
    };

    loadData();

    const handleUpdate = () => {
      if (!isUpdatingRef.current) {
        setSubjects(loadSubjects());
        setTopics(loadTopics());
        setProgress(getProgressByStudent(studentId));
      }
    };

    window.addEventListener('subjectsUpdated', handleUpdate);
    window.addEventListener('topicsUpdated', handleUpdate);
    window.addEventListener('progressUpdated', handleUpdate);

    return () => {
      window.removeEventListener('subjectsUpdated', handleUpdate);
      window.removeEventListener('topicsUpdated', handleUpdate);
      window.removeEventListener('progressUpdated', handleUpdate);
    };
  }, [studentId, refresh]);

  const categories = useMemo(() => {
    const cats = new Set(subjects.map((s) => s.category).filter(Boolean));
    // Remove 'School' category if it exists
    cats.delete('School');
    const categoriesArray = Array.from(cats) as string[];
    
    // Sort categories in specific order: LGS, TYT, AYT, YDT
    const order = ['LGS', 'TYT', 'AYT', 'YDT'];
    return categoriesArray.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      
      // If both are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only a is in the order array, it comes first
      if (indexA !== -1) return -1;
      // If only b is in the order array, it comes first
      if (indexB !== -1) return 1;
      // Otherwise, sort alphabetically
      return a.localeCompare(b);
    });
  }, [subjects]);

  // Set initial category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => s.category === selectedCategory && s.category !== 'School');
  }, [subjects, selectedCategory]);

  const getTopicProgress = (topicId: string) => {
    return progress.find((p) => p.topicId === topicId);
  };

  const handleToggleComplete = async (topicId: string, currentState: boolean) => {
    await setCompletedFlag(studentId, topicId, !currentState);
    setRefresh((r) => r + 1);
    onUpdate();
  };

  const handleUpdateQuestionStats = useCallback(async (
    topicId: string, 
    field: 'questionsSolved' | 'questionsCorrect' | 'questionsWrong',
    value: number
  ) => {
    // Debounce the API call
    const timeoutKey = `${topicId}-${field}`;
    if (updateTimeoutRef.current[timeoutKey]) {
      clearTimeout(updateTimeoutRef.current[timeoutKey]);
    }

    updateTimeoutRef.current[timeoutKey] = setTimeout(async () => {
      isUpdatingRef.current = true;
      
      setProgress(prevProgress => {
        const updated = prevProgress.map(p => 
          p.topicId === topicId ? { ...p, [field]: value } : p
        );
        
        saveProgress(updated).catch(error => {
          console.error('Error updating question stats:', error);
          loadProgressAsync().then(() => {
            const revertedProgress = getProgressByStudent(studentId);
            setProgress(revertedProgress);
          });
        }).finally(() => {
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        });
        
        return updated;
      });
      
      onUpdate();
    }, 500);
  }, [studentId, onUpdate]);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'TYT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AYT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LGS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'YDT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'School':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryStats = (category: string) => {
    const subjectsInCategory = subjects.filter(s => s.category === category);

    const topicsInCategory = topics.filter(t => 
      subjectsInCategory.some(s => s.id === t.subjectId)
    );

    const completedTopics = topicsInCategory.filter(t => {
      const prog = getTopicProgress(t.id);
      return prog?.completedFlag;
    });

    return {
      total: topicsInCategory.length,
      completed: completedTopics.length,
      percentage: topicsInCategory.length > 0 
        ? Math.round((completedTopics.length / topicsInCategory.length) * 100)
        : 0,
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Konu Takibi
            </CardTitle>
            <CardDescription>
              Konuların tamamlanma durumunu takip edin ve çalışma planınızı optimize edin
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {getCategoryStats(selectedCategory).completed} / {getCategoryStats(selectedCategory).total} tamamlandı
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="gap-2"
            >
              {cat}
              <Badge variant="secondary" className="ml-1">
                {getCategoryStats(cat).completed}/{getCategoryStats(cat).total}
              </Badge>
            </Button>
          ))}
        </div>

        <Accordion type="multiple" className="w-full">
          {filteredSubjects.map((subject) => {
            const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
            const completedCount = subjectTopics.filter(t => getTopicProgress(t.id)?.completedFlag).length;

            if (subjectTopics.length === 0) return null;

            return (
              <AccordionItem key={subject.id} value={subject.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">{subject.name}</span>
                      {subject.category && (
                        <Badge variant="outline" className={getCategoryColor(subject.category)}>
                          {subject.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {completedCount} / {subjectTopics.length}
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${subjectTopics.length > 0 ? (completedCount / subjectTopics.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {subjectTopics.map((topic) => {
                      const topicProgress = getTopicProgress(topic.id);
                      const isCompleted = topicProgress?.completedFlag || false;

                      return (
                        <div
                          key={topic.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            isCompleted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => handleToggleComplete(topic.id, isCompleted)}
                            >
                              <div className="flex items-center gap-3 p-1 rounded hover:bg-gray-100 transition-colors">
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => handleToggleComplete(topic.id, isCompleted)}
                                  className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <Label 
                                  className={`cursor-pointer text-base ${
                                    isCompleted ? 'text-green-900 font-medium' : 'text-gray-700'
                                  }`}
                                >
                                  {topic.name}
                                  {isCompleted && (
                                    <CheckCircle2 className="inline-block h-4 w-4 ml-2 text-green-600" />
                                  )}
                                </Label>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {topicProgress && (
                                <>
                                  <span>
                                    {topicProgress.completed} / {topic.avgMinutes} dk
                                  </span>
                                  {topicProgress.lastStudied && (
                                    <Badge variant="outline" className="text-xs">
                                      Son: {new Date(topicProgress.lastStudied).toLocaleDateString('tr-TR')}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {topicProgress && (
                            <div className="flex items-center gap-4 pl-9 text-sm">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground">Çözülen:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={topicProgress.questionsSolved || ''}
                                  onChange={(e) => {
                                    const newValue = parseInt(e.target.value) || 0;
                                    setProgress(prev => prev.map(p => 
                                      p.topicId === topic.id ? { ...p, questionsSolved: newValue } : p
                                    ));
                                    handleUpdateQuestionStats(topic.id, 'questionsSolved', newValue);
                                  }}
                                  className="h-7 w-16 text-xs"
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-green-600">Doğru:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={topicProgress.questionsSolved || 0}
                                  value={topicProgress.questionsCorrect || ''}
                                  onChange={(e) => {
                                    const newValue = parseInt(e.target.value) || 0;
                                    setProgress(prev => prev.map(p => 
                                      p.topicId === topic.id ? { ...p, questionsCorrect: newValue } : p
                                    ));
                                    handleUpdateQuestionStats(topic.id, 'questionsCorrect', newValue);
                                  }}
                                  className="h-7 w-16 text-xs border-green-200"
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-red-600">Yanlış:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={topicProgress.questionsSolved || 0}
                                  value={topicProgress.questionsWrong || ''}
                                  onChange={(e) => {
                                    const newValue = parseInt(e.target.value) || 0;
                                    setProgress(prev => prev.map(p => 
                                      p.topicId === topic.id ? { ...p, questionsWrong: newValue } : p
                                    ));
                                    handleUpdateQuestionStats(topic.id, 'questionsWrong', newValue);
                                  }}
                                  className="h-7 w-16 text-xs border-red-200"
                                  placeholder="0"
                                />
                              </div>
                              {(topicProgress.questionsSolved || 0) > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  %{Math.round(((topicProgress.questionsCorrect || 0) / (topicProgress.questionsSolved || 1)) * 100)} başarı
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Bu kategoride ders bulunamadı</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}