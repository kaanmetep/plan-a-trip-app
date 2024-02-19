let map;
let planCounter = 1;
let i = 0; // this is to control arrays's elements in for loops.
let totalMeters = 0;
let markers = [];
let latlangs = [];
let polylines = [];
let distances = [];
let marker;
// -----------------
const clearArrays = function () {
  markers = [];
  latlangs = [];
  polylines = [];
  distances = [];
};
const clearAll = function () {
  markers.forEach((m) => map.removeLayer(m));
  polylines.forEach((p) => map.removeLayer(p));
  clearArrays();
  planCounter = 1;
  i = 0;
  totalMeters = 0;
  totaldistance.textContent = totalMeters;
  while (planList.firstChild) {
    planList.removeChild(planList.firstChild);
  }
  checkboxTooltips.checked = false;
  checkboxPolylines.checked = false;
  checkboxPolylines.disabled = true;
  checkboxTooltips.disabled = true;
};
const clearLast = function () {
  if (markers.length > 1) {
    map.removeLayer(markers.pop());
    map.removeLayer(polylines.pop());
    latlangs.splice(-1);
    totalMeters -= distances.pop();
    planCounter--;
    markers.slice(-1)[0].openPopup();
    i--;
    if (planList.lastChild) {
      planList.removeChild(planList.lastChild);
    }
    updateTotalDistance();
  } else {
    clearAll();
  }
};
const updateTotalDistance = function () {
  totaldistance.textContent = `${
    totalMeters < 1000
      ? totalMeters + "m"
      : (totalMeters / 1000).toFixed(1) + "km"
  }`;
};
const saveClickedInfos = function (coords, marker) {
  latlangs.push(coords);
  markers.push(marker);
};
const displayMarker = function (coords) {
  return L.marker(coords)
    .addTo(map)
    .bindPopup(`${planCounter}. Plan => ${tooltip.value}`, {
      autoClose: false,
    })
    .openPopup();
};
const displayPolyline = function () {
  return L.polyline([latlangs[i], latlangs[i + 1]], {
    color: "red",
  }).addTo(map);
};
const displayPlanOnList = function () {
  const html = `<li class="plan">${planCounter}. plan -> ${tooltip.value}</li>`;
  planList.insertAdjacentHTML("beforeend", html);
  planCounter++;
  tooltip.value = "";
};
const getDistance = function (first, second) {
  let distance = Math.round(first.getLatLng().distanceTo(second.getLatLng()));
  return distance;
};
const getUserLocation = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude, longitude } = position.coords;
        loadMap(latitude, longitude);
        map.on("click", onClickMap.bind(this));
      },
      function () {
        loadMap(38.7241285, -75.0902951);
        map.on("click", onClickMap.bind(this));
      }
    );
  }
};
const loadMap = function (lat, lng) {
  map = L.map("map").setView([lat, lng], 13);
  L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }).addTo(map);
};
const onClickMap = function (e) {
  checkboxTooltips.disabled = false;
  const { lat, lng } = e.latlng;
  const coords = [lat, lng];
  marker = displayMarker(coords);
  saveClickedInfos(coords, marker);
  if (markers.length > 1) {
    let distance = getDistance(markers[i], markers[i + 1]);
    let polyline = displayPolyline();
    polyline.bindTooltip(
      `${
        distance > 1000
          ? (distance / 1000).toFixed(1) + "km"
          : Math.round(distance) + "m"
      }`,
      {
        permanent: true,
        direction: "center",
        className: "distance",
      }
    );
    totalMeters = totalMeters + distance;
    i++;
    distances.push(distance);
    polylines.push(polyline);
    checkboxPolylines.disabled = false;
    updateTotalDistance();
  }
  displayPlanOnList();
};
const handleTooltips = function () {
  if (checkboxTooltips.checked) {
    markers.forEach((m) => m.openPopup());
  } else {
    markers.forEach((m) => m.closePopup());
  }
};
const handlePolylines = function () {
  if (checkboxPolylines.checked) {
    polylines.forEach((p) => p.getTooltip().setOpacity(0));
  } else {
    polylines.forEach((p) => p.getTooltip().setOpacity(1));
  }
};
// -----------------
getUserLocation();
const btnClearAll = document.querySelector(".btn__clr-all");
const btnClearLast = document.querySelector(".btn__clr-last");
const tooltip = document.getElementById("tooltip");
const totaldistance = document.querySelector(".total-distance");
const checkboxTooltips = document.getElementById("tooltips");
const checkboxPolylines = document.getElementById("polylines");
const planList = document.querySelector(".plans");
btnClearAll.addEventListener("click", clearAll);
btnClearLast.addEventListener("click", clearLast);
checkboxTooltips.addEventListener("click", handleTooltips);
checkboxPolylines.addEventListener("click", handlePolylines);
