// assets/js/modules/datatable/datatable.js
/**
 * DataTable Class
 * Feature-rich data table component
 */

class DataTable {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;

    if (!this.element) {
      throw new Error('DataTable: Element not found');
    }

    this.options = {
      data: [],
      columns: [],
      pageSize: 10,
      pageSizeOptions: [5, 10, 25, 50, 100],
      sortable: true,
      filterable: true,
      searchable: true,
      selectable: false,
      multiSelect: false,
      exportable: true,
      responsive: true,
      emptyMessage: 'No hay datos disponibles',
      ...options
    };

    this.state = {
      data: [],
      filteredData: [],
      displayData: [],
      currentPage: 1,
      pageSize: this.options.pageSize,
      sortColumn: null,
      sortDirection: 'asc',
      searchTerm: '',
      filters: {},
      selectedRows: new Set()
    };

    this.init();
  }

  init() {
    // Extract data from table if not provided
    if (this.options.data.length === 0) {
      this.extractDataFromTable();
    } else {
      this.state.data = [...this.options.data];
    }

    // Build the table
    this.render();
    this.attachEventListeners();
    this.updateDisplay();
  }

  extractDataFromTable() {
    const rows = this.element.querySelectorAll('tbody tr');
    const headers = Array.from(this.element.querySelectorAll('thead th')).map(th => ({
      key: th.dataset.key || th.textContent.toLowerCase().replace(/\s+/g, '_'),
      label: th.textContent.trim()
    }));

    this.options.columns = headers;

    this.state.data = Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      const rowData = {};
      
      headers.forEach((header, index) => {
        rowData[header.key] = cells[index]?.textContent.trim() || '';
      });
      
      return rowData;
    });
  }

  render() {
    const container = document.createElement('div');
    container.className = 'datatable';
    container.innerHTML = this.template();

    // Replace original table
    this.element.replaceWith(container);
    this.element = container;
  }

  template() {
    return `
      <div class="datatable__header">
        <div class="datatable__header-left">
          ${this.options.searchable ? `
            <div class="datatable__search">
              <input 
                type="text" 
                class="datatable__search-input"
                placeholder="Buscar..."
                data-search
              />
            </div>
          ` : ''}
        </div>
        <div class="datatable__header-right">
          ${this.options.exportable ? `
            <button type="button" class="datatable__btn" data-export="csv">
              Exportar CSV
            </button>
          ` : ''}
        </div>
      </div>

      <div class="datatable__wrapper">
        <table class="datatable__table">
          <thead>
            <tr>
              ${this.options.selectable ? `
                <th class="datatable__th datatable__th--checkbox">
                  ${this.options.multiSelect ? `
                    <input type="checkbox" data-select-all />
                  ` : ''}
                </th>
              ` : ''}
              ${this.options.columns.map(col => `
                <th 
                  class="datatable__th ${this.options.sortable && col.sortable !== false ? 'datatable__th--sortable' : ''}"
                  data-column="${col.key}"
                >
                  <div class="datatable__th-content">
                    <span>${col.label}</span>
                    ${this.options.sortable && col.sortable !== false ? `
                      <span class="datatable__sort">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="18 15 12 9 6 15"/>
                        </svg>
                      </span>
                    ` : ''}
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody data-tbody>
            <!-- Rows will be inserted here -->
          </tbody>
        </table>
      </div>

      <div class="datatable__footer">
        <div class="datatable__footer-left">
          <div class="datatable__page-size">
            <label>
              Mostrar
              <select data-page-size>
                ${this.options.pageSizeOptions.map(size => `
                  <option value="${size}" ${size === this.state.pageSize ? 'selected' : ''}>
                    ${size}
                  </option>
                `).join('')}
              </select>
              entradas
            </label>
          </div>
        </div>
        <div class="datatable__footer-right">
          <div class="datatable__info" data-info></div>
          <div class="datatable__pagination" data-pagination></div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Search
    const searchInput = this.element.querySelector('[data-search]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Sort
    if (this.options.sortable) {
      this.element.querySelectorAll('.datatable__th--sortable').forEach(th => {
        th.addEventListener('click', () => {
          this.handleSort(th.dataset.column);
        });
      });
    }

    // Page size
    const pageSizeSelect = this.element.querySelector('[data-page-size]');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.handlePageSizeChange(parseInt(e.target.value));
      });
    }

    // Export
    const exportBtn = this.element.querySelector('[data-export]');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.export(exportBtn.dataset.export);
      });
    }

    // Select all
    const selectAllCheckbox = this.element.querySelector('[data-select-all]');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        this.handleSelectAll(e.target.checked);
      });
    }
  }

  handleSearch(term) {
    this.state.searchTerm = term.toLowerCase();
    this.state.currentPage = 1;
    this.updateDisplay();
  }

  handleSort(column) {
    if (this.state.sortColumn === column) {
      // Toggle direction
      this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.sortColumn = column;
      this.state.sortDirection = 'asc';
    }

    this.updateDisplay();
  }

  handlePageSizeChange(size) {
    this.state.pageSize = size;
    this.state.currentPage = 1;
    this.updateDisplay();
  }

  handleSelectAll(checked) {
    if (checked) {
      this.state.displayData.forEach((_, index) => {
        this.state.selectedRows.add(index);
      });
    } else {
      this.state.selectedRows.clear();
    }
    this.updateDisplay();
  }

  updateDisplay() {
    // Filter
    this.filterData();
    
    // Sort
    this.sortData();
    
    // Paginate
    this.paginateData();
    
    // Render
    this.renderRows();
    this.renderPagination();
    this.renderInfo();
  }

  filterData() {
    let filtered = [...this.state.data];

    // Apply search
    if (this.state.searchTerm) {
      filtered = filtered.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(this.state.searchTerm)
        );
      });
    }

    // Apply column filters
    Object.entries(this.state.filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => 
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    this.state.filteredData = filtered;
  }

  sortData() {
    if (!this.state.sortColumn) return;

    this.state.filteredData.sort((a, b) => {
      const aVal = a[this.state.sortColumn];
      const bVal = b[this.state.sortColumn];

      // Try numeric comparison
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return this.state.sortDirection === 'asc' 
          ? aNum - bNum 
          : bNum - aNum;
      }

      // String comparison
      const comparison = String(aVal).localeCompare(String(bVal));
      return this.state.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  paginateData() {
    const start = (this.state.currentPage - 1) * this.state.pageSize;
    const end = start + this.state.pageSize;
    this.state.displayData = this.state.filteredData.slice(start, end);
  }

  renderRows() {
    const tbody = this.element.querySelector('[data-tbody]');
    
    if (this.state.displayData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${this.options.columns.length + (this.options.selectable ? 1 : 0)}" 
              class="datatable__empty">
            ${this.options.emptyMessage}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.state.displayData.map((row, index) => `
      <tr class="datatable__row">
        ${this.options.selectable ? `
          <td class="datatable__td datatable__td--checkbox">
            <input 
              type="${this.options.multiSelect ? 'checkbox' : 'radio'}"
              ${this.state.selectedRows.has(index) ? 'checked' : ''}
              data-row-select="${index}"
            />
          </td>
        ` : ''}
        ${this.options.columns.map(col => `
          <td class="datatable__td">
            ${this.renderCell(row, col)}
          </td>
        `).join('')}
      </tr>
    `).join('');

    // Attach row selection listeners
    if (this.options.selectable) {
      tbody.querySelectorAll('[data-row-select]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const rowIndex = parseInt(e.target.dataset.rowSelect);
          if (e.target.checked) {
            if (!this.options.multiSelect) {
              this.state.selectedRows.clear();
            }
            this.state.selectedRows.add(rowIndex);
          } else {
            this.state.selectedRows.delete(rowIndex);
          }
        });
      });
    }
  }

  renderCell(row, column) {
    const value = row[column.key];
    
    // Custom render function
    if (column.render && typeof column.render === 'function') {
      return column.render(value, row);
    }

    // Format functions
    if (column.format) {
      switch (column.format) {
        case 'date':
          return new Date(value).toLocaleDateString();
        case 'currency':
          return new Intl.NumberFormat('es-ES', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(value);
        case 'percent':
          return `${value}%`;
        default:
          return value;
      }
    }

    return value;
  }

  renderPagination() {
    const pagination = this.element.querySelector('[data-pagination]');
    const totalPages = Math.ceil(this.state.filteredData.length / this.state.pageSize);

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    const pages = this.generatePageNumbers(this.state.currentPage, totalPages);

    pagination.innerHTML = `
      <button 
        class="datatable__page-btn"
        ${this.state.currentPage === 1 ? 'disabled' : ''}
        data-page="prev"
      >
        Anterior
      </button>
      
      ${pages.map(page => {
        if (page === '...') {
          return '<span class="datatable__page-ellipsis">...</span>';
        }
        return `
          <button 
            class="datatable__page-btn ${page === this.state.currentPage ? 'is-active' : ''}"
            data-page="${page}"
          >
            ${page}
          </button>
        `;
      }).join('')}
      
      <button 
        class="datatable__page-btn"
        ${this.state.currentPage === totalPages ? 'disabled' : ''}
        data-page="next"
      >
        Siguiente
      </button>
    `;

    // Attach pagination listeners
    pagination.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        
        if (page === 'prev' && this.state.currentPage > 1) {
          this.state.currentPage--;
        } else if (page === 'next' && this.state.currentPage < totalPages) {
          this.state.currentPage++;
        } else if (page !== 'prev' && page !== 'next') {
          this.state.currentPage = parseInt(page);
        }
        
        this.updateDisplay();
      });
    });
  }

  generatePageNumbers(current, total) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  renderInfo() {
    const info = this.element.querySelector('[data-info]');
    const start = (this.state.currentPage - 1) * this.state.pageSize + 1;
    const end = Math.min(start + this.state.pageSize - 1, this.state.filteredData.length);
    const total = this.state.filteredData.length;

    info.textContent = `Mostrando ${start} a ${end} de ${total} entradas`;
  }

  export(format = 'csv') {
    if (format === 'csv') {
      this.exportCSV();
    } else if (format === 'json') {
      this.exportJSON();
    }
  }

  exportCSV() {
    const headers = this.options.columns.map(col => col.label);
    const rows = this.state.filteredData.map(row => 
      this.options.columns.map(col => row[col.key])
    );

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csv, 'export.csv', 'text/csv');
  }

  exportJSON() {
    const json = JSON.stringify(this.state.filteredData, null, 2);
    this.downloadFile(json, 'export.json', 'application/json');
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  destroy() {
    // Cleanup
  }
}

export { DataTable };