let rainData = [];
let lastUpdated = "";
const padding = 30;
const lineHeight = 30;
// 使用 corsproxy.io 代理伺服器
const apiUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://wic.gov.taipei/OpenData/API/Rain/Get?stationNo=&loginId=open_rain&dataKey=85452C1D');

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始讀取資料
  fetchRainData();
  
  // 設定每 5 分鐘自動更新一次 (300,000 毫秒)
  setInterval(fetchRainData, 300000);
  
  textFont('sans-serif');
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
  background(20, 30, 48); // 深藍色底
  
  // 標題區
  fill(0, 210, 255);
  textSize(28);
  textAlign(LEFT, TOP);
  text("台北市即時雨量監測", padding, padding);
  
  textSize(14);
  fill(160);
  text(`更新頻率: 每 5 分鐘 | 最後同步: ${lastUpdated || '同步中...'}`, padding, padding + 40);

  // 繪製表頭
  let startY = padding + 90;
  drawTableHeader(padding, startY);

  // 繪製資料內容
  if (rainData.length > 0) {
    drawDataList(padding, startY + 40);
  } else {
    fill(255, 100, 100);
    text("正在讀取 API 資料或發生錯誤...", padding, startY + 40);
  }
}

function drawTableHeader(x, y) {
  fill(200);
  textSize(16);
  text("測站名稱", x, y);
  text("1hr 雨量 (mm)", x + 200, y);
  text("24hr 雨量 (mm)", x + 350, y);
  
  stroke(50, 70, 100);
  line(x, y + 25, width - padding, y + 25);
  noStroke();
}

function drawDataList(startX, startY) {
  textSize(15);
  for (let i = 0; i < rainData.length; i++) {
    let item = rainData[i];
    let currentY = startY + (i * lineHeight);
    
    // 如果超出螢幕就停止繪製
    if (currentY > height - padding) break;

    // 根據有無降雨改變字體顏色
    // 修正：政府 API 欄位通常是大寫開頭 (PascalCase)
    let sName = item.StationName || item.stationName || "未知測站";
    let r1 = parseFloat(item.Rain1hr || item.rain1hr) || 0;
    let r24 = item.Rain24hr || item.rain24hr || "0";

    fill(r1 > 0 ? color(100, 255, 150) : color(220));
    text(sName, startX, currentY);
    text(r1.toFixed(1), startX + 200, currentY);
    text(r24, startX + 350, currentY);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
