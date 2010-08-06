// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.debug.LogManager');
goog.require('goog.i18n.NumberFormat');

goog.require('pixelLab.ImagePreloader');
goog.require('pixelLab.DebugDiv');

goog.require('eightball.PoolTable');
goog.require('eightball.Music');
goog.require('eightball.SoundEffect');
goog.require('eightball.SoundEffectManager');
goog.require('eightball.Game');
goog.require('eightball.Game.EventType');
goog.require('eightball.Game.GameState');

var poolTable;
var musicManager;
var game;
var soundManager;

// displays loading information and preloads all other content then
// calls loadApp
var loadContent = function() {
  pixelLab.DebugDiv.enable();
  pixelLab.ImagePreloader.preload("images/bestscore.png, images/cue.png, images/progressbg.png, images/progressunit.png, images/score.png, images/table.jpg, images/tableborder.png, images/timeremaining.png, images/wood.jpg");
  goog.global.setTimeout(loadApp, 500);
};

var loadApp = function() {

  // show the content, hide the loading element
  $('#loading').fadeOut(400);
  $('#game').fadeIn(1000);
  $('#gamecontrolsouter').fadeIn(1000);

  // music
  musicManager = new eightball.Music("sounds/theme.mp4");

  // sound
  soundManager = new eightball.SoundEffectManager();
  soundManager.add("tick", new eightball.SoundEffect("sounds/tick.mp3", 1));

  // global elements
  var minutesremaining = $('#minutesremaining');
  var secondsremainingtens = $('#secondsremainingtens');
  var secondsremainingones = $('#secondsremainingones');
  var progress = $('#progress');
  var overlay = $('#overlay');
  var start = $('#start');

  // other globals 
  var lastBars = 29;

  // event handlers
  var _tickAction = function() {

    var min = Math.floor(game.secondsLeft / 60);
    var sec = game.secondsLeft % 60;
    var sectens = Math.floor(sec / 10);
    var secones = sec % 10;

    minutesremaining.html(min);
    secondsremainingtens.html(sectens);
    secondsremainingones.html(secones);

    var bars = Math.floor((game.secondsLeft - 1) / 4);

    if (bars != lastBars) {
      lastBars = bars;
      progress.width(15 * bars);
      //soundManager.play("tick");
    }

    pixelLab.DebugDiv.clear();
    goog.debug.LogManager.getRoot().info("0" + min + ":" + (sec < 10 ? "0" + sec : sec));
    var fmt = new goog.i18n.NumberFormat('#,###.##');
    var str = fmt.format(poolTable.stepsPerSecond());
    goog.debug.LogManager.getRoot().info("FPS: " + str);
  };

  var _highScoreAction = function() {
    $('#bestscore').html(game.highScore);
  };

  var _readyAction = function() {
    start.delay(800).fadeIn(400);
  };

  start.click(function() {
    start.fadeOut(100, start.hide());
    overlay.fadeOut(400);
    game.start();
  });

  // create a game object
  game = new eightball.Game();

  // register for game events
  goog.events.listen(game, eightball.Game.EventType.TICK, _tickAction);
  goog.events.listen(game, eightball.Game.EventType.HIGHSCORE, _highScoreAction);
  goog.events.listen(game, eightball.Game.EventType.READY, _readyAction);

  // calling reset after the game has been loaded fires the events we 
  // need to initialize everything for game play
  game.reset();

  var canvasElement = $('canvas#demo_canvas')[0];
  var cueCanvasElement = $('canvas#cue_canvas')[0];
  if (canvasElement) {
    poolTable = new eightball.PoolTable(canvasElement, cueCanvasElement);

    var width = window.innerWidth;
    var height = window.innerHeight;
    poolTable.updateLayout(width, height);
  }

  var updateMusicButton = function() {
    if (musicManager.isMusicOn()) {
      $("#musicbuttonon").fadeIn("fast");
    } else {
      $("#musicbuttonon").fadeOut("fast");
    }
  };

  var updateSoundButton = function() {
    if (soundManager.isSoundOn()) {
      $("#soundsbuttonon").fadeIn("fast");
    } else {
      $("#soundsbuttonon").fadeOut("fast");
    }
  };

  // music on/off
  $("#musicbutton").click(function() {
    musicManager.toggleMusic();
    updateMusicButton();
  });

  // sound effects on/off
  $("#soundsbutton").click(function() {
    soundManager.toggleSound();
    updateSoundButton();
  });

  updateMusicButton();
  updateSoundButton();

  // sound effects test code
  $(".soundtest").click(function() {
    soundManager.play(this.id);
  });
};

$(window).load(loadContent);

$(window).resize(function(e) {
  var width = window.innerWidth;
  var height = window.innerHeight;
  poolTable.updateLayout(width, height);
});

$(window).keypress(function(e) {
  // 114 -> 'r'
  if (e.which == 114) {
    poolTable.rackEm();
  }
});
