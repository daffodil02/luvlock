import Papa from 'papaparse'; // Import PapaParse, a powerful library for parsing CSV (Comma Separated Values) files

// A set of public Google Sheet URLs exported as CSV format
export const SHEET_URLS = {
  // Array of multiple sheet URLs for different order sections
  ORDERS: [
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=258204747&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=577837462&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=2019147234&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=1242867494&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=1798317038&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=1795245801&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=76895146&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=1233109253&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=1292474102&single=true&output=csv',
  ],
  // Single URL for notification data
  NOTIFICATIONS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=808130399&single=true&output=csv',
  // Single URL for ongoing Group Order data
  GO_ORDERS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=2002772106&single=true&output=csv',
  // Single URL for postage data
  // Change: Switched to fetchOrdersData because the Postage sheet uses the same complex merged layout as the Masterlist!
  POSTAGE: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=1917428449&single=true&output=csv',
  // Change: Added dynamic rate sheet for calculator! 🕵️‍♀️🎯
  CALCULATOR_RATE: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4OSHMIPTCNOrFqk4knCD1KLCIT9mJQS5NFYoMKZGP23bDcZPModyVzXmFkF0soMqwH4oyGbNKmo8d/pub?gid=1188104745&single=true&output=csv',
};

// --- Specialized Parser for Order Tracking (Handles complex layouts like merged cells and headings) ---
export const fetchOrdersData = (url, mockFallback) => {
  return new Promise((resolve) => { // Returns a Promise which will resolve when the parsing is finished
    // Check if URL is valid or if it's still a placeholder
    if (!url || (typeof url === 'string' && url.includes('YOUR_'))) {
      resolve(mockFallback); // If invalid, return the fallback data immediately
      return;
    }

    Papa.parse(url, { // Start parsing the CSV at the provided URL
      download: true, // Tell PapaParse to fetch the file from the web
      header: false, // Don't assume the first row is headers (since our sheet has multiple sections)
      skipEmptyLines: true, // Ignore lines that have no data
      complete: (results) => { // Callback function that runs when parsing is done
        const rows = results.data; // The raw rows of data from the spreadsheet
        const allOrders = []; // Array to store processed order objects
        let currentSectionCode = 'N/A'; // Keeps track of the current block section (e.g., #DAYBREAK)
        let currentSectionLink = ''; // Stores the link associated with the current section
        let currentHeaders = null; // Stores the column headers (e.g., USERNAME, STATUS)
        let lastUsername = ''; // Used for "forward filling" usernames in merged rows
        let lastTag = '';      // Used for "forward filling" tags (e.g. #XY11) if it's a column
        let lastCode = '';     // Used for "forward filling" area codes (e.g. CN07)
        let lastStatus = '';   // Used for "forward filling" status (e.g. READY FOR POSTAGE)
        let lastRemarks = '';  // Used for "forward filling" remarks

        rows.forEach((row) => {
          const rowText = row.join(' ');
          const urlMatch = rowText.match(/https?:\/\/[^\s,]+/);
          
          // Helper: Count how many non-empty cells are in this row
          const nonEmojiCells = row.filter(cell => (cell + '').trim().length > 0).length;

          // 1. Detect Block Section Header (e.g. #DAYBREAK4)
          const potentialCode = row.find(cell => (cell + '').trim().startsWith('#'));
          if (potentialCode && nonEmojiCells < 3 && !row.some(cell => (cell+'').toUpperCase().includes('USERNAME'))) {
            currentSectionCode = (potentialCode + '').split('(')[0].trim();
            currentSectionLink = ''; 
            currentHeaders = null;   // Reset headers for new block
            return;
          }

          // 2. Detect Section Link (reference link for the whole block)
          if (!currentHeaders && urlMatch) {
            currentSectionLink = urlMatch[0];
            return;
          }

          // 3. Detect Table Headers (e.g. USERNAME, SPECIFICATION)
          if (row.some(cell => typeof cell === 'string' && cell.toUpperCase().includes('USERNAME'))) {
            currentHeaders = row.map(h => (h || '').trim().toUpperCase());
            return;
          }

          // 4. Process Actual Data Rows
          if (currentHeaders) {
            const hasData = row.some((cell, i) => (cell + '').trim().length > 0);
            if (hasData) {
              const order = { 
                CODE: currentSectionCode, // Default to the block code (#DAYBREAK)
                SECTION_LINK: currentSectionLink 
              };
              
              currentHeaders.forEach((header, i) => {
                let val = (row[i] || '').trim();
                const cellUrl = val.match(/https?:\/\/[^\s,]+/);
                if (cellUrl) order.CELL_LINK = cellUrl[0];

                // Logic for "Column-based" Data
                // This handles complex merged tables (Cluster layouts)
                if (header === 'CODE' || header === 'AREA') {
                  if (val) lastCode = val; 
                  else if (!val) val = lastCode; // Forward fill Code
                  order.CODE = val; 
                }

                if (header === 'TAG' || header === 'BATCH') {
                  // Change: Recognize #PCO tags even if they start with country codes (KR, CN, etc.) 🕵️‍♀️🎯
                  if (val && (val.startsWith('#') || val.toUpperCase().includes('GIVEAWAY') || val.toUpperCase().includes('#PCO'))) {
                    lastTag = val; 
                  } else if (!val) {
                    val = lastTag; // Forward fill the tag if the cell is truly empty (merged row logic)
                  }
                  order.TAG = val; 
                }

                if (header === 'USERNAME') {
                  if (val) lastUsername = val;
                  else val = lastUsername; // Forward fill username
                }

                if (header === 'STATUS') {
                  if (val) lastStatus = val;
                  else val = lastStatus; // Forward fill Status (Fix for merged Ready/Paid cells!)
                }

                if (header === 'REMARKS' || header === 'NOTE') {
                  if (val) lastRemarks = val;
                  else val = lastRemarks; // Forward fill Remarks
                }
                
                if (header) order[header] = val;
              });

              // Final check: must have a username and something they ordered (SPECIFICATION)
              if (order.USERNAME && order.SPECIFICATION) {
                order.FINAL_LINK = order.CELL_LINK || order.SECTION_LINK;
                allOrders.push(order);
              }
            }
          }
        });
        resolve(allOrders); // Final step: Return the full list of orders
      },
      error: () => resolve(mockFallback) // Handle errors by returning the fallback data
    });
  });
};

// --- Standard Parser for Notifications (Used for simple tables with standard headers) ---
export const fetchStandardData = (url, mockFallback) => {
  return new Promise((resolve) => {
    // Basic verification of the provided URL
    if (!url || (typeof url === 'string' && url.includes('YOUR_'))) {
      resolve(mockFallback);
      return;
    }

    Papa.parse(url, {
      download: true, // Fetch file from internet
      header: true, // Use the first row as object keys automatically
      skipEmptyLines: true, // Skip empty rows
      complete: (results) => {
        // Return only rows that actually contain some data (filter out empty objects)
        resolve(results.data.filter(row => Object.values(row).some(x => x)));
      },
      error: () => resolve(mockFallback) // Handle network or parsing errors
    });
  });
};

// Main function to fetch all orders from all listed spreadsheet links
export const fetchOrders = async () => {
  // Promise.all runs all fetch operations in parallel for speed
  const allResults = await Promise.all(
    SHEET_URLS.ORDERS.map(link => fetchOrdersData(link, [])) // Fetch each spreadsheet link
  );
  return allResults.flat(); // Merge the array of arrays into one single flat array of orders
};

// Helper function to fetch notifications
export const fetchNotifications = () => fetchStandardData(SHEET_URLS.NOTIFICATIONS, []);

// Helper function to fetch ongoing Group Orders
export const fetchOngoingGOs = () => fetchStandardData(SHEET_URLS.GO_ORDERS, []);

// Helper function to fetch postage table data
// Change: Switched to fetchOrdersData because the Postage sheet uses the same complex merged layout as the Masterlist!
export const fetchPostage = () => fetchOrdersData(SHEET_URLS.POSTAGE, []);

// Helper function to fetch the exchange rates list for the calculator! 🕵️‍♀️🎯
export const fetchExchangeRates = async () => {
  const data = await fetchStandardData(SHEET_URLS.CALCULATOR_RATE, []);
  // Returns [{ Currency: 'KRW', Rate: '0.0028' }, ...]
  return data;
};
