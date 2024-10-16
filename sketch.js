let vehicles = [];
let optimaFont;
let handpose;
let video;
let predictions = [];
let thumbPrevPos = null;
let thumbCurrPos = null;
let thumbSpeed = 0;
let canUpdateTextContent = true;

let textContent;
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
textContent = para1.toUpperCase();



function preload() {
  optimaFont = loadFont('optimaMedium.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  textSize(64);
  textAlign(LEFT, CENTER);
  textFont(optimaFont); 

  let textContent = para1.toUpperCase();
  let points = [];

  // Split the text into lines and create points for each line
  let lines = textContent.split('\n');
  let yOffset = 0;
  let totalHeight = lines.length * 90; // Calculate total height of the text block

  // Calculate the vertical offset [USED FOR CENTERING THE TEXT]
  let yCenterOffset = (windowHeight - totalHeight + 90) / 2;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // For the font size for the particle text
    let linePoints = optimaFont.textToPoints(line, 50, yCenterOffset + yOffset, 64, { 
      sampleFactor: 0.13 // Increase sampleFactor to reduce the number of particles
    });
    points = points.concat(linePoints);
    yOffset += 90; // For leading
  }

  // Add more particles for each character
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let vehicle = new Vehicle(pt.x, pt.y);
    vehicles.push(vehicle);

    // Add fewer random particles for each character
    for (let j = 0; j < 2; j++) { // Reduce the number of additional particles
      let offsetX = random(-5, 5); // Reduce the offset range
      let offsetY = random(-5, 5); 
      let vehicle = new Vehicle(pt.x + offsetX, pt.y + offsetY);
      vehicles.push(vehicle);
    }
  }

  // Setup handpose
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);

  handpose = ml5.handpose(video, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
  });

  // Hide the video element below, just show the canvas
  video.hide();
}

function modelReady() {
  console.log("Model is working now :D");
}

// Create fingers as keypoints
function createFinger(name, points, color) {
  return {
    name: name,
    points: points,
    color: color
  };
}

function draw() {
  background(0);

  // Process keypoints without drawing them
  processKeypoints();

  for (let i = 0; i < vehicles.length; i++) {
    let v = vehicles[i];
    v.behaviors();
    v.seekMouse();
    v.update();
    v.show();
  }
}

function processKeypoints() {
  if (predictions.length > 0) {
    let prediction = predictions[0];
   
    // Add the points for each finger
    let fingers = [
      createFinger("thumb", prediction.annotations.thumb, 'red'),
      createFinger("indexFinger", prediction.annotations.indexFinger, 'green'),
      createFinger("middleFinger", prediction.annotations.middleFinger, 'blue'),
      createFinger("ringFinger", prediction.annotations.ringFinger, 'yellow'),
      createFinger("pinky", prediction.annotations.pinky, 'purple')
    ];

    // Draw the keypoints
    // for (let i = 0; i < fingers.length; i += 1) {
    //   let finger = fingers[i];
    //   fill(finger.color);
    //   noStroke();
    //   ellipse(finger.points[3][0], finger.points[3][1], 10, 10);
    // }

    // Get the current position of the thumb tip
    thumbCurrPos = fingers[0].points[3]; // Thumb tip

    // Calculate the speed of the thumb
    if (thumbPrevPos) {
      let distance = dist(thumbPrevPos[0], thumbPrevPos[1], thumbCurrPos[0], thumbCurrPos[1]);
      thumbSpeed = distance / (1 / frameRate()); // Speed = distance / time
      console.log("Speed of the thumb:", thumbSpeed);

      // Check if the thumb is moving from right to left
      let isMovingRightToLeft = thumbPrevPos[0] > thumbCurrPos[0];

      // Calculate the distance between the thumb and pinky finger
      let pinkyTip = fingers[4].points[3]; // Pinky tip
      let thumbPinkyDistance = dist(thumbCurrPos[0], thumbCurrPos[1], pinkyTip[0], pinkyTip[1]);
      console.log("Distance between thumb and pinky:", thumbPinkyDistance);

      // Check conditions and update textContent
      if (thumbSpeed > 1000 && thumbPinkyDistance > 100 && isMovingRightToLeft) {
        if (textContent === para1.toUpperCase()) {
          textContent = para2.toUpperCase();
        } else if (textContent === para2.toUpperCase()) {
          textContent = para3.toUpperCase();
        } else if (textContent === para3.toUpperCase()) {
          textContent = para4.toUpperCase();
        } else if (textContent === para4.toUpperCase()) {
          textContent = para5.toUpperCase();
        } else if (textContent === para5.toUpperCase()) {
          textContent = para6.toUpperCase();
        } else if (textContent === para6.toUpperCase()) {
          textContent = para7.toUpperCase();
        } else if (textContent === para7.toUpperCase()) {
          textContent = para8.toUpperCase();
        } else if (textContent === para8.toUpperCase()) {
          textContent = para9.toUpperCase();
        } else if (textContent === para9.toUpperCase()) {
          textContent = para10.toUpperCase();
        } else if (textContent === para10.toUpperCase()) {
          textContent = para11.toUpperCase();
        } else if (textContent === para11.toUpperCase()) {
          textContent = para1.toUpperCase();
        }
        
        updateTextContent();
      }
    }

    // Update the previous position of the thumb
    thumbPrevPos = thumbCurrPos;
  }
}

class Vehicle {
  constructor(x, y) {
    this.pos = createVector(random(width), random(height));
    this.target = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    // Radius/size of each particle
    this.r = 1.5;
    this.maxspeed = 10;
    this.maxforce = 1.5;
    this.speed = 0;
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

  // Method to display the vehicle
  show() {
    stroke(255);
    strokeWeight(map(this.speed, 0, this.maxspeed, 1.3, 0.3)); 
    point(this.pos.x, this.pos.y);
  }

  seekMouse() {
    let mouse = createVector(mouseX, mouseY);
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

  vehicles = [];
  let points = [];

  // Split the text into lines and create points for each line
  let lines = textContent.split('\n');
  let yOffset = 0;
  let totalHeight = lines.length * 90; // Calculate total height of the text block

  // Calculate the vertical offset to center the text block
  let yCenterOffset = (windowHeight - totalHeight + 90) / 2;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // For the font size for the particle text
    let linePoints = optimaFont.textToPoints(line, 50, yCenterOffset + yOffset, 64, { 
      sampleFactor: 0.13 // Increase sampleFactor to reduce the number of particles
    });
    points = points.concat(linePoints);
    yOffset += 90; // For leading
  }

  // Add more particles for each character
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let vehicle = new Vehicle(pt.x, pt.y);
    vehicles.push(vehicle);

    // Add fewer random particles for each character
    for (let j = 0; j < 2; j++) { // Reduce the number of additional particles
      let offsetX = random(-5, 5); // Reduce the offset range
      let offsetY = random(-5, 5); 
      let vehicle = new Vehicle(pt.x + offsetX, pt.y + offsetY);
      vehicles.push(vehicle);
    }
  }
}

//Coded with Copilot
//Other references: 
//text particle by jlee334: https://editor.p5js.org/jlee334/sketches/resjxVski 
//ml5js-fingertipsinhats-webcam by vyasakanksha: https://editor.p5js.org/vyasakanksha/sketches/4-E2ThsHY/
