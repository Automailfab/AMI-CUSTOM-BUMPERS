/**
 * Vehicle Filters - Custom filtering for Make/Model/Year
 * Handles dynamic filtering of products based on vehicle attributes
 */

class VehicleFilters extends HTMLElement {
  constructor() {
    super();
    this.filterInputs = this.querySelectorAll('.vehicle-filter-checkbox');
    this.productGrid = document.querySelector('#product-grid');
    this.productCards = this.productGrid ? this.productGrid.querySelectorAll('.grid__item') : [];
    this.activeFilters = {
      make: [],
      model: [],
      year: []
    };

    this.init();
  }

  init() {
    // Add event listeners to filter checkboxes
    this.filterInputs.forEach(input => {
      input.addEventListener('change', this.handleFilterChange.bind(this));
    });

    // Parse URL parameters to restore filter state
    this.restoreFiltersFromURL();
  }

  handleFilterChange(event) {
    const input = event.target;
    const filterType = input.dataset.filterType;
    const filterValue = input.value;

    if (input.checked) {
      // Add filter
      if (!this.activeFilters[filterType].includes(filterValue)) {
        this.activeFilters[filterType].push(filterValue);
      }
    } else {
      // Remove filter
      const index = this.activeFilters[filterType].indexOf(filterValue);
      if (index > -1) {
        this.activeFilters[filterType].splice(index, 1);
      }
    }

    this.applyFilters();
    this.updateURL();
  }

  applyFilters() {
    if (!this.productCards.length) return;

    let visibleCount = 0;

    this.productCards.forEach(card => {
      const productTitle = this.getProductTitle(card);
      const vehicleInfo = this.parseVehicleInfo(productTitle);
      
      let shouldShow = true;

      // Check each filter type
      Object.keys(this.activeFilters).forEach(filterType => {
        const activeValues = this.activeFilters[filterType];
        if (activeValues.length > 0) {
          const productValue = vehicleInfo[filterType];
          if (!productValue || !activeValues.includes(productValue)) {
            shouldShow = false;
          }
        }
      });

      // Show/hide product
      if (shouldShow) {
        card.style.display = '';
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('hidden');
      }
    });

    // Update results count if element exists
    this.updateResultsCount(visibleCount);
  }

  getProductTitle(productCard) {
    // Try multiple selectors to find product title
    const titleSelectors = [
      '.card__heading a',
      '.card-product__title a',
      '.product-title a',
      'h3 a',
      'h2 a'
    ];

    for (const selector of titleSelectors) {
      const titleElement = productCard.querySelector(selector);
      if (titleElement) {
        return titleElement.textContent.trim();
      }
    }

    return '';
  }

  parseVehicleInfo(productTitle) {
    const vehicleInfo = {
      make: '',
      model: '',
      year: ''
    };

    if (!productTitle) return vehicleInfo;

    const words = productTitle.split(' ');
    const knownMakes = [
      'Ford', 'Chevrolet', 'Chevy', 'Dodge', 'Toyota', 'Honda', 'Nissan', 
      'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'VW', 'Hyundai', 'Kia', 
      'Mazda', 'Subaru', 'Mitsubishi', 'Infiniti', 'Lexus', 'Acura', 
      'Cadillac', 'Buick', 'GMC', 'Ram', 'Jeep', 'Chrysler', 'Lincoln', 
      'Volvo', 'Jaguar', 'Land Rover', 'Porsche', 'Tesla', 'Genesis', 'Alfa Romeo'
    ];

    // Find year (4-digit number between 1900-2030)
    for (const word of words) {
      const cleanWord = word.replace(/[(),\-]/g, '');
      if (cleanWord.length === 4 && /^\d+$/.test(cleanWord)) {
        const year = parseInt(cleanWord);
        if (year >= 1900 && year <= 2030) {
          vehicleInfo.year = cleanWord;
          break;
        }
      }
    }

    // Find make
    for (const word of words) {
      const cleanWord = word.replace(/[(),]/g, '');
      const makeMatch = knownMakes.find(make => 
        make.toLowerCase() === cleanWord.toLowerCase()
      );
      if (makeMatch) {
        vehicleInfo.make = makeMatch;
        break;
      }
    }

    // Find model (everything that's not make or year)
    const modelWords = [];
    for (const word of words) {
      const cleanWord = word.replace(/[(),]/g, '');
      
      // Skip if it's the year
      if (cleanWord === vehicleInfo.year) continue;
      
      // Skip if it's the make
      if (cleanWord.toLowerCase() === vehicleInfo.make.toLowerCase()) continue;
      
      // Skip common non-model words
      const skipWords = ['for', 'bumper', 'cover', 'replacement', 'oem', 'new'];
      if (skipWords.includes(cleanWord.toLowerCase())) continue;
      
      modelWords.push(cleanWord);
    }
    
    if (modelWords.length > 0) {
      vehicleInfo.model = modelWords.join(' ');
    }

    return vehicleInfo;
  }

  updateResultsCount(count) {
    // Look for existing results count element
    let countElement = document.querySelector('.vehicle-results-count');
    
    if (!countElement) {
      // Create results count element if it doesn't exist
      countElement = document.createElement('div');
      countElement.className = 'vehicle-results-count';
      
      // Insert before product grid
      const productContainer = document.querySelector('#ProductGridContainer');
      if (productContainer) {
        productContainer.insertBefore(countElement, productContainer.firstChild);
      }
    }

    const totalProducts = this.productCards.length;
    countElement.innerHTML = `
      <p class="collection-product-count">
        Showing ${count} of ${totalProducts} products
      </p>
    `;
  }

  updateURL() {
    const url = new URL(window.location);
    const params = url.searchParams;

    // Clear existing vehicle filter params
    params.delete('vehicle_make');
    params.delete('vehicle_model');
    params.delete('vehicle_year');

    // Add active filters to URL
    Object.keys(this.activeFilters).forEach(filterType => {
      const values = this.activeFilters[filterType];
      if (values.length > 0) {
        params.set(`vehicle_${filterType}`, values.join(','));
      }
    });

    // Update URL without page reload
    window.history.replaceState({}, '', url.toString());
  }

  restoreFiltersFromURL() {
    const url = new URL(window.location);
    const params = url.searchParams;

    // Restore filter state from URL
    ['make', 'model', 'year'].forEach(filterType => {
      const paramValue = params.get(`vehicle_${filterType}`);
      if (paramValue) {
        this.activeFilters[filterType] = paramValue.split(',');
        
        // Check corresponding checkboxes
        this.activeFilters[filterType].forEach(value => {
          const checkbox = this.querySelector(`input[data-filter-type="${filterType}"][value="${value}"]`);
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      }
    });

    // Apply filters if any were restored
    if (Object.values(this.activeFilters).some(arr => arr.length > 0)) {
      this.applyFilters();
    }
  }

  clearFilters() {
    // Clear all active filters
    this.activeFilters = {
      make: [],
      model: [],
      year: []
    };

    // Uncheck all checkboxes
    this.filterInputs.forEach(input => {
      input.checked = false;
    });

    // Show all products
    this.productCards.forEach(card => {
      card.style.display = '';
      card.classList.remove('hidden');
    });

    // Update URL and results count
    this.updateURL();
    this.updateResultsCount(this.productCards.length);
  }
}

// Define custom element
customElements.define('vehicle-filters', VehicleFilters);

// Add clear filters functionality
document.addEventListener('DOMContentLoaded', function() {
  // Add clear button if it doesn't exist
  const filtersContainer = document.querySelector('.vehicle-filters');
  if (filtersContainer && !filtersContainer.querySelector('.clear-vehicle-filters')) {
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-vehicle-filters button button--tertiary';
    clearButton.textContent = 'Clear Vehicle Filters';
    clearButton.addEventListener('click', function() {
      const vehicleFilters = document.querySelector('vehicle-filters');
      if (vehicleFilters) {
        vehicleFilters.clearFilters();
      }
    });
    
    filtersContainer.appendChild(clearButton);
  }
});