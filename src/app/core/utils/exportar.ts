import writeXlsxFile from 'write-excel-file/universal';

export type Celda = string | number | null;

export async function exportarExcel(nombreArchivo: string, encabezados: string[], filas: Celda[][]): Promise<void> {
  const data = [
    encabezados.map((h) => ({ value: h, fontWeight: 'bold' as const })),
    ...filas.map((fila) => fila.map((v) => (v === null ? null : { value: v }))),
  ];
  const blob = await writeXlsxFile(data).toBlob();
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(url);
}

export function exportarPdf(): void {
  window.print();
}
