var cvs = document.getElementById("mycanvas");
var ctx = cvs.getContext("2d");

var DEGREE = Math.PI / 180
var frames = 0;

var sprite = new Image();
sprite.src = "original.png"


var SCORE = new Audio();
SCORE.src = "audio/sfx_point.mp3"

var FLAP = new Audio();
FLAP.src = "audio/sfx_wing.mp3"

var HIT = new Audio();
HIT.src = "audio/sfx_swooshing.mp3"

var DIE = new Audio();
DIE.src = "audio/sfx_die.mp3"




var state = {
    curent : 0,
    getready : 0,
    game : 1,
    over : 2
}



function clickHandler(){
    switch (state.curent) {
        case state.getready:
            state.curent = state.game
            break;
        case state.game:
            FLAP.play()
            bird.flap();
            break;
    
        default:
            bird.rotation = 0;
            bird.speed = 0;
            pipes.position = [];
            score.value = 0; 
            state.curent = state.getready
            break;
    }
}
document.addEventListener("click", clickHandler)
document.addEventListener("keydown", function(e){
    if(e.which == 32){
        clickHandler();
    }
})


var bg = {
    sX : 0,
    sY : 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }

}

var fg = {
    sX : 276,
    sY : 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    dx: 2,
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },
    update : function() {
        if (state.curent == state.game) {
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }

}

var pipes = {
    top : {
        sX : 553,
        sY : 0,
    },
    bottom : {
        sX : 502,
        sY : 0,
    },
    w : 53, 
    h : 400,
    dx : 2,
    gap : 80,
    position : [],
    maxYPos : - 150,
    draw : function(){
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i]

            let topYPos =p.y;
            let buttomYPos = p.y + this.h + this.gap;
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h)
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, buttomYPos, this.w, this.h)

    }

    },
    update : function(){
        if(state.curent != state.game) return;
        if(frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)          
            })
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i]
            p.x -= this.dx

            let buttomPipesPas = p.y + this.h + this.gap;

            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y
                && bird.y - bird.radius < p.y + this.h) {
                    HIT.play()
                    state.curent = state.over;
            }

            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > buttomPipesPas
                && bird.y - bird.radius < buttomPipesPas + this.h) {
                    HIT.play()
                    state.curent = state.over;
            }

            if (p.x + this.w <= 0) {
                this.position.shift()
                score.value += 1;
                SCORE.play()
                score.best = Math.max(score.value,score.best)
                localStorage.setItem("best",score.best)
            }
            
        }
    }
}

var getready = {
    sX : 0,
    sY : 228,
    w: 173,
    h: 152,
    x: cvs.width/2 - 173/2,
    y: 80,
    draw : function(){
        if (state.curent == state.getready) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
        
    }

}

var gameOver = {
    sX : 175,
    sY : 228,
    w: 225,
    h: 202,
    x: cvs.width/2 - 225/2,
    y: 90,
    draw : function(){
        if (state.curent == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
        
    }

}

var bird = {
    animation:[
        {sX:276, sY:112},
        {sX:276, sY:139},
        {sX:276, sY:164},
        {sX:276, sY:139},

        
    ],
        w: 34,
        h: 26,
        x: 50,
        y: 150,
        rotation : 0,
        jump : 3.6,
        speed : 0,
        gravity: 0.25,
        animationIndex: 3,
        radius : 12,
        draw : function(){
            let bird = this.animation[this.animationIndex]
            ctx.save();
            ctx.translate(this.x, this.y)
            ctx.rotate(this.rotation);
            ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.w/2, this.w, this.h)
            ctx.restore();
            
    },
    update : function(){
        let period = state.curent == state.getready ? 10 : 5
        this.animationIndex += frames % period == 0 ? 1 : 0;
        this.animationIndex = this.animationIndex % this.animation.length
        if (state.curent == state.getready) {
            this.y = 150;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            if (this.speed < this.jump) {
                this.rotation = -25 * DEGREE;
                
            } else {
                this.rotation = 90 * DEGREE;
            }
        }
        if (this.y +this.h/2 >= cvs.height - fg.h) {
            this.y = cvs.height - fg.h - this.h/2;
            this.animationIndex = 1;
            if (state.curent == state.game) {
                DIE.play();
                state.curent = state.over;
            }   
        }
    },
    flap : function(){
        this.speed = - this.jump;
    }

}

var score = {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    draw : function(){
        ctx.fillStyle = "#FFF"
        ctx.strokeStyle = "#000"
        
        if (state.curent == state.game) {
            ctx.lineWidth = 2;
            ctx.font = "35px IMPACT";
            ctx.fillText(this.value, cvs.width/2, 50)
            ctx.strokeText(this.value, cvs.width/2, 50)
        } else if(state.curent == state.over){
            ctx.font = "25px IMPACT";

            ctx.fillText(this.value, 225, 186)
            ctx.strokeText(this.value, 225, 186)

            ctx.fillText(this.best, 225, 228)
            ctx.strokeText(this.best, 225, 228)
        }
    }
}


function update(){
    bird.update();
    fg.update();
    pipes.update()
}

function draw(){
    ctx.fillStyle = "#70c5ce"
    ctx.fillRect(0,0,cvs.width, cvs.height)
    bg.draw()
    pipes.draw()
    fg.draw()
    bird.draw()
    getready.draw()
    gameOver.draw()
    score.draw()


}

function animate(){
    update()
    draw()
    frames ++;
    requestAnimationFrame(animate)
}
animate()