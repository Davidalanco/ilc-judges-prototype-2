/**
 * Sanitize data to remove circular references and non-serializable objects
 * This prevents JSON.stringify errors when storing data in localStorage
 */

export function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) return data.map(sanitizeData);
  
  const sanitized: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      
      // Skip React-specific properties and DOM elements
      if (key.startsWith('__react') || 
          key.startsWith('_react') || 
          key.startsWith('$$') ||
          key.startsWith('_') ||
          value instanceof HTMLElement ||
          value instanceof Node ||
          value instanceof Event ||
          value instanceof EventTarget ||
          (typeof value === 'object' && value !== null && value.constructor?.name === 'FiberNode') ||
          (typeof value === 'object' && value !== null && value.constructor?.name === 'SyntheticEvent') ||
          (typeof value === 'object' && value !== null && value.constructor?.name === 'SyntheticBaseEvent')) {
        continue;
      }
      
      // Skip functions and other non-serializable values
      if (typeof value === 'function' || typeof value === 'symbol') {
        continue;
      }
      
      // Skip objects that might contain circular references
      if (typeof value === 'object' && value !== null) {
        // Check for common circular reference patterns
        if (value.constructor && value.constructor.name && 
            (value.constructor.name.includes('Component') || 
             value.constructor.name.includes('Element') ||
             value.constructor.name.includes('Node'))) {
          continue;
        }
      }
      
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeData(value);
    }
  }
  return sanitized;
}

/**
 * Safely stringify data with circular reference protection
 */
export function safeStringify(data: any): string {
  try {
    const sanitized = sanitizeData(data);
    return JSON.stringify(sanitized);
  } catch (error) {
    console.error('Error stringifying data:', error);
    throw new Error('Failed to serialize data');
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeParse(json: string): any {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Failed to parse JSON data');
  }
}
