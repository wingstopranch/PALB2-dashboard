document.addEventListener("DOMContentLoaded", () => {
    let originalData = []; // Store the original dataset
    let filteredData = []; // Store the currently filtered dataset

    // Load JSON data
    fetch("annotations_output.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            originalData = data;
            filteredData = [...originalData]; // Initialize filtered data
            createTable(filteredData);
            createChart(filteredData);
            setupFilters();
            setupExport();
        })
        .catch(error => console.error("Error loading JSON file:", error));

    // Function to create the data table
    function createTable(data) {
        const tbody = document.querySelector("#riskTable tbody");
        tbody.innerHTML = ""; // Clear existing data
        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.Cancer}</td>
                <td>${item.Risk}</td>
                <td>${item.Medical_Actions_Management}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Function to create the bar chart
    function createChart(data) {
        const ctx = document.getElementById("riskChart").getContext("2d");

        const labels = data.map(item => item.Cancer);
        const risks = data.map(item => {
            // Extract numerical percentage from Risk field (e.g., "53% risk by age 80")
            const match = item.Risk.match(/(\d+\.?\d*)/);
            return match ? parseFloat(match[0]) : 0;
        });

        // Destroy the previous chart instance if it exists
        if (window.riskChart) {
            window.riskChart.destroy();
        }

        // Create the new chart
        window.riskChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Cancer Risk (%)",
                    data: risks,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "Risk Percentage (%)" }
                    }
                }
            }
        });
    }

    // Setup filters for Age Range and Management Options
    function setupFilters() {
        const ageFilter = document.getElementById("ageFilter");
        const managementFilter = document.getElementById("managementFilter");

        function applyFilters() {
            filteredData = originalData.filter(item => {
                const ageMatch = ageFilter.value === "" || item.Age_Range_of_Management === ageFilter.value;
                const managementMatch = managementFilter.value === "" || item.Medical_Actions_Management === managementFilter.value;
                return ageMatch && managementMatch;
            });
            createTable(filteredData);
            createChart(filteredData);
        }

        ageFilter.addEventListener("change", applyFilters);
        managementFilter.addEventListener("change", applyFilters);
    }

    // Function to export filtered data to CSV
    function setupExport() {
        const exportBtn = document.getElementById("exportBtn");

        exportBtn.addEventListener("click", () => {
            const csvContent = [
                ["Cancer Type", "Risk", "Management Options"], // Header row
                ...filteredData.map(item => [
                    item.Cancer,
                    item.Risk,
                    item.Medical_Actions_Management
                ])
            ]
                .map(row => row.map(value => `"${value}"`).join(","))
                .join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "filtered_data.csv";
            a.click();
            URL.revokeObjectURL(url);
        });
    }
});
