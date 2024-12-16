document.addEventListener("DOMContentLoaded", () => {
    // Load JSON data
    fetch("data/aidan.json")
        .then(response => response.json())
        .then(data => {
            createTable(data);
            createChart(data);
            setupSearch(data);
        });

    // Create Table
    function createTable(data) {
        const tbody = document.querySelector("#riskTable tbody");
        tbody.innerHTML = ""; // Clear existing data
        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item['Cancer Clinical/Additional Phenotype (subcategory)']}</td>
                <td>${item.Risk}</td>
                <td>${item['Medical Actions/Management']}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Create Bar Chart
    function createChart(data) {
        const ctx = document.getElementById("riskChart").getContext("2d");
        const labels = data.map(item => item['Cancer Clinical/Additional Phenotype (subcategory)']);
        const risks = data.map(item => parseFloat(item.Risk.replace(/[^0-9.]/g, "")) || 0);

        new Chart(ctx, {
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

    // Search Feature
    function setupSearch(data) {
        const searchInput = document.getElementById("searchInput");
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            const filteredData = data.filter(item =>
                item['Cancer Clinical/Additional Phenotype (subcategory)']
                    .toLowerCase()
                    .includes(query)
            );
            createTable(filteredData);
        });
    }
});
