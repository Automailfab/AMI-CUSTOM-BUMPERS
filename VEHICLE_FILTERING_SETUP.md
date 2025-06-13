# Vehicle Filtering System - Manual Setup Instructions

This theme includes a custom vehicle filtering system that allows customers to filter products by Make, Model, and Year. The system works with both metafields (when available) and title parsing as a fallback.

## Theme Integration Complete ✅

The following has been implemented in the theme:

- ✅ Custom vehicle info parsing from product titles
- ✅ Vehicle filtering UI (Make/Model/Year dropdowns)  
- ✅ Dynamic filtering JavaScript functionality
- ✅ Integration with collection product grid
- ✅ Responsive design and styling
- ✅ URL state management for filter persistence

## Required Manual Steps for Full Functionality

Since Shopify themes cannot create or populate metafields programmatically, the following steps must be completed manually:

### 1. Create Metafield Definitions (Optional but Recommended)

In your Shopify Admin, create the following metafield definitions for Products:

#### Make Metafield
- **Namespace:** `vehicle`
- **Key:** `make`
- **Name:** Vehicle Make
- **Description:** The make/brand of the vehicle (e.g., Ford, Toyota, etc.)
- **Type:** Single line text
- **Validation:** None required

#### Model Metafield  
- **Namespace:** `vehicle`
- **Key:** `model`
- **Name:** Vehicle Model
- **Description:** The model of the vehicle (e.g., Camry, F-150, etc.)
- **Type:** Single line text
- **Validation:** None required

#### Year Metafield
- **Namespace:** `vehicle`
- **Key:** `year` 
- **Name:** Vehicle Year
- **Description:** The year of the vehicle (e.g., 2019, 2020, etc.)
- **Type:** Single line text
- **Validation:** None required

### 2. Populate Metafields (Automated Script Required)

To populate the metafields for all existing products, you'll need to run a script using the Shopify Admin API. Here's a sample Node.js script:

```javascript
const { shopifyApi } = require('@shopify/shopify-api');

// Initialize Shopify API client
const shopify = shopifyApi({
  // Your API configuration
});

async function populateVehicleMetafields() {
  try {
    // Get all products
    const products = await shopify.rest.Product.all({
      session: yourSession,
      limit: 250
    });

    for (const product of products.data) {
      const vehicleInfo = parseVehicleFromTitle(product.title);
      
      if (vehicleInfo.make || vehicleInfo.model || vehicleInfo.year) {
        const metafields = [];
        
        if (vehicleInfo.make) {
          metafields.push({
            namespace: 'vehicle',
            key: 'make',
            value: vehicleInfo.make,
            type: 'single_line_text_field'
          });
        }
        
        if (vehicleInfo.model) {
          metafields.push({
            namespace: 'vehicle', 
            key: 'model',
            value: vehicleInfo.model,
            type: 'single_line_text_field'
          });
        }
        
        if (vehicleInfo.year) {
          metafields.push({
            namespace: 'vehicle',
            key: 'year', 
            value: vehicleInfo.year,
            type: 'single_line_text_field'
          });
        }

        // Update product with metafields
        await shopify.rest.Product.save({
          session: yourSession,
          id: product.id,
          metafields: metafields
        });
        
        console.log(`Updated ${product.title}`);
      }
    }
  } catch (error) {
    console.error('Error updating metafields:', error);
  }
}

function parseVehicleFromTitle(title) {
  // Copy the parsing logic from parse-vehicle-info.liquid
  // This should match the Liquid template logic
  // Return { make, model, year }
}
```

### 3. Enable Vehicle Filtering in Theme Settings

1. Go to Online Store > Themes > Customize
2. Navigate to any Collection page
3. Find the "Products" section settings
4. Enable "Enable Vehicle Filtering" checkbox
5. Save changes

## How It Works

### With Metafields (Recommended)
When metafields are populated:
- Filters show exact, consistent values from metafields
- More accurate filtering results
- Better performance
- Easier maintenance

### Without Metafields (Fallback)
When metafields don't exist:
- System parses product titles to extract Make/Model/Year
- Works with common title formats like "2019 Ford F-150 Bumper"
- Less accurate but provides immediate functionality
- No additional setup required

### Supported Title Formats
The parsing system recognizes these common formats:
- "YEAR MAKE MODEL ..." (e.g., "2019 Ford F-150 Front Bumper")
- "MAKE MODEL YEAR ..." (e.g., "Ford F-150 2019 Rear Bumper")
- "MAKE YEAR MODEL ..." (e.g., "Ford 2019 F-150 Side Bumper")

### Known Vehicle Makes
The system recognizes these vehicle makes:
Ford, Chevrolet, Chevy, Dodge, Toyota, Honda, Nissan, BMW, Mercedes, Audi, Volkswagen, VW, Hyundai, Kia, Mazda, Subaru, Mitsubishi, Infiniti, Lexus, Acura, Cadillac, Buick, GMC, Ram, Jeep, Chrysler, Lincoln, Volvo, Jaguar, Land Rover, Porsche, Tesla, Genesis, Alfa Romeo

## Testing

To test the filtering system:

1. Visit any collection page with the vehicle filtering enabled
2. You should see "Vehicle Filters" section above the standard filters
3. Select Make, Model, or Year values to filter products
4. Products should filter dynamically without page reload
5. URL should update to preserve filter state
6. "Clear Vehicle Filters" button should reset all vehicle filters

## Customization

### Adding More Vehicle Makes
Edit `/snippets/parse-vehicle-info.liquid` and add to the `known_makes` string.

### Changing Metafield Namespace
Update the `namespace` variable in both `/snippets/parse-vehicle-info.liquid` and `/snippets/vehicle-filters.liquid`.

### Styling
Customize the appearance by editing `/assets/vehicle-filters.css`.

## Troubleshooting

### Filters Not Showing
- Check that "Enable Vehicle Filtering" is enabled in theme settings
- Ensure products have titles with recognizable vehicle information
- Verify JavaScript files are loading without errors

### Incorrect Parsing  
- Check product titles follow supported formats
- Add missing vehicle makes to the known makes list
- Consider populating metafields for more accurate results

### Performance Issues
- Consider implementing pagination for collections with many products
- Populate metafields to avoid title parsing overhead
- Use browser developer tools to check for JavaScript errors