import network
import urequests
import time
from machine import Pin
import _thread

# =========================
# WIFI CONFIG
# =========================

SSID = "anas"
PASSWORD = "vji47cf8"

# =========================
# FIREBASE CONFIG
# =========================

FIREBASE_URL = "https://projet-gaz-esp32-default-rtdb.europe-west1.firebasedatabase.app/alarm/status.json"

# =========================
# GPIO
# =========================

led = Pin(2, Pin.OUT)
buzzer = Pin(15, Pin.OUT)

# =========================
# GLOBAL STATE
# =========================

alarm_running = False
alarm_start_time = 0

# =========================
# WIFI CONNECT
# =========================

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
wifi.connect(SSID, PASSWORD)

print("Connecting to WiFi...")

while not wifi.isconnected():
    time.sleep(1)

print("Connected!")
print(wifi.ifconfig())

# =========================
# STOP ALARM
# =========================

def stop_alarm():
    global alarm_running

    alarm_running = False

    led.off()
    buzzer.off()

    print("Alarm stopped")

# =========================
# START ALARM
# =========================

def start_alarm():
    global alarm_running
    global alarm_start_time

    if not alarm_running:

        alarm_running = True
        alarm_start_time = time.time()

        led.on()
        buzzer.on()

        print("Alarm started")

# =========================
# AUTO STOP THREAD
# =========================

def auto_stop_thread():

    global alarm_running

    while True:

        if alarm_running:

            elapsed = time.time() - alarm_start_time

            if elapsed >= 60:

                stop_alarm()

                # Update Firebase back to false
                try:
                    urequests.put(
                        FIREBASE_URL,
                        json=False
                    )
                except:
                    print("Firebase update failed")

        time.sleep(1)

# Start thread
_thread.start_new_thread(auto_stop_thread, ())

# =========================
# MAIN LOOP
# =========================

while True:

    try:

        response = urequests.get(FIREBASE_URL)

        status = response.json()

        response.close()

        print("Firebase status:", status)

        if status == True:
            start_alarm()

        else:
            stop_alarm()

    except Exception as e:
        print("Error:", e)

    time.sleep(1)
