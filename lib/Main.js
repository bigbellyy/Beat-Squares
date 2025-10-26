'use strict';
//global functions


const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
String.prototype.width = function (font) {
    var f = font || '12px arial',
        o = $('<div></div>')
            .text(this)
            .css({ 'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f })
            .appendTo($('body')),
        w = o.width();

    o.remove();

    return w;
}
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

//Smoothed z-index score thingy for peak detection
//@joe_six/smoothed-z-score-peak-signal-detection
//https://github.com/crux/smoothed-z-score
//https://stackoverflow.com/questions/22583391/peak-signal-detection-in-realtime-timeseries-data/57889588#57889588
//Not my peak detection algorithn im too SMALL BRAIN for that

/*
Brakel, J.P.G. van (2014). "Robust peak detection algorithm using z-scores". Stack Overflow.
Available at: https://stackoverflow.com/questions/22583391/peak-signal-detection-in-realtime-timeseries-data/22640362#22640362 
(version: 2020-11-08).
*/
function sum(a) {
    return a.reduce((acc, val) => acc + val)
}

function mean(a) {
    return sum(a) / a.length
}

function stddev(arr) {
    const arr_mean = mean(arr)
    const r = function (acc, val) {
        return acc + ((val - arr_mean) * (val - arr_mean))
    }
    return Math.sqrt(arr.reduce(r, 0.0) / arr.length)
}

function smoothed_z_score(y, params) {
    var p = params || {}
    // init cooefficients
    const lag = Math.floor(p.lag) || 5
    const threshold = p.threshold || 3.5
    const influence = p.influece || 0.5
    if (y === undefined || y.length < lag + 2) {
        throw ` ## y data array to short(${y.length}) for given lag of ${lag}`
    }
    //console.log(`lag, threshold, influence: ${lag}, ${threshold}, ${influence}`)

    // init variables
    var signals = Array(y.length).fill(0)
    var filteredY = y.slice(0)
    const lead_in = y.slice(0, lag)
    //console.log("1: " + lead_in.toString())

    var avgFilter = []
    avgFilter[lag - 1] = mean(lead_in)
    var stdFilter = []
    stdFilter[lag - 1] = stddev(lead_in)
    //console.log("2: " + stdFilter.toString())

    for (var i = lag; i < y.length; i++) {
        //console.log(`${y[i]}, ${avgFilter[i-1]}, ${threshold}, ${stdFilter[i-1]}`)
        if (Math.abs(y[i] - avgFilter[i - 1]) > ((threshold + Notes.sumArray[i] * 0) * stdFilter[i - 1])) {
            if (y[i] > avgFilter[i - 1]) {
                signals[i] = +1 // positive signal
            } else {
                signals[i] = -1 // negative signal
            }
            // make influence lower
            filteredY[i] = influence * y[i] + (1 - influence) * filteredY[i - 1]
        } else {
            signals[i] = 0 // no signal
            filteredY[i] = y[i]
        }

        // adjust the filters
        const y_lag = filteredY.slice(i - lag, i + Math.floor(lag * 0)) || filteredY.slice(i - lag, i)
        avgFilter[i] = mean(y_lag)
        stdFilter[i] = stddev(y_lag)
    }

    return signals
}
const times = [];
let fps;

function refreshLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    refreshLoop();
  });
}

refreshLoop();
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


let loaded = false;
let sillytext = ["Have Fun!", "F11 Please!"];
//let keyboard = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
let keyboard = ["a", "s", "d", "j", "k", "l"];
let notespace = undefined;
let canvas = undefined;
//put em here boy^

/*
let dustEffect = {
    begin: function () { //create stuff
        let canvas = document.createElement("canvas");
        this.canvas = canvas;
        canvas.width = screen.width;
        canvas.height = screen.height;
        canvas.style.zIndex = "400";
        canvas.style.position = "absolute";
        canvas.style.filter = "blur(3px)"
        document.body.appendChild(canvas);
        this.ctx = canvas.getContext("2d");
        canvas.setAttribute("id", "dustCanvas");
        this.update();
        let rate = this.rate
        let amount = this.amount
        let windSpeed = this.windSpeed
        let spawn = this
        spawnMany();
        function spawnMany() {
            setTimeout(() => {
                spawnMany();
            }, rate);
            for (let i = 0;i < amount;++i){
                let z = (Math.random() * 2) + .5;
                let options = {
                    x: 0,
                    y: screen.height * Math.random(),
                    z: z,
                    vY: .2 * getRandomNumber(windSpeed, 1 + windSpeed),
                    vX: .2 * getRandomNumber(windSpeed, 1 + windSpeed),
                    width: clamp(10 * z, 1, 10),
                    height: clamp(15 * z, 3, 15),
                    color: "rgba(200,200,255,",
                    opacity: 0
                }
                spawn.spawn(options);
            }
            
        }
    },
    spawn: function (options) { //create dust particle
        let objs = this.objects;
        objs[objs.length] = options;
    },
    fillRect: function (options) { //fill rectangle
        let x = options.x;
        let y = options.y;
        let width = options.width;
        let height = options.height;
        let color = options.color;
        let opacity = options.opacity;
        let ctx = this.ctx;

        ctx.fillStyle = String((color + opacity) + ")");
        ctx.fillRect(x, y, width, height);
    },
    update: () => {
        window.requestAnimationFrame(this.update);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let objs = this.objects;
        for (let i = 0; i < objs.length; ++i) { //make it so off screen shit gets deleted and stuf gets deleted and opacity removed over time
            let obj = objs[i];
            obj.opacity += .0001
            obj.y = obj.y + obj.vY;
            obj.x = obj.x + obj.vX; //MAKE BIGGER PARTCILES FASTER (DISTANCE SHIT MAKE IT LOOK 3d OMG like the rain u made last time)
            obj.vX += getRandomNumber(-.01 * this.windSpeed, .01 * this.windSpeed);
            obj.vY += getRandomNumber(-.01 * this.windSpeed, .01 * this.windSpeed);
            this.fillRect(obj);
        }
        this.windSpeed += clamp(getRandomNumber(-.01, .01), -10, 10)
    },
    objects: [],
    stop: false,
    windSpeed: 1,
    rate: 1000,
    amount: 10
}
*/
class Dust {
    static dustArray = [];
    static color = { r: 215, g: 215, b: 255 };
    static running = false;
    static stop = false;
    static baseRate = 200;
    static rate = Dust.baseRate; //20 //50 
    static clearRate = 15000;
    static maxV = 5;
    static direction = {
        x: 2,
        y: -2
    }
    static multiplier = 1;
    static streaks = false;
    constructor() {
        let canvas = document.createElement("canvas");
        canvas.setAttribute("id", "dustCanvas");
        //canvas.style.filter = "blur(5px)";
        canvas.style.opacity = ".5"
        document.body.appendChild(canvas);
        Dust.canvas = canvas;
        Dust.ctx = canvas.getContext("2d");
        canvas.style.position = "absolute";
        canvas.style.zIndex = "300";
        canvas.height = screen.height;
        canvas.width = screen.width;

        var myFunction = function () {
            if (Dust.stop === false && document.visibilityState === "visible") {
                Dust.createDust();
            }
            setTimeout(myFunction, Dust.rate);
        }
        setTimeout(myFunction, Dust.rate);

        let clearStreaks = setInterval(() => {
            if (Dust.streaks) {
                $(Dust.canvas).animate({
                    opacity: 0
                }, {
                    duration: 3000,
                    complete: () => {
                        if (!Dust.stop) {
                            Dust.direction.x = getRandomNumber(-5, 5) * 10;
                            Dust.direction.y = getRandomNumber(-5, 5) * 10;
                            Dust.clear();
                            Dust.ctx.clearRect(0, 0, Dust.canvas.width, Dust.canvas.height);
                            $(Dust.canvas).animate({
                                opacity: .5
                            }, {
                                duration: 3000
                            })
                        }
                    }
                })
            }
        }, Dust.clearRate);
        Dust.update();
    }
    static createDust() {
        let z = getRandomNumber(1, 10);
        let dust = {
            x: Math.trunc(screen.width * Math.random()),
            y: Math.trunc(screen.height * Math.random()),
            z: z,
            vX: (Dust.direction.x + getRandomNumber(-.1, .1) * z) * Dust.multiplier,
            vY: (Dust.direction.y + getRandomNumber(-.1, .1) * z) * Dust.multiplier,
            width: z,
            height: z,
            opacity: 0
        }
        if (Notes.running) {
            dust.y = Math.trunc((screen.height * 2) * getRandomNumber(-1, 1))
        }
        Dust.dustArray[Dust.dustArray.length] = dust;
    }
    static clear() {
        Dust.dustArray = []; //extremely ghetto work around jesus christ
    }
    static update() {
        window.requestAnimationFrame(Dust.update);
        let array = Dust.dustArray;
        let ctx = Dust.ctx;
        if (!Dust.streaks) {
            ctx.clearRect(0, 0, Dust.canvas.width, Dust.canvas.height);
        }
        function fillRect(options) {
            let x = options.x;
            let y = options.y;
            let w = options.width;
            let h = options.height;
            let opacity = options.opacity;

            //let v = Math.floor( (Math.abs(options.vX) + Math.abs(options.vY)) * 1 )

            let color = "rgba(" + (Dust.color.r + w) + "," + (Dust.color.g + w) + "," + (Dust.color.b) + "," + opacity + ")";

            ctx.shadowBlur = 15;
            ctx.shadowColor = "rgb(255,255,255)"; //"rgba(" + (255) + "," + (Dust.color.g + + Math.floor(getRandomNumber(-100,0)) ) + "," + (255) + "," + opacity + ")"
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        }
        for (let i = 0; i < array.length; ++i) {
            let obj = array[i];

            obj.x += obj.vX;
            obj.y += obj.vY;

            //obj.opacity = clamp(obj.opacity + .02,0,1);

            if (obj.y > screen.height / 1.5 && Dust.running === true) {
                obj.opacity -= .05;
            }
            else {
                if (Dust.streaks) {
                    obj.opacity += .0005;
                }
                else {
                    obj.opacity += .02;
                }
            }
            //obj.opacity += .0002;
            obj.opacity = clamp(obj.opacity, 0, 1)
            //obj.vX += getRandomNumber(-.1,.1);
            //obj.vY += getRandomNumber(-.1,.1);
            obj.vX += Dust.direction.x / (150 + obj.z * 2) + getRandomNumber(-.1, .1);
            obj.vY += Dust.direction.y / (150 + obj.z * 2) + getRandomNumber(-.1, .1);
            //console.log(obj)
            obj.vX *= Dust.multiplier;
            obj.vY *= Dust.multiplier;

            fillRect(obj);
            if (!Notes.running) {
                if (obj.x > screen.width || obj.x < 0 || obj.y < 0 || obj.y > screen.height) {
                    array.splice(i, 1);
                }
            }
            else {
                if (obj.x > screen.width * 1 || obj.x < -screen.width || obj.y < -screen.height || obj.y > screen.height * 1) {
                    array.splice(i, 1);
                }
            }
        }
        Dust.direction.x += getRandomNumber(-.1, .1);
        Dust.direction.y += getRandomNumber(-.1, .1);
        Dust.direction.x = clamp(Dust.direction.x, -Dust.maxV, Dust.maxV);
        Dust.direction.y = clamp(Dust.direction.y, -Dust.maxV, Dust.maxV);
    }
}
$(document).ready(() => {
    let dust = new Dust();

    Transitions.topToDownBlackScreen(0);
    let startText = document.createElement("div"); //create cool start text
    startText.style.fontSize = "90px";
    startText.style.fontWeight = "bolder";
    startText.style.textShadow = "0px 0px 50px #ffffff";
    document.body.appendChild(startText);
    startText.setAttribute("id", "startText");
    startText.innerHTML = "Beat Squares";
    startText.style.zIndex = "100000";
    startText.style.position = "absolute";
    startText.style.fontFamily = Globals.font;
    let width = startText.innerHTML.width(startText.style.fontSize + " " + Globals.font);
    startText.style.left = String(screen.width / 2 - width / 2 + "px");
    startText.style.top = String(screen.height / 3 + "px");
    startText.style.color = "rgb(255,255,255)";
    startText.style.whiteSpace = "nowrap";
    startText.style.opacity = 0;
    startText.setAttribute("class", "text");
    startText.style.backgroundImage = "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(200,200,255,1) 100%)"

    //shadow effect
    let i = { v: 50 };
    function shadowEffect(on) {
        if (on && !loaded) {
            $(i).animate({
                v: 30
            }, {
                duration: 1000,
                step: function () {
                    let v = i.v;
                    startText.style.textShadow = String("0px 0px " + v + "px #ffffff")
                },
                easing: "swing",
                complete: function () {
                    shadowEffect(false);
                }
            })
        }
        else if (!loaded) {
            $(i).animate({
                v: 75
            }, {
                duration: 1000,
                step: function () {
                    let v = i.v;
                    startText.style.textShadow = String("0px 0px " + v + "px #ffffff")
                },
                easing: "swing",
                complete: function () {
                    shadowEffect(true);
                }
            })
        }
    }
    shadowEffect(true);
    let quoteEffectA = startText.cloneNode();
    quoteEffectA.setAttribute("id", "quoteEffectA");
    quoteEffectA.innerHTML = "「 "
    quoteEffectA.style.fontWeight = "bolder";
    quoteEffectA.style.left = String(parseInt(quoteEffectA.style.left) - 90 + "px")
    quoteEffectA.style.top = String(screen.height / 4 + "px");
    quoteEffectA.style.backgroundImage = "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(200,200,255,1) 100%)"
    let quoteEffectB = startText.cloneNode();
    quoteEffectB.setAttribute("id", "quoteEffectB");
    quoteEffectB.style.fontWeight = "bolder";
    quoteEffectB.innerHTML = " 」 "
    quoteEffectB.style.left = String(screen.width / 2 - width / 2 + width + "px")
    quoteEffectB.style.top = String(screen.height / 2.1 + "px");
    quoteEffectB.style.backgroundImage = "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(200,200,255,1) 100%)"
    document.body.appendChild(quoteEffectA);
    document.body.appendChild(quoteEffectB);

    $(startText).animate({
        opacity: 1
    }, 1000)
    $(quoteEffectA).animate({
        opacity: 1,
        top: screen.height / 3.15
    }, 1500)
    $(quoteEffectB).animate({
        opacity: 1,
        top: screen.height / 2.9
    }, 1500)
    let dotsText = document.createElement("div");
    document.body.appendChild(dotsText);
    dotsText.setAttribute("id", "dotsText");
    dotsText.setAttribute("class", "text")
    dotsText.style.fontWeight = "bolder";
    dotsText.style.backgroundImage = "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(200,200,255,1) 100%)"
    dotsText.innerHTML = "Press any button to continue...";
    dotsText.style.fontFamily = Globals.font;
    dotsText.style.color = "rgb(255,255,255)";
    dotsText.style.zIndex = "1000";
    dotsText.style.fontSize = "20px";
    dotsText.style.position = "absolute";
    let width2 = dotsText.innerHTML.width(dotsText.style.fontSize + " " + Globals.font);
    dotsText.innerHTML = "";
    dotsText.style.left = String(screen.width / 2 - width2 / 1.75 + "px");
    dotsText.style.top = String(screen.height / 2 + 100 + "px");
    dotsText.style.whiteSpace = "nowrap";

    var n = 0;
    var dst = false;
    var dotsHold = "";
    var wait = 0;
    var dotsFinal = "Press any button to continue...";
    function dotsFunction() {
        if (dst === false) {
            wait = 40 + Math.pow(n, 2) / 4;
        }
        setTimeout(() => { //Animate the cool dots thingy
            function animate() {
                dotsHold += dotsFinal.substring(n, n + 1);
                n++;
                dotsText.innerHTML = dotsHold;
                if (n == dotsFinal.length) {
                    n = 0;
                    dotsHold = "";
                }
                if (!loaded) {
                    dotsFunction();
                }
            }
            if (!loaded && dotsText.innerHTML !== dotsFinal && dst === false) {
                animate();
            }
            else if (dotsText.innerHTML === dotsFinal || dst === true) {
                wait = 500;
                dst = true;
                if (n >= 3) {
                    n = 0;
                }
                n++;
                setTimeout(function () {
                    dotsText.innerHTML = dotsFinal.substring(0, dotsFinal.length - (3 - n));
                }, wait)

                dotsFunction();
            }
        }, wait)
    }
    dotsFunction();
    function dotsAnimate(up) {
        if (up) {
            $(dotsText).animate({
                top: screen.height / 2 + 100
            }, {
                duration: 1000,
                step: function () {
                    if (loaded) {
                        $("#dotsText").stop()
                    }
                },
                complete: function () {
                    dotsAnimate(false);
                }
            })
        }
        else {
            $(dotsText).animate({
                top: screen.height / 2 + 125
            }, {
                duration: 1000,
                step: function () {
                    if (loaded) {
                        $("#dotsText").stop()
                    }
                },
                complete: function () {
                    dotsAnimate(true);
                }
            })
        }
    }
    dotsAnimate(false);
    function input(event) {
        if (!loaded) {
            document.removeEventListener("keydown", input)
            document.removeEventListener("click", input);
            Dust.stop = true;
            $(Dust.canvas).animate({
                opacity: 0
            },
                {
                    duration: 1500
                })
            //document.documentElement.requestFullscreen();
            canvas = new Canvas()
            loaded = true;
            //let key = event.key;
            let background = document.body.querySelector("#background");
            background.style.width = "100vw";
            background.style.height = String(screen.height + "px");
            startText.innerHTML = sillytext[Math.trunc(getRandomNumber(0, sillytext.length))];
            let width = startText.innerHTML.width(startText.style.fontSize + " " + Globals.font);
            startText.style.left = String(screen.width / 2 - width / 2 + "px");
            $(dotsText).stop();
            $(startText).stop();
            $(quoteEffectA).stop();
            $(quoteEffectB).stop();
            $(dotsText).animate({
                top: screen.height - 300,
                opacity: 0
            }, {
                duration: 1000 //3000
            })
            $(quoteEffectA).animate({
                top: 0,
                opacity: 0
            }, {
                duration: 1000 //3000
            })
            $(quoteEffectB).animate({
                top: screen.height - 300,
                opacity: 0
            }, {
                duration: 1000 //3000
            })
            $(startText).animate({
                top: 250,
                opacity: 0
            }, {
                duration: 1000, //3000
                complete: function () {
                    startText.remove();
                    Transitions.removeBlackScreen(1000); //1500
                    setTimeout(() => {
                        Dust.streaks = false;
                        Notes.showDropper();
                        dotsText.remove();
                    }, 200) //1500
                }
            })
        }
    }
    document.addEventListener("keydown", input);
    document.addEventListener("click", input);
    document.addEventListener("mousemove", (event) => {
        if (!Notes.running) {
            let x = event.clientX;
            let y = event.clientY;
            let yMag = screen.height / 2 - y;
            let xMag = screen.width / 2 - x;
            Dust.direction.x = -xMag / (screen.width / 10);
            Dust.direction.y = -yMag / (screen.height / 10);
        }
    })

});

let mouse_X = 0;
let mouse_Y = 0;
document.onmousemove = function (event) {
    mouse_X = event.clientX;
    mouse_Y = event.clientY;
}