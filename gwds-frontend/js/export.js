import { Api } from './api.js';
import { CONFIG } from './config.js';

export const Exportar = {

  async pdf(entidade, filtros = {}) {
    const { rows, headers } = await Api.export({ entidade, ...filtros });
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Gaza Water Data System', 40, 40);
    doc.setFontSize(10);
    doc.text(CONFIG.ORGANIZATION, 40, 56);
    doc.text(`Listagem: ${entidade.toUpperCase()}   Gerado em: ${new Date().toLocaleString('pt-PT')}`, 40, 72);
    const filtroTxt = Object.entries(filtros).filter(([k,v]) => v).map(([k,v]) => `${k}=${v}`).join('  ');
    if (filtroTxt) doc.text(`Filtros: ${filtroTxt}`, 40, 86);
    const body = rows.map(r => headers.map(h => String(r[h] ?? '')));
    doc.autoTable({
      head: [headers], body, startY: 100, theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [31,78,121] }
    });
    doc.save(`gwds_${entidade}_${Date.now()}.pdf`);
  },

  async xlsx(entidade, filtros = {}) {
    const { rows, headers } = await Api.export({ entidade, ...filtros });
    const data = [headers, ...rows.map(r => headers.map(h => r[h] ?? ''))];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, entidade);
    XLSX.writeFile(wb, `gwds_${entidade}_${Date.now()}.xlsx`);
  }
};
