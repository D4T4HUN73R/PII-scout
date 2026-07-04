# PII Scout

PII Scout is a powerful dashboard for analyzing CSV datasets with Personal Identifiable Information (PII) in a visual way. It provides instant statistics, map visualization, and search capabilities all in one place. Built as a browser-based application using pure HTML, CSS, and JavaScript, it requires no server setup and runs entirely in the user's browser for enhanced privacy.

## Features

- **CSV Upload**: Click to upload or drag-drop CSV files for analysis
- **Automatic Data Detection**: Intelligent pattern recognition for various PII data types
- **Interactive Map**: Visualizes location data (latitude/longitude) on Leaflet.js maps
- **Instant Statistics**: Real-time statistics for all columns including totals, counts, and distributions
- **Fuzzy Search**: Real-time filtering across all data fields with instant updates
- **Data Visualization**: Dynamic bar graphs and charts for key statistics
- **Dark Mode UI**: Clean, modern interface with greenyellow accents on black background
- **Expandable Details**: Click any row to see complete data information
- **Pagination**: Efficient navigation for large datasets (50 rows per page)
- **Responsive Design**: Adapts to different screen sizes and viewports
- **Privacy-Focused**: All processing happens locally in your browser

## Installation

1. Clone this repository: `git clone <repository-url>`
2. Open `index.html` in any modern web browser
3. **No server required** - everything runs client-side
4. Click "Upload CSV File" to load your dataset

## Usage

### File Upload
- Click the "Upload CSV File" button to select a CSV dataset from your computer
- The application automatically detects column naming patterns for PII types
- Supports standard CSV format with headers in the first row

### Dashboard Layout
The dashboard is organized into a three-column responsive grid:
1. **Left Column** (25%): Dataset statistics and per-column detailed analysis
2. **Middle Column** (50%): Data rows with expandable details and pagination controls
3. **Right Column** (25%): Additional aggregated statistics by data type

### Map Visualization
- Automatically appears when latitude/longitude columns are detected
- Displays all data points on an interactive world map
- Click any marker to view complete entry details in a popup
- Supports zoom and pan for detailed exploration
- Markers show only non-location fields to reduce clutter

### Search Functionality
- Type any search term in the search input box
- Press Enter or click "Search" to filter results
- Results update instantly across all views
- Click any bar graph value to filter by that specific value
- Reset to show all data by clearing the search

### Data Row Interaction
- Click any data row to expand/collapse detailed view
- Rows are auto-named using: name, email, or phone number when present
- Shows all columns with key-value pairs
- Pagination buttons at bottom for large datasets
- Expandable sections for better information organization

## Supported Data Types & Detection

### Location Data
- **Detection Patterns**: latitude, lat, position_lat, pos_lat, coord_lat, longitude, lon, position_lon, pos_lon, coord_lon
- **Functionality**: Automatic map rendering with marker clustering
- **Visualization**: Interactive Leaflet.js map with popup details

### Phone Numbers
- **Detection Patterns**: phone, mobile, telephone, msisdn, phone_number, phone_nr, cell, cellphone
- **Functionality**: Prefix counting and format validation
- **Visualization**: Bar graph showing top 5 area code distributions

### Email Addresses
- **Detection Patterns**: email, e-mail, e-mail-address, mail
- **Functionality**: Domain extraction and distribution analysis
- **Visualization**: Bar graph showing top 5 domain occurrences

### Dates of Birth
- **Detection Patterns**: dob, birth, date_of_birth, birthday
- **Functionality**: Year extraction from multiple date formats
- **Visualization**: Bar graph showing birth year distributions

### Social Security Numbers (SSN)
- **Detection Patterns**: ssn, social security, social number, id number
- **Functionality**: Format validation (XXX-XX-XXXX)
- **Statistics**: Total records, unique values, format validity counts

### Names
- **Detection Patterns**: name, full-name, fullname, first-name, last-name, surname
- **Functionality**: Top value counting
- **Visualization**: Bar graph showing top 5 most frequent names

### Default Data Types
- Generic statistics for non-PII fields
- Shows total and unique value counts
- Displays top 5 values with distribution

## Technical Implementation

### Architecture
- **Frontend Stack**: Pure HTML5, CSS3, JavaScript (no frameworks required)
- **Map Library**: Leaflet.js 1.9.4 for interactive maps
- **No External APIs**: Works offline after initial page load
- **DOM Manipulation**: Pure JavaScript with event delegation
- **CSS Grid & Flexbox**: Modern responsive layout system
- **Local Processing**: All data processing happens client-side

### Key Components

#### CSV Parser
- Handles standard CSV format
- Removes quoted strings
- Trims whitespace
- Supports multiple languages and Unicode characters
- Parses CSV with various delimiters

#### Statistical Engine
- Column-specific analysis based on patterns
- Real-time count calculations
- Duplicate detection
- NaN/missing value counting
- Data type identification

#### Map Renderer
- Automatic location column detection
- Global view (zoom level 2)
- Markers with custom popups
- Click-to-filter functionality
- Map fit bounds for filtered results

#### Search Engine
- Case-insensitive filtering
- Multi-column search
- Instant update on keypress
- Reset to show all data

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

### Performance Considerations
- **Optimized for up to 10,000 rows**: Smooth performance
- **Pagination System**: Default 50 rows per page
- **Lazy Rendering**: Only visible rows processed
- **Event Delegation**: Reduced memory footprint
- **Canvas/CSS Rendering**: Lightweight graphics

## CSV Format Requirements

For optimal functionality:
1. **Headers**: First row must contain column headers
2. **Encoding**: UTF-8 recommended (supports multilingual data)
3. **Structure**: Consistent data types within each column
4. **Locations**: Columns following latitude/longitude patterns enable map features
5. **Quotes**: Handles quoted values correctly

## Sample Dataset

Included `sample-data.csv` contains 1,000 fictional records with:
- Multilingual names (English, Latin, Farsi, Cyrillic)
- Various email domains
- Phone numbers from different regions
- International addresses
- Geolocation data (lat/lon coordinates)
- Birth dates in multiple formats
- Social security numbers
- Postal codes

## Limitations

- **Browser-Based Only**: No server-side processing or Node.js support
- **CSV Format**: Limited to CSV files only
- **Large Datasets**: Performance may degrade beyond 10,000 rows
- **Real-Time Collaboration**: Single-user interface
- **No Save Functionality**: Data is not persisted locally
- **Map Dependency**: Requires internet for map tile loading (fallback available)

## Security & Privacy

- **Local Processing**: No data is sent to external servers
- **Client-Side Only**: All operations happen in your browser
- **No Logging**: No data collection or tracking
- **No Persistence**: Temporary session-only processing
- **Educational Focus**: Designed for awareness and analysis, not production use

## Development Notes

### File Structure
- `index.html`: Main application interface
- `app.js`: Core application logic (~985 lines)
- `styles.css`: Styling and dark theme (~472 lines)
- `sample-data.csv`: Example dataset
- `images/PII_scout_logo.png`: Application branding

### JavaScript Architecture
- Modular function design
- Event-driven architecture
- State management with global variables
- Dynamic DOM generation
- Pattern-based data detection

### CSS Design
- CSS Grid for 3-column layout
- Flexbox for component alignment
- CSS variables for theming
- Media queries for responsiveness
- Dark theme with greenyellow accents (hex: #adff2f)

## Contributing

This project is designed for educational purposes and demonstration of PII analysis concepts. For actual security-sensitive applications:
- Consult with data protection experts
- Implement proper encryption and access controls
- Consider GDPR, CCPA, and other regulatory requirements
- Review and understand data privacy implications

## License

MIT License - See `LICENSE` file for details

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and changes