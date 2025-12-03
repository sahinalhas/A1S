export interface GuidanceItem {
  id: string;
  title: string;
  categoryId: string;
  order: number;
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuidanceCategory {
  id: string;
  title: string;
  type: 'individual' | 'group';
  parentId: string | null;
  level: number;
  order: number;
  isCustom: boolean;
  children?: GuidanceCategory[];
  items?: GuidanceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GuidanceStandard {
  individual: GuidanceCategory[];
  group: GuidanceCategory[];
}

export interface GuidanceStandardsResponse {
  standards: GuidanceStandard;
}

export interface CreateCategoryRequest {
  title: string;
  type: 'individual' | 'group';
  parentId: string | null;
}

export interface UpdateCategoryRequest {
  title: string;
}

export interface CreateItemRequest {
  title: string;
  categoryId: string;
}

export interface UpdateItemRequest {
  title: string;
}

export interface ReorderItemsRequest {
  items: { id: string; order: number }[];
}
