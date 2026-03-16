
window.addEventListener("resize", updatePlayerLabels);
// DOM queries
const gameGrid = document.querySelector("#grid");
const themeInput = document.getElementsByName("theme");
const numberOfPlayers = document.getElementsByName("players");
const gridSize = document.getElementsByName("grid-size");
const form = document.querySelector("form");
const multiPlayer = document.querySelector('.multiplayer-stats');
const soloPlayer = document.querySelector('.solo-stats');
const newGame = document.querySelectorAll('[data-action="new-game"]');
const restartGame = document.querySelectorAll('[data-action="restart"]');
const menuButton = document.querySelector('#menu');
const menuModal = document.querySelector('.menu-modal');


// gameState object
const gameState = {
    playersOption: undefined,
    players: undefined,
    theme: undefined,
    gridSelection: undefined,
    numbers: [],
    randomNumbersArray: [],
    icons: ['./assets/icons/museum.svg', './assets/icons/music.svg', './assets/icons/passport.svg', './assets/icons/pepper-hot.svg', './assets/icons/pizza-slice.svg', './assets/icons/plane-up.svg', './assets/icons/rocket.svg', './assets/icons/sailboat.svg', './assets/icons/school.svg', './assets/icons/scissors.svg', './assets/icons/smile-wink.svg', './assets/icons/snowboarding.svg', './assets/icons/snowflake.svg', './assets/icons/snowman.svg', './assets/icons/soccer-ball.svg', './assets/icons/socks.svg', './assets/icons/umbrella.svg', './assets/icons/water-ladder.svg'],
    randomIcons: [],
    randomIconsArray: [],
    intervalId: null,
    startGame: false,
    soloMovesCount: 0,
    minutes: 0,
    seconds: 0,
    correctPairsCount: 0,
    selectedCard: [],
    selectedItem: [],
    correcChoice: false,
    playersScores: [],
    index: 0,
    counter: 0,
    playersRanking: [],
    testStartTime: null,
    timerValue: 0,
    currentPlayer: 0,
    lockBoard: false,
}

// setup / reset functions
function setupNewGame(){
    // Stop running timer
    stopTimer();

    // Reset state
    gameState.playersOption = undefined;
    gameState.players = undefined;
    gameState.theme = undefined;
    gameState.gridSelection = undefined;

    gameState.numbers = [];
    gameState.randomNumbersArray = [];
    gameState.randomIcons = [];
    gameState.randomIconsArray = [];

    gameState.intervalId = null;
    gameState.startGame = false;
    gameState.soloMovesCount = 0;
    gameState.minutes = 0;
    gameState.seconds = 0;
    gameState.correctPairsCount = 0;
    gameState.timerValue = 0;

    gameState.selectedCard = [];
    gameState.selectedItem = [];
    gameState.correcChoice = false;

    gameState.playersScores = [];
    gameState.playersRanking = [];

    gameState.index = 0;
    gameState.counter = 0;
    gameState.testStartTime = null;

    // Clear dynamic DOM
    gameGrid.innerHTML = '';
    multiPlayer.innerHTML = '';
    soloPlayer.innerHTML = '';

    multiPlayer.style.display = 'none';
    soloPlayer.style.display = 'none';

    const resultsModal = document.querySelector('.results-modal');
    if (resultsModal) resultsModal.style.display = 'none';

    if (menuModal) menuModal.style.display = 'none';

    const resultsContainer = document.querySelector('.results-container');
    if (resultsContainer) resultsContainer.innerHTML = '';

    // Show setup screen again
    document.querySelector('.game-grid').style.display = 'none';
    document.querySelector('.start-page').style.display = 'flex';
}

function restartCurrentGame(){
    stopTimer();

    // Reset state (except for game conditions)
    gameState.numbers = [];
    gameState.randomNumbersArray = [];
    gameState.randomIcons = [];
    gameState.randomIconsArray = [];
    gameState.startGame = false;
    gameState.soloMovesCount = 0;
    gameState.minutes = 0;
    gameState.seconds = 0;
    gameState.correctPairsCount = 0;
    gameState.currentPlayer = 0;
    

    gameState.selectedCard = [];
    gameState.selectedItem = [];
    gameState.correcChoice = false;

    gameState.playersScores = [];
    gameState.playersRanking = [];


    gameState.index = 0;
    gameState.counter = 0;
    if (menuModal && menuModal.style.display === 'flex') {
        menuModal.style.display = 'none';
    }
    if (gameState.playersOption === 'player1') {
        gameState.testStartTime = Date.now();
        gameState.intervalId = setInterval(evaluateTimer, 50);
        gameState.timerValue = Date.now() - gameState.testStartTime;
        document.querySelector('.move-count').textContent = '0';
    }
    
    if (gameState.playersOption !== 'player1') {
        document.querySelectorAll('.score-card .player1-score, .score-card .player2-score, .score-card .player3-score, .score-card .player4-score').forEach((score) => {
            score.dataset.score = 0;
            score.innerText = '0';
        })
        document.querySelectorAll('.score-card').forEach((score) => score.classList.remove('player-turn'));
        document.querySelectorAll('.current-turn').forEach((turn) => turn.classList.remove('show'));
    }
    document.querySelectorAll('.grid-item').forEach((item) => {
        item.classList.remove('selected-card', 'selected', 'correct');
        
    }) 
    document.querySelectorAll('h1').forEach((item) => {
        item.classList.remove('selected-card');
    })
    
}
restartGame.forEach((button) => button.addEventListener('click', restartCurrentGame));

// configuration / setup helpers
function setGameConditions() {
	themeInput.forEach((input) => {
		if (input.checked) {
			input.parentElement.classList.add("selected");
			gameState.theme = input.value;
		} else {
			input.parentElement.classList.remove("selected");
		}
	});
	numberOfPlayers.forEach((input) => {
		if (input.checked) {
			input.parentElement.classList.add("selected");
			gameState.playersOption = input.value;
            gameState.players = input.getAttribute('data-players')
		} else {
			input.parentElement.classList.remove("selected");
		}
	});
	gridSize.forEach((input) => {
		if (input.checked) {
			input.parentElement.classList.add("selected");
			gameState.gridSelection = input.value;
		} else {
			input.parentElement.classList.remove("selected");
		}
	});
}

function displayGameGrid() {
	setGameConditions();
	document.querySelector(".start-page").style.display = "none";
	document.querySelector(".game-grid").style.display = "flex";
	setGridSize();
}

function setGridSize() {
	if (gameState.gridSelection === "grid-6") {
		gameGrid.setAttribute("data-grid", "6");
	} else {
		gameGrid.setAttribute("data-grid", "4");
	}
	populateGridItem();
    setPlayers();
}

// grid creation
function populateRandomNumbers(){
    const length = (parseInt(gameGrid.getAttribute("data-grid")) * parseInt(gameGrid.getAttribute("data-grid"))) / 2
    for (let i = 0; i < length; i++){
        gameState.numbers.push(i);
        gameState.numbers.push(i);
        gameState.randomIcons.push(gameState.icons[i])
        gameState.randomIcons.push(gameState.icons[i])
    }
    gameState.randomNumbersArray = gameState.numbers.sort(() => Math.random() - 0.5);
    gameState.randomIconsArray = gameState.randomIcons.sort(() => Math.random() - 0.5);
}

function populateGridItem() {
    const length = parseInt(gameGrid.getAttribute("data-grid")) * parseInt(gameGrid.getAttribute("data-grid"));
    populateRandomNumbers()
	for (let i = 0; i < length; i++) {
		const div = document.createElement("div");
        div.classList.add("grid-item");
		gameGrid.appendChild(div);
        if (gameState.theme === 'numbers'){
            const numberDisplay = document.createElement('h1');
            numberDisplay.classList.add('number');
            numberDisplay.innerText = gameState.randomNumbersArray[i];
            numberDisplay.dataset.value = gameState.randomNumbersArray[i];
            div.appendChild(numberDisplay)
        } else if (gameState.theme === 'icons'){
            const iconDisplay = document.createElement('img');
            iconDisplay.setAttribute('src', gameState.randomIconsArray[i])
            iconDisplay.dataset.value = gameState.randomIconsArray[i].slice(15)
            iconDisplay.classList.add('icon');
            div.appendChild(iconDisplay)
        }
		
	}   
    document.querySelectorAll('.grid-item').forEach((item) => item.addEventListener('click', selectCard))
}

// player box creation
function populateMulitPlayersBox() {
    for (let i = 0; i < parseInt(gameState.players); i++) {
        const span = document.createElement('span');
        const p = document.createElement('p');
		const div = document.createElement("div");
        const parentDiv = document.createElement('div');
        const currentTurn = document.createElement('p');
        currentTurn.classList.add('current-turn');
        currentTurn.innerHTML = 'CURRENT TURN'
		div.classList.add("score-card");
		div.classList.add("player-card");
        p.classList.add(`player${i + 1}-score`);
        p.dataset.score = 0;
        div.dataset.value = i + 1;
        span.innerText = `Player ${i + 1}`;
        p.innerText = '0'
        div.appendChild(span);
        div.appendChild(p);
		parentDiv.prepend(div);
        parentDiv.appendChild(currentTurn)
        multiPlayer.appendChild(parentDiv)
	}
    updatePlayerLabels()
}
function updatePlayerLabels() {
    if (gameState.playersOption === 'player1') return;
  const scores = document.querySelectorAll(".score-card span");

  scores.forEach((span, index) => {
    span.innerText = `${window.innerWidth > 600 ? "Player" : "P"} ${index + 1}`;
  });
}
function populateSoloPlayerBox(){
    const timeText = document.createElement('span');
    const timeCountDisplay = document.createElement('p');
    const moveText = document.createElement('span');
    const moveCountDisplay = document.createElement('p');
    const timeBox = document.createElement("div");
    const moveBox = document.createElement("div");  
    timeCountDisplay.classList.add('timer-display');
    moveCountDisplay.classList.add('move-count');
    moveBox.classList.add('score-card')
    timeBox.classList.add("score-card");
    timeText.innerText = 'Time';
    timeCountDisplay.innerText = '0:00';
    moveText.innerText = 'Moves';
    moveCountDisplay.innerText = '0';
    soloPlayer.appendChild(timeBox);
    timeBox.appendChild(timeText)
    timeBox.appendChild(timeCountDisplay)
    moveBox.appendChild(moveText);
    moveBox.appendChild(moveCountDisplay);
    soloPlayer.appendChild(moveBox);
}
function setPlayers(){
    switch (gameState.playersOption) {
        case 'player1':
            soloPlayer.style.display = 'flex';
            populateSoloPlayerBox();
            gameState.testStartTime = Date.now();
            gameState.intervalId = setInterval(evaluateTimer, 50)
        break;
        case 'player2':
            multiPlayer.style.display = 'flex';
            populateMulitPlayersBox();
        break;
        case 'player3':
            multiPlayer.style.display = 'flex';
            populateMulitPlayersBox();
  
        break;
        case 'player4':
            multiPlayer.style.display = 'flex';
            populateMulitPlayersBox();   
 
        break;
    
        default:
        break;
    }
}

// gameplay flow
function selectCard(e) {
    if (gameState.lockBoard) return;

    const card = e.currentTarget;

    if (card.classList.contains('selected')) return;

    const value = card.firstElementChild.dataset.value;

    if (!value) return;

    card.firstElementChild.classList.add('selected-card');
    card.classList.add('selected');

    gameState.selectedCard.push(value);
    gameState.selectedItem.push(card);

    if (gameState.selectedCard.length === 2){

        if (gameState.selectedCard[0] === gameState.selectedCard[1]){

            gameState.selectedItem.forEach(card => {
                card.classList.add('correct');
            });

            gameState.correcChoice = true;
            correctCounter(gameState.correcChoice);

        } else {

            gameState.correcChoice = false;
            gameState.lockBoard = true;
            hideWrongSelection();

        }

    } else if (gameState.selectedCard.length > 2){

        gameState.selectedCard.shift();
        gameState.selectedCard.shift();
        gameState.selectedItem.shift();
        gameState.selectedItem.shift();

    }

    displaySoloMoveCount();
    playerTurn();
}
function hideWrongSelection(){
    setTimeout(() => {
        gameState.selectedItem.forEach((item) => {
            item.firstElementChild.classList.remove('selected-card');
            item.classList.remove('selected');
        });

        gameState.selectedCard = [];
        gameState.selectedItem = [];
        gameState.lockBoard = false;
    }, 700)
}

function playerTurn(){
    if (gameState.playersOption === 'player1') return;
        gameState.playersNumber = document.querySelectorAll('.score-card').length;
        gameState.counter++;
        if (gameState.correcChoice){
            const currentScore = parseInt(document.querySelectorAll('.score-card')[gameState.index].lastElementChild.dataset.score);
            document.querySelectorAll('.score-card')[gameState.index].lastElementChild.dataset.score = currentScore + 1;
            document.querySelectorAll('.score-card')[gameState.index].lastElementChild.innerText = currentScore + 1;
            gameState.playersScores[gameState.index] = currentScore + 1;
            gameState.correcChoice = false
        } else{
                gameState.playersScores[gameState.index] = parseInt(document.querySelectorAll('.score-card')[gameState.index].lastElementChild.dataset.score);
        }
        gameState.playersRanking = gameState.playersScores.map((score, index) => {
            return {score, playerNumber: (index + 1)}
        })
        gameState.playersRanking.sort((a, b) => b.score - a.score)
        if (gameState.counter % 2 === 0) {
            gameState.index++;
            if (gameState.index >= gameState.playersNumber) {
                gameState.index = 0;
            }
        }
        gameState.currentPlayer = parseInt(document.querySelectorAll('.score-card')[gameState.index].dataset.value);
        highlightPlayer()
        displayMultiPlayerResults()
}
function correctCounter(correctChoice){
    if (correctChoice){
        gameState.correctPairsCount++;
        correctChoice = false;
    }
}
function highlightPlayer(){
    document.querySelectorAll('.score-card').forEach((score) => {
        setTimeout(() => {
            if (gameState.currentPlayer === parseInt(score.dataset.value)){
                score.classList.add('player-turn');
                score.nextElementSibling.classList.add('show');
            } else {
                score.classList.remove('player-turn');
                score.nextElementSibling.classList.remove('show');
            }
            
        }, 400)
    })
}
function displaySoloMoveCount(){
    if (gameState.playersOption !== 'player1') return;
    gameState.soloMovesCount++;
    document.querySelector('.move-count').textContent = Math.floor(gameState.soloMovesCount / 2)
}

// (solo/multiplayer results)
function displaySoloResults(){
    if (gameState.playersOption !== 'player1') return;
    stopTimer()
    document.querySelector('.results-modal').style.display = 'flex'
    document.querySelector('.results-container').innerHTML = `
        <div class="modal-heading">
            <h1>You did it!</h1>
            <span>Game over! Here’s how you got on…</span>
        </div> 
        <div class="results-box">
            <div class="results-row">
            <div class="player-results">
                <span>Time Elapsed</span>
                <p>${gameState.minutes}:${gameState.seconds < 10 ? `0` : ''}${gameState.seconds}</p>
            </div>
            </div>
            <div class="results-row">
            <div class="player-results">
                <span>Moves Taken</span>
                <p>${Math.floor(gameState.soloMovesCount / 2)}</p>
            </div>
            </div>
        </div>
        <div class="modal-buttons">
            <button type="button" data-action="restart" id="resultsRestartGame" class="orange-btn">Restart</button>
            <button type="button" data-action="new-game" id="setupNewGame" class="grey-btn">Setup New Game</button>
        </div>`
        document.getElementById('setupNewGame').addEventListener('click', setupNewGame);
        document.getElementById('resultsRestartGame').addEventListener('click', restartCurrentGame);
}
function displayMultiPlayerResults(){
    if (gameState.playersOption === 'player1') return;
    const pairs = (parseInt(gameGrid.getAttribute("data-grid")) * parseInt(gameGrid.getAttribute("data-grid"))) / 2 
    console.log(gameState.correctPairsCount, pairs)
    if (gameState.correctPairsCount === pairs){
        document.querySelector('.results-modal').style.display = 'flex'
        document.querySelector('.results-container').innerHTML = `
        <div class="modal-heading">
        <h1>${gameState.playersRanking[1] && gameState.playersRanking[0].score === gameState.playersRanking[1].score ? 'It\'s a tie!' : `Player ${gameState.playersRanking[0].playerNumber} wins!`}</h1>
        <span>Game over! Here are the results…</span>
        </div>
        <div class="results-box">
        ${gameState.playersRanking.map((player) => {
            return `<div class="results-row ${player.score === gameState.playersRanking[0].score ? 'winner' : ''}"> 
            <div class="player-results">
            <span>Player ${player.playerNumber} ${player.score === gameState.playersRanking[0].score ? '(Winner)' : ''}</span>
            <p>${player.score} Pairs</p>
            </div>
            </div>`
        }).join('')}
        
        <div class="modal-buttons">
        <button type="button" data-action="new-game" id="setupNewGame" class="grey-btn">Setup New Game</button>
        </div>`
        document.getElementById('setupNewGame').addEventListener('click', setupNewGame);
    }
}

// timer helpers
function evaluateTimer(){
    if (!gameState.testStartTime) return;
    gameState.timerValue = Math.floor((Date.now() - gameState.testStartTime) / 1000);
    renderTimer(gameState.timerValue);
    const pairs = (parseInt(gameGrid.getAttribute("data-grid")) * parseInt(gameGrid.getAttribute("data-grid"))) / 2  
    if (gameState.correctPairsCount === pairs){
        displaySoloResults()
    }  
}
function renderTimer(timerValue){
    gameState.minutes = Math.floor(timerValue / 60);
    gameState.seconds = timerValue % 60;
    document.querySelector('.timer-display').textContent = `${gameState.minutes}:${gameState.seconds < 10 ? `0` : ''}${gameState.seconds}`;
}
function stopTimer() {
    if (gameState.intervalId !== null) {
        clearInterval(gameState.intervalId);
        gameState.intervalId = null;
    }
}

// menu / modal helpers (menu/modal)
function displayMenu(){
    if (!menuModal) return;

    if (menuModal.style.display === 'flex') {
        menuModal.style.display = 'none';
    } else {
        menuModal.style.display = 'flex';
        stopTimer();
    }
}
function resumeGame(){
    if (menuModal) {
        menuModal.style.display = 'none';
    }

    if (gameState.playersOption === 'player1') {
        gameState.testStartTime = Date.now() - (gameState.timerValue * 1000);
        gameState.intervalId = setInterval(evaluateTimer, 50);
    }
}

// event listeners
const menuRestartBtn = document.querySelector("#menuRestartGame");
if (menuRestartBtn) {
    menuRestartBtn.addEventListener('click', restartCurrentGame);
}
newGame.forEach((button) => button.addEventListener('click', setupNewGame));
themeInput.forEach((input) => input.addEventListener("click", setGameConditions));
numberOfPlayers.forEach((input) => input.addEventListener("click", setGameConditions));
gridSize.forEach((input) => input.addEventListener("click", setGameConditions));
form.addEventListener("submit", (e) => {
	e.preventDefault();
	displayGameGrid();
});
if (menuButton) {
    menuButton.addEventListener('click', displayMenu);
}
const resumeBtn = document.querySelector('#resumeGame');
if (resumeBtn) {
    resumeBtn.addEventListener('click', resumeGame);
}
