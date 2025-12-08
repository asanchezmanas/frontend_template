/**
 * Dashboard Page Logic
 */

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  if (!auth.requireAuth()) return;
  
  // Initialize page
  await initDashboard();
});

/**
 * Initialize dashboard data
 */
async function initDashboard() {
  try {
    // Show loading state
    showLoading();
    
    // Load user info
    loadUserInfo();
    
    // Load usage stats
    await loadUsageStats();
    
    // Load recent data
    await Promise.all([
      loadRecentGenerations(),
      loadRecentDocuments()
    ]);
    
  } catch (error) {
    console.error('Dashboard init error:', error);
    toast.error('Error al cargar el dashboard');
  }
}

/**
 * Load user info and display
 */
function loadUserInfo() {
  const user = auth.getCurrentUser();
  
  if (user) {
    // Update user avatar with initials
    const initials = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
    
    // Update tier badge
    const tierBadge = document.getElementById('tierBadge');
    tierBadge.textContent = utils.capitalize(user.tier || 'free');
    tierBadge.className = `badge badge-${user.tier === 'pro' || user.tier === 'business' ? 'primary' : 'secondary'}`;
  }
}

/**
 * Load usage stats from API
 */
async function loadUsageStats() {
  try {
    const usage = await apiEndpoints.usage.get();
    
    // Update generations
    const genUsed = usage.current_usage.generations;
    const genLimit = usage.limits.generations;
    const genPercentage = usage.usage_percentages.generations;
    
    document.getElementById('generationsUsed').textContent = utils.formatNumber(genUsed);
    document.getElementById('generationsLimit').textContent = `de ${utils.formatNumber(genLimit)} disponibles`;
    document.getElementById('generationsProgress').style.width = `${genPercentage}%`;
    
    // Color code progress bar
    const genProgressBar = document.getElementById('generationsProgress');
    if (genPercentage >= 90) {
      genProgressBar.style.background = 'var(--color-error)';
    } else if (genPercentage >= 70) {
      genProgressBar.style.background = 'var(--color-warning)';
    }
    
    // Update documents
    const docsUsed = usage.current_usage.documents;
    const docsLimit = usage.limits.documents;
    const docsPercentage = usage.usage_percentages.documents;
    
    document.getElementById('documentsCount').textContent = utils.formatNumber(docsUsed);
    document.getElementById('documentsLimit').textContent = `de ${utils.formatNumber(docsLimit)} disponibles`;
    document.getElementById('documentsProgress').style.width = `${docsPercentage}%`;
    
    const docsProgressBar = document.getElementById('documentsProgress');
    if (docsPercentage >= 90) {
      docsProgressBar.style.background = 'var(--color-error)';
    } else if (docsPercentage >= 70) {
      docsProgressBar.style.background = 'var(--color-warning)';
    }
    
    // Update reset date
    const resetDate = new Date(usage.reset_date);
    document.getElementById('resetDate').textContent = utils.formatDate(resetDate);
    
    // Show warning if approaching limits
    if (genPercentage >= 90) {
      toast.warning(`Te quedan solo ${genLimit - genUsed} generaciones este mes`);
    }
    
  } catch (error) {
    console.error('Error loading usage stats:', error);
    // Don't show error toast, just log it
  }
}

/**
 * Load recent generations
 */
async function loadRecentGenerations() {
  try {
    // Get recent generations from localStorage (cache) or API
    const cachedGenerations = storage.get(config.storageKeys.recentGenerations);
    
    if (cachedGenerations && cachedGenerations.length > 0) {
      displayRecentGenerations(cachedGenerations.slice(0, 5));
    } else {
      // If no cache, show empty state (already there by default)
    }
    
  } catch (error) {
    console.error('Error loading recent generations:', error);
  }
}

/**
 * Display recent generations
 */
function displayRecentGenerations(generations) {
  const container = document.getElementById('recentGenerations');
  
  if (generations.length === 0) {
    // Empty state already exists in HTML
    return;
  }
  
  container.innerHTML = generations.map(gen => `
    <div class="recent-item">
      <div class="recent-item-info">
        <h4>${utils.escapeHtml(gen.prompt_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</h4>
        <p>${utils.formatRelativeTime(gen.created_at)}</p>
      </div>
      <div style="display: flex; gap: var(--space-2);">
        <button onclick="viewGeneration('${gen.id}')" class="btn btn-ghost btn-sm">
          Ver
        </button>
        <button onclick="copyContent('${utils.escapeHtml(gen.content)}')" class="btn btn-ghost btn-sm">
          Copiar
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Load recent documents
 */
async function loadRecentDocuments() {
  try {
    const { documents } = await apiEndpoints.documents.list(1, 5);
    
    if (documents && documents.length > 0) {
      displayRecentDocuments(documents);
    }
    
  } catch (error) {
    console.error('Error loading recent documents:', error);
  }
}

/**
 * Display recent documents
 */
function displayRecentDocuments(documents) {
  const container = document.getElementById('recentDocuments');
  
  if (documents.length === 0) {
    return;
  }
  
  container.innerHTML = documents.map(doc => `
    <div class="recent-item">
      <div class="recent-item-info">
        <h4>${utils.escapeHtml(doc.filename)}</h4>
        <p>${utils.formatFileSize(doc.file_size_bytes)} • ${utils.formatRelativeTime(doc.created_at)}</p>
      </div>
      <div style="display: flex; gap: var(--space-2);">
        <button onclick="downloadDocument('${doc.id}')" class="btn btn-ghost btn-sm">
          Descargar
        </button>
        <button onclick="deleteDocument('${doc.id}')" class="btn btn-ghost btn-sm">
          Eliminar
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Show loading state
 */
function showLoading() {
  // Could add skeleton loaders here
  console.log('Loading dashboard...');
}

/**
 * View generation detail
 */
function viewGeneration(id) {
  // Navigate to history page with specific generation
  window.location.href = `/app/history.html?id=${id}`;
}

/**
 * Copy content to clipboard
 */
async function copyContent(content) {
  const success = await utils.copyToClipboard(content);
  if (success) {
    toast.success('Contenido copiado al portapapeles');
  } else {
    toast.error('Error al copiar');
  }
}

/**
 * Download document
 */
async function downloadDocument(id) {
  try {
    const { download_url } = await apiEndpoints.documents.download(id);
    
    // Open in new tab or trigger download
    window.open(download_url, '_blank');
    toast.success('Descargando documento...');
    
  } catch (error) {
    console.error('Error downloading document:', error);
    toast.error('Error al descargar documento');
  }
}

/**
 * Delete document with confirmation
 */
async function deleteDocument(id) {
  modal.confirm(
    'Eliminar Documento',
    '¿Estás seguro? Esta acción no se puede deshacer.',
    async () => {
      try {
        await apiEndpoints.documents.delete(id);
        toast.success('Documento eliminado');
        
        // Reload recent documents
        await loadRecentDocuments();
        await loadUsageStats(); // Update stats
        
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Error al eliminar documento');
      }
    },
    { danger: true }
  );
}

/**
 * Toggle user menu (for future dropdown)
 */
function toggleUserMenu() {
  // TODO: Implement user menu dropdown
  // For now, just go to settings
  window.location.href = '/app/settings.html';
}

/**
 * Handle logout
 */
async function handleLogout() {
  modal.confirm(
    'Cerrar Sesión',
    '¿Estás seguro que quieres cerrar sesión?',
    async () => {
      await auth.logout();
    }
  );
}

// Auto-refresh stats every 30 seconds
setInterval(async () => {
  try {
    await loadUsageStats();
  } catch (error) {
    // Silent fail
  }
}, 30000);