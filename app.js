document.addEventListener("DOMContentLoaded", () => {
    let originalData = [];
    let filteredData = [];

    // Load JSON Data
    fetch("annotations_output.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            originalData = data;
            filteredData = [...originalData];
            createTable(filteredData);
            createChart(filteredData);
            setupFilters();
            setupExport();
        })
        .catch(error => console.error("Error loading JSON file:", error));

    // Function to create the table
    function createTable(data) {
        const tbody = document.querySelector("#riskTable tbody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No matching results</td></tr>`;
            return;
        }

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

    // Function to create the chart
    function createChart(data) {
        const ctx = document.getElementById("riskChart").getContext("2d");
        const labels = data.map(item => item.Cancer);
        const risks = data.map(item => {
            const match = item.Risk.match(/(\d+\.?\d*)/);
            return match ? parseFloat(match[0]) : 0; // Extract numbers from Risk
        });

        // Check if the chart exists before destroying
        if (window.riskChart && typeof window.riskChart.destroy === "function") {
            window.riskChart.destroy();
        }

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
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "Risk Percentage (%)" }
                    }
                }
            }
        });
    }

    // Function to setup filters
    function setupFilters() {
        const cancerFilter = document.getElementById("cancerFilter");
        const ageFilter = document.getElementById("ageFilter");
        const managementFilter = document.getElementById("managementFilter");
        const filterBtn = document.getElementById("filterBtn");

        function applyFilters() {
            const cancerValue = cancerFilter.value.trim().toLowerCase();
            const ageValue = ageFilter.value.trim().toLowerCase();
            const managementValue = managementFilter.value.trim().toLowerCase();

            filteredData = originalData.filter(item => {
                const cancerMatch = cancerValue === "" || item.Cancer.trim().toLowerCase() === cancerValue;
                const ageMatch = ageValue === "" || item.Age_Range_of_Management.trim().toLowerCase() === ageValue;
                const managementMatch = managementValue === "" || item.Medical_Actions_Management.trim().toLowerCase() === managementValue;

                return cancerMatch && ageMatch && managementMatch;
            });

            createTable(filteredData);
            createChart(filteredData);
        }

        filterBtn.addEventListener("click", applyFilters);
    }

    // Function to export filtered data to CSV
    function setupExport() {
        const exportBtn = document.getElementById("exportBtn");

        exportBtn.addEventListener("click", () => {
            const csvContent = [
                ["Cancer Type", "Risk", "Management Options"],
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
