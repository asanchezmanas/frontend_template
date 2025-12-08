// assets/js/modules/datatable/index.js
/**
 * DataTable Module
 * Advanced data table with sorting, filtering, pagination
 */

import { DataTable } from './datatable.js';

export async function init() {
  // Auto-initialize tables with data-datatable attribute
  const tables = document.querySelectorAll('[data-datatable]');
  
  tables.forEach(table => {
    const config = JSON.parse(table.dataset.datatable || '{}');
    new DataTable(table, config);
  });

  console.log(`[DataTable] Initialized ${tables.length} tables`);
}

export { DataTable };