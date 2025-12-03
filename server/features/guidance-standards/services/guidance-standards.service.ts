import { v4 as uuidv4 } from 'uuid';
import type { GuidanceCategory, GuidanceItem, GuidanceStandard } from '../../../../shared/types/index.js';
import * as repository from '../repository/guidance-standards.repository.js';
import { seedGuidanceStandards } from '../../../lib/database/schema/guidance-standards.schema.js';
import getDatabase from '../../../lib/database.js';

function buildCategoryTree(categories: GuidanceCategory[], items: GuidanceItem[]): GuidanceCategory[] {
  const categoryMap = new Map<string, GuidanceCategory>();
  const rootCategories: GuidanceCategory[] = [];
  
  for (const category of categories) {
    categoryMap.set(category.id, { ...category, children: [], items: [] });
  }
  
  for (const item of items) {
    const category = categoryMap.get(item.categoryId);
    if (category) {
      category.items = category.items || [];
      category.items.push(item);
    }
  }
  
  for (const category of categoryMap.values()) {
    if (category.parentId === null) {
      rootCategories.push(category);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(category);
      }
    }
  }
  
  return rootCategories.sort((a, b) => a.order - b.order);
}

export function getAllStandards(): GuidanceStandard {
  const allCategories = repository.getAllCategories();
  const allItems = repository.getAllItems();
  
  const individualCategories = allCategories.filter(c => c.type === 'individual');
  const groupCategories = allCategories.filter(c => c.type === 'group');
  
  const individualTree = buildCategoryTree(individualCategories, allItems);
  const groupTree = buildCategoryTree(groupCategories, allItems);
  
  return {
    individual: individualTree,
    group: groupTree,
  };
}

export function getCategoryWithChildren(categoryId: string): GuidanceCategory | null {
  const category = repository.getCategoryById(categoryId);
  if (!category) return null;
  
  const allCategories = repository.getAllCategories();
  const allItems = repository.getAllItems();
  
  const descendantCategories = allCategories.filter(c => 
    c.id === categoryId || c.parentId === categoryId
  );
  
  const tree = buildCategoryTree(descendantCategories, allItems);
  return tree.length > 0 ? tree[0] : null;
}

export function createCategory(data: {
  title: string;
  type: 'individual' | 'group';
  parentId: string | null;
}): GuidanceCategory {
  let level = 1;
  let order = 1;
  
  if (data.parentId) {
    const parent = repository.getCategoryById(data.parentId);
    if (!parent) {
      throw new Error('Parent category not found');
    }
    level = parent.level + 1;
    
    const siblings = repository.getCategoriesByParent(data.parentId);
    order = siblings.length + 1;
  } else {
    const rootCategories = repository.getCategoriesByParent(null).filter(c => c.type === data.type);
    order = rootCategories.length + 1;
  }
  
  const newCategory: Omit<GuidanceCategory, 'createdAt' | 'updatedAt' | 'children' | 'items'> = {
    id: uuidv4(),
    title: data.title,
    type: data.type,
    parentId: data.parentId,
    level,
    order,
    isCustom: true,
  };
  
  repository.createCategory(newCategory);
  return { ...newCategory, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export function updateCategory(id: string, title: string): void {
  const existing = repository.getCategoryById(id);
  if (!existing) {
    throw new Error('Category not found');
  }
  repository.updateCategory(id, title);
}

export function deleteCategory(id: string): void {
  const existing = repository.getCategoryById(id);
  if (!existing) {
    throw new Error('Category not found');
  }
  repository.deleteCategory(id);
}

export function createItem(data: {
  title: string;
  categoryId: string;
}): GuidanceItem {
  const category = repository.getCategoryById(data.categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  
  const existingItems = repository.getItemsByCategory(data.categoryId);
  const order = existingItems.length + 1;
  
  const newItem: Omit<GuidanceItem, 'createdAt' | 'updatedAt'> = {
    id: uuidv4(),
    title: data.title,
    categoryId: data.categoryId,
    order,
    isCustom: true,
  };
  
  repository.createItem(newItem);
  return { ...newItem, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export function updateItem(id: string, title: string): void {
  const existing = repository.getItemById(id);
  if (!existing) {
    throw new Error('Item not found');
  }
  repository.updateItem(id, title);
}

export function deleteItem(id: string): void {
  const existing = repository.getItemById(id);
  if (!existing) {
    throw new Error('Item not found');
  }
  repository.deleteItem(id);
}

export function reorderItems(items: { id: string; order: number }[]): void {
  repository.reorderItems(items);
}

export function exportStandards(): GuidanceStandard {
  return getAllStandards();
}

export function importStandards(data: GuidanceStandard): void {
  repository.deleteAllData();
  
  const insertCategoryRecursive = (category: GuidanceCategory) => {
    repository.createCategory({
      id: category.id,
      title: category.title,
      type: category.type,
      parentId: category.parentId,
      level: category.level,
      order: category.order,
      isCustom: category.isCustom,
    });
    
    if (category.items) {
      for (const item of category.items) {
        repository.createItem({
          id: item.id,
          title: item.title,
          categoryId: item.categoryId,
          order: item.order,
          isCustom: item.isCustom,
        });
      }
    }
    
    if (category.children) {
      for (const child of category.children) {
        insertCategoryRecursive(child);
      }
    }
  };
  
  for (const category of data.individual) {
    insertCategoryRecursive(category);
  }
  
  for (const category of data.group) {
    insertCategoryRecursive(category);
  }
}

export function resetToDefaults(): void {
  const db = getDatabase();
  repository.deleteAllData();
  seedGuidanceStandards(db);
}

interface CounselingTopic {
  id: string;
  title: string;
  category: string;
  fullPath: string;
}

export function getIndividualTopicsFlat(): CounselingTopic[] {
  const allCategories = repository.getAllCategories();
  const allItems = repository.getAllItems();
  
  const individualCategories = allCategories.filter(c => c.type === 'individual');
  const individualTree = buildCategoryTree(individualCategories, allItems);
  
  const topics: CounselingTopic[] = [];
  
  const extractTopics = (categories: GuidanceCategory[], parentPath: string[] = []) => {
    for (const category of categories) {
      const currentPath = [...parentPath, category.title];
      
      if (category.items && category.items.length > 0) {
        for (const item of category.items) {
          topics.push({
            id: item.id,
            title: item.title,
            category: category.title,
            fullPath: currentPath.join(' > ')
          });
        }
      }
      
      if (category.children && category.children.length > 0) {
        extractTopics(category.children, currentPath);
      }
    }
  };
  
  extractTopics(individualTree);
  return topics;
}
