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

export function initialise() {
  //Scripts
  //--------------------------------
  this.scripts.customRunStart = runStart;
  this.scripts.customRunAction = runAction;
  this.scripts.customRunEnd = runEnd;
  this.scripts.prePaint = prePaint;
  this.scripts.postPaint = postPaint;
  //--------------------------------
  
  //Images
  //--------------------------------
  this.assets.images.actor = new ImageAsset("assets/cny2017/actor.png");
  this.assets.images.sarcophagus = new ImageAsset("assets/cny2017/sarcophagus.png");
  this.assets.images.comicPanelA = new ImageAsset("assets/cny2017/comic-panel-800x600-red.png");
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
    
    sarcophagus: {
      rule: AVO.ANIMATION_RULE_BASIC,
      tileWidth: 64,
      tileHeight: 128,
      tileOffsetX: 0,
      tileOffsetY: -32,
      actions: {
        idle: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: 1 }
          ],
        },
        glow: {
          loop: true,
          steps: [
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
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
  /*if (this.pointer.state === AVO.INPUT_ACTIVE || 
      this.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.SPACE].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.ENTER].state === AVO.INPUT_ACTIVE) {
    this.changeState(AVO.STATE_COMIC, comicStart);
  }*/
  
  this.changeState(AVO.STATE_COMIC, comicStart);
}

function comicStart() {
  this.comicStrip = new ComicStrip(
    "startcomic",
    [ //this.assets.images.comicPanelA,
      //this.assets.images.comicPanelB,
      //this.assets.images.comicPanelC,
    ],
    comicStartFinished);
  this.comicStrip.start();
}

function comicStartFinished() {
  this.changeState(AVO.STATE_ACTION, initialiseLevel);
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
}

function initialiseLevel() {
  //Reset
  this.actors = [];
  this.areasOfEffect = [];
  this.refs = {};
  this.store = {
    distance: 0,
    TARGET_DISTANCE: 10000000,
    flyingSpeed: 0,
    FLYING_SPEED_MIN: 2,
    FLYING_SPEED_MAX: 16,
    time: 0,
  };
  
  const midX = this.canvasWidth / 2, midY = this.canvasHeight / 2;
  
  this.refs[AVO.REF.PLAYER] = new Actor(AVO.REF.PLAYER, midX / 2, midY, 32, AVO.SHAPE_CIRCLE);
  //this.refs[AVO.REF.PLAYER].spritesheet = this.assets.images.actor;
  //this.refs[AVO.REF.PLAYER].animationSet = this.animationSets.actor;
  this.refs[AVO.REF.PLAYER].attributes[AVO.ATTR.SPEED] = 8;
  this.refs[AVO.REF.PLAYER].rotation = AVO.ROTATION_EAST;
  this.actors.push(this.refs[AVO.REF.PLAYER]);
}

function prePaint() {
  if (this.state !== AVO.STATE_ACTION) return;
  
  const backgroundOffset = Math.floor((this.store.distance * 1) % this.canvasWidth);
  
  this.context2d.fillStyle = "#069";
  this.context2d.fillRect(-backgroundOffset, 0, this.canvasWidth, this.canvasHeight);
  this.context2d.fillStyle = "#39c";
  this.context2d.fillRect(-backgroundOffset + this.canvasWidth, 0, this.canvasWidth, this.canvasHeight);
}

function postPaint() {
  if (this.state !== AVO.STATE_ACTION) return;
  
  const distanceLeft = this.store.TARGET_DISTANCE - this.store.distance;
  const time = Math.floor(this.store.time / this.appConfig.framesPerSecond);
  let miliseconds = (Math.floor(this.store.time / this.appConfig.framesPerSecond * 1000) % 1000).toString();
  while (miliseconds.length < 3) { miliseconds = "0" + miliseconds; }
  let seconds = time % 60; seconds = (seconds >= 10) ? seconds : "0" + seconds;
  let minutes = Math.floor(time / 60); minutes = (minutes >= 10) ? minutes : "0" + minutes;
  
  this.context2d.font = AVO.DEFAULT_FONT;
  this.context2d.textAlign = "center";
  this.context2d.textBaseline = "middle";
  this.context2d.fillStyle = "#000";
  this.context2d.fillText(minutes + ":" + seconds + "." + miliseconds, this.canvasWidth * 0.5, this.canvasHeight * 0.8); 
  this.context2d.closePath();
  this.context2d.fillText(this.store.distance, this.canvasWidth * 0.5, this.canvasHeight * 0.9); 
  this.context2d.closePath();
}