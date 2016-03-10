
function Carrier(game, teamnumber, newCarrier) {
	
	//console.log("Carrier Created: " + this.TeamNumber);
    this.radius = 20;
	this.maxSpeed = 5;
	

		
	this.fighterCost = 100;
	this.frigateCost = 500;
	this.resourcerCost = 250;
	this.buildNewCarrierCost = 3000;
	
	this.fighterMax = 40;
	this.fighterMin = 3;
	this.frigateMax = 1;
	this.healthMax = 1000;
	
	this.showHealthBar = true;
	this.healthBarCoords = {BeginX: -12, BeginY : -10, Width : 25, Height : 4};
    this.name = "Carrier";
	this.type = "Ship";
	this.shipType = "Carrier";
	this.startingResources = 650;
	this.whatToBuild = null; //with a clone will repopulate at next update
	this.fireCooldownStart = 1;
	this.fighterCooldownStart = 2;
	this.frigateCooldownStart = 10;
	this.resourcerCooldownStart = 5;
	this.resourceCooldownStart = 1;
	this.autoResourceStep = 10;
	if (newCarrier == undefined) {
		this.TeamNumber = teamnumber;
		this.fighterCount = 0;
		this.frigateCount = 0;
		this.resourcerCount = 0;
		this.health = this.healthMax;
		this.resourceAmount = this.startingResources;
		var R = Math.floor(Math.random() * 255);
		var G = Math.floor(Math.random() * 255);
		var B = Math.floor(Math.random() * 255);
		var e = Math.floor(Math.random() * 6);
		if (e == 1) {
			R= 0;
		} else if (e == 2) {
			G = 0;
		} else if (e == 3) {	
			B = 0;
		}
		
		this.color = "rgb(" + R + "," + G + "," + B + ")"; 
		
		Entity.call(this, game, this.radius + Math.random() * (game.sides.right - this.radius * 2), this.radius + Math.random() * (game.sides.bottom - this.radius * 2));
		this.fireCooldown = 0;
		//for building ships
		this.fighterCooldown = 0;
		this.frigateCooldown = 0;		
		this.resourcerCooldown = 0;	
		
		//for automatic resources:
		this.resourceCooldown = 0;

		this.velocity = { x: 0, y: 0 };
	} else {
		this.TeamNumber = newCarrier.TeamNumber;
		this.fighterCount = newCarrier.fighterCount;
		this.frigateCount = newCarrier.frigateCount;
		this.resourcerCount = newCarrier.resourcerCount;
		this.health = newCarrier.health;
		this.resourceAmount = newCarrier.resourceAmount;
		
		this.color = newCarrier.color; 
		
		Entity.call(this, game, newCarrier.x, newCarrier.y);
		this.fireCooldown = newCarrier.fireCooldown;
		//for building ships
		this.fighterCooldown = newCarrier.fighterCooldown;
		this.frigateCooldown = newCarrier.frigateCooldown;		
		this.resourcerCooldown = newCarrier.resourcerCooldown;	
		
		//for automatic resources:
		this.resourceCooldown = newCarrier.resourceCooldown;

		this.velocity = newCarrier.velocity;
	}

};

Carrier.prototype = new Entity();
Carrier.prototype.constructor = Carrier;

Carrier.prototype.selectAction = function () {

    var action = { direction: { x: 0, y: 0 }, fire: false, target: null};
    var acceleration = 1000000000;
    var closest = 1000;
    var targetShip = null;
    this.firingRadius = 500;
	this.nearEnemyRadius = 50;
	this.closeEnemyRadius = 30;
	this.cornerRadius = 300;

	var nearEnemy = false;

    for (var i = 0; i < this.game.ships.length; i++) {
        var oneShip = this.game.ships[i];
		if (oneShip.TeamNumber != this.TeamNumber) {
			var dist = distance(oneShip, this);
			if (dist < closest) { //dist < 100
				closest = dist;
				targetShip = oneShip;
			}
		}
        
    }
	if (closest < this.nearEnemyRadius) {
		nearEnemy = true;
	}
	
	if (targetShip && nearEnemy) {
		var difX = (targetShip.x - this.x) / dist;
		var difY = (targetShip.y - this.y) / dist;
		action.direction.x -= (difX  / (dist) ) * acceleration;
		action.direction.y -= (difY  / (dist) ) * acceleration;
	}

  ////calculate where the target will be
    if (targetShip && !targetShip.removeFromWorld && nearEnemy && this.fireCooldown == 0) { 
		action.fire = true;
    } 
    return action;
};

Carrier.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Carrier.prototype.collideLeft = function () {
    return (this.x - this.radius) < this.game.sides.left;
};

Carrier.prototype.collideRight = function () {
    return (this.x + this.radius) > this.game.sides.right;
};

Carrier.prototype.collideTop = function () {
    return (this.y - this.radius) < this.game.sides.top;
};

Carrier.prototype.collideBottom = function () {
    return (this.y + this.radius) > this.game.sides.bottom;
};

Carrier.prototype.update = function () {
	//console.log("resourcerCount" + this.resourcerCount);
    Entity.prototype.update.call(this);
	
	if (this.resourceCooldown > 0) this.resourceCooldown -= this.game.clockTick;
    if (this.resourceCooldown <= 0) {
		this.resourceAmount += this.autoResourceStep;
		this.resourceCooldown = this.resourceCooldownStart;
	}
	
	//decide what to build
	this.whatToBuild = "Nothing";
	if (this.resourcerCount === 0) {
		if (this.resourceAmount >= this.resourcerCost) {
			this.whatToBuild = "Resourcer";
		}		
	} else if (this.resourceAmount >= (this.startingResources * 2) && this.frigateCount < this.frigateMax) {
		if (this.resourceAmount >= this.frigateCost) {
			this.whatToBuild = "Frigate";
		}	
	} else if (this.resourceAmount >= this.fighterCost) {
		this.whatToBuild = "Fighter";	
	} 
	switch (this.whatToBuild) {
		case "Nothing": 
			//console.log("Nothing");
			break;
		case "Resourcer": 
			//console.log("Resourcer");
			if (this.resourcerCooldown > 0) this.resourcerCooldown -= this.game.clockTick;
			if (this.resourcerCooldown < 0) this.resourcerCooldown = 0;
			break;
		case "Frigate": 
			//console.log("Frigate");
			if (this.frigateCooldown > 0) this.frigateCooldown -= this.game.clockTick;
			if (this.frigateCooldown < 0) this.frigateCooldown = 0;
			break;
		case "Fighter": 
			//console.log("Fighter");
			if (this.fighterCooldown > 0) this.fighterCooldown -= this.game.clockTick;
			if (this.fighterCooldown < 0) this.fighterCooldown = 0;
			break;
		default: 
			console.log("select not working");
			break;
	}
    if (this.fireCooldown > 0) this.fireCooldown -= this.game.clockTick;
    if (this.fireCooldown < 0) this.fireCooldown = 0;



	//console.log(this.game.clockTick);
	//console.log(Math.ceil((this.game.clockTick) * 5));

	//console.log("fighterCount " + this.fighterCount);
	//console.log("fighterCooldown" + this.fighterCooldown);
    this.action = this.selectAction();
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    // this.x += this.velocity.x * this.game.clockTick;
    // this.y += this.velocity.y * this.game.clockTick;

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
        if (this.collideBottom()) this.y = this.game.sides.bottom  - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.type === "Ship") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            } else if (ent.type === "Resource") {
				ent.removeFromWorld = true;
			}
			//if not a bullet, the ships crash and both loose health
			if (ent.type === "Ship") {
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
	//console.log("Resources for team " + this.TeamNumber + " " + this.resourceAmount);
	if (this.resourcerCount === 0 && this.resourceAmount >= this.resourcerCost) {
		this.resourceAmount -= this.resourcerCost
		var resourcer = new Resourcer(this.game, this);
		this.game.addEntity(resourcer);
		this.resourcerCount++;
	}
	
	if (this.fighterCooldown === 0 && this.resourcerCount > 0 && this.fighterCount < this.fighterMax && this.resourceAmount >= this.fighterCost) {
		this.resourceAmount -= this.fighterCost
		var fighter = new Fighter(this.game, this);
		this.game.addEntity(fighter);
		this.fighterCooldown = this.fighterCooldownStart;
		this.fighterCount++;
		//console.log("fighterCount" + this.fighterCount);
	}
	if (this.whatToBuild === "Frigate" && this.frigateCooldown === 0 && this.resourceAmount >= this.frigateCost) {
		this.resourceAmount -= this.frigateCost
		var frigate = new Frigate(this.game, this);
		this.game.addEntity(frigate);
		this.frigateCooldown = this.frigateCooldownStart;
		this.frigateCount++;
		//console.log("fighterCount" + this.fighterCount);
	}
	
	
	//if you have enough money, build another carrier and get a 2nd resourcer with no build time.
	if (this.resourceAmount > this.buildNewCarrierCost + 750 + this.resourcerCost) {
		var oneCarrier = new Carrier(this.game);
		oneCarrier.TeamNumber = this.TeamNumber;
		oneCarrier.color = this.color;
		this.game.addEntity(oneCarrier);
		this.resourceAmount -= this.buildNewCarrierCost;
		
		this.resourceAmount -= this.resourcerCost
		var resourcer = new Resourcer(this.game, this);
		this.game.addEntity(resourcer);
		this.resourcerCount++;
	}
    

    if (this.fireCooldown === 0 && this.action.fire) {
        this.fireCooldown = this.fireCooldownStart;
        var target = this.action.target;
		var dir = null;
		if (target != null) {
		  dir = direction(target, this);
		}        
		if (dir != null) {
		  var bullet = new Bullet(this.game, this);
		  bullet.x = this.x + dir.x * (this.radius + bullet.radius + 20);
		  bullet.y = this.y + dir.y * (this.radius + bullet.radius + 20);
		  bullet.velocity.x = dir.x * bullet.maxSpeed;
		  bullet.velocity.y = dir.y * bullet.maxSpeed;
		  this.game.addEntity(bullet);
		}
    }	
	if (this.health <= 0) {
		this.removeFromWorld = true;
	}
    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Carrier.prototype.draw = function (ctx) {
	//console.log("drawing carrier");
	//console.log("Resources for team " + this.TeamNumber + " " + this.resourceAmount);
	ctx.beginPath();
	var string = ("Resources for team " + this.TeamNumber + " " + this.resourceAmount);
	ctx.fillStyle = this.color;
	ctx.font = "12px serif";
	ctx.fillText(string, 10, 50 + 15 * this.TeamNumber);
	ctx.closePath();
	
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
	
	//white outline    
	ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.closePath();
	
	if (this.showHealthBar) {	
		//black background
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.fillRect(this.healthBarCoords.BeginX + this.x, this.healthBarCoords.BeginY + this.y, this.healthBarCoords.Width, this.healthBarCoords.Height);
		ctx.stroke(); 
		
		//actual health bar
		var tempHealth = this.health;
		// console.log(tempHealth);
		if (tempHealth > this.healthMax) {
			tempHealth = this.healthMax;
		} else if (tempHealth < 0) {
			tempHealth = 0;
		}
		// console.log(tempHealth);
		// console.log(this);
		// console.log(this.healthMax);
		var healthPercent = (tempHealth / this.healthMax);
		// console.log("healthPercent" + healthPercent);
		var healthGreenAbove = .7;
		var healthYellowAbove = .4;
		ctx.beginPath();
		if (healthPercent > healthGreenAbove) {
			ctx.fillStyle = "green";
		}else if (healthPercent > healthYellowAbove) {
			ctx.fillStyle = "yellow";
		} else {
			ctx.fillStyle = "red";
		}
		var calculatex = this.healthBarCoords.BeginX + this.x;
		var calculatey = this.healthBarCoords.BeginY + this.y;
		var calculatewidth = this.healthBarCoords.Width * healthPercent;
		ctx.fillRect(calculatex, calculatey, calculatewidth, this.healthBarCoords.Height);
		ctx.stroke(); 
		
		//outline of health bar
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.rect(this.healthBarCoords.BeginX + this.x ,this.healthBarCoords.BeginY + this.y, this.healthBarCoords.Width, this.healthBarCoords.Height);
		ctx.stroke(); 
		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.rect(this.healthBarCoords.BeginX + this.x - 1, this.healthBarCoords.BeginY + this.y - 1, this.healthBarCoords.Width + 2, this.healthBarCoords.Height + 2);
		ctx.stroke(); 
	}
	Entity.prototype.draw.call(this, ctx);
};