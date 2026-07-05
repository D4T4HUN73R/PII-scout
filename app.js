// Global variables
let csvData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 50;
let map = null;
let markers = [];
let columnHeaders = [];
let locationColumns = [];

// Common column name patterns for different data types
const phonePatterns = [
  /phone/i,
  /mobile/i,
  /telephone/i,
  /msisdn/i,
  /phone_number/i,
  /phone_nr/i,
  /cell/i,
  /cellphone/i,
];

const emailPatterns = [/email/i, /e[-]?mail/i, /mail/i];

const namePatterns = [
  /name/i,
  /full[-]?name/i,
  /fullname/i,
  /first[-]?name/i,
  /last[-]?name/i,
  /surname/i,
];

const dobPatterns = [/dob/i, /birth/i, /date[-]?of[-]?birth/i, /birthday/i];

const ssnPatterns = [
  /ssn/i,
  /social[-]?security/i,
  /social[-]?number/i,
  /id[-]?number/i,
];

const latPatterns = [
  /latitude/i,
  /lat/i,
  /position_lat/i,
  /pos_lat/i,
  /coord_lat/i,
];

const lonPatterns = [
  /longitude/i,
  /lon/i,
  /position_lon/i,
  /pos_lon/i,
  /coord_lon/i,
];

// DOM elements
const uploadSection = document.getElementById("upload-section");
const csvUpload = document.getElementById("csv-upload");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const datasetStatsEl = document.getElementById("dataset-stats");
const perColumnStatsEl = document.getElementById("per-column-stats");
const dataRowsContainer = document.getElementById("data-rows-container");
const additionalStatsEl = document.getElementById("additional-stats");
const mapContainer = document.getElementById("map-container");
const dataGrid = document.querySelector(".data-grid");
const searchSection = document.getElementById("search-section");

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  // Set up event listeners
  csvUpload.addEventListener("change", handleFileSelect);
  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  // Initialize with a message to upload data
  initEmptyState();

  // Set up overlay click handler for closing processing overlay
  const processingOverlay = document.getElementById("processing-overlay");
  if (processingOverlay) {
    processingOverlay.addEventListener("click", function (event) {
      if (event.target === this) {
        hideProcessingOverlay();
      }
    });
  }
});

// Show processing overlay
function showProcessingOverlay() {
  const overlay = document.getElementById("processing-overlay");
  overlay.classList.remove("hidden");

  // Animate progress bar
  const progressFill = overlay.querySelector(".progress-fill");
  let width = 0;
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
    } else {
      width += 5;
      progressFill.style.width = width + "%";
    }
  }, 100);

  // Add click handler to close overlay
  overlay.addEventListener("click", function (event) {
    if (event.target === this) {
      // Only close if clicked directly on overlay, not children
      hideProcessingOverlay();
    }
  });
}

// Hide processing overlay
function hideProcessingOverlay() {
  const overlay = document.getElementById("processing-overlay");
  overlay.classList.add("hidden");
}

// Show floating overlay with statistics
function showFloatingOverlay() {
  const overlay = document.getElementById("floating-overlay");
  overlay.classList.remove("hidden");

  // Update the summary stats
  updateFloatingStats();
}

// Hide floating overlay
function hideFloatingOverlay() {
  const overlay = document.getElementById("floating-overlay");
  overlay.classList.add("hidden");
}

// Update floating overlay statistics
function updateFloatingStats() {
  const statsCard = document.querySelector(".floating-card");
  if (!statsCard) return;

  // Get the current dataset stats data
  const totalRows = csvData.length;
  const totalColumns = columnHeaders.length;

  // Count columns with NaN values
  let columnsWithNaN = 0;
  columnHeaders.forEach((header) => {
    let nanCount = 0;
    csvData.forEach((row) => {
      if (!row[header] || row[header].trim() === "") {
        nanCount++;
      }
    });
    columnsWithNaN += nanCount > 0 ? 1 : 0;
  });

  // Update the stat values
  const statValues = statsCard.querySelectorAll(".stat-value");
  if (statValues.length >= 3) {
    statValues[0].textContent = totalRows;
    statValues[1].textContent = totalColumns;
    statValues[2].textContent = columnsWithNaN;
  }
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file || (file.type !== "text/csv" && !file.name.endsWith(".csv"))) {
    alert("Please select a valid CSV file");
    return;
  }

  // Show processing overlay
  showProcessingOverlay();

  // Simulate processing delay to demonstrate the progress bar
  setTimeout(() => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const csv = e.target.result;
      parseCSV(csv);
    };
    reader.readAsText(file);
  }, 500);
}

// Parse CSV data
function parseCSV(csv) {
  const lines = csv.split("\n");
  if (lines.length < 2) return;

  // Set column headers from first line
  columnHeaders = lines[0].split(",").map((header) => header.trim());

  // Process data rows
  csvData = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;

    const values = lines[i].split(",");
    const row = {};
    columnHeaders.forEach((header, index) => {
      // Remove quotes from values
      let value = values[index]?.trim() || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      row[header] = value;
    });
    csvData.push(row);
  }

  filteredData = [...csvData];

  // Check for location data
  locationColumns = findLocationColumns();

  if (locationColumns.length >= 2) {
    renderMap();
    mapContainer.classList.remove("hidden");
  } else {
    mapContainer.classList.add("hidden");
  }

  // Hide processing overlay (if shown)
  hideProcessingOverlay();

  // Show the main interface after upload
  document.getElementById("upload-section").style.display = "none";
  dataGrid.classList.remove("hidden");
  searchSection.classList.remove("hidden");

  // Add data-loaded class to container for background effect
  document.querySelector(".container").classList.add("data-loaded");

  // Force map resize when first shown
  if (mapContainer && locationColumns.length >= 2) {
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);
  }

  // Re-render everything with new data
  renderDatasetStats();
  renderPerColumnStats();
  renderDataRows();
  renderAdditionalStats();
}

// Find location columns based on common naming patterns
function findLocationColumns() {
  const latCols = [];
  const lonCols = [];

  columnHeaders.forEach((header) => {
    if (latPatterns.some((pattern) => pattern.test(header))) {
      latCols.push(header);
    }
    if (lonPatterns.some((pattern) => pattern.test(header))) {
      lonCols.push(header);
    }
  });

  // Return both columns if found
  return latCols.length > 0 && lonCols.length > 0
    ? [latCols[0], lonCols[0]]
    : [];
}

// Render dataset stats
function renderDatasetStats() {
  if (csvData.length === 0) return;

  const stats = {
    totalRows: csvData.length,
    totalColumns: columnHeaders.length,
    columnsWithNaN: 0,
    duplicateRows: 0,
    dataTypes: {},
  };

  // Count NaN values for each column
  columnHeaders.forEach((header) => {
    let nanCount = 0;
    csvData.forEach((row) => {
      if (!row[header] || row[header].trim() === "") {
        nanCount++;
      }
    });
    stats.columnsWithNaN += nanCount > 0 ? 1 : 0;
  });

  // Count duplicate rows
  const seenRows = new Set();
  csvData.forEach((row) => {
    const rowString = JSON.stringify(row);
    if (seenRows.has(rowString)) {
      stats.duplicateRows++;
    } else {
      seenRows.add(rowString);
    }
  });

  datasetStatsEl.innerHTML = `
        <div class="square-stat">
            <span>Total Rows:</span>
            <span class="stat-value">${stats.totalRows}</span>
        </div>
        <div class="square-stat">
            <span>Total Columns:</span>
            <span class="stat-value">${stats.totalColumns}</span>
        </div>
        <div class="square-stat">
            <span>Columns with NaN:</span>
            <span class="stat-value">${stats.columnsWithNaN}</span>
        </div>
        <div class="square-stat">
            <span>Duplicate Rows:</span>
            <span class="stat-value" style="color: #ff6b6b;">${stats.duplicateRows}</span>
        </div>
    `;
}

// Render per-column statistics
function renderPerColumnStats() {
  if (csvData.length === 0) return;

  perColumnStatsEl.innerHTML = "";

  columnHeaders.forEach((header) => {
    const values = csvData.map((row) => row[header]).filter((val) => val);
    if (values.length === 0) return;

    // Generate stats based on data type
    const stats = generateColumnStats(header, values);
    if (stats && stats.type) {
      renderColumnStats(header, stats);
    }
  });
}

// Generate column statistics
function generateColumnStats(header, values) {
  // Check if this is a location field - skip it for now
  const isLocation =
    latPatterns.some((pattern) => pattern.test(header)) ||
    lonPatterns.some((pattern) => pattern.test(header));

  if (isLocation) return null;

  // Check if column is likely a phone number using common patterns
  // We're removing phone statistics from left column
  const isPhone = phonePatterns.some((pattern) => pattern.test(header));
  if (isPhone) {
    // Return null so no phone stats are shown in the left column
    return null;
  }

  // Check if column is likely an email
  // We're removing email statistics from left column
  const isEmail = emailPatterns.some((pattern) => pattern.test(header));
  if (isEmail) {
    // Return null so no email stats are shown in the left column
    return null;
  }

  // Check if column is likely a date of birth
  const isDOB = dobPatterns.some((pattern) => pattern.test(header));
  if (isDOB) {
    return {
      type: "dob",
      data: countBirthYears(values),
    };
  }

  // Check if it's an SSN-like field
  const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
  const isSSN = ssnPatterns.some((pattern) => pattern.test(header));
  if (isSSN || values.some((val) => ssnPattern.test(val))) {
    return {
      type: "ssn",
      data: generateSSNStats(values),
    };
  }

  // Check if it's a name
  const isName = namePatterns.some((pattern) => pattern.test(header));
  if (isName) {
    return {
      type: "names",
      data: countTopValues(values, 5),
    };
  }

  // Default statistics
  return {
    type: "default",
    data: countTopValues(values, 5),
    total: values.length,
    unique: [...new Set(values)].length,
  };
}

// Render column-specific stats with expand/collapse functionality
function renderColumnStats(header, stats) {
  const card = document.createElement("div");
  card.className = "stats-card";

  let content = `<h2>${header} Stats</h2>`;

  switch (stats.type) {
    case "dob":
      content += "<h3>Birth Years</h3>";
      if (stats.data && Object.keys(stats.data).length > 0) {
        // Show first 5 values and add expand button if more exist
        const keys = Object.keys(stats.data);
        const firstFive = keys.slice(0, 5);
        const remaining = keys.slice(5);
        
        if (firstFive.length > 0) {
          content += renderBarGraph(
            firstFive.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
        }
        
        if (remaining.length > 0) {
          content += `<button class="expand-btn" data-target="${header}-dob">Show ${remaining.length} more</button>`;
          content += `<div class="collapsible-content" id="${header}-dob-content" style="display: none;">`;
          content += renderBarGraph(
            remaining.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
          content += `</div>`;
        }
      }
      break;
    case "ssn":
      content += "<h3>SSN Statistics</h3>";
      content += `<div class="stat-row"><span>Total Records:</span><span class="stat-value">${stats.data.total}</span></div>`;
      content += `<div class="stat-row"><span>Unique SSNs:</span><span class="stat-value">${stats.data.unique}</span></div>`;
      if (stats.data.verification) {
        content += `<div class="stat-row"><span>Valid Format:</span><span class="stat-value">${stats.data.verification}</span></div>`;
      }
      break;
    case "names":
      content += "<h3>Top Names</h3>";
      if (stats.data && Object.keys(stats.data).length > 0) {
        // Show first 5 values and add expand button if more exist
        const keys = Object.keys(stats.data);
        const firstFive = keys.slice(0, 5);
        const remaining = keys.slice(5);
        
        if (firstFive.length > 0) {
          content += renderBarGraph(
            firstFive.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
        }
        
        if (remaining.length > 0) {
          content += `<button class="expand-btn" data-target="${header}-names">Show ${remaining.length} more</button>`;
          content += `<div class="collapsible-content" id="${header}-names-content" style="display: none;">`;
          content += renderBarGraph(
            remaining.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
          content += `</div>`;
        }
      }
      break;
    default:
      content += "<h3>Top Values</h3>";
      if (stats.data && Object.keys(stats.data).length > 0) {
        // Show first 5 values and add expand button if more exist for default types
        const keys = Object.keys(stats.data);
        const firstFive = keys.slice(0, 5);
        const remaining = keys.slice(5);
        
        if (firstFive.length > 0) {
          content += renderBarGraph(
            firstFive.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
        }
        
        if (remaining.length > 0) {
          content += `<button class="expand-btn" data-target="${header}-default">Show ${remaining.length} more</button>`;
          content += `<div class="collapsible-content" id="${header}-default-content" style="display: none;">`;
          content += renderBarGraph(
            remaining.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
          content += `</div>`;
        }
      }
      break;
  }
  card.innerHTML = content;
  perColumnStatsEl.appendChild(card);
  
  // Add event listeners for expand/collapse functionality to the card just added
  const currentCard = perColumnStatsEl.lastChild;
  if (currentCard && currentCard.classList.contains('stats-card')) {
    const buttons = currentCard.querySelectorAll('.expand-btn');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const content = document.getElementById(targetId + '-content');
        if (content) {
          const isVisible = content.style.display === 'block';
          content.style.display = isVisible ? 'none' : 'block';
          this.textContent = isVisible ? `Show ${targetId.split('-').pop()} more` : 'Hide';
        }
      });
    });
  }
}

// Count phone prefixes
function countPrefixes(values) {
  const prefixCounts = {};
  values.forEach((value) => {
    // Extract common phone prefixes
    const match = value.match(/(\+?1[\s-]?)?(\d{3})[\s-]?(\d{3})[\s-]?(\d{4})/);
    if (match) {
      let prefix = match[2];
      prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
    }
  });
  return prefixCounts;
}

// Count email domains
function countEmailDomains(values) {
  const domainCounts = {};
  values.forEach((value) => {
    if (value.includes("@")) {
      const domain = value.split("@")[1].toLowerCase();
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }
  });
  return domainCounts;
}

// Count birth years from dates
function countBirthYears(values) {
  const yearCounts = {};
  values.forEach((value) => {
    // Try to extract year from various date formats
    let yearMatch;
    if (
      (yearMatch = value.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/)) ||
      (yearMatch = value.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/))
    ) {
      const year = yearMatch[1];
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });
  return yearCounts;
}

// Generate SSN stats
function generateSSNStats(values) {
  const total = values.length;
  const unique = [...new Set(values)].length;
  const validFormatCount = values.filter((val) =>
    /^\d{3}-\d{2}-\d{4}$/.test(val),
  ).length;
  return {
    total,
    unique,
    verification: `${validFormatCount} of ${total} valid formats`,
  };
}

// Count top values (with limit to 5)
function countTopValues(values, limit = 5) {
  const counts = {};
  values.forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .reduce((obj, [key, count]) => {
      obj[key] = count;
      return obj;
    }, {});
}

// Render bar graph with clickable values
function renderBarGraph(data, isTop5Only = false) {
  const maxValue = Math.max(...Object.values(data));

  let html = '<div class="bar-container">';

  Object.entries(data).forEach(([key, value]) => {
    const percentage = (value / maxValue) * 100;
    // Wrap the values in spans that can be clicked for search
    const clickableKey = `<span class="stat-value clickable" data-search="${key}">${key}</span>`;
    html += `
            <div class="bar-graph">
                <div class="bar-fill" style="width: ${percentage}%"></div>
                <div class="bar-label">${clickableKey} (${value})</div>
            </div>
        `;
  });

  html += "</div>";

  return html;
}

// Render column-specific stats with expand/collapse functionality
function renderColumnStats(header, stats) {
  const card = document.createElement("div");
  card.className = "stats-card";

  let content = `<h2>${header} Stats</h2>`;

  switch (stats.type) {
    case "phone":
      content += "<h3>Phone Prefixes</h3>";
      if (stats.data && Object.keys(stats.data).length > 0) {
        content += renderBarGraph(stats.data, true);
      }
      break;
    case "email":
      content += "<h3>Email Domains</h3>";
      if (stats.data && Object.keys(stats.data).length > 0) {
        content += renderBarGraph(stats.data, true);
      }
      break;
    case "dob":
      content += "<h3>Birth Years</h3>";
      if (stats.data && Object.keys(stats.data).length > 0) {
        // Show first 5 values and add expand button if more exist
        const keys = Object.keys(stats.data);
        const firstFive = keys.slice(0, 5);
        const remaining = keys.slice(5);
        
        if (firstFive.length > 0) {
          content += renderBarGraph(
            firstFive.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
        }
        
        if (remaining.length > 0) {
          content += `<button class="expand-btn" data-target="${header}-dob">Show ${remaining.length} more</button>`;
          content += `<div class="collapsible-content" id="${header}-dob-content" style="display: none;">`;
          content += renderBarGraph(
            remaining.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
          content += `</div>`;
        }
      }
      break;
    case "ssn":
      content += "<h3>SSN Stats</h3>";
      content += `<div class="stat-row"><span>Total Records:</span><span class="stat-value">${stats.data.total}</span></div>`;
      content += `<div class="stat-row"><span>Unique SSNs:</span><span class="stat-value">${stats.data.unique}</span></div>`;
      if (stats.data.verification) {
        content += `<div class="stat-row"><span>Valid Format:</span><span class="stat-value">${stats.data.verification}</span></div>`;
      }
      break;
    case "names":
      content += "<h3>Top Names</h3>";
      if (stats.data && Object.keys(stats.data).length > 0) {
        // Show first 5 values and add expand button if more exist
        const keys = Object.keys(stats.data);
        const firstFive = keys.slice(0, 5);
        const remaining = keys.slice(5);
        
        if (firstFive.length > 0) {
          content += renderBarGraph(
            firstFive.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
        }
        
        if (remaining.length > 0) {
          content += `<button class="expand-btn" data-target="${header}-names">Show ${remaining.length} more</button>`;
          content += `<div class="collapsible-content" id="${header}-names-content" style="display: none;">`;
          content += renderBarGraph(
            remaining.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
          content += `</div>`;
        }
      }
      break;
    default:
      content += "<h3>Top Values</h3>";
      if (stats.data && Object.keys(stats.data).length > 0) {
        // Show first 5 values and add expand button if more exist for default types
        const keys = Object.keys(stats.data);
        const firstFive = keys.slice(0, 5);
        const remaining = keys.slice(5);
        
        if (firstFive.length > 0) {
          content += renderBarGraph(
            firstFive.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
        }
        
        if (remaining.length > 0) {
          content += `<button class="expand-btn" data-target="${header}-default">Show ${remaining.length} more</button>`;
          content += `<div class="collapsible-content" id="${header}-default-content" style="display: none;">`;
          content += renderBarGraph(
            remaining.reduce((obj, key) => {
              obj[key] = stats.data[key];
              return obj;
            }, {}),
            true
          );
          content += `</div>`;
        }
      }
      break;
  }
  
  card.innerHTML = content;
  perColumnStatsEl.appendChild(card);
  
  // Add event listeners for expand/collapse functionality to the card just added
  const currentCard = perColumnStatsEl.lastChild;
  if (currentCard && currentCard.classList.contains('stats-card')) {
    const buttons = currentCard.querySelectorAll('.expand-btn');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const content = document.getElementById(targetId + '-content');
        if (content) {
          const isVisible = content.style.display === 'block';
          content.style.display = isVisible ? 'none' : 'block';
          this.textContent = isVisible ? `Show ${targetId.split('-').pop()} more` : 'Hide';
        }
      });
    });
  }
}

// Add all the functions to the end of the file to properly close it

// Render map with location data
function renderMap() {
  // Remove existing map if present
  if (map) {
    map.remove();
  }

  // Initialize the map centered on global view with zoom level 2
  map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: true,
  });

  // Add OpenStreetMap tiles - use default OSM
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add zoom control to bottom right
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  // Clear existing markers
  markers = [];

  // Add markers for each row with location data
  csvData.forEach((row) => {
    if (row[locationColumns[0]] && row[locationColumns[1]]) {
      const lat = parseFloat(row[locationColumns[0]]);
      const lon = parseFloat(row[locationColumns[1]]);

      if (!isNaN(lat) && !isNaN(lon)) {
        const marker = L.marker([lat, lon]).addTo(map);

        // Create compact popup content with dark theme
        let popupContent = '<div class="popup-content">';

        // Add only key fields to make it readable
        Object.entries(row).forEach(([key, value]) => {
          if (
            value &&
            key !== locationColumns[0] &&
            key !== locationColumns[1]
          ) {
            popupContent += `<div class="popup-field"><strong>${key}:</strong> ${value}</div>`;
          }
        });

        popupContent += "</div>";

        marker.bindPopup(popupContent);

        // Store reference to marker for potential later use
        markers.push(marker);
      }
    }
  });

  // Set global view initially - ensure all markers are visible
  setTimeout(() => {
    if (map) {
      map.invalidateSize();
      // Reset to global view with zoom level 2
      map.setView([20, 0], 2);
    }
  }, 100);
}

// Render data rows
function renderDataRows() {
  if (filteredData.length === 0) {
    dataRowsContainer.innerHTML = "<p>No data found</p>";
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
  const showingData = filteredData.slice(startIndex, endIndex);

  dataRowsContainer.innerHTML = "";

  showingData.forEach((row, index) => {
    const rowEl = document.createElement("div");
    rowEl.className = "data-row";
    rowEl.dataset.index = startIndex + index;

    // Determine title from available fields
    let title = "Unknown Entity";
    if (row.name && row.name.trim() !== "") {
      title = row.name;
    } else if (row.email && row.email.trim() !== "") {
      title = row.email;
    } else if (row.phone && row.phone.trim() !== "") {
      title = row.phone;
    }

    // Generate row content
    rowEl.innerHTML = `
            <div class="data-title">${title}</div>
            <div class="data-details">
                ${Object.entries(row)
                  .map(
                    ([key, value]) =>
                      `<div class="data-detail-row">
                        <span>${key}:</span>
                        <span>${value}</span>
                    </div>`,
                  )
                  .join("")}
            </div>
        `;

    // Add click handler to toggle details
    rowEl.addEventListener("click", function () {
      this.classList.toggle("data-open");
    });

    dataRowsContainer.appendChild(rowEl);
  });

  // Render pagination
  renderPagination();
}

// Render pagination controls
function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (totalPages <= 1) {
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  const paginationEl = document.getElementById("pagination");
  paginationEl.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `page-btn ${i === currentPage ? "active" : ""}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      currentPage = i;
      renderDataRows();
    };
    paginationEl.appendChild(pageBtn);
  }
}

// Perform search
function performSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredData = [...csvData];
    // Restore original map view to global level with all markers
    if (map) {
      // Reinitialize map with all data points
      renderMap();
    }
  } else {
    // Filter rows based on search term
    filteredData = csvData.filter((row) => {
      return Object.values(row).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm),
      );
    });

    // Update map to show only filtered results
    updateMapWithFilteredData();
  }

  currentPage = 1;
  renderDatasetStats();
  renderPerColumnStats();
  renderDataRows();
  renderAdditionalStats();
}

// Update map with filtered data points only
function updateMapWithFilteredData() {
  if (!map || !filteredData || filteredData.length === 0) return;

  // Remove existing markers
  markers.forEach((marker) => marker.remove());
  markers = [];

  // Add markers for filtered data - this is correct for search filtering
  filteredData.forEach((row) => {
    if (row[locationColumns[0]] && row[locationColumns[1]]) {
      const lat = parseFloat(row[locationColumns[0]]);
      const lon = parseFloat(row[locationColumns[1]]);

      if (!isNaN(lat) && !isNaN(lon)) {
        const marker = L.marker([lat, lon]).addTo(map);

        // Create compact popup content with dark theme
        let popupContent = '<div class="popup-content">';

        // Add only key fields to make it readable
        Object.entries(row).forEach(([key, value]) => {
          if (
            value &&
            key !== locationColumns[0] &&
            key !== locationColumns[1]
          ) {
            popupContent += `<div class="popup-field"><strong>${key}:</strong> ${value}</div>`;
          }
        });

        popupContent += "</div>";

        marker.bindPopup(popupContent);

        // Store reference to marker for potential later use
        markers.push(marker);
      }
    }
  });

  // Fit map to filtered markers if there are any
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().extend([20, 0]), { padding: [50, 50] });
  } else if (markers.length === 0 && map) {
    // If no results, reset to global view
    map.setView([20, 0], 2);
  }
}

// Find column by patterns
function findColumnByPattern(patterns) {
  for (const header of columnHeaders) {
    if (patterns.some((pattern) => pattern.test(header))) {
      return header;
    }
  }
  return null;
}

// Render additional stats in right column
function renderAdditionalStats() {
  if (csvData.length === 0) return;

  additionalStatsEl.innerHTML = "";

  // Check for phone numbers and show prefix stats
  const phoneColumn = findColumnByPattern(phonePatterns);

  if (phoneColumn) {
    const phoneValues = csvData
      .map((row) => row[phoneColumn])
      .filter((val) => val);
    if (phoneValues.length > 0) {
      const prefixes = countPrefixes(phoneValues);
      renderAdditionalStatCard("Phone Prefixes", "phone", prefixes);
    }
  }

  // Check for email addresses and show domain stats
  const emailColumn = findColumnByPattern(emailPatterns);

  if (emailColumn) {
    const emailValues = csvData
      .map((row) => row[emailColumn])
      .filter((val) => val);
    if (emailValues.length > 0) {
      const domains = countEmailDomains(emailValues);
      renderAdditionalStatCard("Email Domains", "email", domains);
    }
  }

  // Check for date of birth and show year stats
  const dobColumn = findColumnByPattern(dobPatterns);

  if (dobColumn) {
    const dobValues = csvData.map((row) => row[dobColumn]).filter((val) => val);
    if (dobValues.length > 0) {
      const years = countBirthYears(dobValues);
      renderAdditionalStatCard("Birth Years", "dob", years);
    }
  }

  // Check for SSN and show stats
  const ssnColumn = findColumnByPattern(ssnPatterns);

  if (ssnColumn) {
    const ssnValues = csvData.map((row) => row[ssnColumn]).filter((val) => val);
    if (ssnValues.length > 0) {
      const stats = generateSSNStats(ssnValues);
      renderAdditionalStatCard("SSN Statistics", "ssn", stats);
    }
  }

  // Check for names and show top items
  const nameColumn = findColumnByPattern(namePatterns);

  if (nameColumn) {
    const nameValues = csvData
      .map((row) => row[nameColumn])
      .filter((val) => val);
    if (nameValues.length > 0) {
      const counts = countTopValues(nameValues, 5);
      renderAdditionalStatCard("Top Names", "names", counts);
    }
  }

  // Rebind click event listeners to newly added elements - using setTimeout for better DOM readiness
  setTimeout(() => {
    bindClickableEvents();

    // Also re-add the event listeners for the new stat-value elements in case they were missed
    document.querySelectorAll(".stat-value.clickable").forEach((element) => {
      if (!element.dataset.initialized) {
        element.addEventListener("click", function (event) {
          event.stopPropagation(); // Prevent event bubbling
          const searchTerm = this.getAttribute("data-search");
          if (searchTerm) {
            searchInput.value = searchTerm;
            performSearch();
          }
        });
        element.dataset.initialized = true; // Mark as initialized to prevent duplicate listeners
      }
    });
  }, 50);
}

// Render additional stat card in right column
function renderAdditionalStatCard(title, category, data) {
  const card = document.createElement("div");
  card.className = "stats-card";

  let content = `<h2>${title}</h2>`;

  switch (category) {
    case "phone":
      content += "<h3>Phone Prefixes</h3>";
      if (data && Object.keys(data).length > 0) {
        content += renderBarGraph(data, 5);
      }
      break;
    case "email":
      content += "<h3>Email Domains</h3>";
      if (data && Object.keys(data).length > 0) {
        content += renderBarGraph(data, 5);
      }
      break;
    case "dob":
      content += "<h3>Birth Years</h3>";
      if (data && Object.keys(data).length > 0) {
        content += renderBarGraph(data, 5);
      }
      break;
    case "ssn":
      content += "<h3>SSN Statistics</h3>";
      content += `<div class="stat-row"><span>Total Records:</span><span class="stat-value">${data.total}</span></div>`;
      content += `<div class="stat-row"><span>Unique SSNs:</span><span class="stat-value">${data.unique}</span></div>`;
      if (data.verification) {
        content += `<div class="stat-row"><span>Valid Format:</span><span class="stat-value">${data.verification}</span></div>`;
      }
      break;
    case "names":
      content += "<h3>Top Names</h3>";
      if (data && Object.keys(data).length > 0) {
        content += renderBarGraph(data, 5);
      }
      break;
  }

  card.innerHTML = content;
  additionalStatsEl.appendChild(card);
}

// Bind click events for stat values and expand buttons
function bindClickableEvents() {
  // Add click event listeners to all clickable stats (only for new elements)
  const clickableElements = document.querySelectorAll(".stat-value.clickable");

  clickableElements.forEach((element) => {
    // Only add the event listener if it doesn't already exist
    if (!element.dataset.listenerAdded) {
      element.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent event bubbling
        const searchTerm = this.getAttribute("data-search");
        if (searchTerm) {
          searchInput.value = searchTerm;
          performSearch();
        }
      });
      element.dataset.listenerAdded = true; // Mark that listener is added
    }
  });
}

// Export functions for external use
window.app = {
  handleFileSelect: handleFileSelect,
  performSearch: performSearch,
};

// Initialize empty state - no data shown initially
function initEmptyState() {
  document.getElementById("upload-section").style.display = "flex";
  mapContainer.classList.add("hidden");
  dataGrid.classList.add("hidden");
  searchSection.classList.add("hidden");

  // Set up initial background if needed
  setupInitialBackground();
}

// Setup initial background when no data is uploaded
function setupInitialBackground() {
  // Add an image as background for the main container when no data is loaded
  const container = document.querySelector(".container");
  if (container) {
    // Reset any existing background first
    container.style.background = "none";
    // We'll rely on CSS to display the background image in the upload section
  }
}
