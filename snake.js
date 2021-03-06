var allowPressKeys = false;
var currentPosition = {'x':50, 'y':50};
var playerName;
function checkSupported() {
  canvas = document.getElementById('canvas');
  if (canvas.getContext){
    $('#canvasContainer').hide();
    $('loginForm').hide();
    $('#ScoreContainer').hide();
    $('#gameZone').hide();
    $('#initials').focus();
    ctx = canvas.getContext('2d');
    this.gridSize = 10;
  } 
  else {
    // Canvas is not supported
    alert("We're sorry, but your browser seems to suck and can't handle the canvas tag. Please use any web browser other than Internet Explorer.");
  }
}

$(document).ready(function(){
  $('#save').unbind('click').bind('click', function(e){
    e.preventDefault();

    playerName = $('#initials').val();
    if(playerName.length != 3){
        alert("You must enter 3 initials" + playerName.length);
     }
     else{
      $('#ScoreContainer').hide();
      $('#canvasContainer').show();
      $('#playerName').html(' - ' + playerName);
      $('#loginForm').hide();
      $('#gameZone').fadeIn('slow');
      cookie.setScoreCookie();
      game.start();
     }
    });
});

var snake = {
  length :2,
  speed : 3,
  moveLeft:function(){
    },

  moveSnake:function(){
   switch(direction){
      case 'up':
        snake.moveUp();
        break;

      case 'down':
        snake.moveDown();
        break;

      case 'left':
        snake.moveLeft();
        break;

      case 'right':
        snake.moveRight();
        break;
    } 
  },

  hasEatenItSelf:function(element, index, array){
    return (element[0] == currentPosition['x'] && element[1] == currentPosition['y']);
  },

  hasFood:function(element, index, array){
    return (element[0] == foodPlacement[0] && element[1] == foodPlacement[1]);
  },

  moveUp:function(){
    if (upPosition() >= 0) {
      executeMove('up', 'y', upPosition());
    } else {
      game.gameOver();
      //whichWayToGo('x');
    }
  },

   moveDown:function(){
    if (downPosition() < canvas.height) {
      executeMove('down', 'y', downPosition());    
    } else {
      game.gameOver();
      //whichWayToGo('x');
    }
  },

  moveLeft:function(){
    if (leftPosition() >= 0) {
      executeMove('left', 'x', leftPosition());
    } else {
      game.gameOver();
      //whichWayToGo('y');
    }
  },

  moveRight:function(){
    if (rightPosition() < canvas.width) {
      executeMove('right', 'x', rightPosition());
    } else {
      game.gameOver();
      //whichWayToGo('y');
    }
  }
}

var food = {
  placeNew:function(){
   foodPlacement = [Math.floor(Math.random()*(canvas.width/gridSize))*gridSize, Math.floor(Math.random()*(canvas.height/gridSize))*gridSize];
   if(snakeBody.some(snake.hasFood)){
      food.placeNew();
    }
    else{
      ctx.fillStyle = "rgb(102,255,102)";
      ctx.fillRect(foodPlacement[0], foodPlacement[1], gridSize, gridSize);
    }   
  }
}

function drawSnake() {
  if(snakeBody.length >= 3 && snakeBody.some(snake.hasEatenItSelf)){
    game.gameOver();
    return false;
  }
  snakeBody.push([currentPosition['x'], currentPosition['y']]);
  ctx.fillStyle = "rgb(200,0,0)";
  ctx.fillRect(currentPosition['x'], currentPosition['y'], gridSize, gridSize);
  if(snakeBody.length > snakelength){
      var itemToRemove = snakeBody.shift();
      ctx.clearRect(itemToRemove[0], itemToRemove[1], gridSize, gridSize);
    }
    
    if(currentPosition['x'] == foodPlacement[0] && currentPosition['y'] == foodPlacement[1]){
      food.placeNew();
      snakelength += 1;
      game.score();
    }
}
var initials = "";
var score = {
  scores: [],
  add:function(score, name){
    scores.push(score + ':' + name);
  },

  highScore:function(){
    return scores.sort()[0];
  },

  save:function(){
    var cookie = cookie.getScoreCookie();
    if(cookie == 'undefined'){
      cookie.setScoreCookie();
    }
  },

  render:function(){
    var rows = "";
    var scoreRowrow = "<tr><td>[NAME]</td><td>[SCORE]</td></tr>";
    for( var row in scores)
      {
        scoreName = row.split(':');
        var formattedScoreRow = scoreRowrow.replace('[NAME]',scoreName[0]).replace('[SCORE]',scoreName);
        alert(formattedScoreRow);
        rows += formattedScoreRow;
      }
  }
}

var cookieName = 'snakeScore-' + initials;
var cookie = {
  setScoreCookie:function(){
    //if(cookie.getScoreCookie(cookieName) == 'undefined')
      cookie.setCookie(cookieName, initials + ':' + game.score(), 365);
  },
  
  getScoreCookie:function(){
    return cookie.getCookie(cookieName);
  },
  
  setCookie:function(c_name,value,expiredays)
  {
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=c_name+ "=" +escape(value)+
    ((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
  },

  getCookie:function(c_name)
  {
    if (document.cookie.length>0)
      {
      c_start=document.cookie.indexOf(c_name + "=");
      if (c_start!=-1)
        {
        c_start=c_start + c_name.length+1;
        c_end=document.cookie.indexOf(";",c_start);
        if (c_end==-1) c_end=document.cookie.length;
        return unescape(document.cookie.substring(c_start,c_end));
        }
      }
    return "";
  }

}

var gameOver = false;

var game = {
  start:function(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    currentPosition = {'x':50, 'y':50};
    snakeBody = [];
    snakelength = 3;
    food.placeNew();
    drawSnake();
    direction = 'right';
    gameOver = false;
    game.play();
  },
  
  score:function(){
    var currentScore = (snakelength - 3)*10;
     $('#score').html(currentScore);
     var speedIncrease = Math.round(currentScore/100);
     clearInterval(interval);
     interval = setInterval(snake.moveSnake, 100 - speedIncrease ); 
     return currentScore;
  },
  
  gameOver:function(){
    if(gameOver)
      return;
    gameOver = true;
    game.pause();
    alert("Game Over. Your score was "+ game.score());
    score.save();
    ctx.clearRect(0,0, canvas.width, canvas.height);
    $('#play_menu').hide();
    $('#restart_menu').show();  
  },

  restart:function(){
    game.pause();
    game.start();  
    game.score();
  },

  pause:function(){
    clearInterval(interval);
    allowPressKeys = false;
  },

  play:function(){
    interval = setInterval(snake.moveSnake, 100);
    allowPressKeys = true;
  }

}

function leftPosition(){
 return currentPosition['x'] - gridSize;  
}

function rightPosition(){
  return currentPosition['x'] + gridSize;
}

function upPosition(){
  return currentPosition['y'] - gridSize;  
}

function downPosition(){
  return currentPosition['y'] + gridSize;
}


function executeMove(dirValue, axisType, axisValue) {
  direction = dirValue;
  currentPosition[axisType] = axisValue;
  drawSnake();
}


document.onkeydown = function(event){
  var keyCode;

  if(!allowPressKeys){
    return null;
  }

  if(event == null){
      keyCode = window.event.keyCode;
  }
  else{
    keyCode = event.keyCode;
  }

  switch(keyCode){
// left 
  case 37:
    if(direction != "right")
      snake.moveLeft();
    break; 

  // up 
  case 38:
    if(direction != "down")
      snake.moveUp();
    break;


  // right 
  case 39:
    if(direction != "left")
      snake.moveRight();
    break; 

  // down
  case 40:
    if(direction != "up")
      snake.moveDown();
    break; 

  default: 
    break; 
    
  }
}

function whichWayToGo(axisType){  
  if (axisType=='x') {
    a = (currentPosition['x'] > canvas.width / 2) ? snake.moveLeft() : snake.moveRight();
  } else {
    a = (currentPosition['y'] > canvas.height / 2) ? snake.moveUp() : snake.moveDown();
  }
}
