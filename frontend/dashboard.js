document.addEventListener("DOMContentLoaded", () => {

    const apiBase = "http://192.168.137.195:8001/api";

    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${apiBase}/${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error("Fetch error:", error);
            return null;
        }
    }

    // ===== CPU GLOBAL =====
    const cpuChart = new Chart(
        document.getElementById("cpuChart").getContext("2d"),
        {
            type: "line",
            data: { labels: [], datasets: [{ label: "CPU %", data: [] }] },
            options: { scales: { y: { beginAtZero: true, max: 100 } } }
        }
    );

    // ===== RAM =====
    const ramChart = new Chart(
        document.getElementById("ramChart").getContext("2d"),
        {
            type: "line",
            data: { labels: [], datasets: [{ label: "RAM %", data: [] }] },
            options: { scales: { y: { beginAtZero: true, max: 100 } } }
        }
    );

    // ===== TEMP =====
    const tempChart = new Chart(
        document.getElementById("tempChart").getContext("2d"),
        {
            type: "line",
            data: { labels: [], datasets: [{ label: "Temp C", data: [] }] },
            options: { scales: { y: { beginAtZero: true, max: 100 } } }
        }
    );

    // ===== CPU PER CORE =====
    const coresCanvas = document.getElementById("cpuCoresChart");
    const cpuCoresChart = new Chart(
        coresCanvas.getContext("2d"),
        {
            type: "line",
            data: { labels: [], datasets: [] },
            options: { scales: { y: { beginAtZero: true, max: 100 } } }
        }
    );

    // ===== UPTIME FORMAT =====
    function formatUptime(seconds) {
        const d = Math.floor(seconds / 86400);
        seconds %= 86400;
        const h = Math.floor(seconds / 3600);
        seconds %= 3600;
        const m = Math.floor(seconds / 60);
        return `${d}d ${h}h ${m}m`;
    }

// ===== NETWORK RX / TX =====
const networkChart = new Chart(
    document.getElementById("networkChart").getContext("2d"),
    {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "RX (KB/s)",
                    data: [],
                    borderWidth: 2
                },
                {
                    label: "TX (KB/s)",
                    data: [],
                    borderWidth: 2
                }
            ]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    }
);



    // ===== MAIN LOOP =====
    setInterval(async () => {
        const time = new Date().toLocaleTimeString();

        const cpu = await fetchData("cpu");
        const ram = await fetchData("ram");
        const temp = await fetchData("temp");
        const cores = await fetchData("cpu/cores");
        const freq = await fetchData("cpu/freq");
        const uptime = await fetchData("system/uptime");
	const network = await fetchData("network");

        if (cpu) {
            cpuChart.data.labels.push(time);
            cpuChart.data.datasets[0].data.push(cpu.cpu_percent);
            cpuChart.update();
        }

        if (ram) {
            ramChart.data.labels.push(time);
            ramChart.data.datasets[0].data.push(ram.percent);
            ramChart.update();
        }

        if (temp) {
            tempChart.data.labels.push(time);
            tempChart.data.datasets[0].data.push(temp.temperature_c);
            tempChart.update();
        }

        if (cores) {
            if (cpuCoresChart.data.datasets.length === 0) {
                cores.cores.forEach((_, i) => {
                    cpuCoresChart.data.datasets.push({
                        label: `Core ${i}`,
                        data: []
                    });
                });
            }
            cpuCoresChart.data.labels.push(time);
            cores.cores.forEach((v, i) => {
                cpuCoresChart.data.datasets[i].data.push(v);
            });
            cpuCoresChart.update();
        }

        if (freq) {
            document.getElementById("freqCurrent").textContent = freq.current_mhz.toFixed(0);
            document.getElementById("freqMin").textContent = freq.min_mhz.toFixed(0);
            document.getElementById("freqMax").textContent = freq.max_mhz.toFixed(0);
        }

        if (uptime) {
            document.getElementById("uptime").textContent =
                formatUptime(uptime.uptime_seconds);
        }

	if (network) {
	    networkChart.data.labels.push(time);
	    networkChart.data.datasets[0].data.push(network.rx_kbps);
	    networkChart.data.datasets[1].data.push(network.tx_kbps);
	    networkChart.update();
	}


    }, 2000);

});
