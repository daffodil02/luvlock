import Papa from 'papaparse'; // Import PapaParse, a powerful library for parsing CSV (Comma Separated Values) files

// A set of public Google Sheet URLs exported as CSV format
export const SHEET_URLS = {
  // Array of multiple sheet URLs for different order sections
  ORDERS: [
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=1879667933&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=1063731126&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=590351889&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=0&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=773600509&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=955840033&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=1079608460&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=143044074&single=true&output=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=803254890&single=true&output=csv',
  ],
  // Single URL for notification data
  NOTIFICATIONS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=4109000&single=true&output=csv',
  // Single URL for ongoing Group Order data
  GO_ORDERS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwmHnzGnwaVVZjpQyEy1knbhKBByb34He_c5cPpOdEmuxfy2UYNtzDC6itdR6r3JACsvKulwuenc9v/pub?gid=637330377&single=true&output=csv'
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

        rows.forEach((row) => {
          const rowText = row.join(' ');
          const urlMatch = rowText.match(/https?:\/\/[^\s,]+/);
          
          // Helper: Count how many non-empty cells are in this row
          const nonEmojiCells = row.filter(cell => (cell + '').trim().length > 0).length;

          // 1. Detect Block Section Header (e.g. #DAYBREAK4)
          // Look for a cell starting with '#' but ONLY if the row is mostly empty (Block Architecture)
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

                // Logic for "Column-based" Tags (e.g. #XY11 in the first column)
                // This handles tables where the order code is a column that might be merged.
                if (header === 'TAG' || header === 'BATCH') {
                  if (val && val.startsWith('#')) lastTag = val; // Remember the new tag
                  else if (!val) val = lastTag; // Forward fill if merged
                  order.CODE = val; // Override the order code with the specific row tag
                }

                if (header === 'USERNAME') {
                  if (val) lastUsername = val;
                  else val = lastUsername; // Forward fill username
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

// --- Standard Parser for Notifications and GOs (Used for simple tables with standard headers) ---
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
