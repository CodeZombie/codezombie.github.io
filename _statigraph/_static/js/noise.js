function NoiseBox(canvas, pixelScale) {
    this.canvas = canvas;
    this.canvasContext = this.canvas.getContext("2d");
    this.canvasWidth = null;
    this.canvasHeight = null;
    this.imageData = null;
    this.rawImageData = null;
    this.buffer = null
    this.updateCanvas();

    this.pixelScale = pixelScale;

    noise.seed(Math.random());
    this.cameraX = 0;
    this.cameraY = 0;
    this.depth = 64;
    this.time = 0;
    this.dir = +1;
}

NoiseBox.prototype.updateCanvas = function() {
    this.canvas.width = this.canvas.scrollWidth;
    this.canvas.height = this.canvas.scrollHeight;
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;

    this.imageData = this.canvasContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

    var buffer = new ArrayBuffer(this.imageData.data.length);
    this.buffer8 = new Uint8ClampedArray(buffer);
    this.data = new Uint32Array(buffer);
    this.canvasContext.imageSmoothingEnabled = false;
    this.draw(); //prevents flicker.
}

NoiseBox.prototype.draw = function() {
    this.time += 0.01
    this.depth += this.dir*Math.random()*2;
    if(this.depth <= 64 || this.depth >= (255-64)) {
        this.dir = -this.dir;
    }

    for(var y = 0; y < this.canvasHeight; y += this.pixelScale) {
        for(var x = 0; x < this.canvasWidth; x += this.pixelScale) {
            
            var value = 255; //white
            if(noise.simplex2(x + this.time, y) > .1) { //if 2d simplex has us at anything but a very dark tile
                value = Math.abs(noise.simplex3( 0.01 * x, 0.01 * y, this.time)) * 255
                if(value < 60) {
                    value = 255
                }else{
                    value = 16;
                }
            }

            for(var yy = 0; yy < this.pixelScale; yy++) {
                for(var xx = 0; xx < this.pixelScale; xx++) {

                    this.data[(y + yy) * this.canvasWidth + (x + xx)] =
                        (255   << 24) |	// alpha
                        (value << 16) |	// blue
                        (value <<  8) |	// green
                        value;		// red
                }
            }
            
        }
    }

    this.imageData.data.set(this.buffer8);
    this.canvasContext.putImageData(this.imageData, -1, -1); //(-1, -1) reduces border noise :)
}