/**
 * Facets - Filtering and sorting functionality
 * Handles form submissions, URL updates, and progressive enhancement
 */

class FacetsForm extends HTMLElement {
  constructor() {
    super();
    this.filterData = [];
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    // Handle sorting changes immediately
    const sortSelect = this.querySelector('[name="sort_by"]');
    if (sortSelect) {
      sortSelect.addEventListener('change', this.onSubmitHandler.bind(this));
    }
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetsForm.searchParamsInitial;
      if (searchParams === FacetsForm.searchParamsPrev) return;
      FacetsForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetsForm.searchParamsPrev = searchParams;
    const sections = FacetsForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    
    // Show loading state
    document.querySelectorAll('.facets-container .loading-overlay__spinner').forEach((spinner) => spinner.classList.remove('hidden'));
    if (countContainer) countContainer.classList.add('loading');
    if (countContainerDesktop) countContainerDesktop.classList.add('loading');

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetsForm.filterData.some(filterDataUrl) ?
        FacetsForm.renderSectionFromCache(filterDataUrl, event) :
        FacetsForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetsForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetsForm.filterData = [...FacetsForm.filterData, { html, url }];
        FacetsForm.renderFilters(html, event);
        FacetsForm.renderProductGridContainer(html);
        FacetsForm.renderProductCount(html);
      })
      .catch((error) => {
        console.error('Error fetching facets:', error);
      })
      .finally(() => {
        // Hide loading state
        document.querySelectorAll('.facets-container .loading-overlay__spinner').forEach((spinner) => spinner.classList.add('hidden'));
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetsForm.filterData.find(filterDataUrl).html;
    FacetsForm.renderFilters(html, event);
    FacetsForm.renderProductGridContainer(html);
    FacetsForm.renderProductCount(html);
    
    // Hide loading state
    document.querySelectorAll('.facets-container .loading-overlay__spinner').forEach((spinner) => spinner.classList.add('hidden'));
  }

  static renderProductGridContainer(html) {
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer').innerHTML;

    document.getElementById('ProductGridContainer').innerHTML = innerHTML;
  }

  static renderProductCount(html) {
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductCount')?.innerHTML;

    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    
    if (innerHTML && container) {
      container.innerHTML = innerHTML;
      container.classList.remove('loading');
    }
    
    if (innerHTML && containerDesktop) {
      containerDesktop.innerHTML = innerHTML;
      containerDesktop.classList.remove('loading');
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements = parsedHTML.querySelectorAll('#FacetsWrapperDesktop .js-filter, #FacetsWrapperMobile .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetsForm.renderActiveFacets(parsedHTML);
    FacetsForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetsForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.querySelectorAll('.no-js-hidden').forEach((element) => element.classList.remove('no-js-hidden'));
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected') || target.querySelector('.mobile-facets__count');
    const sourceElement = source.querySelector('.facets__selected') || source.querySelector('.mobile-facets__count');

    if (sourceElement && targetElement) {
      targetElement.outerHTML = sourceElement.outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetsForm.toggleActiveFacets();
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const form = event.target.closest('form') || event.target.form;
    const searchParams = this.createSearchParams(form);
    FacetsForm.renderPage(searchParams, event);
  }
}

FacetsForm.filterData = [];
FacetsForm.searchParamsInitial = window.location.search.slice(1);
FacetsForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetsForm);
FacetsForm.setListeners();

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);

    if (this.hasAttribute('href')) {
      FacetsForm.renderPage(new URL(this.getAttribute('href')).searchParams.toString());
    }
  }
}

customElements.define('facet-remove', FacetRemove);

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');
    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button:not(.localization-selector)').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : openDetailsElement.removeAttribute('open');
  }

  onSummaryClick(event) {
    const detailsElement = event.currentTarget.parentNode;
    if (!detailsElement.hasAttribute('open')) {
      this.closeSubmenu();
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (this.contains(document.activeElement)) return;
      this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event && event.type === 'click') event.preventDefault();
    if (elementToFocus) elementToFocus.focus();
    this.mainDetailsToggle.removeAttribute('open');
  }

  closeSubmenu(detailsElement = false) {
    if (detailsElement) {
      detailsElement.removeAttribute('open');
    } else {
      this.querySelectorAll('details[open]').forEach(details => {
        if (details !== this.mainDetailsToggle) {
          details.removeAttribute('open');
        }
      });
    }
  }
}

customElements.define('menu-drawer', MenuDrawer);

// Custom filters functionality
class CustomFacets extends HTMLElement {
  constructor() {
    super();
    this.initializeFilters();
  }

  initializeFilters() {
    // Initialize custom filter checkboxes
    this.querySelectorAll('.custom-facets__checkbox input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', this.handleFilterChange.bind(this));
    });
  }

  handleFilterChange(event) {
    // Trigger form submission when custom filters change
    const form = this.closest('form');
    if (form) {
      const submitEvent = new Event('input', { bubbles: true });
      form.dispatchEvent(submitEvent);
    }
  }
}

customElements.define('custom-facets', CustomFacets);

// Utility function for debouncing
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Remove no-js class from facets container
  document.querySelectorAll('.facets-container').forEach(container => {
    container.classList.remove('no-js');
  });
  
  // Initialize mobile facets functionality
  document.querySelectorAll('.mobile-facets__disclosure').forEach(disclosure => {
    const summary = disclosure.querySelector('summary');
    const facets = disclosure.querySelector('.mobile-facets');
    
    if (summary && facets) {
      summary.addEventListener('click', function(e) {
        if (disclosure.hasAttribute('open')) {
          facets.style.display = 'none';
        } else {
          facets.style.display = 'block';
        }
      });
    }
  });
});