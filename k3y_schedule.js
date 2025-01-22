const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const http = require("http");

// Configuration
const url = "https://www.skccgroup.com/k3y/slot_list.php";
const k3yArea = "K3Y/4"; // Specify the K3Y area to analyze

// Function to fetch and parse the HTML page
async function fetchTableData() {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const table = dom.window.document.querySelector("table");

    const data = [];
    if (table) {
      const rows = table.querySelectorAll("tr");
      rows.forEach((row, index) => {
        if (index === 0) return; // Skip the header row
        const cells = row.querySelectorAll("td");
        if (cells.length >= 4) {
          const date = cells[0].textContent.trim();
          const startTime = cells[1].textContent.trim();
          const endTime = cells[2].textContent.trim();
          const area = cells[3].textContent.trim();

          if (area.includes(k3yArea)) {
            data.push({ date, startTime, endTime });
          }
        }
      });
    }
    return data;
  } catch (error) {
    console.error("Error fetching table data:", error.message);
    return [];
  }
}

// Generate all hourly slots between given times
function generateHours(startTime, endTime) {
  const start = new Date(`1970-01-01T${startTime}:00Z`);
  const end = new Date(`1970-01-01T${endTime}:00Z`);
  const hours = [];
  while (start < end) {
    hours.push(start.toISOString().substring(11, 16));
    start.setUTCHours(start.getUTCHours() + 1);
  }
  return hours;
}

// Convert UTC time to EST
function convertToEST(utcTime) {
  const utcDate = new Date(`1970-01-01T${utcTime}:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(utcDate);
}

// Generate a full day's hourly schedule
function generateFullDaySchedule() {
  return new Set(generateHours("00:00", "23:59"));
}

// Identify gaps in the schedule
function findGaps(data) {
  const requiredRanges = [
    ["00:00", "03:00"],
    ["12:00", "23:59"],
  ];
  const dailyHours = {};
  const gaps = [];

  data.forEach(({ date, startTime, endTime }) => {
    if (!dailyHours[date]) dailyHours[date] = new Set();
    generateHours(startTime, endTime).forEach((hour) =>
      dailyHours[date].add(hour)
    );
  });

  Object.keys(dailyHours).forEach((date) => {
    const fullDay = generateFullDaySchedule();
    const scheduledHours = dailyHours[date];
    const openSlots = [...fullDay].filter((hour) => !scheduledHours.has(hour));

    requiredRanges.forEach(([start, end]) => {
      generateHours(start, end).forEach((hour) => {
        if (openSlots.includes(hour)) {
          const gapEnd = new Date(`1970-01-01T${hour}:00Z`);
          gapEnd.setUTCHours(gapEnd.getUTCHours() + 1);
          const endHour = gapEnd.toISOString().substring(11, 16);

          gaps.push({
            date,
            openSlotUTC: `${hour} - ${endHour} UTC`,
            openSlotEST: `${convertToEST(hour)} - ${convertToEST(endHour)}`,
          });
        }
      });
    });
  });

  return gaps;
}

// Generate HTML content
function generateHTML(gaps) {
  const title = `Open Slots for ${k3yArea}`;
  let previousDate = null;

  const tableRows = gaps
    .map((gap) => {
      const isDateChanged = gap.date !== previousDate;
      previousDate = gap.date;

      return (
        (isDateChanged
          ? `<tr class="date-separator"><td colspan="3"><hr></td></tr>`
          : "") +
        `<tr>
            <td>${gap.date}</td>
            <td>${gap.openSlotUTC}</td>
            <td>${gap.openSlotEST}</td>
        </tr>`
      );
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f8f9fa;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                width: 100%;
                max-width: 800px;
                padding: 20px;
                background-color: #ffffff;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                position: relative;
            }
            h1 {
                text-align: center;
                color: #343a40;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                font-size: 14px;
            }
            th, td {
                padding: 10px;
                border: 1px solid #dee2e6;
                text-align: center;
            }
            th {
                background-color: #6c757d;
                color: white;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            tr:hover {
                background-color: #e9ecef;
            }
            .date-separator td {
                padding: 0;
                border: none;
            }
            .date-separator hr {
                border: none;
                border-top: 2px solid #6c757d;
                margin: 0;
            }
            .copy-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: #f8f9fa;
                color: #007bff;
                border: 1px solid #007bff;
                padding: 5px 10px;
                font-size: 12px;
                border-radius: 5px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: background-color 0.3s ease, color 0.3s ease;
            }
            .copy-button:hover {
                background-color: #007bff;
                color: white;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <button class="copy-button" onclick="copyTableToClipboard()">Copy</button>
            <h1>${title}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Open Slot (UTC)</th>
                        <th>Open Slot (EST)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        <script>
            function copyTableToClipboard() {
                const table = document.querySelector("table");
                const rows = Array.from(table.rows);
                const maxLengths = [7, 25, 25]; // Max lengths for each column (adjustable)
                
                // Format text with consistent column widths
                const text = rows
                    .map((row) =>
                        Array.from(row.cells)
                            .map((cell, i) =>
                                cell.innerText.padEnd(maxLengths[i], " ")
                            )
                            .join("   ") // Column separator
                    )
                    .join("\\n");  // Use escaped newline for better formatting
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text)
                        .then(() => {
                            alert("Table copied to clipboard!");
                        })
                        .catch((err) => {
                            alert("Failed to copy table: " + err);
                        });
                } else {
                    alert("Clipboard access is not supported.");
                }
            }
        </script>
    </body>
    </html>
  `;
}



// HTTP server to serve the HTML
const server = http.createServer(async (req, res) => {
  if (req.url === "/") {
    try {
      const data = await fetchTableData();
      const gaps = findGaps(data);
      const htmlContent = generateHTML(gaps);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlContent);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("An error occurred while generating the schedule.");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
