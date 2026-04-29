// USER PROFILE
let user = localStorage.getItem("loginUser");
if (document.getElementById("userProfile")) {
  document.getElementById("userProfile").innerText = user;
}

// LOGOUT
function logout() {
  localStorage.removeItem("loginUser");
  window.location = "index.html";
}

// MENU
function showMenu(menu) {
  document.getElementById("utama").style.display = "none";
  document.getElementById("energi").style.display = "none";
  document.getElementById(menu).style.display = "block";
}

// GAUGE FUNCTION
function createGauge(id, value, max, label) {
  return new Chart(document.getElementById(id), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, max - value],
        backgroundColor: ['#3b82f6', '#e5e7eb'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '75%',
      plugins: {
        legend: { display: false }
      }
    },
    plugins: [{
      id: 'textCenter',
      afterDraw(chart) {
        const {width} = chart;
        const {height} = chart;
        const ctx = chart.ctx;

        ctx.restore();

        let fontSize = (height / 120).toFixed(2);
        ctx.font = "bold 20px Poppins";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#111";

        const text = value + " " + label;
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;

        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    }]
  });
}

// INIT GAUGE
let volt = createGauge("voltGauge", 220, 300, "V");
let arus = createGauge("arusGauge", 1.5, 5, "A");
let power = createGauge("powerGauge", 300, 500, "W");


// CHART ENERGI
new Chart(document.getElementById("chartEnergi"), {
  type: 'line',
  data: {
    labels: ["08:00","09:00","10:00","11:00","12:00"],
    datasets: [{
      label: "Energi (kWh)",
      data: [0.2,0.25,0.3,0.28,0.35],
      borderColor: "#3b82f6",
      fill: false
    }]
  }
});