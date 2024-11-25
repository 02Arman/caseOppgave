Promise.all([
    fetch("https://data.ssb.no/api/v0/dataset/25138.json?lang=no"), // Dataset 1
    fetch("https://data.ssb.no/api/v0/dataset/25156.json?lang=no"), // Dataset 2
])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        // Hent og organiser data fra datasetene
        const dataset1 = data[0].dataset;
        const regions1 = dataset1.dimension["Region"].category.label; // Landsdeler
        const values2021_1 = dataset1.value.slice(0, 7);
        const values2022_1 = dataset1.value.slice(7, 14);
        const values2023_1 = dataset1.value.slice(14, 21);

        const dataset2 = data[1].dataset;
        const regions2 = dataset2.dimension["Region"].category.label; // Byer
        const values2021_2 = dataset2.value.slice(0, 4);
        const values2022_2 = dataset2.value.slice(4, 8);
        const values2023_2 = dataset2.value.slice(8, 12);

        const labels1 = Object.values(regions1); // Landsdeler
        const labels2 = Object.values(regions2); // Byer

        // Populer checkboxes for landsdeler
        const regionContainer = document.getElementById("regionContainer");
        labels1.forEach((region, index) => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = index;
            checkbox.id = `region${index}`;
            checkbox.checked = true; // Standard valgt
            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = region;
            regionContainer.appendChild(checkbox);
            regionContainer.appendChild(label);
            regionContainer.appendChild(document.createElement("br"));
        });

        // Populer checkboxes for byer
        const cityContainer = document.getElementById("cityContainer");
        labels2.forEach((city, index) => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = index;
            checkbox.id = `city${index}`;
            checkbox.checked = true; // Standard valgt
            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = city;
            cityContainer.appendChild(checkbox);
            cityContainer.appendChild(label);
            cityContainer.appendChild(document.createElement("br"));
        });

        function updateChart(chartType, year, selectedRegions, selectedCities) {
            let values1, values2;

            if (year === "2021") {
                values1 = values2021_1;
                values2 = values2021_2;
            } else if (year === "2022") {
                values1 = values2022_1;
                values2 = values2022_2;
            } else if (year === "2023") {
                values1 = values2023_1;
                values2 = values2023_2;
            }

            const filteredLabels = [];
            const filteredValues1 = [];
            const filteredValues2 = [];

            selectedRegions.forEach(index => {
                filteredLabels.push(labels1[index]);
                filteredValues1.push(values1[index]);
                filteredValues2.push(null); // Ingen data for byer nullverdi
            });

            selectedCities.forEach(index => {
                filteredLabels.push(labels2[index]);
                filteredValues1.push(null); // Ingen data for landsdeler nullverdi
                filteredValues2.push(values2[index]);
            });

            const chartData = {
                labels: filteredLabels,
                datasets: [
                    {
                        label: `Gjennomsnittlig kvadratmeterpris (${year}) - Landsdeler`,
                        data: filteredValues1,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: `Gjennomsnittlig kvadratmeterpris (${year}) - Større byer`,
                        data: filteredValues2,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            };

            const config = {
                type: chartType,
                data: chartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };

            if (window.chartInstance) {
                window.chartInstance.destroy();
            }

            window.chartInstance = new Chart(
                document.getElementById('myChart'),
                config
            );
        }

        function getSelectedOptionsFromCheckboxes(container) {
            return Array.from(container.querySelectorAll("input:checked")).map(checkbox => parseInt(checkbox.value));
        }

        // Initialiser diagrammet med alle standardverdier
        updateChart('bar', '2021', Array.from(Array(labels1.length).keys()), Array.from(Array(labels2.length).keys()));

        // Event listeners for oppdatering
        document.getElementById('chartTypeSelect').addEventListener('change', function () {
            const chartType = this.value;
            const year = document.getElementById('yearSelect').value;
            const selectedRegions = getSelectedOptionsFromCheckboxes(regionContainer);
            const selectedCities = getSelectedOptionsFromCheckboxes(cityContainer);
            updateChart(chartType, year, selectedRegions, selectedCities);
        });

        document.getElementById('yearSelect').addEventListener('change', function () {
            const year = this.value;
            const chartType = document.getElementById('chartTypeSelect').value;
            const selectedRegions = getSelectedOptionsFromCheckboxes(regionContainer);
            const selectedCities = getSelectedOptionsFromCheckboxes(cityContainer);
            updateChart(chartType, year, selectedRegions, selectedCities);
        });

        regionContainer.addEventListener('change', function () {
            const year = document.getElementById('yearSelect').value;
            const chartType = document.getElementById('chartTypeSelect').value;
            const selectedRegions = getSelectedOptionsFromCheckboxes(regionContainer);
            const selectedCities = getSelectedOptionsFromCheckboxes(cityContainer);
            updateChart(chartType, year, selectedRegions, selectedCities);
        });

        cityContainer.addEventListener('change', function () {
            const year = document.getElementById('yearSelect').value;
            const chartType = document.getElementById('chartTypeSelect').value;
            const selectedRegions = getSelectedOptionsFromCheckboxes(regionContainer);
            const selectedCities = getSelectedOptionsFromCheckboxes(cityContainer);
            updateChart(chartType, year, selectedRegions, selectedCities);
        });
    })
    .catch(error => {
        console.error("Feil ved henting av data:", error);
    });
