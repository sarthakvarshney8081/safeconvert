import YAML from 'yaml';
import TOML from '@iarna/toml';
import convert from 'xml-js';
import { jsonToToon } from '@/lib/toon';

export type DataFormat = 'json' | 'yaml' | 'toml' | 'xml' | 'toon';

export function parseData(content: string, format: DataFormat): any {
    if (!content.trim()) return null;
    try {
        switch (format) {
            case 'json':
                return JSON.parse(content);
            case 'yaml':
                return YAML.parse(content);
            case 'toml':
                return TOML.parse(content);
            case 'xml':
                // xml-js returns a complex object structure (elements, attributes) or a simplified one depending on options
                // compact: true returns { root: { ... } }
                const result = convert.xml2js(content, { compact: true });
                // Often XML root is needed or we just return the object
                return result;
            case 'toon':
                // Attempt to parse TOON as YAML (since it's similar)
                return YAML.parse(content);
            default:
                return null;
        }
    } catch (e) {
        throw new Error(`Invalid ${format.toUpperCase()} format`);
    }
}

export function stringifyData(data: any, format: DataFormat): string {
    if (!data) return '';
    try {
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'yaml':
                return YAML.stringify(data);
            case 'toml':
                // TOML stringify might fail on complex objects or nulls/undefined in arrays etc.
                return TOML.stringify(data);
            case 'xml':
                return convert.js2xml(data, { compact: true, spaces: 2 });
            case 'toon':
                return jsonToToon(data);
            default:
                return '';
        }
    } catch (e) {
        return `Error converting to ${format.toUpperCase()}`;
    }
}
