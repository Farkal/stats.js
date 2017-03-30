/**
 * Inspired by https://github.com/mrdoob/stats.js
 */
var Stats = (function () {
    function Stats() {
        var _this = this;
        this.mode = 0;
        this.frames = 0;
        this.handleClick = function (event) {
            event.preventDefault();
            _this.showPanel(++_this.mode % _this.container.children.length);
        };
        this.container = document.createElement('div');
        this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
        this.container.addEventListener('click', this.handleClick, false);
        this.beginTime = (performance || Date).now();
        this.prevTime = this.beginTime;
        this.fpsPanel = this.addPanel(new Panel('FPS', '#0ff', '#002', 100));
        this.msPanel = this.addPanel(new Panel('MS', '#0f0', '#020', 200));
        if (self.performance && self.performance.memory) {
            this.memPanel = this.addPanel(new Panel('MB', '#f08', '#201', performance.memory.jsHeapSizeLimit / 1048576));
        }
        this.showPanel(0);
        this.dom = this.container;
        this.domElement = this.container;
    }
    Stats.prototype.addPanel = function (panel) {
        this.container.appendChild(panel.canvas);
        return panel;
    };
    Stats.prototype.showPanel = function (id) {
        for (var i = 0; i < this.container.children.length; i++) {
            this.container.children[i].style.display = i === id ? 'block' : 'none';
        }
        this.mode = id;
    };
    Stats.prototype.begin = function () {
        this.beginTime = (performance || Date).now();
    };
    Stats.prototype.end = function () {
        this.frames++;
        var time = (performance || Date).now();
        this.msPanel.update(time - this.beginTime);
        if (time > this.prevTime + 1000) {
            this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime));
            this.prevTime = time;
            this.frames = 0;
            if (this.memPanel) {
                var memory = performance.memory;
                this.memPanel.update(memory.usedJSHeapSize / 1048576);
            }
        }
        return time;
    };
    Stats.prototype.update = function () {
        this.beginTime = this.end();
    };
    Stats.round = function (value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    };
    return Stats;
}());
var Panel = (function () {
    function Panel(name, fg, bg, maxValue, precision) {
        if (maxValue === void 0) { maxValue = 0; }
        if (precision === void 0) { precision = 0; }
        this.name = name;
        this.fg = fg;
        this.bg = bg;
        this.maxValue = maxValue;
        this.precision = precision;
        this.min = Infinity;
        this.max = 0;
        this.round = Stats.round;
        this.PR = this.round(window.devicePixelRatio || 1);
        this.WIDTH = 80 * this.PR;
        this.HEIGHT = 48 * this.PR;
        this.TEXT_X = 3 * this.PR;
        this.TEXT_Y = 2 * this.PR;
        this.GRAPH_X = 3 * this.PR;
        this.GRAPH_Y = 15 * this.PR;
        this.GRAPH_WIDTH = 74 * this.PR;
        this.GRAPH_HEIGHT = 30 * this.PR;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.cssText = 'width:80px;height:48px';
        this.context = this.canvas.getContext('2d');
        this.context.font = 'bold ' + (9 * this.PR) + 'px Helvetica,Arial,sans-serif';
        this.context.textBaseline = 'top';
        this.context.fillStyle = bg;
        this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        this.context.fillStyle = fg;
        this.context.fillText(name, this.TEXT_X, this.TEXT_Y);
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
        this.context.fillStyle = bg;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
        this.dom = this.canvas;
    }
    Panel.prototype.update = function (value) {
        this.min = Math.min(this.min, value);
        this.max = Math.max(this.max, value);
        this.context.fillStyle = this.bg;
        this.context.globalAlpha = 1;
        this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
        this.context.fillStyle = this.fg;
        this.context.fillText(this.round(value, this.precision) + ' ' + this.name + ' (' + this.round(this.min, this.precision) + '-' + this.round(this.max, this.precision) + ')', this.TEXT_X, this.TEXT_Y);
        this.context.drawImage(this.canvas, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT);
        this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT);
        this.context.fillStyle = this.bg;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.round((1 - (value / this.maxValue)) * this.GRAPH_HEIGHT));
    };
    return Panel;
}());
