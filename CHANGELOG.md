# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-04

### Added

- Complete PII Scout dashboard application
- **Core Features**:
  - CSV file upload with drag-and-drop support
  - Automatic PII data type detection and categorization
  - Interactive Leaflet.js map visualization with location data
  - Real-time fuzzy search across all dataset columns
  - Three-column responsive dashboard layout
  - Dynamic row title generation (name/email/phone)
  - Pagination system (50 rows per page)
  * Expandable data row details with full information display
- **Statistical Analysis**:
  - Phone number detection with area code prefix counting
  - Email domain extraction and distribution analysis
  - Date of birth parsing and birth year distribution
  - Social Security Number validation (XXX-XX-XXXX format)
  - Name frequency counting
  * Address and postal code statistics
  * Total row/col counts and duplicate detection
  * Per-column statistical breakdowns
  * Additional statistics aggregation in right column
- **Data Visualization**:
  - Bar graph rendering for statistics
  - Interactive clickable stat values for search filtering
  * Responsive design adapting to all screen sizes
  * Dark theme with greenyellow (#adff2f) accents
  * Popup content styling on map markers
- **User Experience**:
  - Processing overlay with animated progress bar
  * Floating statistics card
  * Keyboard support (Enter to search)
  * Mobile responsive layout
  * Initial empty state with helpful messaging
- **Data Handling**:
  - CSV parsing with quoted value support
  - Multilingual and Unicode character support
  * Automatic location column detection
  * Search-based map marker filtering
  * Global view (zoom level 2) for initial display
- **Technical Implementation**:
  - Pure HTML, CSS, JavaScript (no frameworks)
  - Client-side processing (no server required)
  * Leaflet.js 1.9.4 for map functionality
  * Modular function architecture
  * Event-driven DOM manipulation
  * Efficient pagination system
- **Documentation**:
  - Comprehensive README with detailed feature descriptions
  - Installation and usage instructions
  - Supported data types and detection patterns
  - Technical implementation details
  * CSV format requirements
  * Security and privacy considerations
  * Version history

### Changed

- Updated sample-data.csv with enhanced multilingual support including Cyrillic, Arabic, Farsi, Mandarin
- Enhanced email domains for greater variety and international representation
- Initial stable release with complete feature set
- Enhanced documentation with detailed usage instructions
- Improved UI/UX with responsive design patterns
- Updated CHANGELOG format for consistency

### Fixed

- CSV parsing for quoted values and special characters
- Map rendering with proper z-index and layer management
- Search filtering across all dataset columns
- Mobile responsive layout adjustments
- Popup content styling for better readability
- Click event delegation and optimization
- Duplicate row detection logic
- NaN/missing value counting
- Pagination page reset functionality
- Event listener cleanup and memory management
- Dark theme color consistency
- Bar graph rendering transitions

### Security & Privacy

- Implemented client-side only processing (no server communication)
- Added comprehensive security and privacy section to documentation
- Emphasized local data handling in all features

## [Unreleased]

### Planned

- Enhanced search with advanced filtering options
- Export functionality (CSV/PDF reports)
- Additional data validation checks
- Database export capabilities
- Multiple file upload support
- Chart library integration for more visualization types
- Dark mode toggle
- Performance optimizations for very large datasets (>10k rows)
- Internationalization support
- More sophisticated PII pattern detection

[Unreleased]: https://github.com/yourusername/pii-scout/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/pii-scout/releases/tag/v1.0.0
