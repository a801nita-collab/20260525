let rainData = [];
let lastUpdated = "";
const padding = 30;

// Mappa 地圖變數
let mappa;
let myMap;
let canvas;

let mapOptions = {
  lat: 25.0478, // 台北市中心緯度
  lng: 121.5319, // 台北市中心經度
  zoom: 12,
  style: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
};

// 使用 corsproxy.io 代理伺服器
const apiUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://wic.gov.taipei/OpenData/API/Rain/Get?stationNo=&loginId=open_rain&dataKey=85452C1D');

function setup() {
  // 建立全螢幕畫布
  canvas = createCanvas(windowWidth, windowHeight);

  // 初始化地圖 (確保此時 Mappa 已載入)
  mappa = new Mappa('Leaflet');

  // 初始化地圖並將其覆蓋在畫布上
  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);
 
  // 初始讀取資料
  fetchRainData();
 
  // 設定每 10 分鐘自動更新一次 (600,000 毫秒)
  setInterval(fetchRainData, 600000);
 
  textFont('sans-serif');
  textAlign(LEFT, CENTER);
}

function fetchRainData() {
  // 使用 p5.js 的 loadJSON 取得資料
  loadJSON(apiUrl, (data) => {
    console.log("資料回傳成功:", data);
   
    // 彈性檢查：有些 API 回傳直接是陣列，有些會包在 Data 屬性裡
    let actualData = Array.isArray(data) ? data : (data.Data || data.data || []);
   
    if (actualData.length > 0) {
      rainData = actualData;
      lastUpdated = new Date().toLocaleTimeString();
    }
  }, (err) => {
    console.error("無法取得 API 資料，請檢查網路連線或 CORS 限制:", err);
  });
}




function draw() {
  // 清除 p5 畫布，讓底層的 Leaflet 地圖顯現
  clear();
 
  // 繪製 UI 背景
  fill(0, 0, 0, 150);
  noStroke();
  rect(10, 10, 320, 70, 10);

  // 繪製標題
  fill(255);
  textSize(22);
  textAlign(LEFT, TOP);
  text("台北市即時雨量監測", 25, 20);
  textSize(12);
  fill(200);
  text(`更新頻率: 5分 | 最後同步: ${lastUpdated || '連線中...'}`, 25, 50);

  // 繪製地圖標記
  drawMarkers();
}

function drawMarkers() {
  for (let i = 0; i < rainData.length; i++) {
    let item = rainData[i];
    let lat = parseFloat(item.Lat || item.latitude);
    let lon = parseFloat(item.Lon || item.longitude);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      let pos = myMap.latLngToPixel(lat, lon);
      
      // 只畫在畫面內的
      if (pos.x > 0 && pos.x < width && pos.y > 0 && pos.y < height) {
        let r1 = parseFloat(item.Rain1hr || item.rain1hr) || 0;
        let sName = item.StationName || item.stationName || "未知";
        
        // 畫點
        fill(r1 > 0 ? color(0, 255, 200, 200) : color(255, 255, 255, 150));
        stroke(0);
        strokeWeight(1);
        ellipse(pos.x, pos.y, 10, 10);
        
        // 當滑鼠靠近圓點時（距離小於 10 像素），顯示詳細資訊
        if (dist(mouseX, mouseY, pos.x, pos.y) < 10) {
          let label = `${sName} (${r1.toFixed(1)} mm)`;
          noStroke();
          fill(0, 200); // 增加背景深色，更清晰
          rect(pos.x + 12, pos.y - 15, textWidth(label) + 10, 25, 5);
          fill(255);
          textSize(14);
          text(label, pos.x + 17, pos.y - 3);
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
