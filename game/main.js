console.log("starting");
var ASSET_MANAGER = new AssetManager();

function Background(game, image) {
    NonLivingEntity.call(this, game, 0, 400);
    this.radius = 200;
    NonLivingEntity.prototype.setImage(image);
   this.image = image;
}

Background.prototype = new NonLivingEntity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    
}

Background.prototype.draw = function (ctx) {
     NonLivingEntity.prototype.draw.call(this, ctx);
}

//ASSET_MANAGER.queueDownload("./images/Player2.png");
/** From 435 */
ASSET_MANAGER.downloadAll(function () {
	//console.log(document.readyState);
	// while (document.getElementById('SpaceSector') == null) {
	// }
	// if (document.readyState == "interactive") {
		// main();
	// }
	main();
});

function main() {
	console.log("starting up main");
	//console.log(document);
	// console.log(document.getElementsByTagName('*'))
	// console.log(document.getElementById('SpaceSector'))
    var canvas = document.getElementById('SpaceSector');
    var ctx = canvas.getContext('2d'); 
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
}

