/**
 * Parses a CSV string into an array of objects.
 * Assumes the first row is the header.
 * @param csvText The CSV string to parse.
 * @returns An array of objects.
 */
export function parseCSV(csvText: string): any[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
        return []; // No data rows
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);

    return dataRows.map(line => {
        const values = line.split(',');
        const obj: { [key: string]: any } = {};
        headers.forEach((header, index) => {
            const value = values[index]?.trim() || '';
            // Simple type conversion
            if (!isNaN(Number(value)) && value !== '') {
                obj[header] = Number(value);
            } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                obj[header] = value.toLowerCase() === 'true';
            } else {
                obj[header] = value;
            }
        });
        return obj;
    });
}
