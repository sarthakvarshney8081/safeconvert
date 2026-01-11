
/**
 * Convert JSON to TOON (Token-Oriented Object Notation)
 * Goals: Eliminate syntax, use indentation, use tables for uniform arrays.
 */
export function countTokens(text: string): number {
    // Approximation: 1 Token ~= 4 Characters
    if (!text) return 0;
    return Math.ceil(text.length / 4);
}

export function jsonToToon(json: any, indentLevel = 0): string {
    const indent = '  '.repeat(indentLevel);

    if (json === null) return 'null';
    if (typeof json === 'undefined') return 'undefined';

    if (typeof json !== 'object') {
        // Primitives
        if (typeof json === 'string') {
            // Unquote if clean identifier, otherwise keep quotes
            if (/^[a-zA-Z0-9_.\-]+$/.test(json)) return json;
            return `"${json}"`;
        }
        return String(json);
    }

    if (Array.isArray(json)) {
        if (json.length === 0) return '[]';

        // Check if Array of Uniform Objects (for Table view)
        // Must have same keys and values be primitives (or simple enough)
        const isUniformObjectArray = json.every(item =>
            typeof item === 'object' && item !== null && !Array.isArray(item)
        );

        if (isUniformObjectArray && json.length > 0) {
            const keys = Object.keys(json[0]);
            const allMatch = json.every(item => {
                const k = Object.keys(item);
                return k.length === keys.length && k.every((val, i) => val === keys[i]);
            });

            if (allMatch && keys.length > 0) {
                // Render as Table
                // | id | name |
                // | 1 | John |
                const header = `| ${keys.join(' | ')} |`;
                const rows = json.map(obj => {
                    const values = keys.map(k => {
                        let v = obj[k];
                        if (typeof v === 'object') {
                            // Simplify complex objects in table cells
                            return JSON.stringify(v);
                        }
                        return String(v);
                    });
                    return `| ${values.join(' | ')} |`;
                });

                // Add indent to table
                const table = [header, ...rows].map(line => indent + line).join('\n');
                return table;
            }
        }

        // Standard List
        // - item
        return json.map(item => {
            const itemStr = jsonToToon(item, indentLevel + 1).trim();
            // If item was an object/array that resulted in multiple lines, 
            // we might need to adjust formatting.
            // TOON usually puts dash then content.
            if (typeof item === 'object' && item !== null) {
                // If it's an object starting with keys, allow it on next line or same?
                // YAML style:
                // - key: val
                //   key2: val
                // For now, let's just indent recursively
                return `${indent}- ${itemStr}`;
            }
            return `${indent}- ${itemStr}`;
        }).join('\n');
    }

    // Object
    const keys = Object.keys(json);
    if (keys.length === 0) return '{}';

    return keys.map(key => {
        const keyStr = /^[a-zA-Z0-9_]+$/.test(key) ? key : `"${key}"`;
        const value = json[key];

        if (typeof value === 'object' && value !== null) {
            // Nested Object/Array
            // key:
            //   val
            return `${indent}${keyStr}:\n${jsonToToon(value, indentLevel + 1)}`;
        }
        // Primitive
        return `${indent}${keyStr}: ${jsonToToon(value, 0)}`;
    }).join('\n');
}
