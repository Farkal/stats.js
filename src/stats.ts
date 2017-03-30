/**
 * Inspired by https://github.com/mrdoob/stats.js
 */


class Stats {
    private mode: number = 0;
    public container: any;
    public dom: any;
    public domElement: any;
    private beginTime: number;
    private prevTime: number;
    private frames: number = 0;
    private fpsPanel: any;
    private msPanel: any;
    private memPanel: any;
    constructor() {
        this.container = document.createElement( 'div' );
	    this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
        this.container.addEventListener( 'click', this.handleClick, false );

        this.beginTime = ( performance || Date ).now();
        this.prevTime = this.beginTime;

        this.fpsPanel = this.addPanel(new Panel('FPS', '#0ff', '#002', 100 ));
        this.msPanel = this.addPanel(new Panel('MS', '#0f0', '#020', 200));

        if ( self.performance && self.performance.memory ) {
            this.memPanel = this.addPanel(new Panel('MB', '#f08', '#201', performance.memory.jsHeapSizeLimit / 1048576 ));
        }

        this.showPanel(0);
        this.dom = this.container;
        this.domElement = this.container;
    }

    private handleClick = (event:Event) => {
        event.preventDefault();
        this.showPanel( ++ this.mode % this.container.children.length );
    };

    addPanel(panel) {
        this.container.appendChild(panel.canvas);
        return panel;
    }

    showPanel(id) {
        for (var i = 0; i < this.container.children.length; i ++ ) {
			this.container.children[ i ].style.display = i === id ? 'block' : 'none';
		}
		this.mode = id;
    }

    begin(){
        this.beginTime = ( performance || Date ).now();
    }

    end() {
        this.frames ++;
        let time = ( performance || Date ).now();
        this.msPanel.update( time - this.beginTime);
        if ( time > this.prevTime + 1000 ) {
            this.fpsPanel.update( ( this.frames * 1000 ) / ( time - this.prevTime ));

            this.prevTime = time;
            this.frames = 0;

            if ( this.memPanel ) {
                let memory = performance.memory;
                this.memPanel.update(memory.usedJSHeapSize / 1048576);
            }

        }
        return time;
    }

    update(){
        this.beginTime = this.end();
    }

    static round(value, precision) {
        let multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }



}

class Panel {
    public canvas: any;
    public dom: any;
    private min: number;
    private max: number;
    private round: any;
    private PR: number;
    private WIDTH: number;
    private HEIGHT: number;
    private TEXT_X: number;
    private TEXT_Y: number;
    private GRAPH_X: number;
    private GRAPH_Y: number;
    private GRAPH_WIDTH: number;
    private GRAPH_HEIGHT: number;
    private context: any;
    constructor(public name: string, public fg: string, public bg: string, public maxValue: number = 0, public precision: number = 0) {
        this.min = Infinity;
        this.max = 0;
        
        this.round = Stats.round;
        this.PR = this.round( window.devicePixelRatio || 1 );

        this.WIDTH = 80 * this.PR;
        this.HEIGHT = 48 * this.PR;
        this.TEXT_X = 3 * this.PR;
        this.TEXT_Y = 2 * this.PR;
        this.GRAPH_X = 3 * this.PR;
        this.GRAPH_Y = 15 * this.PR;
        this.GRAPH_WIDTH = 74 * this.PR;
        this.GRAPH_HEIGHT = 30 * this.PR;

        this.canvas = document.createElement( 'canvas' );
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.cssText = 'width:80px;height:48px';

        this.context = this.canvas.getContext( '2d' );
        this.context.font = 'bold ' + ( 9 * this.PR ) + 'px Helvetica,Arial,sans-serif';
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
    
    update(value) {
        this.min = Math.min(this.min, value);
        this.max = Math.max(this.max, value);

        this.context.fillStyle = this.bg;
        this.context.globalAlpha = 1;
        this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y );
        this.context.fillStyle = this.fg;
        this.context.fillText(this.round( value, this.precision ) + ' ' + this.name + ' (' + this.round(this.min, this.precision) + '-' + this.round( this.max, this.precision ) + ')', this.TEXT_X, this.TEXT_Y );

        this.context.drawImage( this.canvas, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, 
            this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT );

        this.context.fillRect( this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT );

        this.context.fillStyle = this.bg;
        this.context.globalAlpha = 0.9;
        this.context.fillRect( this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, 
            this.round( ( 1 - ( value / this.maxValue ) ) * this.GRAPH_HEIGHT ) );
    }
}