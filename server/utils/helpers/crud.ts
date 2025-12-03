import { sanitizeString } from '../../middleware/validation.js';

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'any';

export interface FieldConfig {
  name: string;
  type: FieldType;
  sanitize?: boolean;
  optional?: boolean;
  defaultValue?: any;
}

export interface CRUDConfig<T> {
  fields: FieldConfig[];
  repository: {
    insert: (data: T) => void;
    update: (id: string, data: Partial<T>) => void;
    delete: (id: string) => void;
    getByStudent: (studentId: string) => T[];
    getAll?: () => T[];
  };
}

export function createCRUDHelpers<T extends { id: string; studentId?: string }>(
  config: CRUDConfig<T>
) {
  function sanitizeField(value: any, fieldConfig: FieldConfig): any {
    if (value === undefined || value === null) {
      return fieldConfig.optional ? undefined : fieldConfig.defaultValue;
    }

    if (fieldConfig.sanitize && fieldConfig.type === 'string') {
      return sanitizeString(value);
    }

    return value;
  }

  function create(data: any): { success: boolean; id: string } {
    const sanitizedData: any = { id: data.id };

    for (const field of config.fields) {
      sanitizedData[field.name] = sanitizeField(data[field.name], field);
    }

    config.repository.insert(sanitizedData as T);
    return { success: true, id: sanitizedData.id };
  }

  function update(id: string, updates: any): { success: boolean } {
    const sanitizedUpdates: any = {};

    for (const field of config.fields) {
      if (updates[field.name] !== undefined) {
        sanitizedUpdates[field.name] = sanitizeField(updates[field.name], field);
      }
    }

    config.repository.update(id, sanitizedUpdates);
    return { success: true };
  }

  function deleteRecord(id: string): { success: boolean } {
    config.repository.delete(id);
    return { success: true };
  }

  function getByStudent(studentId: string): T[] {
    const sanitizedId = sanitizeString(studentId);
    return config.repository.getByStudent(sanitizedId);
  }

  function getAll(): T[] {
    if (!config.repository.getAll) {
      throw new Error('getAll method not provided in repository');
    }
    return config.repository.getAll();
  }

  return {
    create,
    update,
    delete: deleteRecord,
    getByStudent,
    getAll
  };
}
