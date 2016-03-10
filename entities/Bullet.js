function Bullet(game, entity, newBullet) {
    this.player = 1;
    this.radius = 2;
	this.damage = 25;
	this.range = 200;
    this.name = "Bullet";
	this.type = "Bullet";
    this.color = "Gray";
    this.maxSpeed = 200;
    this.strength = 50;
	this.originator = entity;
	this.origin = {x:entity.x, y:entity.y};	

	if (newBullet == undefined) {
		Entity.call(this, game, this.radius + Math.random() * (game.sides.right - this.radius * 2), this.radius + Math.random() * (game.sides.bottom - this.radius * 2));
		this.velocity = { x: 0, y: 0 };
	} else {
		Entity.call(this, game, newBullet.x, newBullet.y);
		this.velocity = newBullet.velocity;
	}
};

Bullet.prototype = new LivingEntity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Bullet.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Bullet.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Bullet.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Bullet.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Bullet.prototype.update = function () {
    Entity.prototype.update.call(this);
    //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
	
	//check if bullet went to its range
	if (distance(this.origin, this) >= this.range) {
		this.removeFromWorld = true;
	}
    if (collideLeft(this) || collideRight(this)|| collideTop(this) || collideBottom(this)) {
		this.removeFromWorld = true;
    }
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Bullet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x - this.game.getWindowX(), this.y - this.game.getWindowY(), this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};