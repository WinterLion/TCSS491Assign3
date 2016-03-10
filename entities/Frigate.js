function Frigate(game, theCarrier, newFrigate) {
	//console.log("Frigate for team " + theCarrier.TeamNumber + " created.");
	this.carrier = theCarrier;
    this.player = 1;
    this.radius = 13;
    
	this.fullHealth = 350;
	
	this.firingRadius = 110;
	this.firingRange = 100;
    this.name = "Frigate";
	this.type = "Ship";
	this.shipType = "Frigate";

    
	this.shootingCooldownStart = .3;
	this.maxSpeed = 30;
	// console.log("Math.floor" + Math.floor(Math.random() * 2));
	// console.log(Math.floor(Math.random() * 2) * 2);
	// console.log((Math.floor(Math.random() * 2) * 2) - 1);

	
	//for select action:

	this.enemyRadius = 50;
	this.bulletRadius = 30;
	this.closeEnemyRadius = 30;
	this.cornerRadius = 300;	 
	this.avoidFriendlyRadius = 5;
	this.avoidRadius = 10;
	
	if (newFrigate == undefined) {
		this.TeamNumber = theCarrier.TeamNumber;
		this.color = theCarrier.color;
		this.kills = 0;
		this.health = this.fullHealth;
		this.shootingCooldown = 0;
		var xSpawn = this.carrier.x + ((this.carrier.radius + this.radius) * ((Math.floor(Math.random() * 2) * 2) - 1));
		var ySpawn = this.carrier.y + ((this.carrier.radius + this.radius) * ((Math.floor(Math.random() * 2) * 2) - 1));
		Entity.call(this, game, xSpawn, ySpawn);

		this.velocity = { x: 0, y: 0 };
		
	} else {
		this.TeamNumber = newFrigate.TeamNumber;
		this.color = newFrigate.color;
		this.kills = newFrigate.kills;
		this.health = newFrigate.health;
		this.shootingCooldown = newFrigate.shootingCooldown;
		var xSpawn = newFrigate.x;
		var ySpawn = newFrigate.y;
		Entity.call(this, game, xSpawn, ySpawn);

		this.velocity = newFrigate.velocity;
	}
	
};

Frigate.prototype = new Entity();
Frigate.prototype.constructor = Frigate;

Frigate.prototype.selectAction = function () {

    var action = { direction: { x: 0, y: 0 }, fire: false, target: null};
	var acceleration = 1000000000;
    var closest = 1000;
    var targetShip = null;   
	var nearEnemy = false;
	var nearBullet = false;
	var avoiding = false;

    for (var i = 0; i < this.game.ships.length; i++) {
        var oneShip = this.game.ships[i];
		if (this.game.ships[i] != this) {
			var dist = distance(this, oneShip);
			if (dist < this.radius + oneShip.radius + this.avoidRadius) {
				var difX = (oneShip.x - this.x) / dist;
				var difY = (oneShip.y - this.y) / dist;
				action.direction.x -= (difX  / (dist) ) * acceleration;
				action.direction.y -= (difY  / (dist) ) * acceleration;
				avoiding = true;
			}
			if (oneShip.TeamNumber != this.TeamNumber) {
				if (dist < closest) { //dist < 100
					closest = dist;
					targetShip = oneShip;
					action.target = targetShip;
					nearEnemy = dist < this.firingRadius;
				}
			}   
		}     
    }
	if (targetShip && !avoiding) {
		var difX = (targetShip.x - this.x) / dist;
		var difY = (targetShip.y - this.y) / dist;
		action.direction.x += (difX  / (dist) ) * acceleration;
		action.direction.y += (difY  / (dist) ) * acceleration;
	}
    if (targetShip && !targetShip.removeFromWorld && nearEnemy) { 
		action.fire = true;
    } 
	
    return action;
};

Frigate.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Frigate.prototype.collideLeft = function () {
    return (this.x - this.radius) < this.game.sides.left;
};

Frigate.prototype.collideRight = function () {
    return (this.x + this.radius) > this.game.sides.right;
};

Frigate.prototype.collideTop = function () {
    return (this.y - this.radius) < this.game.sides.top;
};

Frigate.prototype.collideBottom = function () {
    return (this.y + this.radius) > this.game.sides.bottom;
};

Frigate.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.shootingCooldown > 0) this.shootingCooldown -= this.game.clockTick;
    if (this.shootingCooldown < 0) this.shootingCooldown = 0;
    this.action = this.selectAction();
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

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
				if (ent.originator.TeamNumber != this.TeamNumber){
					this.health -= ent.damage;
				} 
            }
        }
    }
    

    if (this.shootingCooldown === 0 && this.action.fire) {
        this.shootingCooldown = this.shootingCooldownStart;
        var target = this.action.target;
		var dir = null;
		if (target != null) {
		  dir = direction(target, this);
		}        
		if (dir != null) {
		  var bullet = new Bullet(this.game, this);
		  bullet.x = this.x + dir.x * (this.radius + bullet.radius + 1);
		  bullet.y = this.y + dir.y * (this.radius + bullet.radius + 1);
		  bullet.velocity.x = dir.x * bullet.maxSpeed;
		  bullet.velocity.y = dir.y * bullet.maxSpeed;
		  bullet.originator = this;
		  bullet.range = this.firingRange;
		  this.game.addEntity(bullet);
		}
    }
	if (this.health <= 0) {
		this.removeFromWorld = true;
	}

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Frigate.prototype.draw = function (ctx) {
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
	Entity.prototype.draw.call(this, ctx);
};