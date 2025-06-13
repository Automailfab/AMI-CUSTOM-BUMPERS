/**
 * Vehicle Filters - Client-side filtering for vehicle metafields
 * Filters products by Make, Model, and Placement
 */

class VehicleFilters {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.filtersContainer = document.getElementById(`vehicle-filters-${sectionId}`);
    this.productGrid = document.getElementById('product-grid');
    this.resultsContainer = document.getElementById(`vehicle-results-${sectionId}`);
    
    if (!this.filtersContainer || !this.productGrid) {
      console.warn('Vehicle filters: Required elements not found');
      return;
    }
    
    this.makeSelect = document.getElementById(`vehicle-make-${sectionId}`);
    this.modelSelect = document.getElementById(`vehicle-model-${sectionId}`);
    this.placementSelect = document.getElementById(`vehicle-placement-${sectionId}`);
    this.clearButton = document.getElementById(`vehicle-clear-${sectionId}`);
    this.countElement = this.resultsContainer.querySelector('.vehicle-filters__count');
    
    this.products = Array.from(this.productGrid.querySelectorAll('.grid__item'));
    this.totalProducts = this.products.length;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.updateCount();
  }
  
  bindEvents() {
    // Bind filter change events
    if (this.makeSelect) {
      this.makeSelect.addEventListener('change', () => this.applyFilters());
    }
    
    if (this.modelSelect) {
      this.modelSelect.addEventListener('change', () => this.applyFilters());
    }
    
    if (this.placementSelect) {
      this.placementSelect.addEventListener('change', () => this.applyFilters());
    }
    
    // Bind clear button
    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => this.clearFilters());
    }
  }
  
  applyFilters() {
    const selectedMake = this.makeSelect ? this.makeSelect.value.toLowerCase().trim() : '';
    const selectedModel = this.modelSelect ? this.modelSelect.value.toLowerCase().trim() : '';
    const selectedPlacement = this.placementSelect ? this.placementSelect.value.toLowerCase().trim() : '';
    
    let visibleCount = 0;
    
    // Add loading state
    this.filtersContainer.classList.add('vehicle-filters--loading');
    if (this.countElement) {
      this.countElement.classList.add('updating');
    }
    
    // Filter products
    this.products.forEach(productItem => {
      const productMake = this.getProductAttribute(productItem, 'vehicle-make');
      const productModel = this.getProductAttribute(productItem, 'vehicle-model');
      const productPlacement = this.getProductAttribute(productItem, 'vehicle-placement');
      
      let shouldShow = true;
      
      // Check make filter
      if (selectedMake && productMake && !productMake.includes(selectedMake)) {
        shouldShow = false;
      }
      
      // Check model filter
      if (selectedModel && productModel && !productModel.includes(selectedModel)) {
        shouldShow = false;
      }
      
      // Check placement filter
      if (selectedPlacement && productPlacement && !productPlacement.includes(selectedPlacement)) {
        shouldShow = false;
      }
      
      // Show/hide product
      if (shouldShow) {
        productItem.classList.remove('vehicle-hidden');
        visibleCount++;
      } else {
        productItem.classList.add('vehicle-hidden');
      }
    });
    
    // Remove loading state after a short delay for smooth transition
    setTimeout(() => {
      this.filtersContainer.classList.remove('vehicle-filters--loading');
      if (this.countElement) {
        this.countElement.classList.remove('updating');
      }
    }, 100);
    
    this.updateCount(visibleCount);
    this.updateClearButtonState();
  }
  
  getProductAttribute(productItem, attribute) {
    const element = productItem.querySelector(`[data-${attribute}]`);
    return element ? element.getAttribute(`data-${attribute}`).toLowerCase().trim() : '';
  }
  
  clearFilters() {
    // Reset select values
    if (this.makeSelect) this.makeSelect.value = '';
    if (this.modelSelect) this.modelSelect.value = '';
    if (this.placementSelect) this.placementSelect.value = '';
    
    // Show all products
    this.products.forEach(productItem => {
      productItem.classList.remove('vehicle-hidden');
    });
    
    this.updateCount(this.totalProducts);
    this.updateClearButtonState();
  }
  
  updateCount(count = null) {
    if (!this.countElement) return;
    
    const visibleCount = count !== null ? count : this.products.filter(item => 
      !item.classList.contains('vehicle-hidden')
    ).length;
    
    const hasFilters = this.hasActiveFilters();
    
    if (hasFilters) {
      this.countElement.textContent = `Showing ${visibleCount} of ${this.totalProducts} products`;
    } else {
      this.countElement.textContent = `${this.totalProducts} products`;
    }
  }
  
  hasActiveFilters() {
    return (this.makeSelect && this.makeSelect.value) ||
           (this.modelSelect && this.modelSelect.value) ||
           (this.placementSelect && this.placementSelect.value);
  }
  
  updateClearButtonState() {
    if (!this.clearButton) return;
    
    if (this.hasActiveFilters()) {
      this.clearButton.style.opacity = '1';
      this.clearButton.disabled = false;
    } else {
      this.clearButton.style.opacity = '0.5';
      this.clearButton.disabled = true;
    }
  }
}

// Initialize filters when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Find all vehicle filter containers and initialize them
  const filterContainers = document.querySelectorAll('[id^="vehicle-filters-"]');
  
  filterContainers.forEach(container => {
    const sectionId = container.id.replace('vehicle-filters-', '');
    new VehicleFilters(sectionId);
  });
});

// Support for dynamic section loading (if theme supports it)
if (typeof window.Shopify !== 'undefined' && window.Shopify.theme) {
  document.addEventListener('shopify:section:load', function(event) {
    const sectionId = event.detail.sectionId;
    const container = document.getElementById(`vehicle-filters-${sectionId}`);
    
    if (container) {
      new VehicleFilters(sectionId);
    }
  });
}