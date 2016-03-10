// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
	this.data = [];
    this.entities = [];
	this.ships = [];
    this.carriers = [];
	this.carrierCounter = 0;
    this.bullets = [];
	this.resources = [];
	this.stars = [];
	this.surfaceWidth = null;
    this.surfaceHeight = null;
	this.sides = {left:null, right:null, top:null, bottom:null}
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.degree = null;
    this.x = null;
    this.y = null;
    this.wheel = null;

	//this.showMenu = false;
	this.showMenu = true; //for testing set to true
    this.windowX = 0;
    this.windowY = 0;
	this.FirstMenu = true;
	this.line1 = "Game Over";
	this.line2 = "Click Here";
	this.line3 = "to Restart";

    this.keyState = null;
    this.keydown = null;
    this.startInput();
    this.timer = new Timer();
    this.keydown = {key:"", x:0, y:0};
    this.keyState = {};
	
	this.numCarrierTeams = 6;
    console.log('game initialized');
}

GameEngine.prototype.getWindowX = function() {
    return this.windowX;
}

GameEngine.prototype.getWindowY = function() {
    return this.windowY;
}

GameEngine.prototype.setWindowX = function(x) {
    if (x < 0) {
        this.windowX = 0;
    } else if (x > 400) {
        this.windowX = 400;
    } else {
        this.windowX = x;
    }
}

GameEngine.prototype.setWindowY = function(y) {
        if (y < 0) {
        this.windowY = 0;
    } else if (y > 400) {
        this.windowY = 400;
    } else {
        this.windowY = y;
    }
}

//run only the first time
GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.startInput();
    this.timer = new Timer();
	this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
	this.sides = {left:0, right:this.surfaceWidth, top:0, bottom:this.surfaceHeight}
	//add entities here:
	this.addResources();
	this.addCarriers();	
	this.addStars();
	this.setupServer();
    console.log('game initialized');
}

GameEngine.prototype.setupServer = function () {
	var socket = io.connect("http://76.28.150.193:8888");
	var that = this;
	socket.on("load", function (dataObject) {
		//that.loadData(data);
		that.data.push(dataObject);
		// console.log("that.data ");
		// console.log(that.data);
		if (that.data.length == 6) {
			//console.log("loaded from server");
			that.loadData();
		}
	});

	socket.on("connect", function () {
			console.log("Socket connected.")    });
	socket.on("disconnect", function () {
			console.log("Socket disconnected.")    });
	socket.on("reconnect", function () {
			console.log("Socket reconnected.")    });
	
	document.getElementById("saveButton").addEventListener("click", function(){
		that.save(socket);
	});
	document.getElementById("loadButton").addEventListener("click", function(){
		that.load(socket);
	});
}


GameEngine.prototype.save = function (socket) {
	var studentNameString = "Quinn Cox"
	// var newEntityArray = [];

	var ShipCarrierArray = [];
	var BulletOriginatorArray = [];
	// var entitiesTemp = [];
	// var shipsTemp = [];
    // var carriersTemp = [];
    // var bulletsTemp = [];
	//var resourcesTemp = [];
	//var starsTemp = [];
	var first = false;
	for (var i = 0; i < this.entities.length; i++) {
		this.entities[i].game = null;
		this.entities[i].action = null;
		if (this.entities[i].type == "Ship" && this.entities[i].shipType != "Carrier") {
			if (!first) {
				first = true;
				//console.log(this.entities[i])
			}
			ShipCarrierArray.push(this.entities[i].carrier);
			this.entities[i].carrier = null;
		}
		if (this.entities[i].type == "Bullet") {
			BulletOriginatorArray.push(this.entities[i].originator);
			this.entities[i].originator = null;
		}
	}
	// socket.emit("save", { studentname: studentNameString, statename: "gameState", data: this.entities });
	//console.log("ShipCarrierArray " + ShipCarrierArray);
	socket.emit("save", { studentname: studentNameString, statename: "ShipCarrierArray", data: ShipCarrierArray });
	//console.log("BulletOriginatorArray");
	socket.emit("save", { studentname: studentNameString, statename: "BulletOriginatorArray", data: BulletOriginatorArray });
	//console.log("ships " + this.ships);
	socket.emit("save", { studentname: studentNameString, statename: "ships", data: this.ships });
	//console.log("bullets");
	socket.emit("save", { studentname: studentNameString, statename: "bullets", data: this.bullets });
	//console.log("resources");
	socket.emit("save", { studentname: studentNameString, statename: "resources", data: this.resources });
	//console.log("stars");
	socket.emit("save", { studentname: studentNameString, statename: "stars", data: this.stars });
	//console.log("end");
	// for (var i = 0; i < this.entities.length; i++) {
		// console.log(this.entities[i]);
		// //this.entities[i].game = null;
		// var newObject = JSON.parse(JSON.stringify(this.entities[i]));
		// //var newObject = Object.clone(this.entities[i]);
		// //this.entities[i].game = this;
		 // //jQuery.extend(true, {}, );
		// //console.log(newObject);
		// newEntityArray.push(newObject);
		// //newEntityArray[i].game = null;
	// }
	
	for (var i = 0; i < this.entities.length; i++) {
		this.entities[i].game = this;

		if (this.entities[i].type == "Ship" && this.entities[i].shipType != "Carrier") {
			//console.log(carrierSaveArray);
			this.entities[i].carrier = ShipCarrierArray.pop();
			if (first) {
				first = false;
				//console.log(this.entities[i])
			}
		}
		if (this.entities[i].type == "Bullet") {
			this.entities[i].originator = BulletOriginatorArray.pop();
		}
	}
	// socket.emit("save", { studentname: studentNameString, statename: "gameState", data: newEntityArray });
	console.log("Game Saved");

}

GameEngine.prototype.load = function (socket) {
	this.data = [];
	var studentNameString = "Quinn Cox"
	//socket.emit("load", { studentname: studentNameString, statename: "gameState" });

	//console.log("ships");
	socket.emit("load", { studentname: studentNameString, statename: "ships" });
	//console.log("bullets");
	socket.emit("load", { studentname: studentNameString, statename: "bullets"});
	//console.log("resources");
	socket.emit("load", { studentname: studentNameString, statename: "resources"});
	//console.log("stars");
	socket.emit("load", { studentname: studentNameString, statename: "stars"});
	//console.log("ShipCarrierArray");
	socket.emit("load", { studentname: studentNameString, statename: "ShipCarrierArray"});
	//console.log("BulletOriginatorArray");
	socket.emit("load", { studentname: studentNameString, statename: "BulletOriginatorArray"});
	//console.log("end");
	//console.log("this.data.length " + this.data.length);
	//console.log("loaded from server");
	
}

GameEngine.prototype.loadData = function () {
	//console.log(dataObject);
	//console.log("this.data.length " + this.data.length);	
	this.entities = [];
	this.ships = [];
	this.carriers = [];
	this.bullets = [];
	this.resources = [];
	this.stars = [];
	
	var newEntityArray = [];
	var shipsTemp = [];
	var carriersTemp = [];
	var bulletsTemp = [];
	var resourcesTemp = [];
	var starsTemp = [];
	
	var ShipCarrierArrayTemp = [];
	var BulletOriginatorArrayTemp = [];
	for (var i = 0; i < this.data.length; i++) {
		//console.log("this.data[].length " + this.data[i].data.length + " " + this.data[i].statename );	
		switch (this.data[i].statename) {
			case "ships" :
				shipsTemp = this.data[i].data;
				for (var j = 0; j < shipsTemp.length; j++) {
					switch (shipsTemp[j].shipType) {
						case "Carrier" :
							var newCarrier = new Carrier(this, shipsTemp[j].teamnumber, shipsTemp[j]);
							newEntityArray.push(newCarrier);
							carriersTemp.push(newCarrier);
							break;
						case "Fighter" :
							var newFighter = new Fighter(this, {TeamNumber:0, color:0}, shipsTemp[j]);
							newEntityArray.push(newFighter);
							break;
						case "Frigate" :
							var newFrigate = new Frigate(this, {TeamNumber:0, color:0}, shipsTemp[j]);
							newEntityArray.push(newFrigate);
							break;
						case "Resourcer" :
							var newResourcer = new Resourcer(this, {TeamNumber:0, color:0}, shipsTemp[j]);
							newEntityArray.push(newResourcer);
							break;
						default:
							console.log("Error in loading ships.");
							break;
					}							
				}				
				break;
			case "bullets" :
				bulletsTemp = this.data[i].data;
				for (var j = 0; j < bulletsTemp.length; j++) {
					var newBullet = new Bullet(this, {x:0, y:0}, bulletsTemp[j]);
					newEntityArray.push(newBullet);	
				}			
				break;
			case "resources" :
				resourcesTemp = this.data[i].data;
				for (var j = 0; j < resourcesTemp.length; j++) {
					var newResource = new Resource(this, resourcesTemp[j]);
					newEntityArray.push(newResource);	
				}	
				break;
			case "stars" :
				starsTemp = this.data[i].data;
				for (var j = 0; j < starsTemp.length; j++) {
					var newStar = new Star(this, starsTemp[j]);
					newEntityArray.push(newStar);	
				}	
				break;
			case "ShipCarrierArray" :
				ShipCarrierArrayTemp = this.data[i].data;
				break;
			case "BulletOriginatorArray" :
				BulletOriginatorArrayTemp = this.data[i].data;
				break;
			default:
				console.log("Error in loading");
				break;
		}
	}
	//now connect the ships to their carriers
	var carrierCounter = 0;
	for (var i = 0; i < shipsTemp.length; i++) {
		if (shipsTemp[i].shipType != "Carrier") {
			//find the carrier
			shipsTemp[i].carrier = this.findCarrier(shipsTemp[i], carriersTemp, ShipCarrierArrayTemp[carrierCounter++]);
		}
	}
	//now connect the bullets to their originators
	//TODO: not currently using the originators for anything so I'll do it later.
	

	
	// var newEntityArray = data.data;
	// for (var i = 0; i < this.entities.length; i++) {
		// this.entities[i].game = this;

		// if (this.entities[i].type == "Ship" && this.entities[i].shipType != "Carrier") {
			// //console.log(carrierSaveArray);
			// this.entities[i].carrier = ShipCarrierArray.pop();
			// if (first) {
				// first = false;
				// console.log(this.entities[i])
			// }
		// }
		// if (this.entities[i].type == "Bullet") {
			// this.entities[i].originator = BulletOriginatorArray.pop();
		// }
	// }
	//console.log("newEntityArray.length " + newEntityArray.length)
	for (var i = 0; i < newEntityArray.length; i++) {
		//newEntityArray[i].game = this;
		// switch (newEntityArray[i].type) {
			// case "Star" :
			// newEntityArray[i] = new Star(this, newEntityArray[i]);
		// }
		this.addEntity(newEntityArray[i]);
	}

	console.log("Game Loaded");
	//this.start();
}

GameEngine.prototype.findCarrier = function (theShip, theCarrierArray, theTempCarrier) {
	var TeamNumber = theShip.TeamNumber
	var x = theTempCarrier.x;
	var y = theTempCarrier.y;
	var keepGoing = true;
	for (var i = 0; i < theCarrierArray && keepGoing; i++) {
		var testCarrier = theCarrierArray[i];
		if (testCarrier.x == theTempCarrier.x && 
				testCarrier.y == theTempCarrier.y && 
				testCarrier.TeamNumber == theTempCarrier.TeamNumber) {
			console.log("found correct carrier");
			theShip.carrier = testCarrier;
			keepGoing = false;
		}
	}
}

GameEngine.prototype.reset = function () {
		
	this.entities = [];
	this.ships = [];
    this.carriers = [];
    this.bullets = [];
	this.resources = [];
	this.stars = [];
	this.carrierTeamCounter = 0;
	//add entities here:
	this.addStars();
	this.addResources();
	this.addCarriers();
}

GameEngine.prototype.addCarriers = function () {
    var OneCarrier;
    for (var i = 0; i < this.numCarrierTeams; i++) {
        OneCarrier = new Carrier(this, this.carrierTeamCounter++);
        this.addEntity(OneCarrier);
    }
}

GameEngine.prototype.addResources = function () {
	var numResources = 30;
    var OneResource;
    for (var i = 0; i < numResources; i++) {
        OneResource = new Resource(this);
        this.addEntity(OneResource);
    }
}

GameEngine.prototype.addStars = function () {
	var numStars = 300;
    var OneStar;
    for (var i = 0; i < numStars; i++) {
        OneStar = new Star(this);
        this.addEntity(OneStar);
    }
}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
	if (entity.type === "Ship"){
		this.ships.push(entity);
		if (entity.shipType === "Carrier"){
			this.carriers.push(entity);			
		}
	} else if (entity.type === "Resource") {
		this.resources.push(entity);
	} else if (entity.type === "Bullet") {
		this.bullets.push(entity);
	} else if (entity.type === "Star") {
		this.stars.push(entity);
	}

}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
		if (!that.showMenu){
			that.loop();
			requestAnimFrame(gameLoop, that.ctx.canvas);
		} else {
			that.menuloop();
			requestAnimFrame(gameLoop, that.ctx.canvas);
		}
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
	//var that = this;
    var getXandY = function(e) {
        var x =  e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        return {x: x, y: y};
    }
	
	var getXandYWithWindowOffset = function(e) {
        var x =  e.clientX - that.ctx.canvas.getBoundingClientRect().left + that.getWindowX();
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top + that.getWindowY();
        //console.log("x: " + x + " y: " + y);
        return {x: x, y: y};
    }
    var getX = function(e) {
        var x =  e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        return x;
    }
    var getY = function(e) {
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        return y;
    }
    var that = this;

    if (this.ctx) {
        this.ctx.canvas.addEventListener("click", function(e) {
            //that.click = getXandY(e);
			that.click = getXandYWithWindowOffset(e);
            e.stopPropagation();
            e.preventDefault();
        }, false);
        
        this.ctx.canvas.addEventListener("mousemove", function(e) {
			that.mouse = getXandYWithWindowOffset(e); 
			that.x = that.mouse.x;
            that.y = that.mouse.y;
        }, false);
    }
    window.addEventListener('keydown',function(e){
        e.preventDefault();
        that.keyState[e.keyCode] = true;
    },false);    
    window.addEventListener('keyup',function(e){
        e.preventDefault();
        that.keyState[e.keyCode] = false;
    },false);

    console.log('Input started');
}


GameEngine.prototype.draw = function (top, left) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
	//console.log("drawing");
	for (var i = 0; i < this.stars.length; i++) {
        this.stars[i].draw(this.ctx);
    }	
	for (var i = 0; i < this.resources.length; i++) {
        this.resources[i].draw(this.ctx);
    }	
	for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].draw(this.ctx);
    }		
	for (var i = 0; i < this.ships.length; i++) {
        this.ships[i].draw(this.ctx);
    }
	
	// for (var i = 0; i < this.entities.length; i++) {
        // this.entities[i].draw(this.ctx);
    // }
	
	
    this.ctx.restore();
}

GameEngine.prototype.drawMenu = function (top, left) {
	var height = 100;
	var width = 200;
	this.outerSquare = {x:this.ctx.canvas.width/2 - width/2, y:this.ctx.canvas.height/2 - height/2, height:height, width:width};	
	
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
	

	
	this.ctx.beginPath();
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(this.outerSquare.x, this.outerSquare.y, this.outerSquare.width, this.outerSquare.height);
    this.ctx.fill();
    this.ctx.closePath();
	
	this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.rect(this.outerSquare.x, this.outerSquare.y, this.outerSquare.width, this.outerSquare.height);
    this.ctx.stroke();
    this.ctx.closePath();
	
	this.ctx.fillStyle = "white";
	this.ctx.font="25px Arial";
	
	var line1 = this.line1;
	var line2 = this.line2;
	var line3 = this.line3;
	if (this.FirstMenu) {
		line1 = "New Game"
		line3 = "to Start"
	}

	
	this.ctx.fillText(line1,this.outerSquare.x + 32,this.outerSquare.y + 30);	
	this.ctx.fillText(line2,this.outerSquare.x + 35,this.outerSquare.y + 60);
	this.ctx.fillText(line3,this.outerSquare.x + 38,this.outerSquare.y + 90);
	 
	 	// this.ctx.beginPath();
    // this.ctx.fillStyle = "yellow";
    // this.ctx.arc(outerSquare.x+30, outerSquare.y+30, 5, 0, Math.PI * 2, false);
    // this.ctx.fill();
    // this.ctx.closePath();
	 
	 	// this.ctx.beginPath();
    // this.ctx.fillStyle = "yellow";
    // this.ctx.arc(outerSquare.x, outerSquare.y, 5, 0, Math.PI * 2, false);
    // this.ctx.fill();
    // this.ctx.closePath();
	//circle
	// this.ctx.beginPath();
    // this.ctx.fillStyle = this.color;
    // this.ctx.arc(outerSquare.x, outerSquare.y, outerSquare.width, 0, Math.PI * 2, false);
    // this.ctx.fill();
    // this.ctx.closePath();
	
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
	//console.log("Updating1");
	
    var entitiesCount = this.entities.length;
	//console.log("entitiesCount " + entitiesCount);
    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        if (!entity.removeFromWorld) {
			//console.log("Updating");
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
			// if (this.entities[i].type = "Ship" && this.entities[i].shipType === "Resourcer") {
				// console.log(this.entities[i]);
			// }			
            this.entities.splice(i, 1);
        }
    }
	for (var i = this.ships.length - 1; i >= 0; --i) {
        if (this.ships[i].removeFromWorld) {			           
			// for (var j = this.carriers.length - 1; j >= 0; --j) {
				// if (this.carriers[j].TeamNumber == this.ships[i].TeamNumber) {
					// this.carriers[j].fighterCount--;
				// }
			// }
			//console.log(this.ships[i]);
			if (this.ships[i].shipType === "Fighter"){
				this.ships[i].carrier.fighterCount--;
			} else if (this.ships[i].shipType === "Resourcer"){
				this.ships[i].carrier.resourcerCount--;
				//console.log("resourcer destroyed.");
			} else if (this.ships[i].shipType === "Frigate"){
				this.ships[i].carrier.frigateCount--;
			} 
			this.ships.splice(i, 1);
        }
    }
	var carrierDestroyed = false;
    for (var i = this.carriers.length - 1; i >= 0; --i) {
        if (this.carriers[i].removeFromWorld) {
			carrierDestroyed = true;
			console.log("Team " + this.carriers[i].TeamNumber + " Carrier Destroyed.");
			var OneResource = new Resource(this);
			this.addEntity(OneResource);
			OneResource.x = this.carriers[i].x;
			OneResource.y = this.carriers[i].y;
			OneResource.amount = this.carriers[i].healthMax * 7;
            this.carriers.splice(i, 1);
        }
    }
	//check to see if only one team remains
	if (carrierDestroyed) {
		var carrierArray = [];
		for (var i = this.carriers.length - 1; i >= 0; --i) {
			carrierArray[this.carriers[i].TeamNumber] = 1;			
		}
		var numTeams = 0;
		for (var i = 0; i < carrierArray.length; i++){
			if (carrierArray[i] === 1) {
				numTeams++;
			}
		}
		if (numTeams === 1) {
			console.log("game over");
			this.showMenu = true;
		}
	}
	for (var i = this.resources.length - 1; i >= 0; --i) {
        if (this.resources[i].removeFromWorld) {
            this.resources.splice(i, 1);
        }
    }
    for (var i = this.bullets.length - 1; i >= 0; --i) {
        if (this.bullets[i].removeFromWorld) {
            this.bullets.splice(i, 1);
        }
    }
}

GameEngine.prototype.menuloop = function () {
    //this.clockTick = this.timer.tick();
    //this.update();
    //this.draw();
	//console.log("menuloop");
	this.drawMenu();
	if (this.click != null) {
		//console.log(this.click);
		if (this.click.x >= this.outerSquare.x && 
		this.click.x <= this.outerSquare.x + this.outerSquare.width &&
		this.click.y >= this.outerSquare.y && 
		this.click.y <= this.outerSquare.y + this.outerSquare.height) {
			this.showMenu = false;
			this.FirstMenu = false;
			this.reset();
		}
	}
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
    this.space = null;
}

GameEngine.prototype.loop = function () {
	//console.log("looping");
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
    this.space = null;
}
