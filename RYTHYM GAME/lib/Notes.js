'use strict';
class Notes {
    static source = undefined;
    static rawNotes = [];
    static difficulty = undefined;
    static audio = undefined;
    static alreadyRan = false;
    static stopEffect = false;
    static noteSizeX = 75;
    static noteSizeY = 25;
    static running = false;

    static volume = 1;
    static loudness = 0;

    static score = 0;
    static combo = 0;

    static showDropper() {
        let dropper = document.createElement("div");
        Notes.dropper = dropper;
        dropper.style.width = "100vw";
        dropper.style.height = "100vh";
        dropper.style.opacity = 0;
        dropper.style.position = "absolute";
        dropper.style.zIndex = "999";
        dropper.innerHTML = "Drop MP3 file here.";
        document.body.appendChild(dropper);
        dropper.style.fontFamily = Globals.font;
        dropper.style.fontSize = "30px";
        dropper.style.color = "rgb(255,255,255)"
        dropper.style.backgroundColor = "rgb(255,255,255,.4)"
        dropper.style.textAlign = "center";
        dropper.style.padding = String(screen.height / 3 + "px") + " " + String(0) + " " + String(screen.height / 3 + "px");
        dropper.style.background = "radial-gradient(circle, rgba(200,200,255,0) 0%, rgba(200,200,255,1) 100%)";
        dropper.setAttribute("id", "dropper");
        //let width = dropper.innerHTML.width(Globals.font);
        dropper.style.left = String(0 + "px");
        dropper.style.top = String(0 + "px");
        $(dropper).animate({
            opacity: .5
        }, {
            duration: 500
        });
        dropper.ondragenter = function (event) {
            $(dropper).animate({
                opacity: 1
            }, 500)
            return false;
        }
        dropper.ondragleave = function (event) {
            $(dropper).animate({
                opacity: .5
            }, 500)
            return false;
        }
        dropper.ondragover = function (event) {
            event.preventDefault()
        }
        dropper.ondrop = function (event) {
            let success = false;
            event.preventDefault();
            Notes.data = event.dataTransfer;
            Notes.file = event.dataTransfer.files[0];
            Notes.item = event.dataTransfer.items[0];
            $(dropper).animate({
                opacity: 0
            }, {
                duration: 2000,
                complete: function () {
                    if (success) {
                        Notes.hideDropper();
                        Notes.begin();
                    }
                    else {
                        $(dropper).animate({
                            opacity: .5
                        }, {
                            duration: 1000
                        })
                    }
                }
            })
            if (Notes.file.type == "audio/mpeg" || Notes.file.type == "audio/ogg") {
                success = true;
                dropper.innerHTML = Notes.file.name;
                Notes.musicName = Notes.file.name;
                if (Notes.audio != undefined) {
                    Notes.audio.remove();
                }
                Notes.audio = undefined;
                let reader = new FileReader();

                reader.onload = function (event2) {
                    let audio = document.createElement("audio");
                    Notes.audio = audio;
                    audio.src = event2.target.result;
                    audio.setAttribute("id", "music");
                }
                reader.readAsDataURL(Notes.file);
            }
            else {
                success = false;
                alert("Invalid File Type. Please use MP3 or OGG files!");
                dropper.style.opacity = .5;
                dropper.innerHTML = "oop wrong file type. TRY AGAIN!";
            }
        }
    }
    static hideDropper() {
        Notes.dropper.ondragenter = null;
        Notes.dropper.ondragleave = null;
        Notes.dropper.ondragover = null;
        Notes.dropper.ondrop = null;
        Notes.dropper.remove();
    }
    static begin() {
        Notes.difficulty = undefined;
        Notes.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        Notes.analyser = Notes.audioCtx.createAnalyser();
        let audio = Notes.audio;
        //Use to remove delay to visualizer
        let listenAudio = Notes.audio.cloneNode();
        listenAudio.setAttribute("id", "cloneAudio");
        listenAudio.play();
        listenAudio.loop = true;
        listenAudio.currentTime = Globals.audioDelay; //.2
        //
        audio.play();
        audio.loop = true;
        audio.playbackRate = 1;
        audio.volume = 1;
        audio.currentTime = 0;
        let musicName = Notes.musicName;
        document.body.appendChild(audio);
        //prep analyser array thingy
        Notes.source = Notes.audioCtx.createMediaElementSource(listenAudio); //use just plain audio if bugs out
        //Notes.source.connect(Notes.analyser);
        Notes.listen = Notes.audioCtx.createGain();

        Notes.source.connect(Notes.listen);
        Notes.listen.connect(Notes.analyser);
        //Notes.analyser.connect(Notes.audioCtx.destination); RECONNECT IF U DONT LIKE THE DELAY HACKY THING

        Notes.frequencyData = new Uint8Array(Notes.analyser.frequencyBinCount);
        Notes.analyser.smoothingTimeConstant = .8; //Changes FFT ONLY STUFF ITS IMPORTANTE i think? .95/.90 looks cute
        //
        let titleLabel = document.createElement("h1");
        titleLabel.style.fontFamily = Globals.font;
        titleLabel.innerHTML = String(musicName.substring(0, musicName.length - 4));
        titleLabel.style.position = "absolute";
        titleLabel.style.top = String(screen.height / 10 + "px");
        titleLabel.style.zIndex = "99";
        titleLabel.style.opacity = "0";
        titleLabel.style.fontWeight = "2";
        titleLabel.style.color = "rgb(255,255,255)";
        titleLabel.style.fontSize = "50px";
        titleLabel.style.fontWeight = "bold";
        titleLabel.style.left = "-500px";
        titleLabel.setAttribute("class", "text");
        document.body.appendChild(titleLabel);

        let durationLabel = document.createElement("h1");
        durationLabel.style.fontFamily = Globals.font;
        if (String(audio.duration % 60).length == 1) {
            durationLabel.innerHTML = String(Math.trunc(audio.duration / 60) + ":0" + String(audio.duration % 60))
        }
        else {
            durationLabel.innerHTML = String(Math.trunc(audio.duration / 60) + ":" + String(audio.duration % 60).substring(0, 2))
        }
        durationLabel.setAttribute("class", "text");
        durationLabel.style.position = "absolute";
        durationLabel.style.top = String(screen.height / 5.5 + "px");
        durationLabel.style.zIndex = "99";
        durationLabel.style.opacity = "0";
        durationLabel.style.fontWeight = "2";
        durationLabel.style.color = "rgb(255,255,255)";
        durationLabel.style.left = "-500px";
        durationLabel.style.fontSize = "25px"
        document.body.appendChild(durationLabel);
        //Animate them into existence or visibility xd

        //keyboard
        let s = "";
        for (let i = 0; i < keyboard.length; ++i) {
            let char = keyboard[i].toUpperCase();
            s += char;
        }
        let kb = document.createElement("input");
        kb.type = "text";
        kb.style.border = "none";
        kb.position = "absolute";
        kb.setAttribute("class", "text");
        kb.style.zIndex = "5000";
        kb.style.fontWeight = "bolder";
        kb.style.fontSize = "30px";
        kb.style.width = "150px";
        kb.style.top = String(screen.height / 2.2 + "px");
        kb.value = s;
        kb.style.left = "-500px";
        kb.setAttribute("id", "kb");
        document.body.appendChild(kb);

        //diffilculty stuff
        let choose = document.createElement("h1");
        choose.innerHTML = "Choose Difficulty to Begin";
        document.body.appendChild(choose);
        choose.setAttribute("class", "text");
        choose.style.left = "-500px"
        choose.style.opacity = "0";
        choose.style.top = String(screen.height / 3 + "px");


        let easyButton = document.createElement("div");
        document.body.appendChild(easyButton);
        easyButton.setAttribute("class", "buttons");
        easyButton.setAttribute("id", "easyButton");
        easyButton.style.top = String((screen.height / 2.6 - 9) + "px");
        easyButton.style.left = "-500px";
        easyButton.innerHTML = "♩";
        easyButton.style.opacity = "-2";
        easyButton.style.fontSize = "50px";
        easyButton.style.textShadow = "0px 0px 10px #c2c6ffFF";
        //easyButton.style.background = "radial-gradient(circle, rgba(164,227,255.5) 0%, rgba(164,227,255,0) 66%, rgba(164,227,255,0) 70%)";

        let mediumButton = document.createElement("div");
        document.body.appendChild(mediumButton);
        mediumButton.setAttribute("class", "buttons");
        mediumButton.setAttribute("id", "mediumButton");
        mediumButton.style.top = String(screen.height / 2.6 + "px");
        mediumButton.style.left = "-500px";
        mediumButton.innerHTML = "♪";
        mediumButton.style.opacity = "-2";
        mediumButton.style.fontSize = "50px";
        mediumButton.style.textShadow = "0px 0px 10px #c2c6ffFF";
        //mediumButton.style.background = "radial-gradient(circle, rgba(255,249,164,.5) 0%, rgba(255,249,164,0) 66%, rgba(255,249,164,0) 70%)";

        let hardButton = document.createElement("div");
        document.body.appendChild(hardButton);
        hardButton.setAttribute("class", "buttons");
        hardButton.setAttribute("id", "hardButton");
        hardButton.style.top = String(screen.height / 2.6 + "px");
        hardButton.style.left = "-500px";
        hardButton.innerHTML = "♫";
        hardButton.style.opacity = "-2";
        hardButton.style.fontSize = "50px";
        hardButton.style.textShadow = "0px 0px 10px #c2c6ffFF";
        //hardButton.style.background = "radial-gradient(circle, rgba(255,255,255,.25) 0%, rgba(255,164,164,.8) 66%, rgba(255,164,164,0) 70%)";

        //Create settings
        let lagLabel = document.createElement("div");
        document.body.appendChild(lagLabel);
        lagLabel.setAttribute("id", "lagLabel");
        lagLabel.setAttribute("class", "text");
        lagLabel.style.position = "absolute";
        lagLabel.style.top = String(screen.height / 1.9 + "px");
        lagLabel.style.left = "10px";
        lagLabel.style.fontWeight = "bolder";
        lagLabel.style.fontSize = "22px";
        lagLabel.style.opacity = "0";
        lagLabel.innerHTML = "Lag";

        let lagBar = new barInput({
            x: 10,
            y: screen.height / 1.55,
            width: 250,
            height: 3,
            m: .5
        }, {
            min: 0,
            max: 100,
            increments: 10
        })

        let thresholdLabel = lagLabel.cloneNode();
        document.body.appendChild(thresholdLabel);
        thresholdLabel.innerHTML = "Threshold";
        thresholdLabel.style.top = String(screen.height / 1.9 + "px");
        thresholdLabel.style.left = "300px";
        thresholdLabel.style.opacity = "0";
        let thresholdBar = new barInput({
            x: 300,
            y: screen.height / 1.55,
            width: 250,
            height: 3,
            m: 10
        }, {
            min: 0,
            max: 5,
            increments: 1
        })


        let noiseGateLabel = lagLabel.cloneNode();
        document.body.appendChild(noiseGateLabel);
        noiseGateLabel.innerHTML = "Noise Gate";
        noiseGateLabel.style.top = String(screen.height / 1.475 + "px");
        noiseGateLabel.style.opacity = "0";
        let noiseGateBar = new barInput({
            x: 10,
            y: screen.height / 1.25,
            width: 250,
            height: 3,
            m: 5
        }, {
            min: 0,
            max: 10,
            increments: 1
        })

        let lowerPitchCutoffLabel = lagLabel.cloneNode();
        document.body.appendChild(lowerPitchCutoffLabel);
        lowerPitchCutoffLabel.innerHTML = "Lower Pitch Cutoff";
        lowerPitchCutoffLabel.style.top = String(screen.height / 1.475 + "px");
        lowerPitchCutoffLabel.style.left = "300px";
        lowerPitchCutoffLabel.style.opacity = "0";
        let lowerPitchCutoffBar = new barInput({
            x: 300,
            y: screen.height / 1.25,
            width: 250,
            height: 3,
            m: 5
        }, {
            min: 0,
            max: 10,
            increments: 1
        })
        let o = { opacity: 0 };
        $(o).animate({
            opacity: 1
        }, {
            duration: 1000,
            step: () => {
                lagLabel.style.opacity = String(o.opacity);
                thresholdLabel.style.opacity = String(o.opacity);
                lowerPitchCutoffLabel.style.opacity = String(o.opacity);
                noiseGateLabel.style.opacity = String(o.opacity);
            }
        })
        //default values
        thresholdBar.setValue(2);
        lagBar.setValue(35);
        noiseGateBar.setValue(4);
        lowerPitchCutoffBar.setValue(2);
        //
        Dust.stop = false;
        $(Dust.canvas).animate({
            opacity: .8
        }, {
            duration: 1250
        });
        setTimeout(() => {
            $(titleLabel).animate({
                opacity: 1,
                left: 10
            }, {
                duration: 1000
            })
        }, 1);

        setTimeout(() => {
            $(durationLabel).animate({
                opacity: 1,
                left: 10
            }, {
                duration: 800
            })
        }, 250);

        setTimeout(() => {
            $(choose).animate({
                opacity: 1,
                left: 10
            }, {
                duration: 1200
            })
        }, 500);

        //Buttons
        setTimeout(() => {
            //Put em here!
            $(easyButton).animate({
                opacity: 1,
                left: 55
            }, {
                duration: 2000
            });
            $(mediumButton).animate({
                opacity: 1,
                left: 155
            }, {
                duration: 2000
            });
            $(hardButton).animate({
                opacity: 1,
                left: 255
            }, {
                duration: 2000
            });
            $(kb).animate({
                opacity: .5,
                left: 140
            }, {
                duration: 2500
            })

        }, 750);

        //background effect
        let lightThing = document.createElement("div");
        lightThing.setAttribute("id", "lightThing");
        lightThing.style.width = String(screen.width + "px");
        lightThing.style.height = String(screen.height + "px");
        lightThing.style.position = "absolute";
        lightThing.style.opacity = "0";
        lightThing.style.backgroundColor = "rgb(200,200,255)";
        lightThing.style.background = "radial-gradient(circle, rgba(200,200,255,0) 0%, rgba(200,200,255,1) 65%, rgba(200,200,255,1) 70%, rgba(200,200,255,1) 100%)"; //radial-gradient(circle, rgba(63,94,251,0) 0%, rgba(190,235,255,1) 65%, rgba(200,246,255,1) 70%, rgba(107,152,172,1) 100%)
        lightThing.style.zIndex = "2";
        document.body.appendChild(lightThing);
        Notes.lightThing = lightThing;

        function bgMusicEffect() {
            if (Notes.stopEffect == false) {
                if (audio.paused || listenAudio.paused) {
                    audio.play()
                    listenAudio.play();
                }
                window.requestAnimationFrame(bgMusicEffect);
            }
            Notes.analyser.getByteFrequencyData(Notes.frequencyData);
            let data = Notes.frequencyData;
            let n = 0;
            //Check for wrong delay
            if (Math.abs(listenAudio.currentTime - audio.currentTime) > Globals.audioDelay + .1) {
                listenAudio.currentTime = audio.currentTime + Globals.audioDelay;
            }
            //
            for (var i = 0; i < data.length; i++) {
                let v = data[i];
                n += v * (1 + Math.pow(i / data.length / 2, 2));
            }
            n /= data.length;
            //Notes.analyser.smoothingTimeConstant = .95 - clamp(n / 3, 0, .5)
            let detail = Globals.ring_effect_detail;
            //lightThing.style.opacity = String(Math.trunc(n * detail)/(detail * 100));
            lightThing.style.opacity = String(n / 100);
            lightThing.style.width = String(screen.width + Math.pow(n / 5, 2) + "px");
            lightThing.style.left = String(-Math.pow(n / 5, 2) / 2 + "px");
            Notes.loudness = n;
            //extra effect
            if (document.getElementById("timeBar")) {
                let timeBar = document.getElementById("timeBar");
                let width = (audio.currentTime / audio.duration) * window.innerWidth;
                timeBar.style.width = String(width + "px")
                timeBar.style.left = String(0 + "px")
            }
            if (document.getElementById("3dshade") && Notes.gameBegan === true) {
                document.getElementById("3dshade").style.opacity = String(1 - (n / 125));
            }
            if (document.getElementById("easyButton")) {
                document.getElementById("easyButton").style.color = String("rgb(" + (180 + n / .2) + "," + (180 + n / .2) + "," + (180 + n / .15) + ")");
                document.getElementById("mediumButton").style.color = String("rgb(" + (180 + n / .2) + "," + (180 + n / .2) + "," + (180 + n / .15) + ")"); //"rgb(" + (255 - n/1) + "," + (255 - n/.2) + "," + "255)"
                document.getElementById("hardButton").style.color = String("rgb(" + (180 + n / .2) + "," + (180 + n / .2) + "," + (180 + n / .15) + ")");
            }
            if (document.getElementById("startButton") && document.getElementById("startLabel")) {
                document.getElementById("startButton").style.transform = String("rotate(" + (Notes.startButtonRotation + n) + "deg)")
                document.getElementById("startLabel").style.transform = String("rotate(" + (n / 5) + "deg)")
                //Notes.startButtonRotation += n/10;
            }
            Dust.rate = Math.floor(clamp((Dust.baseRate + 5) - n / .1, 1, 200))
            Dust.multiplier = 1 + n / 10000;
            //Notes.audio.volume = Notes.volume;
        }
        function chooseEffect(p) {
            let n = p;
            if (p == 1) { p = 0 } else { p = 1 }
            $(choose).animate({
                opacity: p
            }, {
                duration: 1000,
                complete: function () {
                    if (Notes.difficulty == undefined) {
                        chooseEffect(p);
                    }
                }
            })
        }
        chooseEffect(0);
        if (!Notes.alreadyRan) {
            Notes.alreadyRan = true;
            bgMusicEffect();
        }
        //button animations
        //big ass start button lmao

        let startButton = document.createElement("div");
        let size = screen.width / 7;
        document.body.appendChild(startButton);
        startButton.setAttribute("id", "startButton");
        startButton.style.zIndex = "5001";
        startButton.style.position = "absolute";
        startButton.style.width = String(size + "px");
        startButton.style.height = String(size + "px");
        startButton.style.left = "42vw";
        startButton.style.backgroundColor = "rgb(230,230,255)";
        startButton.style.background = "linear-gradient(0deg, rgba(150,180,255,1) 0%, rgba(255,255,255,1) 100%)";
        startButton.style.boxShadow = "0px 0px 100px rgb(194 198 255)"
        startButton.style.transform = "rotate(45deg)";
        startButton.style.opacity = "0";
        startButton.style.top = "-100px";
        startButton.style.fontSize = "bolder";
        startButton.style.fontFamily = Globals.font;
        startButton.style.fontSize = "65px";
        startButton.style.color = "rgb(255,255,255)"
        startButton.style.textShadow = "0px 0px 50px #ffffff"
        startButton.style.textAlign = "center";
        startButton.style.verticalAlign = "middle";
        startButton.style.lineHeight = String(size + "px");

        let startLabel = startButton.cloneNode();
        document.body.appendChild(startLabel);
        startLabel.setAttribute("id", "startLabel");
        startLabel.style.background = "none";
        startLabel.style.boxShadow = "none";
        startLabel.style.backgroundColor = "none";
        startLabel.style.fontWeight = "bolder";
        startLabel.style.transform = "rotate(0deg)";
        startLabel.innerHTML = "START";
        startLabel.setAttribute("class", "noselect");
        startLabel.style.zIndex = "5001";
        {
            let over = false;
            let e = 0;
            rotateAdd();
            function rotateAdd() {
                Notes.startButtonRotation += clamp(e, 0, 10);
                if (over) {
                    e += .075;
                }
                else {
                    e += -.05;
                }
                e = clamp(e, 0, 10)
                setTimeout(() => {
                    if (startButton) {
                        rotateAdd();
                    }
                }, 1);
            }
            startLabel.onmouseenter = function () {
                Notes.spinning = true
                over = true;
            }
            startLabel.onmouseleave = function () {
                Notes.spinning = false;
                over = false;
            }
            startLabel.onmousedown = function () {
                createNotes();
            }
        }
        //
        Notes.startButtonRotation = -45;
        setTimeout(() => {
            $(startButton).animate({
                top: (screen.height / 2) - size / 2,
                opacity: .8
            }, {
                duration: 1500
            })
            $(startLabel).animate({
                top: (screen.height / 2) - size / 2,
                opacity: 1
            }, {
                duration: 1500
            })
        }, 750);
        //easy button
        easyButton.onmouseenter = function () {
            //$(easyButton).stop();
            thresholdBar.setValue(2);
            lagBar.setValue(60);
            noiseGateBar.setValue(5);
            lowerPitchCutoffBar.setValue(2);

            let n = { theta: 0 }
            $(n).animate({
                theta: 30
            }, {
                duration: 100,
                step: () => {
                    easyButton.style.transform = String("rotate(" + n.theta + "deg)");
                }
            })
        }
        easyButton.onmouseleave = function () {
            //$(easyButton).stop();
            let n = { theta: 30 }
            $(n).animate({
                theta: 0
            }, {
                duration: 100,
                step: () => {
                    easyButton.style.transform = String("rotate(" + n.theta + "deg)");
                }
            })
        }
        //

        //medium button
        mediumButton.onmouseenter = function () {
            thresholdBar.setValue(2);
            lagBar.setValue(50);
            noiseGateBar.setValue(5);
            lowerPitchCutoffBar.setValue(2);

            //$(mediumButton).stop();
            let n = { theta: 0 }
            $(n).animate({
                theta: 30
            }, {
                duration: 100,
                step: () => {
                    mediumButton.style.transform = String("rotate(" + n.theta + "deg)");
                }
            })
        }
        mediumButton.onmouseleave = function () {
            //$(mediumButton).stop();
            let n = { theta: 30 }
            $(n).animate({
                theta: 0
            }, {
                duration: 100,
                step: () => {
                    mediumButton.style.transform = String("rotate(" + n.theta + "deg)");
                }
            })
        }
        //

        //hard button
        hardButton.onmouseenter = function () {
            thresholdBar.setValue(2);
            lagBar.setValue(30);
            noiseGateBar.setValue(3);
            lowerPitchCutoffBar.setValue(0);

            //$(hardButton).stop();
            let n = { theta: 0 }
            $(n).animate({
                theta: 30
            }, {
                duration: 100,
                step: () => {
                    hardButton.style.transform = String("rotate(" + n.theta + "deg)");
                }
            })
        }
        hardButton.onmouseleave = function () {
            //$(hardButton).stop();
            let n = { theta: 30 }
            $(n).animate({
                theta: 0
            }, {
                duration: 100,
                step: () => {
                    hardButton.style.transform = String("rotate(" + n.theta + "deg)");
                }
            })
        }
        //

        // Create the audio data
        function createNotes() {
            $(startButton).animate({
                top: 0,
                opacity: 0
            }, {
                duration: 1000
            })
            $(startLabel).animate({
                top: 0,
                opacity: 0
            }, {
                duration: 1000
            })
            keyboard = [];
            for (let i = 0; i < kb.value.length; ++i) {
                let v = kb.value.substring(i, i + 1);
                if (v.toUpperCase() != v.toLowerCase() || v.length < 4) {
                    keyboard[i] = v.toLowerCase();
                }
                else {
                    keyboard = ["a", "s", "d", "j", "k", "l"];
                    break;
                }
            }
            //loading text
            Dust.stop = true;
            $(Dust.canvas).animate({
                opacity: 0
            }, {
                duration: 500
            })


            easyButton.style.zIndex = "99";
            mediumButton.style.zIndex = "99";
            hardButton.style.zIndex = "99";
            setTimeout(() => {
                easyButton.remove();
                mediumButton.remove();
                hardButton.remove();
            }, 1500);

            let loadingText = document.createElement("div");
            loadingText.setAttribute("class", "text");
            loadingText.setAttribute("id", "loadingText");
            loadingText.style.width = String(screen.width + "px");
            loadingText.style.height = String(screen.height + "px");
            loadingText.style.fontSize = "50px";
            loadingText.style.textAlign = "center";
            loadingText.innerHTML = "Creating notes, this won't take long.";
            loadingText.style.fontWeight = "bolder";
            loadingText.style.padding = String(window.screen.availHeight / 2.5 + "px") + " " + String(0) + " " + String(window.screen.availHeight / 2.5 + "px");
            loadingText.style.opacity = 0;
            loadingText.style.zIndex = "1000001";
            document.body.appendChild(loadingText);
            //
            Transitions.totalBlackScreen(1000);
            $(audio).animate({
                volume: 0
            }, {
                duration: 1000,
                complete: function () {
                    audio.pause();
                }
            })
            setTimeout(() => {
                $(loadingText).animate({
                    opacity: 1
                }, {
                    duration: 1000
                });
            }, 1000);

            //get music data
            const dataArray = [];
            const diffArray = [];

            setTimeout(() => {
                fetch(audio.src, {
                    mode: "no-cors"
                })
                    .then((response) => response.arrayBuffer())
                    .then((arrayBuffer) => {
                        // It's of course also possible to re-use an existing
                        // AudioContext to decode the mp3 instead of creating
                        // a new one here.
                        let offlineAudioContext = new OfflineAudioContext({
                            length: 1,
                            sampleRate: Notes.audioCtx.sampleRate
                        });

                        return offlineAudioContext.decodeAudioData(arrayBuffer);
                    })
                    .then((audioBuffer) => {
                        const signal = new Float32Array(512 * 1); //signalsizemultiplier 4
                        //console.log(audioBuffer.sampleRate * Math.floor(audio.duration))

                        for (let i = 0; i < audioBuffer.sampleRate * audio.duration; i += signal.length) {

                            audioBuffer.copyFromChannel(signal, 0, i);
                            let s = Meyda.windowing(signal, "blackman");
                            dataArray[dataArray.length] = Meyda.extract('amplitudeSpectrum', s)
                        }
                        finished();
                    });

            }, 2000);
            const notesArray = [];
            let direction = 1;
            function finished() {
                let peaks = undefined;
                Notes.stopEffect = true;
                audio.currentTime = 0;
                //audio.play();
                Notes.sumArray = [];
                for (let i = 0; i < dataArray.length; i++) {
                    let dataA = dataArray[i];
                    let dataB = dataArray[i + 1] || dataA; // WAS 5
                    let data1 = [];
                    let data2 = [];
                    //normalize data arrays
                    let thrs = noiseGateBar.getValue(); //threshold 2.5 possibly (noise barrier)
                    let n = 0;

                    let t = dataArray[i - 1] || dataA;
                    let y = dataA;
                    for (let e = 0; e < dataA.length; ++e) {
                        n += dataA[e];
                        data1[e] = dataA[e];
                        data2[e] = dataB[e];

                        if (dataA[e] > thrs && e > lowerPitchCutoffBar.getValue() && dataA[e] >= t[e]) {
                            data1[e] = 1;
                        }
                        else {
                            data1[e] = 0;
                        }
                        if (dataB[e] > thrs && e > lowerPitchCutoffBar.getValue() && dataB[e] >= y[e]) {
                            data2[e] = 1;
                        }
                        else {
                            data2[e] = 0;
                        }
                    }
                    Notes.sumArray[Notes.sumArray.length] = n / dataA.length;
                    //get difference in fft
                    let diff = arrayDifference(data1, data2);
                    let difference = 0;
                    for (let g = 0; g < diff.length; ++g) {
                        difference += diff[g];
                    }
                    diffArray[diffArray.length] = difference;
                }
                let lag = lagBar.getValue();
                let threshold = thresholdBar.getValue();
                lagBar.remove();
                thresholdBar.remove();
                noiseGateBar.remove();
                lagLabel.remove();
                lowerPitchCutoffLabel.remove();
                thresholdLabel.remove();
                noiseGateLabel.remove();
                lowerPitchCutoffBar.remove();
                startButton.remove();
                startLabel.remove();
                kb.remove();

                peaks = smoothed_z_score(diffArray, {
                    lag: lag,//20 15 10
                    threshold: threshold,    //3
                    influence: 0
                });
                let newPeaks = smoothed_z_score(peaks, {
                    lag: 10,
                    threshold: 2
                })
                //peaks = newPeaks;

                Notes.peaks = peaks;
                Notes.dataArray = dataArray;
                Notes.diffArray = diffArray;

                //Create physical notes
                const thrs = 3;

                for (let i = 0; i < peaks.length; ++i) { //time = i * (1000 * audio.duration/dataArray.length)
                    let peak = peaks[i];
                    if (peak === 1) {

                        let dataRawA = dataArray[i];
                        let dataRawB = dataArray[i + 1] || dataRawA; //possible change the pos of dataB to get increased frequency difference


                        //normalize bins
                        for (let x = 0; x < dataRawA.length; ++x) {
                            let d = dataRawA[x];
                            if (d > thrs) {
                                dataRawA[x] = 1;
                            }
                            else {
                                dataRawA[x] = 0;
                            }
                        }
                        for (let x = 0; x < dataRawB.length; ++x) {
                            let d = dataRawB[x];
                            if (d > thrs) {
                                dataRawB[x] = 1;
                            }
                            else {
                                dataRawB[x] = 0;
                            }
                        }

                        let dataA = dataBin(dataRawA, keyboard.length); //  binned/histogramy data
                        let dataB = dataBin(dataRawB, keyboard.length);

                        let difference = binDifference(dataA, dataB);
                        let maximums = findMaximums(difference, 2); //correspond 1 to difficulty 5
                        let time = Math.floor(i * (1000 * audio.duration / dataArray.length) + .5);
                        let differenceVal = addValues(difference);
                        let actualTime = maximums[0];
                        if (notesArray.length > 0) {
                            let prev = notesArray[notesArray.length - 1];
                            if (Math.abs(prev.time - time) < 200) { //200
                                let seen = false;
                                for (let i = 0; i < prev.note.length; ++i) {
                                    let note = prev.note[i];
                                    if (note == maximums[0]) {
                                        seen = true;
                                        break;
                                    }
                                }
                                if (!seen) {
                                    prev.actualTime.push(time);
                                    prev.note.push(maximums[0]);
                                }

                                maximums = []
                                differenceVal = 0
                            }
                        }

                        let obj = {
                            note: maximums,
                            time: time,
                            peak: i,
                            actualTime: []
                        }
                        if (differenceVal !== 0) {
                            notesArray[notesArray.length] = obj;
                        }
                    }
                }
                console.log(notesArray)
                //ADD FUNCTION THAT CHECKS FOR DUPLICATE NOTES !!!!!
                for (let i = 0; i < notesArray.length; ++i) {
                    let time1 = notesArray[i].time;
                    for (let e = 0; e < notesArray.length; ++e) {
                        if (i !== e) {
                            let time2 = notesArray[e].time;
                            let n1 = notesArray[e].note[0]
                            let n2 = notesArray[i] || n1
                            n2 = n2.note[0];
                            if (Math.abs(time1 - time2) < 50 && n1 === n2) {
                                notesArray.splice(e, 1);
                                //break
                            }
                            if (n1 === 0) {
                                notesArray.splice(e, 1)
                            }
                        }
                    }
                }
                function sumTime(notes){
                    let n = 0;
                    for (let i = 0;i < notes.actualTime.length;++i){
                        let actualTime = notes.actualTime[i];
                        n += actualTime;
                    }
                    if (notes.actualTime.length > 0){
                        n /= notes.actualTime.length;
                        notes.time = n;
                    }
                }
                for (let i = 0; i < notesArray.length; ++i) {
                    let notes = notesArray[i];
                    sumTime(notes);
                    if (notesArray.length > 4) { //spacebar notes

                    }
                }

                /*
                for (let i = 0; i < notesArray.length; i++) {
                    let note1 = notesArray[i].note;
                    let note2 = notesArray[i + 1];
                    if (note2 !== undefined) {
                        note2 = note2.note;
                        let distance = Math.abs(notesArray[i].time - notesArray[i + 1].time);
                        if (note1 === note2 && distance < 500) {
                            notesArray.splice(i, 1);
                        }
                    }
                }
                */
                Notes.notes = notesArray;
                setTimeout(() => {
                    begin();
                }, 3000)
            } //end of finished
            /*
                let peaks = undefined;
                let notes = [];
                peaks = smoothed_z_score(array, {
                    lag: 3,
                    threshold: threshold,    //4 threshold for med 5 for easy 3 HARD
                    influence: 0
                });
                for (let i = 0; i < keyboard.length; ++i) { //change keyboard.length to peaks if it breaks
                    let v = peaks[i];
                    if (v === 1) {
                        notes[notes.length] = i;
                    }
                }

                other

                for (let i = array.length - 1;i >= 0;--i){
                    if (i > threshold){
                        notes[notes.length] = i;
                    }
                }
            */
            function findMaximums(array, threshold) { //amount recursion isnt made yet
                let notes = [];

                if (notesArray.length > 0) {
                    let prev = notesArray[notesArray.length - 1].note
                    prev = prev[prev.length - 1];
                    if (prev + direction > keyboard.length || prev + direction <= 0) {
                        direction *= -1;
                        notes[notes.length] = prev + direction;
                    }
                    else {
                        notes[notes.length] = prev + direction;
                    }
                }
                else {
                    let max = 0;
                    let maxI = 0;
                    for (let i = 1; i < array.length; ++i) {
                        if (array[i] > max) {
                            maxI = i;
                            max = array[i];
                        }
                    }
                    notes[notes.length] = maxI;
                }

                return notes;
            }
            function addValues(array) {
                let val = 0;
                for (let i = 0; i < array.length; ++i) {
                    val += array[i];
                }
                return val;
            }
            function dataBin(array, splices) { //returns binned array
                let newArray = [];
                let divide = Math.floor((array.length / 4) / splices);
                for (let i = 0; i < Math.floor(array.length / 4); ++i) {
                    if (newArray.length <= splices) {
                        let data = array[i];
                        if (i % divide == 0) {
                            let segment = [];
                            newArray[newArray.length] = segment;
                        }
                        let segment = newArray[newArray.length - 1];
                        segment[segment.length] = data;
                    }
                }
                return newArray;
            }
            function binDifference(bin1, bin2) { //bins must be the same length
                let newArray = [];
                for (let i = 0; i < bin1.length; ++i) { //create single value both arrays
                    let val1 = 0;
                    let val2 = 0;
                    let total = 0;
                    for (let e = 0; e < bin1[0].length; ++e) {
                        val1 += bin1[i][e];
                        val2 += bin2[i][e];
                    }
                    total = Math.abs(val1 - val2);
                    if (isNaN(total)) {
                        total = 0;
                    }
                    newArray[i] = total;
                }
                return newArray;
            }
            function arrayDifference(data1, data2) { //arrays must be the same length
                let newArray = [];
                for (let i = 0; i < data1.length; ++i) { //create single value both arrays
                    let val1 = 0;
                    let val2 = 0;
                    let total = 0;
                    val1 += data1[i];
                    val2 += data2[i];
                    total = Math.abs(val1 - val2);
                    if (isNaN(total)) {
                        total = 0;
                    }
                    newArray[i] = total;
                }
                return newArray;
            }
            //

            //Begin GAME
            function keyInput(event) {
                let key = event.key

                function getIndex() {
                    let index = -1;
                    for (let i = 0; i < keyboard.length; ++i) {
                        if (key === keyboard[i]) {
                            index = i;
                            return index;
                        }
                    }
                    return index;
                }

                let index = getIndex();
                let hit = false;
                if (index !== -1) {
                    let squares = Canvas.objects;
                    for (let i = 0; i < squares.length; ++i) {
                        let square = squares[i];
                        let note = keyboard[square.note - 1];
                        let y = square.y;
                        if (note !== undefined && note === keyboard[index]) {
                            if (y > (screen.height / .75 + (Notes.noteSizeX * .5))) {
                                squares[i].green = true;
                                squares.splice(i, 1);
                                Notes.score += 1;
                                Notes.combo += 1;
                                hit = true;
                                i--;
                            }
                        }
                    }
                    Canvas.keyGradients[index].color = "rgba(230,230,255,";
                    if (!hit) {
                        Notes.combo = 0;
                        Notes.score += -1;
                        Canvas.keyGradients[index].color = "rgba(255,225,200,";
                    }
                    Canvas.keyGradients[index].v = 2;
                }
            }
            function begin() {
                //set up dust effect
                Dust.stop = false;
                Dust.streaks = false;
                Dust.canvas.style.transform = "perspective(" + screen.height + "px) rotateX(70deg)";
                Dust.direction.x = 0;
                Dust.direction.y = 5;
                Dust.running = true;
                Notes.running = true;
                setTimeout(() => {
                    $(Dust.canvas).animate({
                        opacity: .7
                    }, {
                        duration: 1000
                    })
                }, 7000);
                let testDelay = 3000; //3000

                //timeBar
                let timeBar = document.createElement("div");
                timeBar.id = "timeBar";
                document.body.appendChild(timeBar)
                timeBar.style.position = "absolute";
                timeBar.style.width = String(0 + "px");
                timeBar.style.height = String(5 + "px")
                timeBar.style.top = String(0 + "px");
                timeBar.style.left = String(parseInt(timeBar.style.width) / 2 + "px")
                timeBar.style.backgroundColor = "rgb(225,225,255)"
                timeBar.style.zIndex = "500";

                let notes = Notes.notes;
                audio.pause();
                listenAudio.pause();
                //easyButton.remove();
                //mediumButton.remove();
                //hardButton.remove();
                choose.remove();


                document.getElementById("lightThing").style.opacity = "0";

                //loadingText.innerHTML = "have fun"
                $(titleLabel).animate({
                    opacity: .5
                }, {
                    duration: 8000
                })
                $(durationLabel).animate({
                    opacity: 0
                }, {
                    duration: 8000
                })
                $(loadingText).animate({
                    opacity: 0,
                    top: -250
                }, {
                    duration: 1500
                });
                let percent = { n: 0 };
                setTimeout(() => { //3d effect shade thingy gyh
                    let div = document.createElement("div");
                    div.setAttribute("id", "3dshade");
                    div.style.position = "absolute";
                    div.style.height = String((screen.height + 0) + "px");
                    div.style.width = String(screen.width + "px");
                    //clip
                    //div.style.clipPath = "polygon(0 60%, 100% 60%, 100% 0%, 0 0%)"; 
                    //
                    div.style.top = "0px";
                    div.style.left = String(0 + "px")
                    div.style.background = "radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)";
                    div.style.opacity = "0";
                    div.style.zIndex = "200";
                    document.body.appendChild(div);
                    function pulse(out) {
                        if (out) {
                            $(div).animate({
                                left: 0
                            }, {
                                duration: 5000,
                                easing: "linear",
                                complete: function () {
                                    pulse(false);
                                }
                            })
                        }
                        else {
                            $(div).animate({
                                left: -screen.width / 1.5
                            }, {
                                duration: 5000,
                                easing: "linear",
                                complete: function () {
                                    pulse(true);
                                }
                            })
                        }
                    }
                    $(div).animate({
                        opacity: 1
                    }, {
                        duration: 6000 - testDelay,
                        complete: function () {
                            //pulse(true)
                        }
                    })
                    $(percent).animate({
                        n: 15
                    }, {
                        duration: 6000 - testDelay,
                        step: function () {
                            document.getElementById("background").style.background = String("linear-gradient(0deg, rgba(28,26,51,1) 0%, rgba(112,111,146,1)" + (30 - percent.n) + "%, rgba(170,170,212,1)" + (40 - percent.n) + "%, rgba(120,120,170,1) " + (60 - percent.n) + "%, " + "rgba(" + (28 - percent.n) + "," + (26 - percent.n) + "," + (51 - percent.n) + ",1) " + (100 - (percent.n * 1.75)) + "%)")
                            // document.getElementById("background").style.background = String("linear-gradient(0deg, rgba(28,26,51,1) 0%, rgba(112,111,146,1)" + (10 + percent.n) + "%, rgba(170,170,212,1)" + (15 + percent.n) + "%, rgba(120,120,170,1) " + (20 + percent.n) + "%, " + "rgba(" + (28 - percent.n) + "," + (26 - percent.n) + "," + (51 - percent.n) + ",1) "+ "100%)")
                        },
                        complete: function () {
                            document.getElementById("background").style.background = String("linear-gradient(0deg, rgb(28, 26, 51) 0%, rgb(112, 111, 146) 15%, rgb(170, 170, 212) 25%, rgb(120, 120, 170) 45%, rgb(13, 11, 36) 73.75%)")
                        }
                    })
                }, 1000);

                Transitions.removeBlackScreen(1500);
                setTimeout(() => {
                    Notes.gameBegan = true;
                    //z indexes (revert them during cleanup)
                    document.getElementById("lightThing").style.zIndex = "201"; //Change if it makes shit weird (CHANGE IT AFTER THE GAME FINISHES THO!!)
                    listenAudio.currentTime = Globals.audioDelay;
                    audio.currentTime = 0;
                    Notes.stopEffect = false;
                    bgMusicEffect();
                    audio.volume = 1;
                    audio.loop = false;
                    listenAudio.loop = false;
                    audio.play();
                    listenAudio.play();
                    loadingText.remove();

                }, 8000 - testDelay);
                Notes.stopGame = false;
                const squares = Canvas.objects;
                setTimeout(() => {
                    Canvas.canvas.style.opacity = "0";
                    Canvas.canvas.style.zIndex = "9000";
                    document.getElementById("background").style.background = String("linear-gradient(0deg, rgb(28, 26, 51) 0%, rgb(112, 111, 146) 15%, rgb(170, 170, 212) 25%, rgb(120, 120, 170) 45%, rgb(13, 11, 36) 73.75%)")
                    document.addEventListener("keydown", keyInput); //begin key input

                    setTimeout(() => {
                        $(Canvas.canvas).animate({
                            opacity: 1
                        },
                            {
                                duration: 1000
                            })
                    }, 500);

                    //Combo text
                    let comboText = document.createElement("div");
                    comboText.id = "comboText";
                    comboText.setAttribute("class", "text");
                    comboText.style.fontSize = "50px";
                    comboText.style.position = "absolute";
                    //comboText.style.left = "49vw";
                    comboText.style.width = "100vw";
                    comboText.style.height = "10vh";
                    comboText.innerHTML = "Marvelous!"
                    comboText.style.textAlign = "center";
                    comboText.style.top = String(screen.height / 6 + "px")
                    document.body.appendChild(comboText);
                    comboText.style.zIndex = "10000";
                    comboText.style.opacity = "0";
                    comboText.style.fontWeight = "bolder";
                    comboText.style.color = "rgb(230,230,255)"
                    updateNotes();
                    for (let i = 0; i < notes.length; ++i) {
                        let note = notes[i];
                        let time = note.time;
                        setTimeout(() => {
                            createNote(note);
                        }, time);
                    }
                }, 6000 - testDelay);
                function createNote(note) {
                    let notes = note.note;
                    for (let i = 0; i < notes.length; ++i) {
                        let obj = {};
                        obj.key = notes[i];
                        obj.type = "rectangle";
                        obj.x = Canvas.canvas.width / 2 + (Notes.noteSizeX * obj.key) - ((keyboard.length) * Notes.noteSizeX / 2) - Notes.noteSizeX; //Canvas.canvas.width/2 - (Notes.noteSize * i) + ((keyboard.length) * Notes.noteSize/2)
                        obj.y = 0;
                        obj.width = Notes.noteSizeX;
                        obj.height = Notes.noteSizeY;
                        obj.opacity = 0;
                        obj.color = "rgba(250,250,255,";
                        obj.colorText = "rgba(0,0,0,";
                        obj.colorShadow = "rgba(200,200,250,";
                        obj.note = obj.key
                        //green indicates that this square should not cause penalties
                        obj.green = false;
                        squares.push(obj)
                    }
                }
                let oldCombo = Notes.combo
                let comboWords = ["Marvelous!", "Amazing!", "Awesome!", "Powerful!"]
                let index = 0;
                function updateNotes() {
                    if (!Notes.stopGame) {
                        window.requestAnimationFrame(updateNotes)
                    }
                    let comboText = document.getElementById("comboText");
                    if (Notes.combo > oldCombo && Notes.combo > 10) {
                        if (Notes.combo % 10 == 0) {
                            if (index === comboWords.length - 1) {
                                index = 0;
                            }
                            else {
                                index++;
                            }
                            comboText.innerHTML = comboWords[index];
                        }
                    }
                    else if (Notes.combo < 10) {
                        comboText.style.opacity = String(clamp(parseFloat(comboText.style.opacity) - parseFloat(comboText.style.opacity) / 25, 0, 1))
                    }
                    else if (Notes.combo > 10) {
                        comboText.style.opacity = String(clamp(parseFloat(comboText.style.opacity) + (.05 + parseFloat(comboText.style.opacity)) / 20, 0, 1))
                    }
                    oldCombo = Notes.combo;

                    let rate = .61
                    //keep dust direction down
                    let n = parseInt(lightThing.style.opacity) * 10;
                    Dust.direction.x = 0;
                    Dust.direction.y = 5;
                    //Dust.rate = 50 - (n * 40)
                    //
                    for (let i = 0; i < squares.length; ++i) {
                        let object = squares[i];
                        object.y += ((screen.height / .75) / (fps)) * rate;
                        if (object.y > screen.height / .75) {
                            object.opacity = clamp(object.opacity - .025, 0, .8);
                            if (object.opacity <= 0 || object.y > screen.height / .675) {
                                Canvas.keyGradients[object.key - 1].v = 2;
                                Canvas.keyGradients[object.key - 1].color = "rgba(255,200,240,"
                                if (!object.green) {
                                    Notes.score += -1;
                                    Notes.combo = 0;
                                }
                                squares.splice(i, 1);
                                i--;
                            }
                        }
                        else {
                            object.opacity = clamp(object.opacity + .005, 0, .8);
                        }
                    }

                }
            }
        }
    }
    static clear() {

    }
}

class barInput {
    static moving = false;
    /*
    dimensions : x,y,width,height
    range: min,max,increments
    */
    constructor(dimensions, range) {
        let min = range.min;
        let max = range.max;
        let increments = range.increments;
        this.range = range;
        this.value = min;
        this.dimensions = dimensions;
        //create CSS
        this.obj = {};
        let base = document.createElement("div");
        this.obj.base = base;
        document.body.appendChild(base);
        base.style.width = String(dimensions.width + "px");
        base.style.height = String(dimensions.height + "px");
        base.style.left = String(dimensions.x + "px");
        base.style.top = String(dimensions.y + "px");
        base.style.backgroundColor = "rgb(255,255,255)";
        base.style.zIndex = "5000";
        base.style.position = "absolute";
        base.style.background = "linear-gradient(90deg, rgba(219,215,255,1) 0%, rgba(255,255,255,1) 100%)";
        base.style.opacity = "0";
        base.style.boxShadow = "0px 0px 10px #c2c6ff6b"
        let ticks = [];
        for (let i = min; i <= max; i += increments) {
            let tick = document.createElement("div");
            document.body.appendChild(tick);
            let hc = (dimensions.height * 2 + (i * dimensions.m));
            tick.style.left = String((dimensions.x + ((i / max) * (dimensions.width - dimensions.height))) + "px");
            tick.style.top = String((dimensions.y - hc) + "px");
            tick.style.width = String(dimensions.height + "px");
            tick.style.height = String((hc) + "px");
            tick.style.backgroundColor = "rgb(255,255,255)";
            tick.style.zIndex = "5000";
            tick.style.position = "absolute";
            tick.style.background = "linear-gradient(0deg, rgba(219,215,255,1) 0%, rgba(219,215,255,1) 50%, rgba(28,26,51,0) 100%)"
            tick.style.opacity = "0";
            tick.style.boxShadow = "0px 5px 10px #c2c6ff6b"
            ticks[ticks.length] = tick;
        }
        this.obj.ticks = ticks;
        let o = { opacity: 0 };

        let cursor = document.createElement("div");
        this.cursor = cursor;
        document.body.appendChild(cursor);
        cursor.style.top = String((dimensions.y - (dimensions.height * (10) * 2.5)) + "px");
        cursor.style.left = String(dimensions.x - (dimensions.height * 5) / 2 + "px");
        cursor.style.transform = "rotate(45deg)"
        cursor.style.backgroundColor = "rgb(255,255,255)";
        cursor.style.width = String(dimensions.height * 5 + "px");
        cursor.style.height = String(dimensions.height * 5 + "px");
        cursor.style.background = "linear-gradient(0deg, rgba(150,180,255,1) 0%, rgba(255,255,255,1) 100%)";
        cursor.style.position = "absolute";
        cursor.style.zIndex = "5000";
        cursor.style.opacity = "0";
        cursor.style.boxShadow = "0px 0px 10px rgb(194 198 255)"
        let t = this;
        cursor.onclick = function () {
            if (barInput.moving === false) {
                barInput.moving = true;
            }
            else {
                barInput.moving = false;
                if (range.changed === "volume") {
                    Notes.volume = t.getValue() / 10;
                }
            }
            function move() {
                if (barInput.moving) {
                    window.requestAnimationFrame(move);
                    let x = parseInt(cursor.style.left);
                    cursor.style.left = String(clamp(x + (mouse_X - x) * .05, dimensions.x - (dimensions.height * 5) / 2, dimensions.x + dimensions.width - (dimensions.height * 5) / 2) + "px");
                }
            }
            move();
        }
        $(o).animate({
            opacity: 1
        }, {
            duration: 1000,
            step: () => {
                base.style.opacity = String(o.opacity);
                cursor.style.opacity = String(o.opacity);
                for (let i = 0; i < ticks.length; ++i) {
                    ticks[i].style.opacity = String(o.opacity);
                }
            }
        })
    }
    getValue() {
        let percent = (parseInt(this.cursor.style.left) - this.dimensions.x + this.dimensions.height * 5 / 2) / (this.dimensions.width);
        let value = (this.range.max - this.range.min) * percent
        value *= 10
        value = Math.floor(value)
        return value / 10
    }
    setValue(value) {
        let pX = (value * (this.dimensions.width)) / (this.range.max - this.range.min);
        $(this.cursor).stop();
        $(this.cursor).animate(
            {
                left: (pX + this.dimensions.x - this.dimensions.height * 5 / 2)
            },
            {
                duration: 500
            })
    }
    remove() {
        this.cursor.remove();
        this.obj.base.remove();
        for (let i = 0; i < this.obj.ticks.length; ++i) {
            this.obj.ticks[i].remove();
        }
    }
}

/*
obj.x = (key * 50 - 25);
                        obj.y = (-50);
                        obj.x1 = (key * 50 + 25);
                        obj.y1 = (0);
                        obj.xPos = (key * 50);
                        obj.yPos = (0);
                        obj.width = (50);
                        obj.height = (50);
                        /

/*
function titleAnim(n){
                    $(titleLabel).animate({
                        opacity : 0
                    },{
                        duration : 1000,
                        complete : function(){
                            if (n === 1){
                                n = 0;
                            }
                            else{
                                n = 1;
                            }
                            titleAnim(n);
                        }
                    })
                }
                titleAnim(1);

                        let data = dataArray[i]; //Find highest frequency (loudest note)
                        let max = 0;
                        let maxIndex = 0;
                        for (let e = 0;e < data.length;e++){
                            let d = (data[e] + 100) * (e/500 + 1);
                            if (d > max){
                                max = d;
                                maxIndex = e;
                            }
                        }
                        console.log(maxIndex)
                        let keyMap = data.length/keyboard.length;
                        let key = Math.floor(maxIndex/keyMap + .5);
                        notes[notes.length] = {
                            time : i * (1000 * audio.duration/dataArray.length),
                            key : key
                        }
                        console.log('yes')
                        */


/*


            Notes.analyser.disconnect(Notes.audioCtx.destination); //disconnect , get ready for file analysis
            Notes.analyser.smoothingTimeConstant = 0.0;
            var interval = .01; //added time reducer loading thing
            Transitions.topToDownBlackScreen(1000)
            setTimeout(() => {
                document.body.appendChild(loadingText)
                loadingText.style.zIndex = "101";
                $(loadingText).animate({
                    opacity: 1
                }, {
                    duration: 2500
                })

                Notes.stopEffect = true; //stop the effect for now so no 2 updates
                //wait for the BLACK SCREEN so no lag is shown
                Notes.source.connect(Notes.listen);
                Notes.listen.connect(Notes.analyser);
                audio.currentTime = 0;
                audio.pause();
                audio.play();
                audio.playbackRate = 16;
                let n = 0;
                function recurse() {

                    Notes.analyser.getByteFrequencyData(Notes.frequencyData);
                    let newArray = [];
                    let data = Notes.frequencyData;
                    for (let i = 0; i < data.length; i++) {
                        let val = data[i];
                        newArray[i] = {
                            data: val,
                            time: audio.currentTime
                        };
                    }
                    Notes.rawNotes[Notes.rawNotes.length] = newArray;
                    //console.log(newArray);
                    //console.log(audio.timePosition)
                    //audio.currentTime = audio.currentTime + interval;
                    const testAvg = [];
                    if (audio.currentTime < audio.duration) {
                        window.requestAnimationFrame(recurse);
                    }
                    else {
                        Notes.peakNotes = [];
                        Notes.peakNotesTime = [];
                        for (var i = 0; i < Notes.rawNotes.length; i++) {
                            let array = Notes.rawNotes[i];
                            let dataAvg = 0;
                            for (var e = 0; e < array.length; e++) {
                                let data = array[e].data;
                                if (data !== 0){
                                    data = 200;
                                }
                                dataAvg += data;
                                //dataAvg += data + Math.pow(data/65,2);
                            }
                            dataAvg /= array.length;
                            Notes.peakNotes[Notes.peakNotes.length] = dataAvg;
                            Notes.peakNotesTime[Notes.peakNotesTime.length] = array[0].time;

                            testAvg[testAvg.length] = {
                                data : dataAvg,
                                time : array[0].time
                            };
                        }
                        let peaks = smoothed_z_score(Notes.peakNotes, {
                            lag: 50,
                            threshold: 2,
                            influence: 0
                        });
                        for (var i = 0; i < peaks.length; i++) {
                            let peak = peaks[i];
                            let time = Notes.peakNotesTime[i];
                            let obj = {
                                data: peak,
                                time: time
                            };
                            Notes.peakNotes[i] = obj;
                        }
                        Notes.analyser.connect(Notes.audioCtx.destination); //reconnect the audio
                        audio.playbackRate = 1;
                        console.log("yes")
                        audio.currentTime = 0;
                        audio.play();
                        //test
                        let peak = Notes.peakNotes;
                        let on = false;
                        for (var i = 0; i < peaks.length; i++) {
                            let data = peak[i].data;
                            let time = peak[i].time;
                            let audioTime = audio.currentTime;
                            if (data !== 0) {
                                setTimeout(function () {
                                    if (on){
                                        on = false;
                                        //document.body.querySelector("#blackScreen").style.opacity = 0;
                                    }
                                    else{
                                        on = true;
                                        //document.body.querySelector("#blackScreen").style.opacity = 1;
                                    }
                                    console.log(time + " ---- " + audio.currentTime)
                                }, time * 1000 - 500)
                            }
                            let data2 = testAvg[i].data
                            setTimeout(function(){
                                document.body.querySelector("#blackScreen").style.opacity = String(data2/50);
                            }, testAvg[i].time * 1000 -500)
                        }
                        //

                    }
                }
                recurse(0);
            }, 1000);
*/