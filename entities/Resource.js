
function Resource(game, newResource) {
	//console.log("Resource created.");
	this.game = game;
    this.radius = 5;
	this.radiusMax = 30;
	var resourceMin = 100;
	var resourceRange = 10000

	//console.log("Resouce amount: " + this.amount);
	this.type = "Resource";

	if (newResource == undefined) {
		this.amount = Math.floor(Math.random() * resourceRange);
		if (this.amount < resourceMin) {
			this.amount = resourceMin;
		}
		this.xSpawn = Math.floor(this.game.surfaceWidth * Math.random());
		this.ySpawn = Math.floor(this.game.surfaceHeight * Math.random());
		//console.log(this.xSpawn + ", " + this.ySpawn);
		Entity.call(this, game, this.xSpawn, this.ySpawn);
	} else {
		this.amount = newResource.amount;
		this.xSpawn = newResource.x;
		this.ySpawn = newResource.y;
		Entity.call(this, game, this.xSpawn, this.ySpawn);
	}
	
};

Resource.prototype = new Entity();
Resource.prototype.constructor = Resource;


Resource.prototype.update = function () {
    Entity.prototype.update.call(this);
	this.radius = Math.ceil(this.amount / 400);
	if (this.radius > this.radiusMax) {
		this.radius = this.radiusMax;
	}        
	if (this.amount <= 0) {
		//console.log("resource consumed");
		this.removeFromWorld = true;
	}
};

Resource.prototype.draw = function (ctx) {
	//console.log("resource drawn");
    ctx.beginPath();
    //ctx.fillStyle = "BurlyWood"; //don't tell prof Marriott but I got this color from w3 schools.
    ctx.fillStyle = "rgba(222,184,135, 0.4)";
	//radius = ;
	ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};