/* eslint-disable no-undef */
// /* eslint-disable no-undef */
/// 1. Context and Master Volume

// -- Audio Context for window
var AudioContext = window.AudioContext || window.webkitAudioContext;

const context = new AudioContext();

// -- Master Volume
const masterVolume = context.createGain();
masterVolume.connect(context.destination);
masterVolume.gain.value = 0.2;

// -- links volume control context with html volume control element
const volumeControl = document.querySelector("#volume-control");

//-- Event listener to adjust volume levels
volumeControl.addEventListener("input", function () {
    masterVolume.gain.value = this.value;
});

// 2.  Notes -- Array of frequencies split into semitones -- numbers indicative of frequencies

const notes = {
    C4: 261.63,
    Db4: 277.18,
    D4: 293.66,
    Eb4: 311.13,
    E4: 329.63,
    F4: 349.23,
    Gb4: 369.99,
    G4: 392.0,
    Ab4: 415.3,
    A4: 440,
    Bb4: 466.16,
    B4: 493.88,
    C5: 523.25,
};

// -- Note Selects Div

const noteSelectsDiv = document.querySelector("#note-selects-div");

//--  Loop squencer through notes

// -- Generates new notes through loop and appends to sequencer
for (let i = 0; i <= 7; i++) {
    const select = document.createElement("select");
    select.id = `note ${i + 1}`;
    for (let j = 0; j < Object.keys(notes).length; j++) {
        //creates new element
        const option = document.createElement("option");
        // applies value to new element
        option.value = j;
        option.innerText = `${Object.keys(notes)[j]}`;
        // append child, event listener
        select.appendChild(option);
        select.addEventListener("change", setCurrentNotes);
    }
    noteSelectsDiv.appendChild(select);
}

//-- array of current note on page load
let currentNotes = [0, 3, 0, 7, 8, 7, 3, 2];
const noteSelects = document.querySelectorAll("select");
function setNoteSelects() {
    for (let i = 0; i < currentNotes.length; i++) {
        noteSelects[i].value = currentNotes[i];
    }
}

// -- Set Current Notes using a For Loop

function setCurrentNotes() {
    for (let i = 0; i < noteSelects.length; i++) {
        currentNotes[i] = noteSelects[i].value;
    }
}

setNoteSelects();

//WAVEFORM SELECT
const waveforms = document.getElementsByName("waveform");
let waveform = "sine";

function setWaveform() {
    for (var i = 0; i < waveforms.length; i++) {
        if (waveforms[i].checked) {
            waveform = waveforms[i].value;
        }
    }

    if (waveform != "fm") {
        // Hide the harmonicity controls
        let harmonicitySlider = document.getElementById("harmonicity");
        harmonicitySlider.setAttribute("hidden", "hidden");

        let harmonicityLabel = document.getElementById("harmonicity-label");
        harmonicityLabel.setAttribute("hidden", "hidden");

        // Hide the modulation index controls
        let modIndexSlider = document.getElementById("mod-index");
        modIndexSlider.setAttribute("hidden", "hidden");

        let modIndexLabel = document.getElementById("mod-index-label");
        modIndexLabel.setAttribute("hidden", "hidden");
    } else {
        // Show harmonicity controls
        let harmonicitySlider = document.getElementById("harmonicity");
        harmonicitySlider.removeAttribute("hidden");

        let harmonicityLabel = document.getElementById("harmonicity-label");
        harmonicityLabel.removeAttribute("hidden");

        // Show modulation index controls
        let modIndexSlider = document.getElementById("mod-index");
        modIndexSlider.removeAttribute("hidden");

        let modIndexLabel = document.getElementById("mod-index-label");
        modIndexLabel.removeAttribute("hidden");
    }
}

waveforms.forEach((waveformInput) => {
    waveformInput.addEventListener("change", function () {
        setWaveform();
    });
});

//------------- Effect Controls

// Envelope
let attackTime = 0.3;
let sustainLevel = 0.8;
let releaseTime = 0.3;
let noteLength = 1;

// Document Query Selectors

const attackControl = document.querySelector("#attack-control");
const releaseControl = document.querySelector("#release-control");
const noteLengthControl = document.querySelector("#note-length-control");

//-- Functions to adjust Envelope Controls

attackControl.addEventListener("input", function () {
    attackTime = Number(this.value);
    console.log("attack adjusted");
});

releaseControl.addEventListener("input", function () {
    releaseTime = Number(this.value);
    console.log("release adjusted");
});

noteLengthControl.addEventListener("input", function () {
    noteLength = Number(this.value);
    console.log("note length adjusted");
});

// Vibrato
let vibratoSpeed = 10;
let vibratoAmount = 0;
const vibratoAmountControl = document.querySelector("#vibrato-amount-control");
const vibratoSpeedControl = document.querySelector("#vibrato-speed-control");

vibratoAmountControl.addEventListener("input", function () {
    vibratoAmount = this.value;
});

vibratoSpeedControl.addEventListener("input", function () {
    vibratoSpeed = this.value;
});

// FM Controls
let Harmonicity = 2;
let modIndex = 1.2;
const harmonicityControl = document.querySelector("#harmonicity");
const modIndexControl = document.querySelector("#mod-index");

harmonicityControl.addEventListener("input", function () {
    Harmonicity = this.value;
});

modIndexControl.addEventListener("input", function () {
    modIndex = this.value;
});

//--- Delay

// variables
const delayAmountControl = document.querySelector("#delay-amount-control");
const delayTimeControl = document.querySelector("#delay-time-control");
const feedbackControl = document.querySelector("#feedback-control");
const delay = context.createDelay();
const feedback = context.createGain();
const delayAmountGain = context.createGain();

delayAmountGain.connect(delay);
delay.connect(feedback);
feedback.connect(delay);
delay.connect(masterVolume);

// Delay Values
delay.delayTime.value = 0;
delayAmountGain.gain.value = 0;
feedback.gain.value = 0;

// Delay Functions

delayAmountControl.addEventListener("input", function () {
    delayAmountGain.value = this.value;
});

delayTimeControl.addEventListener("input", function () {
    delay.delayTime.value = this.value;
});

feedbackControl.addEventListener("input", function () {
    feedback.gain.value = this.value;
});

//-- Loop Controls and Functions
const startButton = document.querySelector("#start-button");
const stopButton = document.querySelector("#stop-button");
const tempoControl = document.querySelector("#tempo-control");
let tempo = 120.0;
let currentNoteIndex = 0;
let isPlaying = false;

tempoControl.addEventListener(
    "input",
    function () {
        tempo = Number(this.value);
    },
    false
);

startButton.addEventListener("click", function () {
    if (!isPlaying) {
        isPlaying = true;
        console.log("Loop started");
        noteLoop();
    }
});

stopButton.addEventListener("click", function () {
    isPlaying = false;
    console.log("Loop stopped");
});

function noteLoop() {
    const secondsPerBeat = 60.0 / tempo;
    if (isPlaying) {
        playCurrentNote();
        nextNote();
        window.setTimeout(function () {
            noteLoop();
        }, secondsPerBeat * 1000);
    }
}

function nextNote() {
    noteSelects[currentNoteIndex].style.background = "hotpink";
    if (noteSelects[currentNoteIndex - 1]) {
        noteSelects[currentNoteIndex - 1].style.background = "black";
    } else {
        noteSelects[7].style.background = "black";
    }
    currentNoteIndex++;
    if (currentNoteIndex === 8) {
        currentNoteIndex = 0;
    }
}

//-------------------------- Main Loop Function --- Integrates Low Frequency Oscillator & Frequency Modulator

function playCurrentNote() {
    if (waveform != "fm") {
        const osc = context.createOscillator();
        const noteGain = context.createGain();
        noteGain.gain.setValueAtTime(0, 0);
        noteGain.gain.linearRampToValueAtTime(
            sustainLevel,
            context.currentTime + noteLength * attackTime
        );
        // -- currentTime allows for more precise control over timeline -- current time of our audio Context
        noteGain.gain.setValueAtTime(
            sustainLevel,
            context.currentTime + noteLength - noteLength * releaseTime
        );
        //--- Allows us to change a value over time - similar to setValueAtTime
        noteGain.gain.linearRampToValueAtTime(
            0,
            context.currentTime + noteLength
        );

        // -- LFO (Low Frequency Oscillator) connected to Wave Oscillator Frequency output to control Vibrato
        // -- Value of LFO is the output of the oscillator producing the wave sound
        lfoGain = context.createGain();
        lfoGain.gain.setValueAtTime(vibratoAmount, 0);
        lfoGain.connect(osc.frequency);

        //-- LFO connected to current Time, Note Array and new LFO Gain Node (volume)
        lfo = context.createOscillator();
        lfo.frequency.setValueAtTime(vibratoSpeed, 0);
        lfo.start(0);
        lfo.stop(context.currentTime + noteLength);
        lfo.connect(lfoGain);

        osc.type = waveform;
        osc.frequency.setValueAtTime(
            Object.values(notes)[`${currentNotes[currentNoteIndex]}`],
            0
        );
        osc.start(0);
        osc.stop(context.currentTime + noteLength);
        osc.connect(noteGain);

        noteGain.connect(masterVolume);
        noteGain.connect(delay);
    } else {
        const noteGain = context.createGain();
        noteGain.gain.setValueAtTime(0, 0);
        noteGain.gain.linearRampToValueAtTime(
            sustainLevel,
            context.currentTime + noteLength * attackTime
        );
        // -- currentTime allows for more precise control over timeline -- current time of our audio Context
        noteGain.gain.setValueAtTime(
            sustainLevel,
            context.currentTime + noteLength - noteLength * releaseTime
        );
        //--- Allows us to change a value over time - similar to setValueAtTime
        noteGain.gain.linearRampToValueAtTime(
            0,
            context.currentTime + noteLength
        );

        //Calculating the frequency of the modulator based on H frequency of the carrier
        const Carrier = context.createOscillator();
        var CarrierFrequency =
            Object.values(notes)[`${currentNotes[currentNoteIndex]}`];
        Carrier.type = "sine";
        Carrier.frequency.setValueAtTime(CarrierFrequency, 0);

        // -- LFO (Low Frequency Oscillator) connected to Wave Oscillator Frequency output to control Vibrato
        // -- Value of LFO is the output of the oscillator producing the wave sound
        lfoGain = context.createGain();
        lfoGain.gain.setValueAtTime(vibratoAmount, 0);
        lfoGain.connect(Carrier.frequency);

        //-- LFO connected to current Time, Note Array and new LFO Gain Node (volume)
        lfo = context.createOscillator();
        lfo.frequency.setValueAtTime(vibratoSpeed, 0);
        lfo.start(0);
        lfo.stop(context.currentTime + noteLength);
        lfo.connect(lfoGain);

        //-- The Modulator
        const ModulatorOsc = context.createOscillator();
        //Have to use the current value of the frequency of the carrier Carrier.frequency.value, because it might be
        //constantly changing because of the LFO
        var ModulatorFrequency = Harmonicity * Carrier.frequency.value;
        ModulatorOsc.frequency.setValueAtTime(ModulatorFrequency, 0);
        ModulatorOsc.type = "sine";

        //The amplitude of the Modulator, based on H, I and frequency of the carrier.
        //In Web audio to change the amplitude of the Modulator you need this gain node,
        //so the output of the modulator can give you some real frequency values.
        const Modulator = context.createGain();
        var ModulatorAmplitude = Harmonicity * modIndex * CarrierFrequency;
        Modulator.gain.setValueAtTime(ModulatorAmplitude, 0);

        Carrier.start();
        ModulatorOsc.start();
        Carrier.stop(context.currentTime + noteLength);
        ModulatorOsc.stop(context.currentTime + noteLength);

        //connecting the modulator osc to the gain, so we can get some real frequency values
        ModulatorOsc.connect(Modulator);

        //Connecting the Modulator output to the frequency parameter of the carier
        Modulator.connect(Carrier.frequency);

        //Carrier.connect(context.destination);
        Carrier.connect(noteGain);

        noteGain.connect(masterVolume);
        noteGain.connect(delay);
    }
}

//--------------------------------------------------------------------- Keyboard

// Arrays of computer keyboard keys
const WHITE_KEYS = ["z", "x", "c", "v", "b", "n", "m"];
const BLACK_KEYS = ["s", "d", "g", "h", "j"];

const keys = document.querySelectorAll(".key");
const whiteKeys = document.querySelectorAll(".key.white");
const blackKeys = document.querySelectorAll(".key.black");

keys.forEach((key) => {
    key.addEventListener("click", () => playNote(key));
});

//-------- Key down on computer keyboard note arrays, corresponds with piano keys played
document.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const key = e.key;
    const whiteKeyIndex = WHITE_KEYS.indexOf(key);
    const blackKeyIndex = BLACK_KEYS.indexOf(key);

    // iterate through array, if greater than -1 (i.e. if it finds something, play corresponding note )
    if (whiteKeyIndex > -1) playNote(whiteKeys[whiteKeyIndex]);
    if (blackKeyIndex > -1) playNote(blackKeys[blackKeyIndex]);
});

// --------------------- Audio Play Function
// 1. Audio data by id dataset - links audio file with the corresponding note
// 2. Current time set to 0 -- allows the note to be hit repeatedly, resets everytime it's pressed
// 3. Event Listener tracks which note is active

function playNote(key) {
    const noteAudio = document.getElementById(key.dataset.note);
    noteAudio.currentTime = 0;
    noteAudio.play();
    key.classList.add("active");
    noteAudio.addEventListener("ended", () => {
        key.classList.remove("active");
    });
}
// const Visualizer = () => {
//     const synth = useSynth();
//     const canvasRef = useRef(null);

//     useEffect(() => {
//         const ctx = canvasRef.current.getContext("2d");
//         const cw = canvasRef.current.width;
//         const ch = canvasRef.current.height;
//         const chh = Math.round(ch * 0.5);
//         ctx.fillStyle = "red";
//         ctx.strokeStyle = "red";

//         let canDraw = true;

//         const draw = () => {
//             try {
//                 if (canDraw) requestAnimationFrame(draw);
//                 ctx.clearRect(0, 0, cw, ch);
//                 const data = synth.getAnalyserData();

//                 ctx.beginPath();
//                 ctx.moveTo(0, chh);
//                 for (let i = 0, ln = data.length; i < ln; i++) {
//                     ctx.lineTo(i, ch * (data[i] / 255));
//                 }
//                 ctx.stroke();
//             } catch (e) {
//                 console.log("Ooops", e);
//                 canDraw = false;
//             }
//         };

//         draw();
//     }, []);

//     return (
//         <canvas
//             className="visualizer"
//             width="128"
//             height="45"
//             ref={canvasRef}
//         />
//     );
// };
