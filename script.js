  //SAMPLE PHASER GAME
  //By Matt Parker and Bennett Foddy
  //NYU Game Center 2015

  //Creates a new Phaser Game
  //You might want to check here to understand the basics of Phaser: http://www.photonstorm.com/phaser/tutorial-making-your-first-phaser-game
  var game = new Phaser.Game(520, 520, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render});

  //define a variable to control the speed of player movement
  var speed = 100;

  //variable for keyboard input
	var cursors;

  //variable we will use for our player sprite (ring)
  var player;

  //variable that shows the current color of the player (last dot hit, starts as white)
  var playerColorIndex;

  //variable that will reference the group of dots on the screen
  var dots;

  //variable for the score
  var score = 0;

  var biteCount = 0;
  var playing = false;

  var xWindowDelta = 0;
  var yWindowDelta = 0;

  //variable for the direction the player will turn when it hits a dot
  var nextDir = -1;

  //variables that contain the 4 directions, the player can move: Up, Down, Left, and Right
  var DIR_UP    = 0;
  var DIR_DOWN  = 1;
  var DIR_LEFT  = 2;
  var DIR_RIGHT = 3;

  //varaible that will contain whether the player can turn at a given time,
  //check the "update" and "turn" functions for more details
  var canTurn = true;

  //array of dot color names
  var colorArray = ['red', 'green', 'blue', 'yellow', 'white'];

  var soundArray = ['firstBite', 'secondBite', 'thirdBite', 'fourthBite'];

  var song;

  var gameOverText = null;

  //array of dot colors, 0xff0000 == red, 0x00ff00 = green, 0x00ffff == blue, etc
  var tintArray = [0xff0000, 0x00ff00, 0x00ffff, 0xffff00, 0xffffff];


  var bitesArray = [0,0,0,0,0];

  var spriteSheetArray = ['redFace', 'greenFace', 'blueFace', 'yellowFace'];

  //the "preload" function allows you to load images, text, fonts, sounds, and more when your program first starts,
  //so they will be fast to use later. They are loaded into a "cache", or into memory of the application where they
  //can easily be located later. It also allows you to set up initial variables.
  function preload () {

    //LOAD IMAGES
    //the player image into memory

    game.load.spritesheet('default', 'assets/image/faceSheet.png', 64, 64);
    game.load.spritesheet(spriteSheetArray[0], 'assets/image/faceSheetRed.png', 64, 64);
    game.load.spritesheet(spriteSheetArray[1], 'assets/image/faceSheetGreen.png', 64, 64);
    game.load.spritesheet(spriteSheetArray[2], 'assets/image/faceSheetBlue.png', 64, 64);
    game.load.spritesheet(spriteSheetArray[3], 'assets/image/faceSheetYellow.png', 64, 64);

    //all the dot images into memory
    //colorArray[0] == 'red', colorArray[1] == 'green', colorArray[2] == 'blue',etc. See line 39
    game.load.image(colorArray[0], 'assets/image/redApple.png');
    game.load.image(colorArray[1], 'assets/image/greenGrape.png');
    game.load.image(colorArray[2], 'assets/image/blueBerry.png');
    game.load.image(colorArray[3], 'assets/image/yellowMelon.png');

    game.load.audio(soundArray[0], 'assets/sound/firstBite.wav');
    game.load.audio(soundArray[1], 'assets/sound/secondBite.wav');
    game.load.audio(soundArray[2], 'assets/sound/thirdBite.wav');
    game.load.audio(soundArray[3], 'assets/sound/fourthBite.wav');

    game.load.audio('song', 'assets/sound/song.ogg');

  }

  function create () {
    //create the player sprite, using the image with the key 'player'
  	player = game.add.sprite(game.world.width/2, game.world.height/2, 'default');

    player.animations.add('eat', [0, 2], 5, true);

    player.frame = 0;
    //set the scale to half size, the image is twice as large as we want it to show up in the game
    player.scale.set(0.75, 0.75);
    //set the anchor to the middle, not the side
    player.anchor.setTo(0.5, 0.5);
    //enable physics on the player sprite
    game.physics.arcade.enable(player);
    //create a small collision box for the player, comment in line 157 to see the bounding box
    player.body.setSize(64, 64, 0, 0);
    //make the initial player color 5 (white, no color)
    player.color = 5;

    //create a group for dots and give them physics
    dots = game.add.group();
    dots.enableBody = true;

    //create a variable for tracking when players hit buttons on the keyboard
    cursors = game.input.keyboard.createCursorKeys();


    for(var i = 0; i < 4; i++) {
      bitesArray[i] = game.add.audio(soundArray[i]);
      bitesArray[i].onStop.add(playStopped, this);
    }

    song = game.add.audio('song');
    song.onStop.add(playStopped, this);

    //call the 'makeDots' on line 239, which creates dots in all 4 adjacent positions
    //to the player if there isn't already a dot there
    makeDots();
  }

  //In Phaser, the 'update' function is called once per frame. It's a place where you can check for
  //user input and react to it, check for collisions and react to them, etc.
  function update(){

    if(gameOverText) {
      if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        //reset();
        gameOverText.destroy();
        gameOverText = null;
        reset();
        makeDots(); //call the 'makeDots' on line 201, which creates dots in all 4 adjacent positions
      }

      return;
    }
    if(!playing) {
      player.animations.stop();
    }

    if (cursors.up.isDown) //if the up arrow is pressed
    {
      //set the nextDir variable to the value of DIR_UP, which is 0 (see line 29)
      nextDir = DIR_UP;
      player.frame = 1;
    } else if (cursors.down.isDown){ //otherwise, if the down arrow is pressed
      //set the nextDir variable to the value of DIR_DOWN, which is 0 (see line 30)
      nextDir = DIR_DOWN;
      player.frame = 0;
  	} else if (cursors.left.isDown){ //otherwise, if the left arrow is pressed
      //set the nextDir variable to the value of DIR_LEFT, which is 0 (see line 31)
      nextDir = DIR_LEFT;
      player.frame = 3;
    } else if (cursors.right.isDown){ //otherwise, if the right arrow is pressed
      //set the nextDir variable to the value of DIR_RIGHT, which is 0 (see line 32)
      nextDir = DIR_RIGHT;
      player.frame = 4;
    }
    if(playing && nextDir == DIR_DOWN){
      player.animations.play('eat')
    }


    //loop through all the dots
    for(var i = 0; i < dots.children.length; i++){
      //for each dot in the group, use the place holder varibale "dot"
      var dot = dots.children[i];

      if(playerHit(dot)){ //if the player is hitting a dot
        playBite();
        //player.position.set(dot.position.x, dot.position.y); //jump the player to the exact position of the dot

        if(player.color != dot.color){ //if the color of the dot doesn't match the player's color
          score++;  //add one to the score
          player.color = dot.color; //make the player color equal to the color of the dot we just hit
          player.loadTexture(spriteSheetArray[player.color]);
          dots.remove(dot, true); //remove the dot from the group and destroy the sprite
          console.log("score: " + score); //print out the score to the javascript console
          if(speed < 350) {
            speed += 10;
          }
        } else {
          gameOverText = game.add.text(game.world.centerX, game.world.centerY + 50, "",
                              { font: "20px Arial", fill: "#ffFFFF", align: "center" });
          gameOverText.anchor.setTo(0.5, 0.5);
          gameOverText.setText("You need a balanced diet\n (spacebar to reset)");
          player.body.velocity.x = 0;
          player.body.velocity.y = 0;
          song.stop();
        }
        canTurn = true; //set the player's ability to turn to true
        makeDots(); //call the 'makeDots' on line 201, which creates dots in all 4 adjacent positions
      }
    }

    //if(canTurn){ //if the player can turn
      turn(); //call the 'turn' on line 180, which changes the players durection to based on what nextDir is set to
    //}

    if(!Phaser.Rectangle.containsPoint(game.world.bounds, player.position)){ //if the player has left the screen
      gameOverText = game.add.text(game.world.centerX, game.world.centerY + 50, "",
                          { font: "20px Arial", fill: "#ffFFFF", align: "center" });
      gameOverText.anchor.setTo(0.5, 0.5);
      gameOverText.setText("Stay in your box\n (spacebar to reset)");
      player.body.velocity.x = 0;
      player.body.velocity.y = 0;
      canTurn = true; //set the player's ability to turn to true

    }
  }

  //The 'render' function is called once per frame in Phaser. It's mostly used to render extra debug
  //information on top of what what Phaser automatically shows you. Here we are using it to render the player's score
  function render(){
    game.debug.text("Score: " + score , game.world.width/2 - 40, 32);
    //try commenting the line below in. It will show the player's hitbox.
    //game.debug.body(player);
  }

  //function that resets the game
  function reset(){
    player.position.set(game.world.width/2, game.world.height/2); //move the player back to the middle

    player.loadTexture('default');
    song.stop();
    score = 0;  //set the score to 0
    biteCount = 0;
    playing = false;

    player.body.velocity.x = 0; //stop the player movement on the x axis
    player.body.velocity.y = 0; //stop the player movement on the y axis

    player.color = 4; //set the player color to white

    nextDir = -1; //set the nextDir to -1

    dots.removeAll(true); //remove all the dots from the dots group and destroy them

    speed = 100;

  }

  //function that turns the player
  function turn(){

    if(nextDir != -1){ //if next dir isn't equal to -1
      canTurn = false; //set "canTurn" to false
    }

    player.body.velocity.x = 0; //stop the player movement on the x axis
    player.body.velocity.y = 0; //stop the player movement on the y axis

    if(nextDir == DIR_UP){ //if nextDir is set to DIR_UP
      player.body.velocity.y = -speed; //make the player move up
    } else if(nextDir == DIR_DOWN){ //if nextDir is set to DIR_DOWN
      player.body.velocity.y = speed; //make the player move down
    } else if(nextDir == DIR_LEFT){ //if nextDir is set to DIR_LEFT
      player.body.velocity.x = -speed; //make the player move left
    } else if(nextDir == DIR_RIGHT){ //if nextDir is set to DIR_RIGHT
      player.body.velocity.x = speed; //make the player move right
    }
  }

  function playBite(){
    if(!playing)
    {
      if(biteCount > 6) {
        song.play();
        game.time.events.add(Phaser.Timer.SECOND * 6.1, function() { speed += 100;}, this);
      }
      else {
      bitesArray[biteCount % 4].play();
    }
      playing = true;
      biteCount++;
      if(xWindowDelta < 250) {
        xWindowDelta += 25;
      }
      if(yWindowDelta < 90) {
        yWindowDelta += 10
      }
      game.width = 520 + xWindowDelta;
      game.height = 520 + yWindowDelta;
      game.world.width = 520 + xWindowDelta;
      game.world.height = 520 + yWindowDelta;

      game.renderer.resize(game.width, game.height);
      window.dispatchEvent(new Event('resize'));
    }

  }

  function playStopped() {
    playing = false;
  }

  //function that creates dots up, down, left and right of the player
  function makeDots(){
    console.log("makeDots"); //print out "makeDots" to the javascript console

    var colorIndex = score; //set color index to the current score
    var dotRoll = Math.random() * 10;

    var hasDot = true;

    //select a position to the left of the player
    while(hasDot) {
      var pos = new Phaser.Point(Math.random() * (480 + xWindowDelta) + 32, Math.random() * 480 + 32);
      var distanceToPlayer = Math.abs(player.body.x - pos.x) + Math.abs(player.body.y - pos.y);
      //pos = adjustToBeat(pos, distanceToPlayer);
      console.log(pos);
      hasDot = checkHasDot(pos, distanceToPlayer); //call the "checkHasDot" on line 251 to see if there is already a dot there
    }
    makeDot(colorIndex, pos); //call the "makeDot" function on line 239 to make a dot there
    colorIndex++; //add 1 to colorIndex

    if(dotRoll > 5) {
      var hasDot = true;
      //select a position to the right of the player
      while(hasDot) {
      var pos = new Phaser.Point(Math.random() * 480 + 32, Math.random() * 480 + 32);
      var distanceToPlayer = Math.abs(player.body.x - pos.x) + Math.abs(player.body.y - pos.y);
      //pos = adjustToBeat(pos, distanceToPlayer);
      console.log(pos);
      hasDot = checkHasDot(pos, distanceToPlayer); //call the "checkHasDot" on line 251 to see if there is already a dot there
      }
      makeDot(colorIndex, pos); //call the "makeDot" function on line 239 to make a dot there
      colorIndex++; //add 1 to colorIndex
      }

    if(dotRoll > 8) {
      var hasDot = true;
      //select a position to the right of the player
      while(hasDot) {
      var pos = new Phaser.Point(Math.random() * (480 + xWindowDelta) + 32, Math.random() * 480 + 32);
      var distanceToPlayer = Math.abs(player.body.x - pos.x) + Math.abs(player.body.y - pos.y);
      //pos = adjustToBeat(pos, distanceToPlayer);
      console.log(pos);
      hasDot = checkHasDot(pos, distanceToPlayer); //call the "checkHasDot" on line 251 to see if there is already a dot there
      }
      makeDot(colorIndex, pos); //call the "makeDot" function on line 239 to make a dot there
      colorIndex++; //add 1 to colorIndex
      }
  }

  //function that makes a dot on in the dots group, based on a 2 passes parameters: colorIndex and position
  function makeDot(colorIndex, pos){
    //make a dot sprite from the dots group
    //use the colorArray (see line 39) to select the image
    //use the 'mod' (same as remainder) of the colorIndex to choose a color (4%4 == 0, 5%4 == 1, 6%4 == 2, etc)
    if(colorArray[colorIndex%4] == player.color)
    {
      colorIndex++;
    }
    var dot = dots.create(pos.x, pos.y, colorArray[colorIndex%4]);

    dot.color = colorIndex%4; //set the dot color to the color based on the mod

    dot.anchor.setTo(0.5, 0.5); //set the anchor to the middle, not the side
    dot.scale.set(0.5, 0.5); //set the scale to half size, the image is twice as large as we want it to show up in the game
  }

  function adjustToBeat(pos, distanceToPlayer) {
    beatDistance = 2.45 * speed;
    beatDistance = beatDistance % 245;

    offset = distanceToPlayer % beatDistance;

    console.log("BeatDistance: ", beatDistance, "distanceToPlayer: ", distanceToPlayer);

    if(pos.x < 240) {
      pos.x += beatDistance;
    }
    else {
      pos.x -= beatDistance;
    }

    return pos;
  }
  //function that checks to see if the passed postion already has a dot, if it does, returns true, if not, returns false
  function checkHasDot(pos, distanceToPlayer){
    var hasDot = false; //make a hasDot variable, set it to dot

    playerBox = player.getBounds();

    if(distanceToPlayer < speed) {
      console.log("too close!");
      return true;
    }

    for(var i = 0; i < dots.children.length; i++){ //loop through all the numbers from 0 to the number of children dots has
      var dot = dots.children[i]; //for each dot in the group, use the place holder varibale "dot"

      if(Phaser.Rectangle.containsPoint(dot.getBounds(), pos) ||
                    Phaser.Rectangle.containsPoint(playerBox, pos)){ //if the position "pos" is inside of that dots position
        hasDot = true; //set hasDot to true
      }
    }

    if(pos.x < 32 || pos.x > (490 + xWindowDelta) || pos.y < 32 || pos.y > 490) {
      hasDot = true;
    }

    return hasDot; //return the value of hasDot (either true or false)
  }

  //function to see if a player hit a dot
  function playerHit(dot){
    return (player.body.hitTest(dot.position.x, dot.position.y)); //check to see if the sprite position is inside of the player's hitbox
  }
