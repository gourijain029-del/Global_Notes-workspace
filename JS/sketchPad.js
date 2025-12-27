
const $ = (selector) => document.querySelector(selector);

export class SketchPad {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    
    // Tools
    this.colorInput = $('#sketch-color');
    this.sizeInput = $('#sketch-size');
    this.penBtn = $('#tool-pen');
    this.eraserBtn = $('#tool-eraser');
    this.clearBtn = $('#tool-clear');
    
    this.mode = 'pen'; // 'pen' or 'eraser'
    
    this.init();
  }

  init() {
    this.setupEvents();
    this.reset();
  }

  reset() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.updateBrush();
  }

  updateBrush() {
    this.ctx.lineWidth = this.sizeInput.value;
    this.ctx.strokeStyle = this.mode === 'eraser' ? '#ffffff' : this.colorInput.value;
  }

  setupEvents() {
    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());

    // Touch Events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchend', (e) => {
      const mouseEvent = new MouseEvent('mouseup', {});
      this.canvas.dispatchEvent(mouseEvent);
    });

    // Tool Controls
    this.colorInput.addEventListener('change', () => this.updateBrush());
    this.sizeInput.addEventListener('input', () => this.updateBrush());

    this.penBtn.addEventListener('click', () => {
      this.mode = 'pen';
      this.penBtn.classList.add('active');
      this.eraserBtn.classList.remove('active');
      this.updateBrush();
    });

    this.eraserBtn.addEventListener('click', () => {
      this.mode = 'eraser';
      this.eraserBtn.classList.add('active');
      this.penBtn.classList.remove('active');
      this.updateBrush();
    });

    this.clearBtn.addEventListener('click', () => {
      const confirmClear = confirm('Clear sketch?');
      if (confirmClear) this.reset();
    });
  }

  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const { x, y } = this.getCoordinates(e);
    this.lastX = x;
    this.lastY = y;
  }

  draw(e) {
    if (!this.isDrawing) return;
    const { x, y } = this.getCoordinates(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  getImageDataUrl() {
    return this.canvas.toDataURL('image/png');
  }
}
