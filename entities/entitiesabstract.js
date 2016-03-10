var friction = 1;
var maxSpeed = 100;
var minSpeed = 5;


function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    if(this.game) {
        this.ctx = game.ctx;
    }
    this.removeFromWorld = false;
}

Entity.prototype.setLocation = function (X, Y) {
    this.x = X;
    this.y = Y;
}

Entity.prototype.setRemoved = function (bool) {
    this.removeFromWorld = bool;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
		
		//team number
		ctx.beginPath();
		var string = (this.TeamNumber);
		ctx.font = "12px serif";
		ctx.fillStyle = "white";
		ctx.fillText(string, this.x, this.y);
		ctx.closePath();
    }
}

function LivingEntity(game, pointerX, pointerY, directionX, directionY, locationX, locationY) {
    Entity.call(this, game, locationX, locationY);
    this.game = game;
    this.locationX = locationX;
    this.locationY = locationY;
    this.pointerX = pointerX;
    this.pointerY = pointerY;
    this.directionX = directionX;
    this.directionY = directionY;
	this.SpriteWidth = 60;  //default:60
	this.SpriteHeight = 60;  //default:60
		this.CenterOffsetX = 0; // puts the center of the sprite in the center of the entity
	this.CenterOffsetY = 0;  //puts the center of the sprite in the center of the entity
	this.SpriteRotateOffsetX = 0; //describes the point of rotation on the sprite changed from 1/2 width
	this.SpriteRotateOffsetY = 0; //describes the point of rotation on the sprite changed from 1/2 height
	// this.CenterOffsetX = CenterOffsetX; // puts the center of the sprite in the center of the entity
	// this.CenterOffsetY = CenterOffsetY;  //puts the center of the sprite in the center of the entity
	// this.SpriteRotateOffsetX = SpriteRotateOffsetX; //describes the point of rotation on the sprite changed from 1/2 width
	// this.SpriteRotateOffsetY = SpriteRotateOffsetY; //describes the point of rotation on the sprite changed from 1/2 height
	this.angle = 0;
    this.health = 100;
    this.strength = 25;
    this.speed = 10;
    this.movingAnimation = null;
    this.attackAnimation = null;
    this.struckAnimation = null;
    this.deathAnimation = null;
    this.currentAnimation = null;
}

LivingEntity.prototype = new Entity();
LivingEntity.prototype.constructor = LivingEntity;

LivingEntity.prototype.getX = function () {
    return this.locationX;
} 

LivingEntity.prototype.getY = function () {
    return this.locationY;
} 

LivingEntity.prototype.setX = function (x) {
    this.locationX = x;
}

LivingEntity.prototype.setY = function (y) {
    this.locationY = y;
}
 
LivingEntity.prototype.setMovingAnimation = function (spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow) {
    this.movingAnimation = new Animation(spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow);
}

LivingEntity.prototype.setAttackAnimation = function (spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow) {
    this.attackAnimation = new Animation(spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow);
}

LivingEntity.prototype.setStruckAnimation = function (spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow) {
    this.struckAnimation = new Animation(spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow);
}

LivingEntity.prototype.setDeathAnimation = function (spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow) {
    this.deathAnimation = new Animation(spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse, numFramesInRow);
}

// LivingEntity.prototype.draw = function () {
//     this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
// }

LivingEntity.prototype.draw = function (ctx) {
	//console.log("angle LE draw: " + this.angle);
    if (this.movingAnimation && this.name === "playerControlled" && this.controlled === true) {

//        console.log("Location: " + this.x + " " + this.y);
//        console.log("Mouse: " + this.game.x + " " + this.game.y);

        var rad = Math.atan2(this.game.y - this.y, this.game.x - this.x);
        var deg = rad * (180 / Math.PI);
		//this.movingAnimation.drawFrameRotate(this.game.clockTick, ctx, this.x - this.radius, this.y - this.radius, deg);
        this.movingAnimation.drawFrameRotate(this.game.clockTick, ctx, this.x - this.radius - this.CenterOffsetX - this.game.getWindowX(), 
		this.y - this.radius - this.CenterOffsetY - this.game.getWindowY(), deg,
		this.SpriteRotateOffsetX, this.SpriteRotateOffsetY);
		//console.log("this.SpriteRotateOffsetX" + this.SpriteRotateOffsetX);
		//console.log("this.CenterOffsetX" + this.CenterOffsetX);

    } else { // Zombies
	//this.movingAnimation.drawFrameRotate(this.game.clockTick, ctx, this.x - this.radius, this.y - this.radius, this.angle);
        this.movingAnimation.drawFrameRotate(this.game.clockTick, ctx, this.x - this.radius - this.game.getWindowX(), this.y - this.radius - this.game.getWindowY(), this.angle);
    }

    if (this.game.showOutlines) {
        ctx.beginPath();
		ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.arc(this.x, this.y , 5, 0, Math.PI * 2, false);
        ctx.closePath();
		ctx.stroke();
		
		ctx.beginPath();
		ctx.strokeStyle = "blue";
        ctx.lineWidth = 1;
        ctx.arc(this.x + this.SpriteWidth/2 + 2, this.y + this.SpriteHeight/2 + 2, 5, 0, Math.PI * 2, false);
        ctx.closePath();
		ctx.stroke();
		
		ctx.beginPath();
		ctx.strokeStyle = "purple";
        ctx.lineWidth = 1;
        ctx.arc(this.x + this.CenterOffsetX, this.y + this.CenterOffsetY, 5, 0, Math.PI * 2, false);
        ctx.closePath();
		ctx.stroke();
		
		ctx.beginPath();
		ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        ctx.arc(this.x + this.SpriteWidth, this.y + this.SpriteHeight, 5, 0, Math.PI * 2, false);
        ctx.closePath();
		ctx.stroke();
		
		ctx.beginPath();
        ctx.strokeStyle = "pink";
        ctx.lineWidth = 1;
        ctx.arc(this.x + this.radius, this.y + this.radius, 5, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
		
		ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
    }

}

LivingEntity.prototype.update = function () {
    // if (this.health === 0) {
    //     this.currentAnimation = this.deathAnimation;
    // } else if (/* Attack button is pressed */) {
    //     this.currentAnimation = this.attackAnimation;
    // } else {
    //     this.currentAnimation = this.movingAnimation;
    // }
}

function NonLivingEntity(game, locationX, locationY) {
    Entity.call(this, game, locationX, locationY);
    this.name = "NonLiving";
    this.image = null;
}

NonLivingEntity.prototype = new Entity();
NonLivingEntity.prototype.constructor = NonLivingEntity;

NonLivingEntity.prototype.setImage = function (image) {
    this.image = image;
    console.log("Image set");
}

NonLivingEntity.prototype.setLocation = function (X, Y) {
    Entity.prototype.setLocation.call(this, X, Y);
}

NonLivingEntity.prototype.draw = function (ctx) {
  //  this.game.ctx.drawImage(this.image, 0, 0);
  ctx.drawImage(this.image, 0, 0);

}

NonLivingEntity.prototype.update = function () {
    
}