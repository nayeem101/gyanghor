/* globals Chart:false, feather:false */

(async function () {
  "use strict";
  var options = {
    method: "POST",
    cache: "no-cache",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      api_key: "m786074488-8d0417fc83d445e6439d45e1",
      format: "json",
      logs: "1",
      response_times: "1",
    }),
  };

  async function getInfo() {
    const response = await fetch("https://api.uptimerobot.com/v2/getMonitors", options);
    return response.json();
  }
  let result = await getInfo();
  console.log(result.monitors[0]);
  let { response_times, logs } = result.monitors[0];
  console.log(response_times, logs);
  let labels = response_times.map((r) => {
    let date = new Date(r.datetime);
    return `${date.getHours()} : ${date.getMinutes()}`
  });
  let showData = response_times.map((r) => r.value);
  console.log(labels, showData);
  // Graphs
  var ctx = document.getElementById("myChart");
  // eslint-disable-next-line no-unused-vars
  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Day",
          data: showData,
          lineTension: 0,
          backgroundColor: "blue",
          borderColor: "#007bff",
          borderWidth: 4,
          pointBackgroundColor: "#007bff",
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
            },
          },
        ],
      },
      legend: {
        display: true,
        labels: {
          fontColor: "red",
        },
      },
    },
  });
})();
