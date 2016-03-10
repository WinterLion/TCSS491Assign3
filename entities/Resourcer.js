
function Resourcer(game, theCarrier, newResourcer) {
	//console.log("Resourcer for team " + theCarrier.TeamNumber + " created.");
	this.carrier = theCarrier;
    this.player = 1;
    this.radius = 10;
	this.fullHealth = 500;

    this.name = "Resourcer";
	this.type = "Ship";
	this.shipType = "Resourcer";

	this.cooldownStart = 1;
	this.resourceCollectRate = 5;
	this.maxSpeed = 30;
	this.stop = false;

	
	//for select action:
	
	this.EnemyRadius = 50;
	this.closeEnemyRadius = 30;
	this.cornerRadius = 300;	 
	this.avoidRadius = 5;
	
	this.collecting = false;
	this.targetResource = null;
	this.collectionRadius = 5;
	
	if (newResourcer == undefined) {
		this.TeamNumber = theCarrier.TeamNumber;
		this.color = theCarrier.color;
		this.cooldown = 0;
		this.health = this.fullHealth;
		var xSpawn = this.carrier.x + this.carrier.radius + this.radius + 20;
		var ySpawn = this.carrier.y + this.carrier.radius + this.radius + 20;
		Entity.call(this, game, xSpawn, ySpawn);

		this.velocity = { x: 0, y: 0 };
	} else {
		//console.log("this.TeamNumber " + this.TeamNumber);
		//console.log("newResourcer.TeamNumber " + newResourcer.TeamNumber);
		this.TeamNumber = newResourcer.TeamNumber;
		//console.log("this.TeamNumber " + this.TeamNumber);
		this.color = newResourcer.color;
		this.cooldown = newResourcer.cooldown;
		this.health = newResourcer.health;
		var xSpawn = newResourcer.x;
		var ySpawn = newResourcer.y;
		Entity.call(this, game, xSpawn, ySpawn);

		this.velocity = { x: 0, y: 0 };
	}
	
};

Resourcer.prototype = new Entity();
Resourcer.prototype.constructor = Resourcer;

Resourcer.prototype.selectAction = function () {

    var action = { direction: { x: this.x, y: this.y }, target: null};
	var acceleration = 1000000000;
    var closest = 1000;
    var targetResource = null;   
	var nearEnemy = false;
	var nearResource = false;
	var avoiding = false;
	this.collecting = false;
	this.stop = false;
	//console.log(this.game.ships.length);
	//don't crash into other ships
    for (var i = 0; i < this.game.ships.length; i++) {
        var oneShip = this.game.ships[i];
		if (this.game.ships[i] != this) {
			var dist = distance(this, oneShip);
			if (dist < this.radius + oneShip.radius + this.avoidRadius) {
				//console.log("dist " + dist);
				//console.log(oneShip.x + " "+ this.x);
				//console.log(oneShip.y + " "+ this.y);
				var difX = (oneShip.x - this.x) / dist;
				var difY = (oneShip.y - this.y) / dist;
				//console.log(difX + " "+ difY);
				action.direction.x -= (difX  / (dist) ) * acceleration;
				action.direction.y -= (difY  / (dist) ) * acceleration;
				avoiding = true;
			}
		}
    }
	//distance(oneResource, this) <(this.collectionRadius + this.radius + oneResource.radius)
	//go to resources
	//console.log("not avoid " + !avoiding);
	if (!avoiding) {
		//console.log("this.game.resources.length " + this.game.resources.length);
		for (var i = 0; i < this.game.resources.length; i++) {
			var oneResource = this.game.resources[i];
			if (!oneResource.removeFromWorld) {
				var dist = distance(oneResource, this);
				if (dist < closest) { //dist < 100
					closest = dist;
					targetResource = oneResource;
					action.target = targetResource;
					//console.log(oneResource);
					//console.log("this.collectionRadius " + this.collectionRadius + " " + this.radius + " " + oneResource.radius);
					//console.log(dist);
					//console.log(this.collectionRadius + this.radius + oneResource.radius);
					//console.log((dist < (this.collectionRadius + this.radius + oneResource.radius)));
					nearResource = (dist < (this.collectionRadius + this.radius + oneResource.radius));
					//console.log("nearResource1 " + nearResource);
				}
			}
		}
	}
	//console.log(targetResource);
	if (targetResource && !avoiding){
		//console.log("head toward resource" );
		//console.log("nearResource " + nearResource);
		if (!nearResource) {
			//console.log("not near resource ");
			var difX = (targetResource.x - this.x) / dist;
			var difY = (targetResource.y - this.y) / dist;
			action.direction.x += (difX  / (dist) ) * acceleration;
			action.direction.y += (difY  / (dist) ) * acceleration;
		} else {
			//console.log("nearResource in " + nearResource);
			this.collecting = true;
			this.stop = true;
			this.targetResource = targetResource;
		}
	} 


    return action;
};

Resourcer.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Resourcer.prototype.collideLeft = function () {
    return (this.x - this.radius) < this.game.sides.left;
};

Resourcer.prototype.collideRight = function () {
    return (this.x + this.radius) > this.game.sides.right;
};

Resourcer.prototype.collideTop = function () {
    return (this.y - this.radius) < this.game.sides.top;
};

Resourcer.prototype.collideBottom = function () {
    return (this.y + this.radius) > this.game.sides.bottom;
};

Resourcer.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
	this.action = this.selectAction();
	if (this.collecting && this.targetResource) {
		 if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
		 if (this.cooldown < 0) this.cooldown = 0;
		 if (this.cooldown === 0) {
			 if (this.targetResource.amount > this.resourceCollectRate) {
				 this.carrier.resourceAmount += this.resourceCollectRate;
				 this.targetResource.amount -= this.resourceCollectRate;
			 } else {
				 this.carrier.resourceAmount += this.targetResource.amount;
				 this.targetResource.amount = 0;
			 }
		 }
	}
    
    
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

	if (!this.stop) {
		this.x += this.velocity.x * this.game.clockTick;
		this.y += this.velocity.y * this.game.clockTick;
	}

    if (collideLeft(this) || collideRight(this)) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = this.game.sides.right - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (collideTop(this) || collideBottom(this)) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = this.game.sides.bottom - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
			//if not a bullet, the ships crash and both loose health
			if (ent.type === "ship") {
				if (this.health > ent.health) {
					this.health -= ent.health;
					ent.health = 0;
					ent.removeFromWorld = true;
				} else if (this.health < ent.health) {
					ent.health -= this.health;
					this.health = 0;
					this.removeFromWorld=true;
				} else { //equal so remove both
					this.health = 0;
					this.removeFromWorld=true;
					ent.health = 0;
					ent.removeFromWorld = true;
				}
            }			
            if (ent.type === "Bullet") {
                ent.removeFromWorld = true;
				//no friendly fire
				if (ent.originator.TeamNumber != this.TeamNumber){
					this.health -= ent.damage;
				}  
            }
        }
    }
	if (this.health <= 0) {
		this.removeFromWorld = true;
	}
	if (!this.removeFromWorld && this.collecting) {
		
	}
    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Resourcer.prototype.draw = function (ctx) {
	
	if (this.collecting) {	
		var midAngle = XYtoAngleRad(this,this.targetResource)
		var startAngle = midAngle - 1 + Math.PI;
		var endAngle = midAngle + 1 + Math.PI;

		//resource active collection indicator
		ctx.beginPath();
		ctx.fillStyle = "yellow";
		ctx.arc(this.x, this.y, this.radius * 2, startAngle, endAngle, false);
		ctx.fill();
		ctx.closePath();
	}
	

	//main body
    ctx.beginPath();
    //ctx.fillStyle = this.color;
	ctx.fillStyle = "black";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
	
	//team color border
	var lineWidth = ctx.lineWidth;
	ctx.lineWidth = 5;
	ctx.beginPath();
    ctx.strokeStyle = this.color;
	ctx.fillStyle = "black";
    ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2, false);
    ctx.stroke();
	ctx.lineWidth = lineWidth;
    ctx.closePath();
	
	//"RC" label
	ctx.beginPath();
	var string = ("rc");
	ctx.font = "12px serif";
	ctx.fillStyle = "white";
	ctx.fillText(string, this.x - 5, this.y + 4);
	ctx.closePath();
	
	//white outline    
	ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.closePath();
	Entity.prototype.draw.call(this, ctx);
};