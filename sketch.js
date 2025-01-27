let audio; 

let port;   //declares a port to handle communication between arduino and p5js
let connectBtn;  // declares connectBtn for the connect button
let myVal1 = 0; //declares myVal to store the potentiometer readings
let myVal2 = 0;
let myVal3 = 0;

//create arrays for three categories of colours using RGB values
let colours = {
  gentle: [200, 200, 200], //a light grey calm colour
  happy: [255, 105, 180], //a bright pink
  bright: [255, 69, 0],  //orange/red colour
};

let time = 0
let previousRate = 1;
let currentTempoText = 'Tempo: '
let countDown = 10;
let lastTempoTime = 0;
let canvas;
let currentColours = colours.gentle; // Begin sketch with gentle colours
let steps = 360;
let r = 100; //base radius for the shapes
let noiseScale = 0.002;
let noiseAmount = 300;
let shapeType = 'circle'; //begin sketch with circle shape as the audio will begin at a normal tempo

function preload() {
  audio = loadSound('audio.mp3');
}

function setup() {

  //using the createDiv function to position the question above the canvas
  let textDiv = createDiv('Respond to the current tempo using the dials');
  textDiv.position(150, 20); 
  textDiv.style('font-size', '30px');
  textDiv.style('color', 'DarkGrey');

  canvas = createCanvas(800, 400); //landscape canvas to represent a live music performance screen
  canvas.position(0, 75); //position the canvas below the buttons so it is an outcome of the input
  noFill();
  stroke(255,50);
  background(200);

port = createSerial();//initialises a serial connection 

connectBtn = createButton('Connect to Arduino');//creates a button
connectBtn.position(20, 475);//position of the button
connectBtn.mousePressed(connectBtnClick); //when the mouse is pressed it initiates the button clicked function

  // Create buttons to change the audio playback speed 
  //let slowAudioButton = createButton('0.5x Tempo');
  //slowAudioButton.position(100, 50);
 //slowAudioButton.mousePressed(() => setAudioRate(0.5));

 // let normalAudioButton = createButton('1x Tempo');
 // normalAudioButton.position(300, 50);
  //normalAudioButton.mousePressed(() => setAudioRate(1));

  //let fastAudioButton = createButton('2x Tempo ');
  //fastAudioButton.position(500, 50);
  //fastAudioButton.mousePressed(() => setAudioRate(2));

  let playButton = createButton ('Play Audio'); //creating a button to play the audio
  playButton.position (20,20);
  playButton.mousePressed (playAudio);

  let pauseButton = createButton ('Pause Audio'); //creating a button to pause the audio
  pauseButton.position (20,50);
  pauseButton.mousePressed (pauseAudio);
}

function playAudio() {
  audio.play(); //plays the audio
  audio.rate(0.5); //ensure that the audio always starts at 0.5
  currentTempoText = 'Tempo: Slow';
  time = 0; //when the audio starts it sets the time to 0 so that the countdown can start
}

function pauseAudio(){
  audio.pause(); //pause the audio
  currentTempoText = 'Tempo: '; //when the audio is paused the tempo text returns to how it began
  countDown = 10; //the countdown returns to 10 ready to start again
}

function draw() {

//setting the countdown by using 'startCountdown' as a function and using time in seconds so that the countdown resets every 10 seconds
  if (audio.isPlaying()){
  time ++ ; //time increases in increments of 1

  if (time < 60 * 10){
    if (time == 1) startCountdown()
    setAudioRate(0.5);

  }else if (time >= 60 * 10 && time < 60 * 20){
    if (time == 60 * 10) startCountdown();
    setAudioRate(1);

  }else if (time >= 60 * 20 && time < 60 * 30){
    if (time == 60 * 20) startCountdown();
    setAudioRate(2)
    
 //once the 30 seconds is over the audio is paused and the framecount is reset   
  } else if (time >= 60 * 30){
    if (time == 60 * 30)
    audio.pause(); 
    time = 0;
    countDown = 10;
    lastTempoTime = millis();
    currentTempoText = 'Tempo: ';
    resetVisuals(); //reset the visauls back to original using the variable resetVisuals
  } 

updateCountdown();
}
  
  let val = port.readUntil("\n"); 
  if (val) {
    let values = split(val.trim(), ","); // Splits the string into two parts

    //Convert each value from the string into an integer and assign them to variable Val 1,2 or 3
    if (values.length === 3) {
      myVal1 = int(values[0]); // First potentiometer value
      myVal2 = int(values[1]); // Second potentiometer value
      myVal3 = int(values[2]); // third potentiometer value 
    }
  } 

   noFill();
  background(0, 10); // background with an echo effect 
  stroke(currentColours[0], currentColours[1], currentColours[2], 80); 

  //Assign each function to either Val1, Val2, or Val3
  setMovement(myVal1);

  setShape(myVal2);

  setColours(myVal3);

//use if and else statements to determine which shape to to draw 
  if (shapeType === 'circle') {
    distortedCircle();
  } else if (shapeType === 'grid') {
    distortedGrid();
  } else if (shapeType === 'spiral') {
    distortedSpiral();
  }

//text to display the current tempo and the countdown timer
  noStroke();
  fill(100);
  textSize(24);
  text(currentTempoText, 20, 40);
  noStroke();
  fill(100);
  textSize(24);
  text('Timer: ' + int(countDown), 20, 70); //using int to ensure the countdown is an integer 
}


//ensuring that i use noise within all my distorted shapes so that the visual is fluid and connects with the audio
function distortedCircle() {
  beginShape();
  for (let i = 0; i <= steps; i++) {
    let x = width / 2 + r * cos((TWO_PI * i) / steps);
    let y = height / 2 + r * sin((TWO_PI * i) / steps);
    x += map(
      noise(noiseScale * x, noiseScale * y, frameCount / 100), 0, 1, -noiseAmount, noiseAmount);
    y += map(
      noise(noiseScale * x, noiseScale * y, 1), 0, 1, -noiseAmount, noiseAmount);
    vertex(x, y);
  }
  endShape(CLOSE);
}

function distortedGrid() {
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      let x = 70 + i * 70;
      let y = 70 + j * 70;

      let xOffset = map(
        noise(noiseScale * x, noiseScale * y, frameCount * 0.01), 0, 1, -noiseAmount, noiseAmount);
      let yOffset = map(
        noise(noiseScale * x, noiseScale * y, frameCount * 0.02), 0, 1, -noiseAmount, noiseAmount);
      rect(x + xOffset, y + yOffset, 50, 50);
    }
  }
}

function distortedSpiral() {
  beginShape();
  for (let i = 0; i < steps; i++) {
    let angle = i * 0.1;
    let radius = r + i * 0.5;

    let x = width / 2 + radius * cos(angle);
    let y = height / 2 + radius * sin(angle);

    x += map(noise(noiseScale * x, frameCount / 100), 0, 1, -noiseAmount, noiseAmount);
    y += map(noise(noiseScale * y, frameCount / 100), 0, 1, -noiseAmount, noiseAmount);

    vertex(x, y);
  }
  endShape();
}

//using the value from the first potentiometer to alter the amount of noise scale and noise amount
function setMovement(val){
  noiseScale = map(val, 0, 1023, 0.001, 0.03);
  noiseAmount = map(val, 0, 1023, 50, 200); // ensure i map the arduino values to an appropriate range
}

//using the value from the second potentiometer to alter the shape of the visual
//i had to split the potentiometer readings (0-1023) into three groups as i had three shapes 
function setShape(val){
  if (val < 341){ //use if and else values to determine the shape
    shapeType = 'circle';
  } else if (val >= 341 && val < 682){
    shapeType = 'grid';
  } else {
    shapeType = 'spiral';
  }
}
//using the values from the third potentiometer to alter the colour 
//i had to split the potentiometer readings (0-1023) into three groups as i had three shapes
function setColours(val) {
  if (val < 341) {
    currentColours = colours.gentle;
  } else if (val >= 341 && val < 682) {
    currentColours = colours.happy;
  } else {
    currentColours = colours.bright;
  }
}

//reset the visual back to the original format
function resetVisuals(){
  currentColours = colours.gentle;
  shapeType = 'circle';
  noiseScale = 0.002;
  noiseAmount = 300;
}

function startCountdown(){ //start the countdown timer
  countDown = 10;
  lastTempoTime = millis();
}

//use millis to calculate the countdown value by comparing the current time to the last recorded tempo time
function updateCountdown(){
  let elapsedTime = (millis() - lastTempoTime) / 1000;
  countDown = 10 - elapsedTime;
//ensuring the countdown doesnt go below 0
  if (countDown <= 0){
    countDown = 0;
  }
}

//using audio.jump to have the three tempos play from different sections of my audio 
function setAudioRate(rate) {
  if (rate !== previousRate){
    if (rate == 0.5){
      audio.jump(40);
    }else if (rate == 1){
      audio.jump(60);
    }else if (rate == 2){
      audio.jump(90);
    }
    previousRate = rate;
  }
  audio.rate(rate);
  if (!audio.isPlaying()) {
    audio.loop();
  }

//changing the tempo text based on the current tempo
  if (rate === 0.5) {
    currentTempoText = "Tempo: Slow";
  } else if (rate === 1) {
    currentTempoText = "Tempo: Steady";
  } else if (rate === 2) {
    currentTempoText = "Tempo: Fast";
  }
}


function connectBtnClick() {
  console.log('Button clicked');
  if (!port.opened()) {
    port.open('Arduino', 9600); // Open the port at 9600 baud rate
  } else {
    port.close();
  }
} 