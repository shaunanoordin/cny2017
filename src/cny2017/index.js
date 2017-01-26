/*
CNY2017
============

Happy Chinese New Year!

(Shaun A. Noordin || shaunanoordin.com || 20170115)
********************************************************************************
 */

import { AvO, ComicStrip } from "../avo/index.js";
import { Actor, AoE, Effect } from "../avo/entities.js";
import * as AVO from  "../avo/constants.js";
import { ImageAsset } from "../avo/utility.js";

const FIREWORK_MISSILE = "firework_missile";

export function initialise() {
  //Scripts
  //--------------------------------
  this.scripts.customRunStart = runStart;
  this.scripts.customRunAction = runAction;
  this.scripts.customRunEnd = runEnd;
  this.scripts.prePaint = prePaint;
  this.scripts.postPaint = postPaint;
  this.spawnRandomObstacle = spawnRandomObstacle.bind(this);
  //--------------------------------
  
  //Images
  //--------------------------------
  this.assets.images.rooster = new ImageAsset("assets/cny2017/rooster.png");
  this.assets.images.background = new ImageAsset("assets/cny2017/city-background.png");
  this.assets.images.comicIntro = new ImageAsset("assets/cny2017/comic-intro.png");
  this.assets.images.comicWin = new ImageAsset("assets/cny2017/comic-win.png");
  this.assets.images.comicLose = new ImageAsset("assets/cny2017/comic-lose.png");
  //--------------------------------
  
  //Animations
  //--------------------------------
  const STEPS_PER_SECOND = AVO.FRAMES_PER_SECOND / 10;
  this.animationSets = {
    actor: {
      rule: AVO.ANIMATION_RULE_DIRECTIONAL,
      tileWidth: 64,
      tileHeight: 64,
      tileOffsetX: 0,
      tileOffsetY: -16,
      actions: {
        idle: {
          loop: true,
          steps: [
            { row: 0, duration: 1 }
          ],
        },
        move: {
          loop: true,
          steps: [
            { row: 1, duration: STEPS_PER_SECOND },
            { row: 2, duration: STEPS_PER_SECOND },
            { row: 3, duration: STEPS_PER_SECOND },
            { row: 4, duration: STEPS_PER_SECOND },
            { row: 5, duration: STEPS_PER_SECOND },
            { row: 4, duration: STEPS_PER_SECOND },
            { row: 3, duration: STEPS_PER_SECOND },
            { row: 2, duration: STEPS_PER_SECOND },
          ],
        },
      },
    },
    
    rooster: {
      rule: AVO.ANIMATION_RULE_BASIC,
      tileWidth: 128,
      tileHeight: 128,
      tileOffsetX: -32,
      tileOffsetY: 0,
      actions: {
        idle: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: STEPS_PER_SECOND * 1 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 1 },
            { col: 0, row: 2, duration: STEPS_PER_SECOND * 1 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 1 },
          ],
        },
        walk: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: STEPS_PER_SECOND * 1 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 1 },
            { col: 0, row: 2, duration: STEPS_PER_SECOND * 1 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 1 },
          ],
        },
      },
    },
  };
  
  //Process Animations; expand steps to many frames per steps.
  for (let animationTitle in this.animationSets) {
    let animationSet = this.animationSets[animationTitle];
    for (let animationName in animationSet.actions) {
      let animationAction = animationSet.actions[animationName];
      let newSteps = [];
      for (let step of animationAction.steps) {
        for (let i = 0; i < step.duration; i++) { newSteps.push(step); }
      }
      animationAction.steps = newSteps;
    }
  }
  //--------------------------------
}

function runStart() {
  //this.changeState(AVO.STATE_COMIC, playIntroComic);
  this.changeState(AVO.STATE_ACTION, initialiseLevel);
}

function playIntroComic() {
  this.comicStrip = new ComicStrip(
    "introcomic",
    [ this.assets.images.comicIntro ],
    finishIntroComic);
}

function finishIntroComic() {
  this.changeState(AVO.STATE_ACTION, initialiseLevel);
}

function playWinComic() {
  this.comicStrip = new ComicStrip(
    "win_comic",
    [ this.assets.images.comicWin ],
    finishIntroComic);
}

function finishWinComic() {
  this.changeState(AVO.STATE_COMIC, playIntroComic);
}

function playLoseComic() {
  this.comicStrip = new ComicStrip(
    "lose_comic",
    [ this.assets.images.comicLose ],
    finishIntroComic);
}

function finishLoseComic() {
  this.changeState(AVO.STATE_COMIC, playIntroComic);
}

function runEnd() {}

function runAction() {
  if (this.refs[AVO.REF.PLAYER].x < 0) this.refs[AVO.REF.PLAYER].x = 0;
  if (this.refs[AVO.REF.PLAYER].y < 0) this.refs[AVO.REF.PLAYER].y = 0;
  if (this.refs[AVO.REF.PLAYER].x > this.canvasWidth) this.refs[AVO.REF.PLAYER].x = this.canvasWidth;
  if (this.refs[AVO.REF.PLAYER].y > this.canvasHeight) this.refs[AVO.REF.PLAYER].y = this.canvasHeight;
  
  this.store.flyingSpeed = Math.floor(
    (this.refs[AVO.REF.PLAYER].x / this.canvasWidth) * 
    (this.store.FLYING_SPEED_MAX - this.store.FLYING_SPEED_MIN) +
    this.store.FLYING_SPEED_MIN
  );
  this.store.time++;
  this.store.distance += this.store.flyingSpeed;
  
  //Win condition?
  if (this.store.distance >= this.store.TARGET_DISTANCE) {
    this.changeState(AVO.STATE_COMIC, playWinComic);
  }
  
  this.actors.map((actor) => {
    if (actor === this.refs[AVO.REF.PLAYER]) return;
    
    if (actor.name === FIREWORK_MISSILE) {
      actor.y -= actor.attributes[AVO.ATTR.SPEED];
    }
    
    actor.x -= this.store.flyingSpeed;
    
    if (this.isATouchingB(actor, this.refs[AVO.REF.PLAYER])) {
      this.changeState(AVO.STATE_COMIC, playLoseComic);
    }
  });
  
  this.spawnRandomObstacle(1000);
}

function initialiseLevel() {
  //Reset
  this.actors = [];
  this.areasOfEffect = [];
  this.refs = {};
  this.store = {
    distance: 0,
    TARGET_DISTANCE: 10000,
    flyingSpeed: 0,
    FLYING_SPEED_MIN: 2,
    FLYING_SPEED_MAX: 16,
    time: 0,
    GOSH_YOU_ARE_LATE_TIME: 45 * AVO.FRAMES_PER_SECOND,
  };
  
  const midX = this.canvasWidth / 2, midY = this.canvasHeight / 2;
  
  this.refs[AVO.REF.PLAYER] = new Actor(AVO.REF.PLAYER, midX / 2, midY, 64, AVO.SHAPE_CIRCLE);
  this.refs[AVO.REF.PLAYER].spritesheet = this.assets.images.rooster;
  this.refs[AVO.REF.PLAYER].animationSet = this.animationSets.rooster;
  this.refs[AVO.REF.PLAYER].attributes[AVO.ATTR.SPEED] = 8;
  this.refs[AVO.REF.PLAYER].rotation = AVO.ROTATION_EAST;
  this.actors.push(this.refs[AVO.REF.PLAYER]);
}

function spawnRandomObstacle(n = 100) {
  const r = Math.random() * n;
  if (r < 50) {
    const actor = new Actor(FIREWORK_MISSILE, Math.floor(this.canvasWidth * 1.10), Math.floor(this.canvasHeight * (Math.random() * 0.5 + 1)), 32, AVO.SHAPE_CIRCLE);
    actor.attributes[AVO.ATTR.SPEED] = Math.floor(Math.random() * 8 + 4);
    this.actors.push(actor);
  }
  
  
}

function prePaint() {
  if (this.state === AVO.STATE_ACTION) {
    //Paint the sky.
    //const percentage = Math.max(0, Math.min(1, this.store.distance / this.store.TARGET_DISTANCE));
    const percentage = Math.max(0, Math.min(1, this.store.time / this.store.GOSH_YOU_ARE_LATE_TIME))
    const gradient = this.context2d.createLinearGradient(0, this.canvasHeight * 0.2, 0, this.canvasHeight * 0.8);
    const COLOUR_MORNING_TOP = { R: 102, G: 204, B: 255 };
    const COLOUR_MORNING_BOTTOM = { R: 255, G: 255, B: 255 };
    const COLOUR_EVENING_TOP = { R: 153, G: 51, B: 0 };
    const COLOUR_EVENING_BOTTOM = { R: 255, G: 153, B: 0 };
    const top_r = Math.floor(COLOUR_MORNING_TOP.R + percentage * (COLOUR_EVENING_TOP.R - COLOUR_MORNING_TOP.R));
    const top_g = Math.floor(COLOUR_MORNING_TOP.G + percentage * (COLOUR_EVENING_TOP.G - COLOUR_MORNING_TOP.G));
    const top_b = Math.floor(COLOUR_MORNING_TOP.B + percentage * (COLOUR_EVENING_TOP.B - COLOUR_MORNING_TOP.B));
    const bottom_r = Math.floor(COLOUR_MORNING_BOTTOM.R + percentage * (COLOUR_EVENING_BOTTOM.R - COLOUR_MORNING_BOTTOM.R));
    const bottom_g = Math.floor(COLOUR_MORNING_BOTTOM.G + percentage * (COLOUR_EVENING_BOTTOM.G - COLOUR_MORNING_BOTTOM.G));
    const bottom_b = Math.floor(COLOUR_MORNING_BOTTOM.B + percentage * (COLOUR_EVENING_BOTTOM.B - COLOUR_MORNING_BOTTOM.B));
    
    gradient.addColorStop(0, "rgba("+top_r+","+top_g+","+top_b+",1)");
    gradient.addColorStop(1, "rgba("+bottom_r+","+bottom_g+","+bottom_b+",1)");
    
    this.context2d.fillStyle = gradient;
    this.context2d.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    //Paint the city background.
    const backgroundOffset = Math.floor((this.store.distance * 1) % this.canvasWidth);
    this.context2d.drawImage(this.assets.images.background.img, -backgroundOffset, 0);
    this.context2d.drawImage(this.assets.images.background.img, -backgroundOffset + this.canvasWidth, 0);
    
    //if (this.store.prevBGOffset > backgroundOffset) this.store.bgFlip = !this.store.bgFlip;
    //this.store.prevBGOffset = backgroundOffset;
    
    //this.context2d.fillStyle = (this.store.bgFlip) ? "#069" : "#39c";
    //this.context2d.fillRect(-backgroundOffset, 0, this.canvasWidth, this.canvasHeight);
    //this.context2d.fillStyle = (this.store.bgFlip) ? "#39c" : "#069";
    //this.context2d.fillRect(-backgroundOffset + this.canvasWidth, 0, this.canvasWidth, this.canvasHeight);
  }
}

function postPaint() {
  if (this.state === AVO.STATE_ACTION) {
    //Paint the UI: Time
    const time = Math.floor(this.store.time / this.appConfig.framesPerSecond);
    let miliseconds = (Math.floor(this.store.time / this.appConfig.framesPerSecond * 1000) % 1000).toString();
    while (miliseconds.length < 3) { miliseconds = "0" + miliseconds; }
    let seconds = time % 60; seconds = (seconds >= 10) ? seconds : "0" + seconds;
    let minutes = Math.floor(time / 60); minutes = (minutes >= 10) ? minutes : "0" + minutes;
    this.context2d.font = AVO.DEFAULT_FONT;
    this.context2d.textAlign = "center";
    this.context2d.textBaseline = "middle";
    this.context2d.fillStyle = "#000";
    this.context2d.fillText(minutes + ":" + seconds + "." + miliseconds, this.canvasWidth * 0.5, this.canvasHeight * 0.05); 
    
    //Paint the UI: Distance to target
    this.context2d.fillText(Math.floor(this.store.distance / 10) + "m", this.canvasWidth * 0.5, this.canvasHeight * 0.95);
    const distStartX = this.canvasWidth * 0.25;
    const distEndX = this.canvasWidth * 0.75;
    const distMidY = this.canvasHeight * 0.9;
    const distRadius = 16;
    this.context2d.fillStyle = "#fc3";
    this.context2d.strokeStyle = "#666";
    this.context2d.lineWidth = 3;
    this.context2d.beginPath();
    this.context2d.arc(distStartX, distMidY, distRadius, 0, 2 * Math.PI);
    this.context2d.closePath();
    this.context2d.stroke();
    this.context2d.beginPath();
    this.context2d.arc(distEndX, distMidY, distRadius, 0, 2 * Math.PI);
    this.context2d.closePath();
    this.context2d.stroke();
    this.context2d.beginPath();
    this.context2d.moveTo(distStartX + distRadius, distMidY);
    this.context2d.lineTo(distEndX - distRadius, distMidY);
    this.context2d.closePath();
    this.context2d.stroke();
    
    const currentX = this.store.distance / this.store.TARGET_DISTANCE * (distEndX - distStartX) + distStartX;
    this.context2d.beginPath();
    this.context2d.arc(currentX, distMidY, distRadius, 0, 2 * Math.PI);
    this.context2d.closePath();
    this.context2d.fill();
    
    //Paint the UI: Paint cursor
    if (this.pointer.state === AVO.INPUT_ACTIVE) {
      const player = this.refs[AVO.REF.PLAYER];
      
      this.context2d.fillStyle = "#633";
      this.context2d.strokeStyle = "#933";
      this.context2d.lineWidth = 2;
      this.context2d.beginPath();
      this.context2d.arc(this.pointer.start.x, this.pointer.start.y, AVO.INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2, 0, 2 * Math.PI);
      this.context2d.moveTo(this.pointer.start.x, this.pointer.start.y);
      this.context2d.closePath();
      this.context2d.stroke();
      
      this.context2d.beginPath();
      this.context2d.arc(this.pointer.now.x, this.pointer.now.y, AVO.INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2, 0, 2 * Math.PI);
      this.context2d.closePath();
      this.context2d.fill();
      
      this.context2d.beginPath();
      this.context2d.moveTo(this.pointer.start.x + 0,  this.pointer.start.y + 48);
      this.context2d.lineTo(this.pointer.start.x + 16, this.pointer.start.y + 40);
      this.context2d.lineTo(this.pointer.start.x - 16, this.pointer.start.y + 40);
      this.context2d.closePath();
      this.context2d.stroke();
      
      this.context2d.beginPath();
      this.context2d.moveTo(this.pointer.start.x + 0,  this.pointer.start.y - 48);
      this.context2d.lineTo(this.pointer.start.x + 16, this.pointer.start.y - 40);
      this.context2d.lineTo(this.pointer.start.x - 16, this.pointer.start.y - 40);
      this.context2d.closePath();
      this.context2d.stroke();
      
      this.context2d.beginPath();
      this.context2d.moveTo(this.pointer.start.x + 48, this.pointer.start.y + 0);
      this.context2d.lineTo(this.pointer.start.x + 40, this.pointer.start.y + 16);
      this.context2d.lineTo(this.pointer.start.x + 40, this.pointer.start.y - 16);
      this.context2d.closePath();
      this.context2d.stroke();
      
      this.context2d.beginPath();
      this.context2d.moveTo(this.pointer.start.x - 48, this.pointer.start.y + 0);
      this.context2d.lineTo(this.pointer.start.x - 40, this.pointer.start.y + 16);
      this.context2d.lineTo(this.pointer.start.x - 40, this.pointer.start.y - 16);
      this.context2d.closePath();
      this.context2d.stroke();
      
      this.context2d.stroke();
    }
  } else if (this.state === AVO.STATE_COMIC && this.comicStrip &&
      this.comicStrip.currentPanel === 0 && this.comicStrip.state === AVO.COMIC_STRIP_STATE_IDLE) {
    //Paint the UI: Time
    const time = Math.floor(this.store.time / this.appConfig.framesPerSecond);
    let miliseconds = (Math.floor(this.store.time / this.appConfig.framesPerSecond * 1000) % 1000).toString();
    while (miliseconds.length < 3) { miliseconds = "0" + miliseconds; }
    let seconds = time % 60; seconds = (seconds >= 10) ? seconds : "0" + seconds;
    let minutes = Math.floor(time / 60); minutes = (minutes >= 10) ? minutes : "0" + minutes;
    this.context2d.font = AVO.DEFAULT_FONT;
    this.context2d.textAlign = "center";
    this.context2d.textBaseline = "middle";
    this.context2d.fillStyle = "#000";
    this.context2d.fillText(minutes + ":" + seconds + "." + miliseconds, this.canvasWidth * 0.5, this.canvasHeight * 0.15);
  }
}
