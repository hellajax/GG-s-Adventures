const gameContainer = document.getElementById('game-container');
const character = document.getElementById('character');
const welcomeScreen = document.getElementById('welcome-screen');
const startButton = document.getElementById('start-game-btn');

const words = {
    short: ['hp', 'web', 'xp', 'npc', 'gg', 'fps', 'afk', 'rpg', 'lol', 'dom', 'js', 'css', 'yo', 'tu', 'el', 'ok', 'ta', 'si', 'no', 'utu', 'sol', 'rol', 'bot', 'lan', 'map', 'inv', 'pc', 'ps', 'gol', 'top'],
    medium: ['emma', 'gaby', 'lucky', 'rempi', 'juan', 'combo', 'loot', 'nivel', 'skill', 'spawn', 'magia', 'html', 'game', 'play', 'items', 'boss', 'skins', 'pixel', 'juego', 'clan', 'pvp', 'mmo', 'team', 'arma', 'foro', 'gana', 'modo', 'click', 'taco', 'rato', 'redes', 'joker'],
    long: ['gonzalo', 'borba', 'damian', 'player', 'jugador', 'enemigo', 'consola', 'cartas', 'partida', 'ranking', 'diseño', 'mando', 'acciones', 'habilidad', 'batalla', 'jugar', 'esquivar', 'estrategia', 'victoria', 'secreto', 'monedas', 'girar', 'comando', 'campeon', 'puntos', 'zona', 'tiempo'],
    extraLong: ['gabriela', 'pajares', 'martinez', 'personaje', 'inventario', 'habilidad', 'videojuego', 'dificultad', 'oneshot', 'estrategia', 'poderes', 'jugabilidad', 'conquistar', 'multijugador', 'conquista', 'exploracion', 'desafio', 'entrenamiento', 'competir', 'realidad', 'superpoderes', 'niveles', 'compañero', 'habilidoso', 'interactivo', 'clases', 'jefes', 'recompensa', 'maraton', 'sorpresa', 'desbloquear'],
    gg: ["doom","cod","docker","proxmox","servidor","ansible","php","casino","programacion","sistemas","operativos"],
    pajares: ["gantt","backlog","vision","cocinar","repo","pert","cpm","proyecto","ppt"],
};

let activeWords = [];
let spawnInterval;
let moveInterval;
let score = 0;
let wordSpawnRate = 3000;
let moveSpeed = 0.5;
let selectedCharacter;

let backgroundMusic = new Audio('../mp3/music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1;

let explosion = new Audio('../mp3/explosion.mp3');
explosion.volume = 0.3;

let specialSound = new Audio('../mp3/specialSound.mp3');
specialSound.volume = 0.3;

let meow = new Audio('../mp3/meow.mp3');
meow.volume = 0.3;

let levelUp = new Audio('../mp3/levelUp.mp3');
levelUp.volume = 0.3;

let click = new Audio('../mp3/click.mp3');
click.volume = 0.5;

let death = new Audio('../mp3/death.mp3');
death.volume = 0.1;

const characterSelectionScreen = document.getElementById('character-selection-screen');
const characterOptions = document.getElementById('character-options');
const characterImg = document.getElementById('character-img');

function showCharacterSelectionScreen() {
    welcomeScreen.style.display = 'none';
    characterSelectionScreen.style.display = 'flex';
}

characterOptions.addEventListener('click', (event) => {
    const selectedOption = event.target.closest('.character-option');
    if (selectedOption) {
        selectedCharacter = selectedOption.dataset.character;
        characterImg.src = `../${selectedCharacter}/mini.png`;
        characterSelectionScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        startGame();
    }
});

startButton.addEventListener('click', () => {
    showCharacterSelectionScreen();
});

showWelcomeScreen();

function startMusic() {
    backgroundMusic.play();
}

function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function getWordsByDifficulty(selectedCharacter) {
    let wordsPool = [];

    if (score < 100) {
        wordsPool = [...words.short];
    } else if (score < 200) {
        wordsPool = [...words.short, ...words.medium];
    } else if (score < 300) {
        wordsPool = [...words.short, ...words.medium, ...words.long];
    } else {
        wordsPool = [...words.medium, ...words.long, ...words.extraLong];
    }

    if (selectedCharacter === "gg") {
        wordsPool = [...wordsPool, ...words.gg];
    } else if (selectedCharacter === "pajares") {
        wordsPool = [...wordsPool, ...words.pajares];
    }

    return wordsPool;
}


function adjustDifficulty() {
    wordSpawnRate = Math.max(1000, 3500 - Math.floor(score / 10) * 50);
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnWord, wordSpawnRate);

    moveSpeed = 1 + (score / 4000);
}

function spawnWord() {
    const currentWords = getWordsByDifficulty(selectedCharacter);
    const wordText = currentWords[Math.floor(Math.random() * currentWords.length)];
    const wordDiv = document.createElement('div');
    wordDiv.textContent = wordText;
    wordDiv.className = 'word';

    const side = Math.floor(Math.random() * 4);
    if (side === 0) {
        wordDiv.style.top = '0';
        wordDiv.style.left = `${Math.random() * 100}%`;
    } else if (side === 1) {
        wordDiv.style.top = `${Math.random() * 100}%`;
        wordDiv.style.right = '0';
    } else if (side === 2) {
        wordDiv.style.bottom = '0';
        wordDiv.style.left = `${Math.random() * 100}%`;
    } else {
        wordDiv.style.top = `${Math.random() * 100}%`;
        wordDiv.style.left = '0';
    }

    wordDiv.dataset.text = wordText;
    wordDiv.dataset.progress = '0';
    wordDiv.dataset.x = parseFloat(wordDiv.style.left) || 0;
    wordDiv.dataset.y = parseFloat(wordDiv.style.top) || 0;
    gameContainer.appendChild(wordDiv);
    activeWords.push(wordDiv);
}

function moveWords() {
    const charRect = character.getBoundingClientRect();

    activeWords.forEach((word, index) => {
        const wordRect = word.getBoundingClientRect();
        const dx = charRect.left + charRect.width / 2 - (wordRect.left + wordRect.width / 2);
        const dy = charRect.top + charRect.height / 2 - (wordRect.top + wordRect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        word.dataset.x = parseFloat(word.dataset.x) + (dx / distance) * moveSpeed;
        word.dataset.y = parseFloat(word.dataset.y) + (dy / distance) * moveSpeed;
        word.style.transform = `translate(${word.dataset.x}px, ${word.dataset.y}px)`;

        if (distance < 30) {
            death.play();
            endGame();
        }
    });
}

let previousScore = 0;

document.addEventListener('keydown', (event) => {
    if (!click.paused) {
        click.currentTime = 0;
    }
    click.play();
    const letter = event.key.toLowerCase();

    const wordsToRemove = [];

    activeWords.forEach((word, index) => {
        const text = word.dataset.text;
        const progress = parseInt(word.dataset.progress, 10);

        if (text[progress] === letter) {
            const isSpecial = ["damian", "juan", "pajares", "gg", "gonzalo", "martinez", "gabriela", "borba", "gaby"].includes(text);
            const isKitty = ["lucky", "emma", "rempi"].includes(text);

            if (isSpecial) {
                word.innerHTML = `<span class="illuminated special">${text.substring(0, progress + 1)}</span>${text.substring(progress + 1)}`;
            } else if (isKitty) {
                word.innerHTML = `<span class="illuminated kitty">${text.substring(0, progress + 1)}</span>${text.substring(progress + 1)}`;
            } else {
                word.innerHTML = `<span class="illuminated">${text.substring(0, progress + 1)}</span>${text.substring(progress + 1)}`;
            }

            word.dataset.progress = progress + 1;

            if (progress + 1 === text.length) {
                let wordPoints = 10 + text.length;

                if (isSpecial) {
                    if (!specialSound.paused) {
                        specialSound.currentTime = 0;
                    }
                    specialSound.play();
                    wordPoints = 10 + text.length;
                } else if (isKitty) {
                    if (!meow.paused) {
                        meow.currentTime = 0;
                    }
                    meow.play();
                    wordPoints = 10 + text.length;
                } else {
                    if (!explosion.paused) {
                        explosion.currentTime = 0;
                    }
                    explosion.play();
                }

                const wordRect = word.getBoundingClientRect();
                const originalX = wordRect.left + window.scrollX;
                const originalY = wordRect.top + window.scrollY;

                word.classList.add('explosion-effect');

                const wrapper = document.createElement('div');
                wrapper.classList.add('explosion-wrapper');
                wrapper.style.position = 'absolute';
                wrapper.style.left = `${originalX}px`;
                wrapper.style.top = `${originalY}px`;

                wrapper.appendChild(word);
                document.body.appendChild(wrapper);

                wordsToRemove.push({ word, index, wordPoints });
            }
        }
    });

    wordsToRemove.forEach(({ word, index, wordPoints }) => {
        score += wordPoints;
        setTimeout(() => {
            word.classList.remove('explosion-effect');
            word.remove();
            activeWords.splice(index, 1);
            updateScore();

            if (score - previousScore >= 50) {
                levelUp.play();
                adjustDifficulty();
                previousScore = score;
            }
        }, 500);
    });
});

function updateScore() {
    let scoreDisplay = document.getElementById('score');
    if (!scoreDisplay) {
        scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score';
        scoreDisplay.textContent = `${score}`;
        scoreDisplay.style.position = 'absolute';
        scoreDisplay.style.top = '20px';
        scoreDisplay.style.left = '20px';
        scoreDisplay.style.padding = '5px';
        scoreDisplay.style.color = 'white';
        scoreDisplay.style.fontFamily = 'Pixemon, sans-serif';
        scoreDisplay.style.fontSize = '24px';
        gameContainer.appendChild(scoreDisplay);
    } else {
        scoreDisplay.textContent = `${score}`;
    }
}

function endGame() {
    clearInterval(spawnInterval);
    clearInterval(moveInterval);
    activeWords.forEach(word => word.remove());
    activeWords = [];

    const overlay = document.createElement('div');
    overlay.id = 'game-over';
    overlay.innerHTML = `
        <h1>GAME OVER</h1>
        <p>Puntuación final: ${score}</p>
        <button id="restart-btn">Jugar de nuevo</button>
        <button id="main-menu-btn">Volver al menú principal</button>
    `;
    gameContainer.appendChild(overlay);

    stopMusic();

    document.getElementById('restart-btn').addEventListener('click', () => {
        resetGame();
    });

    document.getElementById('main-menu-btn').addEventListener('click', () => {
        resetGame(true);
        showWelcomeScreen();
    });
}

function resetGame(toWelcomeScreen = false) {
    score = 0;
    updateScore();

    wordSpawnRate = 3000;
    moveSpeed = 0.5;

    clearInterval(spawnInterval);
    clearInterval(moveInterval);

    activeWords.forEach(word => word.remove());
    activeWords = [];

    const gameOverMessage = document.getElementById('game-over');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }

    if (!toWelcomeScreen) {
        spawnInterval = setInterval(spawnWord, wordSpawnRate);
        moveInterval = setInterval(moveWords, 1000 / 60);

        stopMusic();
        startMusic();
    }
}

function startGame() {
    startMusic();
    welcomeScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    spawnInterval = setInterval(spawnWord, wordSpawnRate);
    moveInterval = setInterval(moveWords, 1000 / 60);
}

function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    gameContainer.style.display = 'none';
    stopMusic();
}

showWelcomeScreen();