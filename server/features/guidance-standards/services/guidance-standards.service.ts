import { v4 as uuidv4 } from 'uuid';
import type { GuidanceCategory, GuidanceItem, GuidanceStandard } from '../../../../shared/types/index.js';
import * as repository from '../repository/guidance-standards.repository.js';

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

export async function getAllStandards(): Promise<GuidanceStandard> {
  const allCategories = await repository.getAllCategories();
  const allItems = await repository.getAllItems();
  
  const individualCategories = allCategories.filter(c => c.type === 'individual');
  const groupCategories = allCategories.filter(c => c.type === 'group');
  
  const individualTree = buildCategoryTree(individualCategories, allItems);
  const groupTree = buildCategoryTree(groupCategories, allItems);
  
  return {
    individual: individualTree,
    group: groupTree,
  };
}

export async function getCategoryWithChildren(categoryId: string): Promise<GuidanceCategory | null> {
  const category = await repository.getCategoryById(categoryId);
  if (!category) return null;
  
  const allCategories = await repository.getAllCategories();
  const allItems = await repository.getAllItems();
  
  const descendantCategories = allCategories.filter(c => 
    c.id === categoryId || c.parentId === categoryId
  );
  
  const tree = buildCategoryTree(descendantCategories, allItems);
  return tree.length > 0 ? tree[0] : null;
}

export async function createCategory(data: {
  title: string;
  type: 'individual' | 'group';
  parentId: string | null;
}): Promise<GuidanceCategory> {
  let level = 1;
  let order = 1;
  
  if (data.parentId) {
    const parent = await repository.getCategoryById(data.parentId);
    if (!parent) {
      throw new Error('Parent category not found');
    }
    level = parent.level + 1;
    
    const siblings = await repository.getCategoriesByParent(data.parentId);
    order = siblings.length + 1;
  } else {
    const rootCategories = (await repository.getCategoriesByParent(null)).filter(c => c.type === data.type);
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
  
  await repository.createCategory(newCategory);
  return { ...newCategory, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export async function updateCategory(id: string, title: string): Promise<void> {
  const existing = await repository.getCategoryById(id);
  if (!existing) {
    throw new Error('Category not found');
  }
  await repository.updateCategory(id, title);
}

export async function deleteCategory(id: string): Promise<void> {
  const existing = await repository.getCategoryById(id);
  if (!existing) {
    throw new Error('Category not found');
  }
  await repository.deleteCategory(id);
}

export async function createItem(data: {
  title: string;
  categoryId: string;
}): Promise<GuidanceItem> {
  const category = await repository.getCategoryById(data.categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  
  const existingItems = await repository.getItemsByCategory(data.categoryId);
  const order = existingItems.length + 1;
  
  const newItem: Omit<GuidanceItem, 'createdAt' | 'updatedAt'> = {
    id: uuidv4(),
    title: data.title,
    categoryId: data.categoryId,
    order,
    isCustom: true,
  };
  
  await repository.createItem(newItem);
  return { ...newItem, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export async function updateItem(id: string, title: string): Promise<void> {
  const existing = await repository.getItemById(id);
  if (!existing) {
    throw new Error('Item not found');
  }
  await repository.updateItem(id, title);
}

export async function deleteItem(id: string): Promise<void> {
  const existing = await repository.getItemById(id);
  if (!existing) {
    throw new Error('Item not found');
  }
  await repository.deleteItem(id);
}

export async function reorderItems(items: { id: string; order: number }[]): Promise<void> {
  await repository.reorderItems(items);
}

export async function exportStandards(): Promise<GuidanceStandard> {
  return getAllStandards();
}

export async function importStandards(data: GuidanceStandard): Promise<void> {
  await repository.deleteAllData();
  
  const insertCategoryRecursive = async (category: GuidanceCategory) => {
    await repository.createCategory({
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
        await repository.createItem({
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
        await insertCategoryRecursive(child);
      }
    }
  };
  
  for (const category of data.individual) {
    await insertCategoryRecursive(category);
  }
  
  for (const category of data.group) {
    await insertCategoryRecursive(category);
  }
}

export async function resetToDefaults(): Promise<void> {
  await repository.deleteAllData();
}

interface CounselingTopic {
  id: string;
  title: string;
  category: string;
  fullPath: string;
}

export async function getIndividualTopicsFlat(): Promise<CounselingTopic[]> {
  const allCategories = await repository.getAllCategories();
  const allItems = await repository.getAllItems();
  
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
