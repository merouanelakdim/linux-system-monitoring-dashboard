from flask import Flask, jsonify
from flask_cors import CORS
import psutil
import os
import time

app = Flask(__name__)
prev_net = psutil.net_io_counters()
prev_time = time.time()
CORS(app)

def get_cpu_temperature():
    """Reads Raspberry Pi CPU temperature."""
    try:
        with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
            temp = int(f.read()) / 1000.0
            return temp
    except:
        return None

@app.get("/api/cpu")
def cpu_usage():
    """CPU usage in percentage."""
    cpu = psutil.cpu_percent(interval=1)
    return jsonify({"cpu_percent": cpu})

@app.get("/api/ram")
def ram_usage():
    """RAM usage information."""
    mem = psutil.virtual_memory()
    return jsonify({
        "total": mem.total,
        "used": mem.used,
        "percent": mem.percent
    })

@app.get("/api/temp")
def temperature():
    """CPU temperature in Celsius."""
    temp = get_cpu_temperature()
    return jsonify({"temperature_c": temp})

@app.get("/")
def root():
    return "Raspberry Pi Monitoring API is running!"

@app.get("/api/cpu/cores")
def cpu_per_core(): 
	"""CPU usage per core"""
	cores = psutil.cpu_percent(interval=1, percpu=True)
	return jsonify({
		"cores": cores,
		"core_count": len(cores)
	})

@app.get("/api/cpu/freq")
def cpu_frequency():
	"""CPU frequency information"""
	freq = psutil.cpu_freq()
	return jsonify({
		"current_mhz":freq.current,
		"min_mhz": freq.min,
		"max_mhz": freq.max})
@app.get ("/api/system/uptime")
def system_uptime():
	"""System uptime in seconds"""
	uptime_seconds = time.time() - psutil.boot_time()
	return jsonify({
		"uptime_seconds" : int(uptime_seconds)})

@app.route("/api/network")
def network_usage():
    global prev_net, prev_time

    current_net = psutil.net_io_counters()
    current_time = time.time()

    delta_time = current_time - prev_time
    if delta_time <= 0:
        delta_time = 1

    rx_bytes = current_net.bytes_recv - prev_net.bytes_recv
    tx_bytes = current_net.bytes_sent - prev_net.bytes_sent

    rx_kbps = (rx_bytes / delta_time) / 1024
    tx_kbps = (tx_bytes / delta_time) / 1024

    prev_net = current_net
    prev_time = current_time

    return jsonify({
        "rx_kbps": round(rx_kbps, 2),
        "tx_kbps": round(tx_kbps, 2)
    })



if __name__ == "__main__":
    # IMPORTANT: port 8001 (no sudo required)
    app.run(host="0.0.0.0", port=8001)

