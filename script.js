'use strict';

// Selcting elements 
const player0Ele = document.querySelector('.player--0');
const player1Ele = document.querySelector('.player--1');

const score0El = document.querySelector('#score--0');
const score1El = document.getElementById('score--1');

const current0Ele = document.getElementById('current--0');
const current1Ele = document.getElementById('current--1');

const diceEl = document.querySelector('.dice');

const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');
const btnSettings = document.querySelector('.btn--Settings');
const bgModal = document.querySelector('.bg');
const modil = document.querySelector('.modil');
const closeModal = document.querySelector('.close-modal');

let player0 = document.getElementById('name--0');
let player1 = document.getElementById('name--1');

const First_name = document.querySelector('.First_name');
const Second_name = document.querySelector('.Second_name');
const Number_winning = document.querySelector('.Number_winning');
const btnSaveSettings = document.querySelector('.btnSave');


/* modil  functionalete*/
btnSaveSettings.addEventListener('click', function ()
{
    modil.classList.add('hidden');
    bgModal.classList.add('hidden');
    if (First_name.value === '') player0.textContent = 'Player 1';
    else player0.textContent = First_name.value;

    if (Second_name.value === '') player1.textContent = 'Player 2';
    else player1.textContent = Second_name.value;

    if (Number_winning.value === '') scoreWine = 100;
    else scoreWine = Number_winning.value;
});

// Selcting conditions 
score0El.textContent = 0;
score1El.textContent = 0;
diceEl.classList.add('hidden');
let scoreWine = 100;

let scores, currentScore, activePlayer, playing;

const init = function ()
{
    scores = [0, 0];
    currentScore = 0;
    activePlayer = 0;
    playing = true;

    score0El.textContent = 0;
    score1El.textContent = 0;
    current0Ele.textContent = 0;
    current1Ele.textContent = 0;

    player0Ele.classList.remove('player--winner', 'player--active');
    player1Ele.classList.remove('player--winner', 'player--active');
    player0Ele.classList.add('player--active');
};
init();

const switchplayer = function ()
{
    document.getElementById(`current--${activePlayer}`).textContent = 0;
    currentScore = 0;
    activePlayer = activePlayer === 0 ? 1 : 0;
    player0Ele.classList.toggle('player--active');
    player1Ele.classList.toggle('player--active');
};

// rolling dice functionality
btnRoll.addEventListener('click', function ()
{
    if (playing)
    {
        // 1. Genrating rundom dice roll
        const dice = Math.trunc(Math.random() * 6) + 1;

        // 2. display dice
        diceEl.classList.remove('hidden');
        diceEl.src = `./dice-${dice}.png`;

        // 3. Chek for rolled 1:
        if (dice !== 1)
        {
            // add dice to current score

            currentScore += dice;
            document.getElementById(`current--${activePlayer}`).textContent = currentScore;

        } else
        {
            // swirch to next player
            switchplayer();
        }
    }

});

btnHold.addEventListener('click', function ()
{
    if (playing)
    {
        // 1. add current score to active player's 
        scores[activePlayer] += currentScore;
        document.getElementById(`score--${activePlayer}`).textContent = scores[activePlayer];

        // 2. Check if player's score is >= 100
        if (scores[activePlayer] >= scoreWine)
        {
            // Finish the game
            playing = false;
            diceEl.classList.add('hidden');
            // diceEl.src = `dice-${dice}.png`;
            document.querySelector(`.player--${activePlayer}`).classList.add('player--winner');
            document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');

        } else
        {
            // Switch to the next player 
            switchplayer();
        }

    }
});

btnNew.addEventListener('click', init);



/* modil close & open */
btnSettings.addEventListener('click', function ()
{
    modil.classList.remove('hidden');
    bgModal.classList.remove('hidden');
});

closeModal.addEventListener('click', function ()
{
    modil.classList.add('hidden');
    bgModal.classList.add('hidden');
});

bgModal.addEventListener('click', function ()
{
    modil.classList.add('hidden');
    bgModal.classList.add('hidden');
});
