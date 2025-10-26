'use strict';
class Canvas {
    static objects = []; //Doesn't just hold pixels, holds full objects/shapes/polygons/ect.
    static keyGradients = [];
    constructor() {
        Canvas.canvas = document.createElement("canvas");
        Canvas.canvas.setAttribute("id", "canvas");
        Canvas.canvas.width = screen.width;
        Canvas.canvas.height = screen.height * 2;
        Canvas.canvas.style.top = String(-screen.height / 1.75 + "px");
        Canvas.canvas.style.position = "absolute";
        Canvas.canvas.style.zIndex = "0";
        Canvas.canvas.style.opacity = "1";
        Canvas.ctx = Canvas.canvas.getContext("2d");

        Canvas.canvas.style.transform = "perspective(" + screen.height + "px) rotateX(70deg)";

        document.body.appendChild(Canvas.canvas);
        Canvas.update();
    }
    static update() {
        window.requestAnimationFrame(Canvas.update);
        Canvas.ctx.clearRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
        let objects = Canvas.objects;
        let ctx = Canvas.ctx;
        function drawImage(image, dx, dy) {
            ctx.drawImage(image, dx, dy);
        }
        function drawGradient(options) {
            let x = options.x;
            let y = options.y;
            let x1 = options.x1;
            let y1 = options.y1;
            let xPos = options.xPos;
            let yPos = options.yPos;
            let width = options.width;
            let height = options.height;
            let fill1 = options.fillRect1;
            let fill2 = options.fillRect2;
            let color1 = options.color1;
            let color2 = options.color2;

            let opacity = options.opacity;

            let grd = ctx.createLinearGradient(x, y, x1, y1);
            grd.addColorStop(0, "rgba(200,200,255,0)"); //String(color1 + opacity + ")")
            grd.addColorStop(.7, "rgba(200,200,255,1)");
            grd.addColorStop(.9, "rgba(200,200,255,1)");
            grd.addColorStop(1, "rgba(200,200,255,0)");

            ctx.fillStyle = grd;
            ctx.fillRect(xPos, yPos, width, height);
        }
        function drawRecangle(options) {
            //ctx.filter = String("drop-shadow(0px 0px 50px " + (options.colorShadow + options.opacity) + ")");
            ctx.fillStyle = String(options.color + options.opacity + ")");
            ctx.fillRect(options.x, options.y, options.width, options.height);

            if (options.font && options.text) {
                ctx.fillStyle = String(options.colorText + options.opacity + ")");
                ctx.font = String(options.width + "px " + Globals.font);
                ctx.fillText(String(options.text), options.x + options.width / 4, options.y + options.height / 1.25)
            }
        }
        function drawText(options) {
            ctx.fillStyle = String(options.color + options.opacity + ")");
            ctx.font = String(options.width / 2 + "px " + Globals.font);
            ctx.fillText(String(options.text), options.x + options.width, options.y + options.height)
        }

        for (let i = 0; i < keyboard.length + 1; ++i) { //bar lines
            let x = 0;
            let y = 0;
            let x1 = 0;
            let y1 = Canvas.canvas.height / 1.3;
            let xPos = Canvas.canvas.width / 2 + (Notes.noteSizeX * i) - ((keyboard.length) * Notes.noteSizeX / 2);
            let yPos = 0;
            let color1 = "rgba(200,200,255,";
            let color2 = "rgba(200,200,255,";
            let width = 2;
            let height = Canvas.canvas.height / 1.3;
            let obj = {
                x: x,
                y: y,
                x1: x1,
                y1: y1,
                xPos: xPos,
                yPos: yPos,
                width: width,
                height: height,
                color1: color1,
                color2: color2,
                opacity: 1
            }
            drawGradient(obj);
            if (i < keyboard.length) {
                drawText({
                    x: xPos - 5,
                    y: Canvas.canvas.height / 1.4,
                    text: keyboard[i].toUpperCase(),
                    width: Notes.noteSizeX / 2,
                    height: Notes.noteSizeX / .5,
                    color: "rgba(200,200,255,",
                    opacity: 1
                });

                //create key gradients
                if (Canvas.keyGradients[i] === undefined) {
                    Canvas.keyGradients[i] = {
                        v : 0,
                        color : "rgba(200,200,255,",
                        opacity : 1
                    };
                }
                //key red thingies that go up and stuff when u do input
                let yOffset = Canvas.canvas.height / 1.3 - (Notes.noteSizeX * Canvas.keyGradients[i].v);

                let x = 0;
                let y = (yOffset);
                let x1 = 0;
                let y1 = Notes.noteSizeX * Canvas.keyGradients[i].v + (yOffset);
                let xP = Canvas.canvas.width / 2 + (Notes.noteSizeX * i) - ((keyboard.length) * Notes.noteSizeX / 2);
                let yP = Canvas.canvas.height / 1.3 - (Notes.noteSizeX * Canvas.keyGradients[i].v);
                let width = Notes.noteSizeX;
                let height = Notes.noteSizeX * Canvas.keyGradients[i].v;
                let color1 = Canvas.keyGradients[i].color;
                let color2 = Canvas.keyGradients[i].color;
                let opacity = Canvas.keyGradients[i].v/3;
                let grd = ctx.createLinearGradient(x, y, x1, y1);
                grd.addColorStop(0, Canvas.keyGradients[i].color + "0)");
                grd.addColorStop(.5, Canvas.keyGradients[i].color + (opacity) + ")" );
                grd.addColorStop(1, Canvas.keyGradients[i].color + "1)");
                ctx.shadowBlur = 25 + Notes.loudness/10;
                //ctx.shadowColor = Canvas.keyGradients[i].color + "1)";
                ctx.shadowColor = "rgba(200,200,255,1)";
                ctx.fillStyle = grd;
                ctx.fillRect(xP, yP, width, height);
                Canvas.keyGradients[i].v = clamp(Canvas.keyGradients[i].v - Canvas.keyGradients[i].v/25,0,5);
            }
        }

        /*
        let timePixels = Notes.combo * 10
        let width = (comboPixels)
        let timeBar = {
            x : Canvas.canvas.width / 2 - (Notes.noteSizeX * 1.5) - ((keyboard.length) * Notes.noteSizeX / 2),
            y : Canvas.canvas.height/1.5 - height/2,
            width : Notes.noteSizeX,
            height : height,
            color : "rgb(180,180,255,",
            opacity : 1
        }
        */
        //drawRecangle(timeBar);

        for (let i = 0; i < objects.length; ++i) {
            let object = objects[i];
            let type = object.type;
            if (type === "gradient-rectangle") {
                drawGradient(object);
            }
            else if (type === "rectangle") {
                drawRecangle(object);
            }
        }
    }
}//            ctx.clearRect(0,0,Canvas.canvas.width,Canvas.canvas.height);
