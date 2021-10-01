canvas = document.querySelector("canvas");

ctx = canvas.getContext('2d');

window.addEventListener('resize', resize);
resize();

function resize() {
    ctx.canvas.width  = document.body.scrollWidth;
    // total height of strings
    ctx.canvas.height = 300;
}

// x position of the start of the string
STRINGS_X = [512, 506, 499, 495, 500, 508];
// y position of the string
STRINGS_Y = [35, 81, 127, 173, 219, 265];

// y positions of user scroll to trigger the first strum
SCROLL_TRIGGERS_Y = [500, 557, 557+45, 557+45+45, 557+45+45+45, 557+45+45+45+45];

GUITAR_VELOCITY = 0.1;

STRING_DECAY = 0.1;

pluck = [0, 0, 0, 0, 0, 0]

OPEN = ["E2", "A2", "D3", "G3", "B3", "E4"];

G_CHORD = ["G2", "D3", "G3", "B3", "D4", "G4"];
D_CHORD = ["D2", "A2", "D3", "F#3", "A3", "D4"];
E_MIN_CHORD = ["E2", "B2", "E3", "G3", "B3", "E4"];
C_CHORD = ["C3", "E3", "G3", "C4", "E4", "G4"];
B_MIN_CHORD = ["B2", "D3", "F#3", "B3", "D4", "F#4"],

STRING_NOTES = [ OPEN,
    G_CHORD,
    D_CHORD,
    E_MIN_CHORD,
    C_CHORD,
    G_CHORD,
    D_CHORD,
    B_MIN_CHORD,
    C_CHORD,
    B_MIN_CHORD,
    C_CHORD,
    D_CHORD,
    G_CHORD,
    OPEN
              ]
pluck_x = [0, 0, 0, 0, 0, 0]

const LINES = [
'line0.mp3',
'line1.mp3',
'line2.mp3',
'line3.mp3',
'line4.mp3',
'line5.mp3',
'line6.mp3',
'line7.mp3',
'silent.mp3',
'line8.mp3',
'silent.mp3',
'line9.mp3',
'silent.mp3',
];

var player = new Tone.Player().toDestination();

const sampler1 = new Tone.Sampler({
    urls: {
            "E2": "E2.mp3",
    },
    baseUrl: "https://jminjie.github.io/samples/guitar/",
}).toDestination();
const sampler2 = new Tone.Sampler({
    urls: {
            "A2": "A2.mp3",
    },
    baseUrl: "https://jminjie.github.io/samples/guitar/",
}).toDestination();
const sampler3 = new Tone.Sampler({
    urls: {
            "D3": "D3.mp3",
    },
    baseUrl: "https://jminjie.github.io/samples/guitar/",
}).toDestination();
const sampler4 = new Tone.Sampler({
    urls: {
            "G3": "G3.mp3",
    },
    baseUrl: "https://jminjie.github.io/samples/guitar/",
}).toDestination();
const sampler5 = new Tone.Sampler({
    urls: {
            "B3": "B4.mp3",
    },
    baseUrl: "https://jminjie.github.io/samples/guitar/",
}).toDestination();
const sampler6 = new Tone.Sampler({
    urls: {
            "E4": "E4.mp3",
    },
    baseUrl: "https://jminjie.github.io/samples/guitar/",
}).toDestination();

const samplers = [sampler1, sampler2, sampler3, sampler4, sampler5, sampler6];

animate();

var currentlyStrumming = false;
var flip = [1, 1, 1, 1, 1, 1];
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';

    let allStrumming = true;
    for (let i = 0; i < 6; i++) {
        if (Math.abs(pluck[i]) > 1) {
            ctx.beginPath();
            ctx.moveTo(STRINGS_X[i], STRINGS_Y[i]);
            ctx.bezierCurveTo(pluck_x[i] ,STRINGS_Y[i] + pluck[i], pluck_x[i]+50,STRINGS_Y[i] - pluck[i], 5000,STRINGS_Y[i]);
            ctx.stroke();
            pluck[i] = flip[i] * (Math.abs(pluck[i]) - STRING_DECAY);
            flip[i] *= -1;
        } else {
            allStrumming = false;
            pluck[i] = 0;
            ctx.beginPath();
            ctx.moveTo(STRINGS_X[i], STRINGS_Y[i]);
            ctx.lineTo(5000, STRINGS_Y[i])
            ctx.stroke();
        }
    }

    if (allStrumming) {
        if (!currentlyStrumming) {
            advanceChord();
            playLineAndAdvance();
        }
        currentlyStrumming = true;
    } else {
        currentlyStrumming = false;
    }

    requestAnimationFrame(animate);
}

var chord_index = 0;
function advanceChord() {
    if (chord_index + 1 < STRING_NOTES.length) {
        chord_index = chord_index + 1;
    }
}

Tone.Transport.start();
var line_index = 0;
player.load(LINES[line_index]);
function playLineAndAdvance() {
    player.start();
    if (line_index < LINES.length - 1) {
        line_index += 1;
        player.load(LINES[line_index]);
    }

    if (chord_index == 8 || chord_index == 10) {
        // autoplay on chord 8 or 10
        for (let i = 0; i < 6; i++) {
            let DELAY_S = 1.3;
            let note = STRING_NOTES[chord_index][i];
            let time =  '+' + (DELAY_S + (i/14));
            Tone.Transport.schedule((time) => {
                samplers[i].triggerAttack(note, Tone.context.currentTime, GUITAR_VELOCITY);
                startPluck(i, 1000);
                // advance chord automatically on 6th note
                if (i == 5) {
                    advanceChord();
                    playLineAndAdvance();
                }
            }, time);
        }
    }
}

function startPluck(i, x) {
    samplers[i].releaseAll();
    let note = STRING_NOTES[chord_index][i];
    samplers[i].triggerAttack(note, Tone.context.currentTime, GUITAR_VELOCITY);
    // 15 pix pluck displacement
    pluck[i] = 15;
    pluck_x[i] = x;
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

var lastScrollY = 0;
window.addEventListener("scroll", scrollPluck);

function scrollPluck(event) {
    for (let i = 0; i < 6; i++) {
        if (Math.sign(lastScrollY - SCROLL_TRIGGERS_Y[i]) !=
                Math.sign(window.scrollY - SCROLL_TRIGGERS_Y[i])) {
            // when triggering pluck from scroll, just imagine that user mouse
            // is around 1000 (middle of the string)
            startPluck(i, 1000);
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
                window.removeEventListener("scroll", scrollPluck);
                startPluck(i, mouseX);
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

