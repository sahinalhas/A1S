import { useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Card } from "@/components/organisms/Card";

interface ActionItem {
 id?: string;
 description?: string;
 assignedTo?: string;
 dueDate?: string;
 priority?: 'low' | 'medium' | 'high';
}

interface ActionItemsManagerProps {
 items: ActionItem[];
 onItemsChange: (items: ActionItem[]) => void;
}

export default function ActionItemsManager({ items, onItemsChange }: ActionItemsManagerProps) {
 const [newItem, setNewItem] = useState("");

 const addItem = () => {
 if (!newItem.trim()) return;

 const item: ActionItem = {
 id: `action_${Date.now()}`,
 description: newItem.trim(),
 priority: 'medium'
 };

 onItemsChange([...items, item]);
 setNewItem("");
 };

 const removeItem = (id: string | undefined) => {
 if (!id) return;
 onItemsChange(items.filter(item => item.id !== id));
 };

 const updateItem = (id: string | undefined, updates: Partial<ActionItem>) => {
 if (!id) return;
 onItemsChange(items.map(item => 
 item.id === id ? { ...item, ...updates } : item
 ));
 };

 const priorityColors = {
 low: 'text-blue-600',
 medium: 'text-yellow-600',
 high: 'text-red-600'
 };

 const priorityLabels = {
 low: 'Düşük',
 medium: 'Orta',
 high: 'Yüksek'
 };

 return (
 <div className="space-y-4">
 <div className="flex gap-2">
 <Input
 placeholder="Yeni eylem maddesi..."
 value={newItem}
 onChange={(e) => setNewItem(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && addItem()}
 />
 <Button type="button" onClick={addItem} size="sm">
 <Plus className="h-4 w-4 mr-1" />
 Ekle
 </Button>
 </div>

 {items.length > 0 && (
 <div className="space-y-2">
 {items.map((item) => (
 <Card key={item.id} className="p-3">
 <div className="space-y-2">
 <div className="flex items-start justify-between gap-2">
 <p className="text-sm flex-1">{item.description}</p>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeItem(item.id)}
 >
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>

 <div className="grid grid-cols-3 gap-2">
 <Input
 placeholder="Atanan kişi"
 value={item.assignedTo || ''}
 onChange={(e) => updateItem(item.id, { assignedTo: e.target.value })}
 className="text-xs"
 />

 <div className="relative">
 <Input
 type="date"
 value={item.dueDate || ''}
 onChange={(e) => updateItem(item.id, { dueDate: e.target.value })}
 className="text-xs"
 />
 </div>

 <Select
 value={item.priority}
 onValueChange={(value) => updateItem(item.id, { priority: value as ActionItem['priority'] })}
 >
 <SelectTrigger className="text-xs">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(priorityLabels).map(([value, label]) => (
 <SelectItem key={value} value={value} className="text-xs">
 <span className={priorityColors[value as keyof typeof priorityColors]}>
 {label}
 </span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </Card>
 ))}
 </div>
 )}
 </div>
 );
}
