class Transitions{
    static bg = "rgb(28,26,51)";
    static gradient = "linear-gradient(0deg, rgba(28,26,51,1) 0%, rgba(112,111,146,1) 30%, rgba(170,170,212,1) 40%, rgba(120,120,170,1) 60%, rgba(28,26,51,1) 100%)"; //https://cssgradient.io/ 
    static totalBlackScreen(duration,duration2){
        let elm = document.body.querySelector("#blackScreen") || document.createElement("div");
        elm.setAttribute("id","blackScreen");
        document.body.appendChild(elm);
        elm.style.width = "100vw";
        elm.style.height = String(screen.height + "px");
        elm.style.zIndex = "1000000";
        elm.style.backgroundColor = Transitions.bg;
        elm.style.background = Transitions.gradient;
        elm.style.opacity = 0;
        elm.style.position = "absolute";
        $(elm).animate({
            opacity : 1
        },duration,function(){
            if(duration2){Transitions.removeBlackScreen(duration2);}
        });
    }
    static topToDownBlackScreen(duration,duration2){
        let elm = document.body.querySelector("#blackScreen") || document.createElement("div");
        elm.setAttribute("id","blackScreen");
        document.body.appendChild(elm);
        elm.style.width = "100vw";
        elm.style.height = String(screen.height + "px");
        elm.style.zIndex = "100";
        elm.style.backgroundColor = Transitions.bg;
        elm.style.background = Transitions.gradient;
        elm.style.opacity = 1;
        elm.style.position = "absolute";
        elm.style.top = String(-screen.height + "px");
        $(elm).animate({
            top : 0
        },duration,function(){
            if(duration2){Transitions.removeBlackScreen(duration2);}
        });
    }
    static removeBlackScreen(duration){
        let elm = document.body.querySelector("#blackScreen") || document.createElement("div");
        $(elm).animate({
            opacity : 0
        },{
            duration : duration,
            complete : function(){
                elm.style.zIndex = "0";
            }
        });
    }
}