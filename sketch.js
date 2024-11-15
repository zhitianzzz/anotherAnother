let vehicles = [];
let optimaFont;
let handpose;
let video;
// let predictions = [];
let hands = [];

let thumbPrevPos = null;
let thumbCurrPos = null;
let thumbSpeed = 0;
let canUpdateTextContent = true;
let thumbPinkyDistance = 0;
let textContent = "";

let cursorX, cursorY; 
let trailX, trailY; 
let easing = 0.23;
let showCursor = false;

const paraInstruction0 = "Welcome :)\nThis is an interactive experience\nusing hand gestures.\n\nTo proceed to the next section, please\n1. Spread your fingers in front of\nyour webcam\n2. Gently wave your hand left to right";
const paraInstruction1 = "To activate text effect, please\n1. Pinch your fingers together;\n2. Gently move your hand\n\nWords will ripple following\nthe movement of your fingertips";
const paraInstruction2 = "TIPS:\n1. Recommend to use single hand only\n2. Keep your hand in the camera when\nyou want to make interactions";
const paraInstruction3 = "Now you are all set,\nPlease enjoy the experience :D";

const para1 = "Here you are,\nLying in this six-foot-long bed,\nWondering if you’ll ever wake\nFrom this dream of being alive\nOr if you’ll just keep on sleeping.";
const para2 = "The fridge moans,\nThe fan breathes deeply,\nInhales the dusty, heavy air.\nSighs…";
const para3 = "There are no signs of the morning,\nDarkness as creamy as soup.\nScrolling… scrolling…\nOne window faces the car park,\nUp… and up…\nAnother kisses a concrete wall.";
const para4 = "Here you are,\nDragging your bones into the toilet.\nHumidity climbs the mouldy air,\nSoaking up the small space,\nClogging your lungs.\nA pale palm turns off the tap.";
const para5 = "You know,\nIt is another start.";
const para6 = "Then,\nLike a bouncy ball,\nYou bump into all kinds of corners,\nCrashing into the world.";
const para7 = "Restless, unsettled at first—\nYou soon loosen up and surrender,\nSpinning and spinning…\nLose yourself in the washing machine,\nUntil you are drained completely.";
const para8 = "You were let go,\nReleased into your cell.";
const para9 = "You have missed\nthe remnant of sunlight.\nThey walk past your room\nat 3:30 in the afternoon,\nLingering for only 30 minutes\nUntil they are invited\nto the glass tower next street.";
const para10 = "As a pity...\nThey left behind a stripe of warmth,\nSmeared across your desk—\nBut you missed that too.\nPerhaps you saw it\nIn the corner of your eye,\nBut turned away.";
const para11 = "12 AM.\nYou feel like you’ve done nothing,\nAnd the fluorescent glow whispers\nIt’s another day.";

// Initialize textContent with the first paragraph
textContent = paraInstruction0.toUpperCase();

let fridgeSound;
let tapSound;
let streetSound;
let washingMachineSound;
let houseDoorSound;
let lightOnSound;
let footstepsSound;
let oldWindowSound;
let tickingSound;
let clockSound;

function preload() {
  optimaFont = loadFont('optimaMedium.ttf');
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  textSize(52); // Font size
  textAlign(LEFT, CENTER);
  textFont(optimaFont); 

  // Set the volume for the background sounds
  document.getElementById('quietHall').volume = 0.6; 
  document.getElementById('roomBG').volume = 0.5; 

  // Start sound at 0 volume
  fridgeSound = document.getElementById('fridgeSound');
  fridgeSound.volume = 0; 
  tapSound = document.getElementById('tapSound');
  tapSound.volume = 0;
  streetSound = document.getElementById('streetSound');
  streetSound.volume = 0;
  washingMachineSound = document.getElementById('washingMachineSound');
  washingMachineSound.volume = 0;
  houseDoorSound = document.getElementById('houseDoorSound');
  lightOnSound = document.getElementById('lightOnSound');
  footstepsSound = document.getElementById('footstepsSound');
  oldWindowSound = document.getElementById('oldWindowSound');
  tickingSound = document.getElementById('tickingSound');
  clockSound = document.getElementById('clockSound');
  clockSound.volume = 0;

  let textContent = paraInstruction0.toUpperCase();
  let points = [];
  let tracking = 4; // Tracking in pixels
  let leading = 70; // Leading in pixels

  // Split the text into lines and create points for each line
  let lines = textContent.split('\n');
  let yOffset = 0;
  let totalHeight = lines.length * leading; // Calculate total height of the text block
  let yCenterOffset = (windowHeight - totalHeight + leading) / 2; // Calculate the vertical offset for centering the text

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let xOffset = 2;
    for (let j = 0; j < line.length; j++) {
      let char = line[j];
      let charPoints = optimaFont.textToPoints(char, 50 + xOffset, yCenterOffset + yOffset, 52, { 
        sampleFactor: 0.18 // Increase sampleFactor to reduce the number of particles
      });
      points = points.concat(charPoints);
      xOffset += textWidth(char) + tracking; // Adjust xOffset for tracking
    }
    yOffset += leading; // Adjust yOffset for leading
  }

  // Add more particles for each character
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let vehicle = new Vehicle(pt.x, pt.y);
    vehicles.push(vehicle);
    for (let j = 0; j < 1; j++) { // Reduce the number of additional particles
      let dotsOffsetX = random(-4, 4); 
      let dotsOffsetY = random(-4, 4); 
      let vehicle = new Vehicle(pt.x + dotsOffsetX, pt.y + dotsOffsetY);
      vehicles.push(vehicle);
    }
  }

  // Setup handpose v.1.0
  // video = createCapture(VIDEO);
  // video.size(width, height);
  
  //draw video capture feed as image inside p5 canvas
  // handpose = ml5.handpose(video, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  // handpose.on("predict", results => {
  //   predictions = results;
  // });

  // Hide the video element below, just show the canvas
  // video.hide();

  // Setup handpose v.2.0
  push();
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handPose.detectStart(video, gotHands);
  pop();

  // frameRate(70);
  noCursor(); 
  trailX = width / 2; 
  trailY = height / 2;
}

// function modelReady() {
//   console.log("Model is working now :D");
// }

// Create fingers as keypoints
// function createFinger(name, points, color) {
//   return {
//     name: name,
//     points: points,
//     color: color
//   };
// }

function draw() {
  background(0);

  // Process keypoints without drawing them
  processKeypoints();

  for (let i = 0; i < vehicles.length; i++) {
    let v = vehicles[i];
    v.behaviors();
    v.seekMouse(cursorX, cursorY);
    v.update();
    v.show();
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}

function processKeypoints() {
  // if (predictions.length > 0) {
  //   let prediction = predictions[0];
   
  //   // Add the points for each finger
  //   let fingers = [
  //     createFinger("thumb", prediction.annotations.thumb, 'red'),
  //     createFinger("indexFinger", prediction.annotations.indexFinger, 'green'),
  //     createFinger("middleFinger", prediction.annotations.middleFinger, 'blue'),
  //     createFinger("ringFinger", prediction.annotations.ringFinger, 'yellow'),
  //     createFinger("pinky", prediction.annotations.pinky, 'purple')
  //   ];

  //   // Draw the keypoints
  //   for (let i = 0; i < fingers.length; i += 1) {
  //     let finger = fingers[i];
  //     fill(finger.color);
  //     noStroke();
  //     ellipse(finger.points[3][0], finger.points[3][1], 10, 10);
  //   }

  //   // Get the current position of the thumb tip
  //   thumbCurrPos = fingers[0].points[3]; // Thumb tip

  //   // Calculate the speed of the thumb
  //   if (thumbPrevPos) {
  //     let distance = dist(thumbPrevPos[0], thumbPrevPos[1], thumbCurrPos[0], thumbCurrPos[1]);
  //     thumbSpeed = distance / (1 / frameRate()); // Speed = distance / time
  //     console.log("Speed of the thumb:", thumbSpeed);

  //     // Check if the thumb is moving from right to left
  //     let isMovingRightToLeft = thumbPrevPos[0] > thumbCurrPos[0];

  //     // Calculate the distance between the thumb and pinky finger
  //     let pinkyTip = fingers[4].points[3]; // Pinky tip
  //     let thumbPinkyDistance = dist(thumbCurrPos[0], thumbCurrPos[1], pinkyTip[0], pinkyTip[1]);
  //     console.log("Distance between thumb and pinky:", thumbPinkyDistance);

  //     // Check conditions and update textContent
  //     if (thumbSpeed > 1000 && thumbPinkyDistance > 100 && isMovingRightToLeft) {
  //       if (textContent === para1.toUpperCase()) {
  //         textContent = para2.toUpperCase();
  //       } else if (textContent === para2.toUpperCase()) {
  //         textContent = para3.toUpperCase();
  //       } else if (textContent === para3.toUpperCase()) {
  //         textContent = para4.toUpperCase();
  //       } else if (textContent === para4.toUpperCase()) {
  //         textContent = para5.toUpperCase();
  //       } else if (textContent === para5.toUpperCase()) {
  //         textContent = para6.toUpperCase();
  //       } else if (textContent === para6.toUpperCase()) {
  //         textContent = para7.toUpperCase();
  //       } else if (textContent === para7.toUpperCase()) {
  //         textContent = para8.toUpperCase();
  //       } else if (textContent === para8.toUpperCase()) {
  //         textContent = para9.toUpperCase();
  //       } else if (textContent === para9.toUpperCase()) {
  //         textContent = para10.toUpperCase();
  //       } else if (textContent === para10.toUpperCase()) {
  //         textContent = para11.toUpperCase();
  //       } else if (textContent === para11.toUpperCase()) {
  //         textContent = para1.toUpperCase();
  //       }
        
  //       updateTextContent();
  //     }
  //   }

  //   // Update the previous position of the thumb
  //   thumbPrevPos = thumbCurrPos;
  // }
  
  // Draw the fingertips and calculate thumb speed and distance to pinky
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    // Get the current position of the thumb and pinky tips
    thumbCurrPos = hand.keypoints[4]; // Thumb tip
    let pinkyCurrPos = hand.keypoints[20]; // Pinky tip

    // Calculate the speed of the thumb
    if (thumbPrevPos) {
      let distance = dist(thumbPrevPos.x, thumbPrevPos.y, thumbCurrPos.x, thumbCurrPos.y);
      thumbSpeed = distance / (1 / frameRate()); // Speed = distance / time
      console.log("Speed of the thumb:", thumbSpeed);

      // Check if the thumb is moving from left to right
      let isMovingLeftToRight = thumbPrevPos.x > thumbCurrPos.x;

      // Calculate the distance between the thumb tip and the index finger tip
      let thumbTip = hand.keypoints[4]; 
      let indexTip = hand.keypoints[8]; 
      let pinchDistance = dist(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y);
    
      console.log("Pinch Distance is: " + pinchDistance);

      // Show the cursor only if the fingers are pinched together
      showCursor = pinchDistance < 110; 

      // Check conditions and update textContent
      if (thumbSpeed > 7000 && pinchDistance > 110 && isMovingLeftToRight) {
        console.log("Conditions met for updating textContent");
        updateTextContent();
      }
    }

    // Update the previous position of the thumb
    thumbPrevPos = thumbCurrPos;

    // Map the index finger to the mouse cursor
    let indexFingerPos = hand.keypoints[8]; 
    cursorX = width - indexFingerPos.x;
    cursorY = indexFingerPos.y;
    
    // if (showCursor) {
    //   // Trailing circle
    //   fill(255, 127);
    //   noStroke();
    //   ellipse(trailX, trailY, 30, 30);

    //   // Update trailing circle
    //   let dx = cursorX - trailX;
    //   let dy = cursorY - trailY;
    //   trailX += dx * easing;
    //   trailY += dy * easing;
    // }
  }
}

class Vehicle {
  constructor(x, y) {
    this.pos = createVector(random(width), random(height));
    this.target = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    // Radius/size of each particle
    this.r = 0.8;
    this.maxspeed = 10;
    this.maxforce = 2;
    this.speed = 1.2;
  }

  // Method to handle the behaviors of the vehicle
  behaviors() {
    let arrive = this.arrive(this.target);
    let seek = this.seek(this.target);
    this.applyForce(arrive);
    this.applyForce(seek);
  }

  // Method to apply a force to the vehicle
  applyForce(force) {
    this.acc.add(force);
  }

  // Calculate the force needed to arrive at the target
  arrive(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    // Slows down as it approaches the target)
    let speed = this.maxspeed;
    if (d < 100) {
      speed = map(d, 0, 100, 0, this.maxspeed);
    }
    // Set the magnitude of the desired vector to the calculated speed
    desired.setMag(speed);
    // Calculate the steering force
    let steer = p5.Vector.sub(desired, this.vel);
    // Limit the steering force to the maximum force
    steer.limit(this.maxforce);
    return steer;
  }

  // Method to calculate the force needed to seek the target
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    // Set the magnitude of the desired vector to the maximum speed
    desired.setMag(this.maxspeed);
    let steer = p5.Vector.sub(desired, this.vel);
    // Limit the steering force to the maximum force
    steer.limit(this.maxforce);
    return steer;
  }

  // Update the position of the vehicle
  update() {
    // Update the velocity based on the acceleration
    this.vel.add(this.acc);
    // Update the position based on the velocity
    this.pos.add(this.vel);
    // Reset acc to 0
    this.acc.mult(0);
    this.speed = this.vel.mag(); 
  }

  // Animation: how the particles form together
  show() {
    stroke(255);
    strokeWeight(map(this.speed, 0, this.maxspeed, 1.3, 0.01)); 
    point(this.pos.x, this.pos.y);
  }

  seekMouse(cursorX, cursorY) {
    let mouse = createVector(cursorX, cursorY);
    let seekForce = this.seek(mouse);
    this.applyForce(seekForce);
  }
}

// Update the text content and create particles for each character
function updateTextContent() {
  if (!canUpdateTextContent) return;

  // Avoiding multiple updates in a short time
  canUpdateTextContent = false;
  setTimeout(() => {
    canUpdateTextContent = true;
  }, 2000);

  // Update textContent in order
  if (textContent === paraInstruction0.toUpperCase()) {
    textContent = paraInstruction1.toUpperCase();
  } else if (textContent === paraInstruction1.toUpperCase()) {
    textContent = paraInstruction2.toUpperCase();
  } else if (textContent === paraInstruction2.toUpperCase()) {
    textContent = paraInstruction3.toUpperCase();
  } else if (textContent === paraInstruction3.toUpperCase()) {
    textContent = para1.toUpperCase();
  } else if (textContent === para1.toUpperCase()) {
    textContent = para2.toUpperCase();
    fadeIn(fridgeSound);
  } else if (textContent === para2.toUpperCase()) {
    textContent = para3.toUpperCase(); 
    if (curtainSound) { 
      curtainSound.play();
    }
  } else if (textContent === para3.toUpperCase()) {
    textContent = para4.toUpperCase();
    fadeIn(tapSound);
  } else if (textContent === para4.toUpperCase()) {
    textContent = para5.toUpperCase();
    fadeOut(fridgeSound);
    fadeOut(tapSound);
    fadeIn(streetSound);
  } else if (textContent === para5.toUpperCase()) {
    textContent = para6.toUpperCase();
  } else if (textContent === para6.toUpperCase()) {
    textContent = para7.toUpperCase();
    fadeIn(washingMachineSound);
  } else if (textContent === para7.toUpperCase()) {
    textContent = para8.toUpperCase();
    fadeOut(streetSound);
    fadeOut(washingMachineSound);
    if (houseDoorSound) { 
      houseDoorSound.play();
    }
  } else if (textContent === para8.toUpperCase()) {
    textContent = para9.toUpperCase();
    if (lightOnSound) { 
      lightOnSound.play();
      lightOnSound.onended = function() { // Play footstepsSound once lightOnSound ends
        footstepsSound.play();
      };
    }
  } else if (textContent === para9.toUpperCase()) {
    textContent = para10.toUpperCase();
    if (oldWindowSound) { 
      oldWindowSound.play();
    }
    fadeIn(tickingSound);
  } else if (textContent === para10.toUpperCase()) {
    textContent = para11.toUpperCase();
    fadeIn(clockSound);
  } else if (textContent === para11.toUpperCase()) {
    textContent = para1.toUpperCase();
    fadeOut(tickingSound);
  }

  console.log("Updating textContent to:", textContent); // Debug: Log textContent update

  // Clear the canvas and redraw the text content
  vehicles = [];
  let points = [];
  let tracking = 4; // Tracking in pixels
  let leading = 70; // Leading in pixels

  // Split text
  let lines = textContent.split('\n');
  let yOffset = 0;
  let totalHeight = lines.length * leading; // Total height of text block
  let yCenterOffset = (windowHeight - totalHeight + leading) / 2; // Vertical offset for centering

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let xOffset = 2;
    for (let j = 0; j < line.length; j++) {
      let char = line[j];
      let charPoints = optimaFont.textToPoints(char, 50 + xOffset, yCenterOffset + yOffset, 52, { 
        sampleFactor: 0.18 // Increase sampleFactor to reduce the number of particles
      });
      points = points.concat(charPoints);
      xOffset += textWidth(char) + tracking; // Adjust xOffset for tracking
    }
    yOffset += leading; // Adjust yOffset for leading
  }

  // Add more particles for each character
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let vehicle = new Vehicle(pt.x, pt.y);
    vehicles.push(vehicle);
    for (let j = 0; j < 1; j++) { // Reduce the number of additional particles
      let dotsOffsetX = random(-4, 4); 
      let dotsOffsetY = random(-4, 4); 
      let vehicle = new Vehicle(pt.x + dotsOffsetX, pt.y + dotsOffsetY);
      vehicles.push(vehicle);
    }
  }
}

function fadeIn(audioElement) {
  let volume = 0;
  audioElement.volume = volume;
  audioElement.play();
  let fadeInterval = setInterval(() => {
    if (volume < 0.6) {
      volume += 0.01;
      audioElement.volume = volume;
    } else {
      clearInterval(fadeInterval);
    }
  }, 10); // Adjust the interval time for a smoother fade
}

function fadeOut(audioElement) {
  let volume = audioElement.volume;
  let fadeInterval = setInterval(() => {
    if (volume > 0) {
      volume -= 0.01;
      audioElement.volume = volume;
    } else {
      audioElement.pause();
      clearInterval(fadeInterval);
    }
  }, 10); // Adjust the interval time for a smoother fade
}

//Coded with Copilot
//Other references: 
//text particle by jlee334: https://editor.p5js.org/jlee334/sketches/resjxVski 
//ml5js-fingertipsinhats-webcam by vyasakanksha: https://editor.p5js.org/vyasakanksha/sketches/4-E2ThsHY/