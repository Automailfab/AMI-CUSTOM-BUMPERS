# Cascading Filters System for Shopify Dawn Theme

## Overview

This implementation provides a cascading dropdown filter system for the collection/search page that filters products by Make → Model → Placement in a sequential manner.

## How It Works

### Data Structure
Products should be tagged with a specific naming convention:
- **Make tags**: `make_[make-name]` (e.g., `make_ford`, `make_chevrolet`)
- **Model tags**: `model_[make-name]_[model-name]` (e.g., `model_ford_f150`, `model_chevrolet_silverado`) 
- **Placement tags**: `placement_[make-name]_[model-name]_[placement-name]` (e.g., `placement_ford_f150_front`, `placement_ford_f150_rear`)

### User Experience
1. User selects a Make from the first dropdown
2. Model dropdown automatically populates with relevant models for that Make
3. User selects a Model 
4. Placement dropdown automatically populates with relevant placements for that Make/Model combination
5. Product grid updates dynamically with each selection
6. Users can clear all filters with the "Clear All" button

## Files Modified/Created

### New Files
- `snippets/cascading-filters.liquid` - Main filter component
- `assets/cascading-filters.js` - JavaScript for cascading behavior
- `assets/component-cascading-filters.css` - Styling for the filters
- `assets/facets.js` - Basic facets functionality (if missing)
- `assets/component-facets.css` - Basic facets styling (if missing)

### Modified Files
- `sections/main-collection-product-grid.liquid` - Integration point
- `templates/collection.json` - Enabled cascading filters by default
- `locales/en.default.json` - Added translation strings

## Configuration

### Enabling/Disabling
In the theme customizer under Collection pages:
- Toggle "Enable cascading filters" checkbox
- This can be set per collection template

### Adding New Makes/Models/Placements
Simply add products with the appropriate tags:
1. Add `make_[new-make]` tag to products
2. Add `model_[new-make]_[new-model]` tag to products
3. Add `placement_[new-make]_[new-model]_[new-placement]` tag to products

The system automatically detects and displays new values in the dropdowns.

## Customization

### Changing Tag Format
If you need to use a different tag format or metafields instead:
1. Modify the data extraction logic in `snippets/cascading-filters.liquid` (lines 40-80)
2. Update the JavaScript filtering logic in `assets/cascading-filters.js` (updateProducts method)

### Styling
All styles are in `assets/component-cascading-filters.css`:
- Modify CSS custom properties to match your theme colors
- Adjust grid layout in `.cascading-filters__dropdowns`
- Update mobile breakpoint styles as needed

### Localization
Add translations in your locale files under `products.cascading_filters`:
```json
"cascading_filters": {
  "filter_by_label": "Filter by Vehicle",
  "make_label": "Make",
  "model_label": "Model", 
  "placement_label": "Placement",
  "select_make": "Select Make",
  "select_model": "Select Model",
  "select_placement": "Select Placement",
  "clear_all": "Clear All"
}
```

## Technical Details

### Browser Compatibility
- Modern browsers with ES6+ support
- Graceful degradation for older browsers
- Mobile responsive design

### Performance
- Data is extracted server-side (Liquid) for fast initial load
- Client-side filtering for instant dropdown updates
- AJAX product grid updates to avoid page reloads

### SEO Friendly
- URLs update with filter parameters
- Back/forward browser navigation works
- Filters are applied as URL parameters that Shopify understands

## Troubleshooting

### Dropdowns Not Populating
1. Check that products have correctly formatted tags
2. Verify tag names don't contain special characters
3. Ensure products are published and visible

### JavaScript Errors
1. Check browser console for error messages
2. Verify all required DOM elements exist
3. Check that filter data JSON is valid

### Styling Issues
1. Check for CSS conflicts with existing theme styles
2. Verify CSS is loading properly
3. Check mobile responsive behavior

## Testing

A test file `test-cascading-filters.html` is provided for local testing. This file:
- Simulates the filter interface with sample data
- Tests the cascading dropdown behavior
- Validates JavaScript functionality without needing Shopify

To test locally:
1. Open `test-cascading-filters.html` in a browser
2. Try selecting different Makes to see Models populate
3. Select Models to see Placements populate
4. Verify the "Clear All" button works
5. Check browser console for any JavaScript errors

## Future Enhancements

The system is designed to be extensible:
- Add more filter levels (e.g., Year, Trim)
- Integrate with product metafields instead of tags
- Add filter history/breadcrumbs
- Implement saved filter preferences