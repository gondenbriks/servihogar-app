import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file (.xlsx)
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the sheet
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate buffer and trigger download
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Error al exportar a Excel. Por favor intenta de nuevo.');
    }
};
