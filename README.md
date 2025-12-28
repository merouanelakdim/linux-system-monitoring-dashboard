# Linux System Monitoring Dashboard

## 📌 Overview

This project is a **Linux system monitoring dashboard** designed for **Raspberry Pi / Linux-based embedded systems**.

The goal is to **collect low-level system metrics from the Linux kernel**, process them in a backend service, and visualize them in **real time** via a lightweight frontend dashboard.

The project focuses on **understanding how Linux exposes system statistics internally**, not just displaying values.

---

## 🎯 Features

### 🖥️ CPU Monitoring

* Global CPU usage
* **Per-core CPU usage** (multi-line chart)
* CPU frequency (current / min / max)

### 🌡️ Thermal & Memory

* CPU temperature
* RAM usage

### ⏱️ System Uptime

* Time since last boot
* Derived from Linux system interfaces

### 📡 Network Throughput (RX / TX)

* Real-time **download (RX)** and **upload (TX)** rates
* Calculated from cumulative kernel counters

> ⚠️ Linux does **not** expose network bandwidth directly.
> The kernel only provides **cumulative byte counters since boot**.
>
> The backend computes the real throughput using **state + time delta**.

---

## 🧠 Technical Approach

### Linux Kernel Data Sources

The Linux kernel exposes system metrics via:

* `/proc` (virtual filesystem)
* `/sys` (hardware & power management)
* Kernel interfaces accessed through `psutil`

These metrics are:

* **Monotonic** (never reset until reboot)
* **Low-level** (raw counters, not processed values)

---

## 🏗️ Architecture

```
+-------------------+
|   Linux Kernel    |
|-------------------|
| /proc/stat        |
| /proc/net/dev     |
| /sys/devices/...  |
+---------+---------+
          |
          v
+-------------------+
|   Backend API     |
|  (Python / Flask)|
|-------------------|
| - psutil          |
| - State handling |
| - Delta compute  |
| - REST endpoints |
+---------+---------+
          |
          v
+-------------------+
|   Frontend UI     |
|  (HTML / JS)     |
|-------------------|
| - Fetch API      |
| - Chart.js       |
| - Real-time UI   |
+-------------------+
```

---

## 🔁 Network Throughput Logic (RX / TX)

Linux exposes **cumulative counters**:

```text
rx_bytes_total
 tx_bytes_total
```

To compute real bandwidth:

```text
rate = (bytes_now - bytes_previous) / time_delta
```

This requires:

* persistent backend state
* precise time measurement
* correct unit conversion (bytes → KB/s)

This approach is similar to professional tools like **Netdata**, **Grafana agents**, or **collectd**.

---

## 🛠️ Technologies Used

* **Backend**: Python, Flask, psutil
* **Frontend**: HTML, JavaScript, Chart.js
* **OS**: Linux (Raspberry Pi OS)
* **Service Management**: systemd

---

## 🚀 How to Run

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
python3 -m http.server 8000
```

Open:

```
http://<RASPBERRY_PI_IP>:8000
```

---

## 📈 Project Goals

* Deep understanding of Linux system internals
* Real-time monitoring logic
* Embedded & IoT-oriented architecture
* Clean separation between kernel, backend, and UI

---

## 📬 Author

**Merouane Lakdim**
Embedded Software / Linux Enthusiast

---

> This project is continuously evolving with new metrics and features.
