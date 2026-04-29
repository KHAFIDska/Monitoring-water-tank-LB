#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// ================= WIFI =================
#define WIFI_SSID "BINA"
#define WIFI_PASSWORD "nipislimau"

// ================= FIREBASE =================
#define API_KEY "AIzaSyDh-fKoteETN9dZEjA8oNCHD2SVmAXaVz0"
#define DATABASE_URL "https://bina-elektic-default-rtdb.asia-southeast1.firebasedatabase.app"

// ================= PIN SENSOR =================
#define TRIG_PIN 5
#define ECHO_PIN 18

// ================= TANDON =================
float tinggi_tandon = 100.0; // cm
float radius = 50.0;         // cm

// ================= FIREBASE OBJECT =================
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ================= VARIABEL =================
long duration;
float jarak, tinggi_air, volume, liter, persen;

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // WIFI CONNECT
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");

  // FIREBASE CONFIG
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {

  // ====== BACA SENSOR ======
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH);
  jarak = duration * 0.034 / 2;

  // ====== HITUNG TINGGI AIR ======
  tinggi_air = tinggi_tandon - jarak;

  if (tinggi_air < 0) tinggi_air = 0;
  if (tinggi_air > tinggi_tandon) tinggi_air = tinggi_tandon;

  // ====== HITUNG VOLUME ======
  volume = 3.14 * radius * radius * tinggi_air;
  liter = volume / 1000;

  // ====== PERSEN ======
  persen = (tinggi_air / tinggi_tandon) * 100;

  // ====== STATUS ======
  String status;
  if (persen < 20) status = "LOW";
  else if (persen > 90) status = "FULL";
  else status = "NORMAL";

  // ====== KIRIM KE FIREBASE ======
  Firebase.RTDB.setFloat(&fbdo, "/water_tank/liter", liter);
  Firebase.RTDB.setFloat(&fbdo, "/water_tank/persen", persen);
  Firebase.RTDB.setFloat(&fbdo, "/water_tank/tinggi_air", tinggi_air);
  Firebase.RTDB.setString(&fbdo, "/water_tank/status", status);

  // ====== SERIAL MONITOR ======
  Serial.print("Jarak: "); Serial.print(jarak);
  Serial.print(" | Liter: "); Serial.print(liter);
  Serial.print(" | Persen: "); Serial.print(persen);
  Serial.print(" | Status: "); Serial.println(status);

  delay(2000);
}