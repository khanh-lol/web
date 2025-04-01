// Lấy các phần tử HTML cần thiết
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-button');
const mapSelector = document.getElementById('map-selector');

// Thiết lập kích thước lưới và canvas
const gridSize = 20;
const canvasSize = canvas.width;

// Các biến quản lý game
let snake = [];
let direction = { x: 0, y: 0 };
let food = {};
let score = 0;
let gameInterval;
let walls = [];

// Hàm khởi tạo game
function initGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 }; // Game không di chuyển cho đến khi ấn phím
  score = 0;
  scoreDisplay.textContent = 'Score: ' + score;
  generateFood();
  generateMap(mapSelector.value);
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 100);
}

// Hàm tạo thức ăn ở vị trí ngẫu nhiên không trùng với snake hoặc tường
function generateFood() {
  food = {
    x: Math.floor(Math.random() * (canvasSize / gridSize)),
    y: Math.floor(Math.random() * (canvasSize / gridSize))
  };
  if (snake.some(segment => segment.x === food.x && segment.y === food.y) ||
      walls.some(w => w.x === food.x && w.y === food.y)) {
    generateFood();
  }
}

// Hàm tạo map theo lựa chọn
function generateMap(mapType) {
  walls = [];
  if (mapType === 'map1') {
    // Map 1: tạo tường dọc ở giữa
    for (let i = 5; i < 25; i++) {
      walls.push({ x: 15, y: i });
    }
  } else if (mapType === 'map2') {
    // Map 2: tạo tường viền ngoài canvas
    const gridCount = canvasSize / gridSize;
    for (let i = 0; i < gridCount; i++) {
      walls.push({ x: i, y: 0 });
      walls.push({ x: i, y: gridCount - 1 });
      walls.push({ x: 0, y: i });
      walls.push({ x: gridCount - 1, y: i });
    }
  } else {
    // Default: không có tường bổ sung
    walls = [];
  }
}

// Lắng nghe sự kiện bàn phím (sử dụng WASD để điều khiển)
document.addEventListener('keydown', (e) => {
  if (e.key === 'w' && direction.y !== 1) {
    direction = { x: 0, y: -1 };
  } else if (e.key === 's' && direction.y !== -1) {
    direction = { x: 0, y: 1 };
  } else if (e.key === 'a' && direction.x !== 1) {
    direction = { x: -1, y: 0 };
  } else if (e.key === 'd' && direction.x !== -1) {
    direction = { x: 1, y: 0 };
  }
});

// Sự kiện bắt đầu game và thay đổi map
startButton.addEventListener('click', initGame);
mapSelector.addEventListener('change', () => {
  generateMap(mapSelector.value);
});

// Vòng lặp game chính
function gameLoop() {
  // Nếu chưa bấm phím di chuyển thì không thực hiện
  if (direction.x === 0 && direction.y === 0) return;

  // Tính toán vị trí đầu mới của rắn
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Kiểm tra va chạm với biên của canvas
  if (head.x < 0 || head.x >= canvasSize / gridSize || head.y < 0 || head.y >= canvasSize / gridSize) {
    endGame();
    return;
  }

  // Kiểm tra va chạm với thân rắn
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  // Kiểm tra va chạm với tường của map
  if (walls.some(w => w.x === head.x && w.y === head.y)) {
    endGame();
    return;
  }

  // Di chuyển rắn: thêm đầu mới vào đầu mảng
  snake.unshift(head);

  // Kiểm tra nếu rắn ăn được thức ăn
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = 'Score: ' + score;
    generateFood();
  } else {
    // Loại bỏ đuôi rắn nếu không ăn được thức ăn
    snake.pop();
  }

  draw();
}

// Hàm vẽ lại toàn bộ game
function draw() {
  // Xoá canvas
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Vẽ thức ăn
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Vẽ rắn
  ctx.fillStyle = 'lime';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });

  // Vẽ tường map
  ctx.fillStyle = 'brown';
  walls.forEach(w => {
    ctx.fillRect(w.x * gridSize, w.y * gridSize, gridSize, gridSize);
  });
}

// Hàm kết thúc game
function endGame() {
  clearInterval(gameInterval);
  alert('Game Over! Your score: ' + score);
}
