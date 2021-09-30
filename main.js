canvas = document.querySelector("canvas");

ctx = canvas.getContext('2d');

window.addEventListener('resize', resize);
resize();

function resize() {
    ctx.canvas.width  = document.body.scrollWidth;
    // total height of strings
    ctx.canvas.height = 263;
}

// x position of the start of the string
STRINGS_X = [512, 506, 499, 495, 500, 508];
// y position of the string
STRINGS_Y = [20, 66, 112, 158, 204, 250];

// y positions of user scroll to trigger the first strum
SCROLL_TRIGGERS_Y = [500, 557, 557+45, 557+45+45, 557+45+45+45, 557+45+45+45+45];

strum = [0, 0, 0, 0, 0, 0]
STRING_NOTE = ["E1", "A1", "D2", "G2", "B3", "E4"];
strum_x = [0, 0, 0, 0, 0, 0]

const sampler = new Tone.Sampler({
    urls: {
        "C3": "C3.wav",
        "C4": "C4.wav",
        "C5": "C5.wav",
    },
    release: 1,
    baseUrl: "https://jminjie.github.io/samples/banjo/",
}).toDestination();

animate();

var flip = [1, 1, 1, 1, 1, 1];
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';

    for (let i = 0; i < 6; i++) {
        if (Math.abs(strum[i]) > 1) {
            ctx.beginPath();
            ctx.moveTo(STRINGS_X[i], STRINGS_Y[i]);
            ctx.bezierCurveTo(strum_x[i] ,STRINGS_Y[i] + strum[i], strum_x[i]+50,STRINGS_Y[i] - strum[i], 5000,STRINGS_Y[i]);
            ctx.stroke();
            //strum[i] = -Math.abs(strum[i]/1.15);
            strum[i] = flip[i] * (Math.abs(strum[i]) - 0.2);
            flip[i] *= -1;
        } else {
            strum[i] = 0;
            ctx.beginPath();
            ctx.moveTo(STRINGS_X[i], STRINGS_Y[i]);
            ctx.lineTo(5000, STRINGS_Y[i])
            ctx.stroke();
        }
    }
    requestAnimationFrame(animate);
}

function startStrum(i, x) {
    sampler.triggerAttackRelease(STRING_NOTE[i], Tone.context.currentTime);
    // 15 pix strum displacement
    strum[i] = 15;
    strum_x[i] = x;
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

var lastScrollY = 0;
window.addEventListener("scroll", scrollStrum);

function scrollStrum(event) {
    for (let i = 0; i < 6; i++) {
        if (Math.sign(lastScrollY - SCROLL_TRIGGERS_Y[i]) !=
                Math.sign(window.scrollY - SCROLL_TRIGGERS_Y[i])) {
            // when triggering strum from scroll, just imagine that user mouse
            // is around 1000 (middle of the string)
            startStrum(i, 1000);
        }
    }
    lastScrollY = window.scrollY;
}


var lastMouseY = 0;
canvas.onmousemove = pluckStrings;
function pluckStrings(event) {
    let pos = getMousePos(event);
    var mouseY = pos.y;
    var mouseX = pos.x;
    
    if (mouseX > 550) {
        for (let i = 0; i < 6; i++) {
            if (Math.sign(lastMouseY - STRINGS_Y[i]) != Math.sign(mouseY - STRINGS_Y[i])) {
                // when user starts plucking manually, don't trigger by scroll anymore
                window.removeEventListener("scroll", scrollStrum);
                startStrum(i, mouseX);
            }
        }
    }
    lastMouseY = mouseY;
}

canvas.onmousedown = printMousePosition;
function printMousePosition(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    console.log("Coordinate x: " + x, 
        "Coordinate y: " + y);
    Tone.start();
}

