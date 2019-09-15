//The map buffer is where the draw data is stored. 
//This is necessary because this program needs to be double buffered.
function BufferedMap(width, height) {
    this.width = width;
    this.height = height;
    this.primaryBuffer = [];
    this.backBuffer = [];

    for(var y = 0; y < this.height; y++) { //for every x coordinate
        this.primaryBuffer[y] = [];
        this.backBuffer[y] = [];
        for(var x = 0; x < this.width; x++) { //for every column
            if(y == height - 1) {
                this.backBuffer[y][x] = 15;
            }else {
                this.backBuffer[y][x] = 0;
            }
            this.primaryBuffer[y][x] = 0;
        }
    }
}

//returns the value from the primary buffer.
BufferedMap.prototype.getValue = function(x, y) {
    if(this.primaryBuffer[y] == null || this.primaryBuffer[y][x] == null) {
        return null;
    }
    return this.primaryBuffer[y][x];
}

//sets the value to the back buffer.
BufferedMap.prototype.setValue = function(x, y, value) {
    if(this.backBuffer[y] == null || this.backBuffer[y][x] == null) {
        return;
    }
    this.backBuffer[y][x] = value;
}

//move values from the backBuffer to the primary buffer
BufferedMap.prototype.swap = function () {
    for(var y = 0; y < this.height; y++) {
        for(var x = 0; x < this.width; x++) {
            this.primaryBuffer[y][x] = this.backBuffer[y][x]; //put the value in the backbuffer into the primary.
        }
    }
}

function Hellfire(canvas, size) {

    this.canvas = canvas;
    this.canvasContext = canvas.getContext('2d');

    this.canvas.height = this.canvas.scrollHeight;
    this.canvas.width = this.canvas.scrollWidth;

    this.canvasContext.scale(this.canvas.width / size, this.canvas.height / size);
    this.canvasContext.imageSmoothingEnabled = false;

    this.bufferedMap = new BufferedMap(size, size);
                                        
    this.pixelBuffer = this.canvasContext.createImageData(this.bufferedMap.width, this.bufferedMap.height);
}

Hellfire.prototype.colorFromNumber = function(number) {
    var colormap = [
        [16,  12,  16],
        [47,  15,   7],
        [87,  23,   7],
        [119, 31,   7],
        [159, 47,   7],
        [191, 71,   7],
        [223, 87,   7],
        [215, 95,   7],
        [207, 111,  15],
        [199, 151,  31],
        [191, 159,  31],
        [191, 167,  39],
        [183, 183,  55],
        [207, 207, 111],
        [223, 223, 159],
        [255, 255, 255]];
        if(number < 0 || number > 15){
            number = 15;
        }
        return colormap[number]
}

Hellfire.prototype.drawDot = function(x, y, color) {
    //determine the exact pixel location, and modify its buffers.
    var index = ((y * this.bufferedMap.width) + x);
    this.pixelBuffer.data[(index * 4)] = color[0]//red;
    this.pixelBuffer.data[(index * 4) + 1] = color[1] //green;
    this.pixelBuffer.data[(index * 4) + 2] = color[2]//blue
    this.pixelBuffer.data[(index * 4) + 3] = 255;//opaque
}


Hellfire.prototype.draw = function () {
    //swap map buffers. process, draw to back pixel buffer, then draw buffer to canvas.
    this.bufferedMap.swap();

    for(var y = 0; y < this.bufferedMap.height; y++) {
        for(var x = 0; x < this.bufferedMap.width; x++) {
            this.process(x, y);
            this.drawDot(x, y, this.colorFromNumber(this.bufferedMap.getValue(x, y)));
        }
    }    

    this.canvasContext.putImageData(this.pixelBuffer, 0, 0);
    this.canvasContext.drawImage(this.canvas, 0, 0);
}

Hellfire.prototype.process = function (x, y) {
    var fireProps = {   
        wind: 0, //any real value. (good 2)
        spread: 2, //any integer value (good 3)
        verticalPropagation: 2, //any positive integer. (good: 2)
        fireHeightFactor: .6//any value between 0 and 1. (Good: 7)
    };
    var rand = Math.random();
    var rand2 = Math.random()

    var spread = Math.round((rand2 * fireProps.spread) - Math.floor(fireProps.spread/2));
    var wind = -Math.round(rand2 * fireProps.wind);

    var verticalPropagation = Math.ceil(rand * fireProps.verticalPropagation);
    var belowValue = this.bufferedMap.getValue(x + spread + wind, y + verticalPropagation); //grab the value of the dot below this one.
    if(belowValue != null) { //if the value below is not zero.
        if(belowValue > 0) {
            if(rand > fireProps.fireHeightFactor) {
                belowValue -=1;
            }
            this.bufferedMap.setValue(x, y, belowValue);
        }else{
            this.bufferedMap.setValue(x, y, 0);
        }
    }
}