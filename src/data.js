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
        let currentSectionCode = 'N/A'; // Keeps track of the current section (e.g., #DAYBREAK)
        let currentSectionLink = ''; // Stores the link associated with the current section
        let currentHeaders = null; // Stores the column headers (e.g., USERNAME, STATUS)
        let lastUsername = ''; // Used for "forward filling" usernames in merged rows

        rows.forEach((row) => { // Loop through every row in the spreadsheet
          const rowText = row.join(' '); // Merge all cells into one string to search for URLs
          const urlMatch = rowText.match(/https?:\/\/[^\s,]+/); // Regular expression to find a URL in the text

          // 1. Detect Section Header (e.g. #DAYBREAK)
          // Look for a cell starting with '#' that isn't the main header row
          const potentialCode = row.find(cell => (cell + '').trim().startsWith('#'));
          if (potentialCode && !row.some(cell => (cell+'').toUpperCase().includes('USERNAME'))) {
            currentSectionCode = potentialCode.split('(')[0].trim(); // Extract the code part
            currentSectionLink = ''; // Reset link because we are in a new section
            currentHeaders = null;   // Reset headers because the new section might have different columns
            return; // Skip to the next row
          }

          // 2. Detect Section Link (found in a row between the Section Code and the Table Headers)
          if (!currentHeaders && urlMatch) {
            currentSectionLink = urlMatch[0]; // Save the first URL we find as the section's reference link
            return; // Skip to the next row
          }

          // 3. Detect Table Headers
          // If a row contains the word 'USERNAME', we assume this row defines the columns
          if (row.some(cell => typeof cell === 'string' && cell.toUpperCase().includes('USERNAME'))) {
            currentHeaders = row.map(h => (h || '').trim().toUpperCase()); // Save headers in uppercase for consistency
            return; // Skip to next row
          }

          // 4. Process Actual Data Rows
          if (currentHeaders) { // Only process if we've already found headers for the current section
            const hasData = row.some((cell, i) => (cell + '').trim().length > 0); // Check if row is not empty
            if (hasData) {
              const order = { // Create a new order object
                CODE: currentSectionCode, // Link it to the current section code
                SECTION_LINK: currentSectionLink // Link it to the current section reference
              };
              
              currentHeaders.forEach((header, i) => { // Go through each header and assign the cell value to the order object
                let val = (row[i] || '').trim(); // Get the value from the current row and column index
                
                // Extract any specific link found inside a cell (e.g. a tracking link in REMARKS)
                const cellUrl = val.match(/https?:\/\/[^\s,]+/);
                if (cellUrl) order.CELL_LINK = cellUrl[0]; // Store it as a specific cell link

                if (header === 'USERNAME') { // Handle merged username cells
                  if (val) lastUsername = val; // If cell has a name, remember it
                  else val = lastUsername; // If cell is empty, use the last remembered name (Forward Fill)
                }
                if (header) order[header] = val; // Assign the value to the object using the header name as the key
              });

              // Validation: Only add if there is a username and specification (standard for an order)
              if (order.USERNAME && order.SPECIFICATION) {
                // Determine final link: cell link (specific tracking) takes priority over section link (general info)
                order.FINAL_LINK = order.CELL_LINK || order.SECTION_LINK;
                allOrders.push(order); // Add finished order to our list
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
