import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { Card, CardContent, CardHeader } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { questionTypeIcons, questionTypeLabels } from "./QuestionTypeSelector";
import { SurveyTemplateForm } from "../types";

interface QuestionEditorProps {
 control: Control<SurveyTemplateForm>;
 questionIndex: number;
 onRemove: () => void;
 setValue: UseFormSetValue<SurveyTemplateForm>;
 watch: UseFormWatch<SurveyTemplateForm>;
}

export function QuestionEditor({ 
 control, 
 questionIndex, 
 onRemove,
 setValue,
 watch
}: QuestionEditorProps) {
 const questionType = watch(`questions.${questionIndex}.questionType`);
 const options = watch(`questions.${questionIndex}.options`);
 const Icon = questionTypeIcons[questionType];

 const addOption = () => {
 const currentOptions = options || [];
 setValue(`questions.${questionIndex}.options`, [...currentOptions,""]);
 };

 const removeOption = (optionIndex: number) => {
 const currentOptions = options || [];
 const newOptions = currentOptions.filter((_: any, i: number) => i !== optionIndex);
 setValue(`questions.${questionIndex}.options`, newOptions);
 };

 const showOptionsField = questionType ==="MULTIPLE_CHOICE" || questionType ==="DROPDOWN";

 return (
 <Card>
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
 <Badge variant="outline" className="gap-1">
 <Icon className="h-3 w-3" />
 {questionTypeLabels[questionType]}
 </Badge>
 <span className="text-sm text-muted-foreground">
 Soru {questionIndex + 1}
 </span>
 </div>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={onRemove}
 >
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <FormField
 control={control}
 name={`questions.${questionIndex}.questionText`}
 render={({ field }) => (
 <FormItem>
 <FormLabel>Soru Metni</FormLabel>
 <FormControl>
 <Input 
 placeholder="Sorunuzu buraya yazın..."
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 {showOptionsField && (
 <div className="space-y-2">
 <FormLabel>Seçenekler</FormLabel>
 {(options || []).map((option: string, optionIndex: number) => (
 <FormField
 key={optionIndex}
 control={control}
 name={`questions.${questionIndex}.options.${optionIndex}`}
 render={({ field }) => (
 <FormItem>
 <div className="flex gap-2">
 <FormControl>
 <Input
 placeholder={`Seçenek ${optionIndex + 1}`}
 {...field}
 />
 </FormControl>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeOption(optionIndex)}
 disabled={options.length <= 1}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 <FormMessage />
 </FormItem>
 )}
 />
 ))}
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={addOption}
 className="w-full"
 >
 <Plus className="mr-2 h-4 w-4" />
 Seçenek Ekle
 </Button>
 </div>
 )}

 <FormField
 control={control}
 name={`questions.${questionIndex}.required`}
 render={({ field }: { field: { value: boolean; onChange: (value: boolean) => void } }) => (
 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
 <div className="space-y-0.5">
 <FormLabel>Zorunlu Soru</FormLabel>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />
 </CardContent>
 </Card>
 );
}
