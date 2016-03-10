
function Star(game, newStar) {
	this.radiusMin = .2;
	this.radiusMax = 2;
	this.type = "Star";
	
	if (newStar == undefined) {
		//console.log("star created");

		this.radius = (Math.random() * this.radiusMax) + this.radiusMin;

		this.xSpawn = Math.floor(game.surfaceWidth * Math.random());
		this.ySpawn = Math.floor(game.surfaceHeight * Math.random());
		//console.log(this.xSpawn + ", " + this.ySpawn);
		Entity.call(this, game, this.xSpawn, this.ySpawn);
	} else {
		this.radius = newStar.radius;
		this.xSpawn = newStar.x;
		this.ySpawn = newStar.y;
		//console.log(this.xSpawn + ", " + this.ySpawn);
		Entity.call(this, game, this.xSpawn, this.ySpawn);
	}

};

Star.prototype = new Entity();
Star.prototype.constructor = Star;

Star.prototype.update = function () {
}

Star.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};