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
  this.scripts.runStart = runStart;
  this.scripts.runAction = runAction;
  this.scripts.runEnd = runEnd;
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
}

function initialiseLevel() {
  //Reset
  this.actors = [];
  this.areasOfEffect = [];
  this.refs = {};
  
  const midX = this.canvasWidth / 2, midY = this.canvasHeight / 2;
  
  this.refs[AVO.REF.PLAYER] = new Actor(AVO.REF.PLAYER, midX, midY, 32, AVO.SHAPE_CIRCLE);
  this.refs[AVO.REF.PLAYER].spritesheet = this.assets.images.actor;
  this.refs[AVO.REF.PLAYER].animationSet = this.animationSets.actor;
  this.refs[AVO.REF.PLAYER].attributes[AVO.ATTR.SPEED] = 8;
  this.refs[AVO.REF.PLAYER].rotation = AVO.ROTATION_EAST;
  this.actors.push(this.refs[AVO.REF.PLAYER]);
}
