
/* 
Kalle Liljeström

LaserPhaser Remastered
Made with Phaser 3

The game is a tweaked version of the lecture demo. 
Changes: 

faster pace
at the start always spawn on top of at least 1 platform,
some platforms move
added a more rare blue star worth 5 points
added wall jump
move with arrow keys
shoot enemies (ships) with mouse, if you get hit you die
added music and sounds for star pick ups, lasers and on death
main menu
2 gamemodes: horizontal and vertical platforms
game over screen with total score

Code sources:

Lecture demo week 7
Getting started with Phaser3: https://phaser.io/tutorials/getting-started-phaser3/index
Phaser labs examples: https://labs.phaser.io/
  -> Shooting logic and Bullets from: https://github.com/photonstorm/phaser3-examples/blob/master/public/src/physics/arcade/topdown%20shooter%20combat%20mechanics.js 
  -> Move to object logic from: https://github.com/photonstorm/phaser3-examples/blob/master/public/src/physics/arcade/move%20to%20pointer.js
  -> MainMenu scene logic from: https://labs.phaser.io/view.html?src=src\games\minesweeper\minesweeper.js
WASD movement keys by user Cornstipated from: https://www.html5gamedevs.com/topic/40607-how-to-replace-arrow-keys-with-wasd-movement/

Assets: 

Lecture demo week 7
Getting started with Phaser3: https://phaser.io/tutorials/getting-started-phaser3/index
CanonInD.mp3 https://incompetech.com/music/royalty-free/index.html?isrc=usuan1100301
PickUp.mp3, Laser.mp3 and GameOver.mp3 from pixabay.com
Ship2.png can't find source anymore
AirBach.mp3 cant find source anymore
*/

let game;

let gameOptions = {
  dudeGravity: 800,
  dudeSpeed: 300,
  gamemode: 0,
  totalScore: 0
};

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#000c1f",

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 1000
    },

    pixelArt: true,

    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          y: 0
        }
      }
    },
    scene: [MainMenu, PlayGame, GameOver]
  };

  game = new Phaser.Game(gameConfig);
  window.focus();
};


class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super({key: "MainMenu"});
    }

    //loading assets
    preload() {
      this.load.setPath('src/assets/Images');
      this.load.image("ground", "Platform.png");
      this.load.image("groundVertical", "PlatformVertical.png");
      this.load.image("star", "star.png");
      this.load.image("star2", "star2.png");
      this.load.image("ship", "Ship.png");
      this.load.image("bullet", "Laser.png");
      this.load.image("mainmenu", "MainMenu.png");
      this.load.image("gameOverScreen", "GameOverScreen.png");
  
      this.load.spritesheet("dude", "dude.png", {
  
        frameWidth: 32,
        frameHeight: 48  
      });
      this.load.setPath('src/assets/Audio');
      this.load.audio("Air", 'AirBach.mp3');
      this.load.audio("Canon", 'CanonInD.mp3');
      this.load.audio("PickUp", 'PickUp.mp3');
      this.load.audio("laser", "Laser.mp3");
      this.load.audio("gameOver", "GameOver.mp3") 

    }


    create ()
    {   

        this.input.mouse.disableContextMenu();

        this.highlight = this.add.rectangle(0, 400, 400, 300, 0x0182fb).setOrigin(0).setAlpha(0.75);
        

        this.intro = this.add.image(0, 0, 'mainmenu').setOrigin(0);

        const zone1 = this.add.zone(0, 400, 400, 300).setOrigin(0);
        const zone2 = this.add.zone(400, 400, 400, 300).setOrigin(0);
        const zone3 = this.add.zone(0, 700, 800, 300).setOrigin(0);

        zone1.setInteractive();
        zone2.setInteractive();
        zone3.setInteractive();
        
 
        zone1.on('pointerover', () => {
            this.highlight.y = zone1.y;
            this.highlight.x = zone1.x;
            this.highlight.width = zone1.width;
        });

        zone2.on('pointerover', () => {
            this.highlight.y = zone2.y;
            this.highlight.x = zone2.x;
            this.highlight.x = zone2.width;
        });

        zone3.on('pointerover', () => {
            this.highlight.y = zone3.y;
            this.highlight.x = zone3.x;
            this.highlight.width = zone3.width;
        });

        zone1.once('pointerdown', () =>
        {
          gameOptions.gamemode = 0;
          this.scene.start('PlayGame');
            
        });

        zone2.once('pointerdown', () =>
        {
          gameOptions.gamemode = 1;
          this.scene.start('PlayGame');
        });

    }

    
}

class PlayGame extends Phaser.Scene {
  constructor() {
    super({key: "PlayGame"});
    this.score = 0;
    this.score2 = 0;
    this.targetX = 0;
    this.targetY = 0;
  }

  

  create() {

    gameOptions.totalScore = 0;

    // Adding sounds
    this.pickUp = this.sound.add('PickUp', {volume: 0.5});
    this.laser = this.sound.add('laser', {volume: 0.3});
    
    if (gameOptions.gamemode === 0) {
      this.music = this.sound.add('Air', {volume: 0.3, loop: true});
    } else {
      this.music = this.sound.add('Canon', {volume: 0.5, loop: true});
    }
    
    
    if (!this.music.isPlaying) {
      this.music.play();
    }
    

    this.groundGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    // Making platforms horizontal or vertical based on gamemode
    let platform = "ground";
    if (gameOptions.gamemode === 0) {
        platform = "ground";
    } else {
      platform = "groundVertical";
    }

    // Create initial platforms (sometimes still leads to unplayable starting situations)
    this.groundGroup.create(
      game.config.width / 2,
      game.config.height * (2 / 3),
      platform
    );
    for (let i = 0; i < 15; i++) {
      let xCoordinate = Phaser.Math.Between(0, game.config.width);
      let ground = this.groundGroup.create(
        Phaser.Math.Between(0, xCoordinate),
        Phaser.Math.Between(0, game.config.height),
        platform
      );
      if (Phaser.Math.Between(0, 1) === 1) {
        if (xCoordinate > game.config.width / 2) {
          ground.setVelocityX(gameOptions.dudeSpeed / -10);
        } else {
          ground.setVelocityX(gameOptions.dudeSpeed / 10);
        }
      }
    }

    // Player character and colliders
    this.dude = this.physics.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "dude"
    );
    this.dude.body.gravity.y = gameOptions.dudeGravity;
    this.physics.add.collider(this.dude, this.groundGroup);

    this.starsGroup = this.physics.add.group({});
    this.physics.add.collider(this.starsGroup, this.groundGroup);
    
    this.shipGroup = this.physics.add.group({allowGravity: false});
    

    this.physics.add.overlap(
      this.dude,
      this.starsGroup,
      this.collectStar,
      null,
      this
    );
    this.physics.add.overlap(this.dude, this.shipGroup, this.shipHit, null, this);
    
    this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.physics.add.overlap(this.shipGroup, this.playerBullets, this.shootShip, null, this);

    // Fires bullet from player on left click of mouse
    this.input.on('pointerdown', (pointer, time) =>
    {
      console.log("shoot")
        if (this.dude.active === false) { return; }

        // Get bullet from bullets group
        const bullet = this.playerBullets.get().setActive(true).setVisible(true);
        

        if (bullet)
        {
            this.laser.play()
            this.targetX = pointer.x;
            this.targetY = pointer.y;
            bullet.fire(this.dude, this.targetX, this.targetY);
            
        }
    });

    // Star counters in top left corner
    this.add.image(16, 16, "star");
    this.scoreText = this.add.text(32, 3, "0", {
      fontSize: "30px",
      fill: "#ffffff"
    });

    this.add.image(80, 16, "star2");
    this.scoreText2 = this.add.text(96, 3, "0", {
      fontSize: "30px",
      fill: "#ffffff"
    });

    // Move player with WASD instead of arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors = this.input.keyboard.addKeys(
      {up:Phaser.Input.Keyboard.KeyCodes.W,
      down:Phaser.Input.Keyboard.KeyCodes.S,
      left:Phaser.Input.Keyboard.KeyCodes.A,
      right:Phaser.Input.Keyboard.KeyCodes.D});

    // Animations
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 10
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.triggerElements = this.time.addEvent({
      callback: this.addElements,
      args: [platform],
      callbackScope: this,
      delay: 1000,
      loop: true
    });
  }

  
  // Create new platforms, stars, enemies over time
  addElements(platform) {
    
    
    let xCoordinate = Phaser.Math.Between(0, game.config.width);

    let ground = this.groundGroup.create(xCoordinate, 0, platform);
    this.groundGroup.setVelocityY(gameOptions.dudeSpeed / 4);

    if (Phaser.Math.Between(0, 2) === 2) {
      if (xCoordinate > 400) {
        ground.setVelocityX(gameOptions.dudeSpeed / -10);
      } else {
        ground.setVelocityX(gameOptions.dudeSpeed / 10);
      }

      if (Phaser.Math.Between(0, 1)) {
        this.starsGroup.create(
          Phaser.Math.Between(0, game.config.width),
          0,
          "star"
        ).setData('star2', false);
        this.starsGroup.setVelocityY(gameOptions.dudeSpeed);
      }
      if (Phaser.Math.Between(0, 5) === 5) {
        this.starsGroup.create(
          Phaser.Math.Between(0, game.config.width),
          0,
          "star2"
        ).setData('star2', true);
        this.starsGroup.setVelocityY(gameOptions.dudeSpeed);
      }
      if (Phaser.Math.Between(0, 1)) {
        let enemy = this.shipGroup.create(
          Phaser.Math.Between(0, game.config.width),
          0,
          "ship"
        );
        this.physics.moveToObject(enemy, this.dude, 200);
        enemy.rotation = 1.57079633 + Phaser.Math.Angle.Between(enemy.x, enemy.y, this.dude.x, this.dude.y); // angle ship to dude
        
      }
      
    }
  }

  
  collectStar(dude, star) {
    star.disableBody(true, true);
    this.pickUp.play()
    if (star.getData('star2')) {
      this.score2 += 1;  
    this.scoreText2.setText(this.score2);
    } else {
    this.score += 1;  
    this.scoreText.setText(this.score);
    }
    
  }

  shipHit(dude, ship){
    this.playerDead();
  }

  shootShip(ship, bullet){
    ship.disableBody(true,true);
    //bullet.disableBody(true,true);
  }


  update() {
  
    // Player movement
    if (this.cursors.left.isDown) {
      this.dude.body.velocity.x = -gameOptions.dudeSpeed;
      this.dude.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.dude.body.velocity.x = gameOptions.dudeSpeed;
      this.dude.anims.play("right", true);
    } else {
      this.dude.body.velocity.x = 0;
      this.dude.anims.play("turn", true);
    }

    // Jump and wall jump
    if (
      this.cursors.up.isDown &&
      (this.dude.body.touching.down ||
        this.dude.body.touching.left ||
        this.dude.body.touching.right)
    ) {
      this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.6;
    }

    // Kill player if below or above screen
    if (this.dude.y > game.config.height || this.dude.y < 0) {
      this.playerDead();
    }
  }
  
  playerDead() {
    gameOptions.totalScore = this.score + (this.score2 * 5);
    this.score = 0;
    this.score2 = 0;
    this.music.stop()
    this.scene.start("GameOver");
  }
}


class GameOver extends Phaser.Scene
{
    constructor ()
    {
        super({key: "GameOver"});
    }

    create ()
    {
      this.gameOver = this.sound.add('gameOver', {volume: 0.5});
      this.gameOver.play();
      
      this.input.mouse.disableContextMenu();

      this.highlight = this.add.rectangle(0, 400, 400, 300, 0x0182fb).setOrigin(0).setAlpha(0.75);
      

      this.intro = this.add.image(0, 0, 'gameOverScreen').setOrigin(0);

      const zone1 = this.add.zone(0, 400, 400, 300).setOrigin(0);
      const zone2 = this.add.zone(400, 400, 400, 300).setOrigin(0);
    

      zone1.setInteractive();
      zone2.setInteractive();
    

      zone1.on('pointerover', () => {
          this.highlight.y = zone1.y;
          this.highlight.x = zone1.x;
          this.highlight.width = zone1.width;
      });

      zone2.on('pointerover', () => {
          this.highlight.y = zone2.y;
          this.highlight.x = zone2.x;
          this.highlight.x = zone2.width;
      });

  

      zone1.once('pointerdown', () =>
      {
        this.scene.start('PlayGame');
          
      });

      zone2.once('pointerdown', () =>
      {
        this.scene.start('MainMenu');
      });

      // Show totalscore on screen
      this.totalScoreText = this.add.text(400, 367, gameOptions.totalScore, {
        fontSize: "40px",
        fill: "#ffffff"
      });
     
  }
}

// Source: https://github.com/photonstorm/phaser3-examples/blob/master/public/src/physics/arcade/topdown%20shooter%20combat%20mechanics.js
class Bullet extends Phaser.GameObjects.Image
{
    constructor (scene)
    {
        super(scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        
    }

    fire (shooter, targetX, targetY)
    {
      console.log("bullet")
      
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan((targetX - this.x) / (targetY - this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (targetY >= this.y)
        {
            this.xSpeed = this.speed * Math.sin(this.direction);
            this.ySpeed = this.speed * Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed * Math.sin(this.direction);
            this.ySpeed = -this.speed * Math.cos(this.direction);
        }

        this.rotation =  1.57079633 + Phaser.Math.Angle.Between(shooter.x, shooter.y, targetX, targetY); // angle bullet with shooters rotation
        console.log(this.rotation)
        this.born = 0; // Time since new bullet spawned
        
    }

    update (time, delta)
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

