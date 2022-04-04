
let num;
let guessCount = 1;
let resetButton;

const guessField = document.querySelector('.guess-field');
const guessSubmit = document.querySelector('.guess-submit');
const guesses = document.querySelector('.guesses');
const lastResult = document.querySelector('.last-result');
const guessCountText = document.querySelector('.guess-count');

//NOTE: we can just generate the number in client-side but for educational purpose we will do it on server-side
const getRandomNum = async () =>
{
    const result = await fetch('http://localhost:80/api/getRandomNum');

    if(result.ok)
    {
        let text = await result.text();
        //console.log(text);
        
        num = Number(text);
    }
}

window.onload = getRandomNum();

function checkGuess()
{
    const userGuess = Number(guessField.value);

    if(guessCount === 1)
    {
        guesses.textContent = 'Previous guess: ';
        guessCountText.textContent = 'Remaining guesses: ' + (10 - guessCount);
    }
    
    if(Number.isNaN(userGuess) || userGuess > 100 || userGuess < 1)
    {
        lastResult.textContent = 'Please enter a valid number!';
    }
    else
    {
        guesses.textContent += guessField.textContent + userGuess + ' ';
    
        if(userGuess === num)
        {
            lastResult.textContent = 'Congrats you guessed the number! The number is ' + num;
            guessField.value = '';
            guessCountText.textContent = '';
            setGameOver();
        }
        else
        {
            if(guessCount > 10)
            {
                lastResult.textContent = 'GAME OVER!!';
                guessField.value = '';
                setGameOver();
            }
            else
            {
                if(userGuess > num)
                {
                    lastResult.textContent = 'Nice try! Too high.';
                    guessCountText.textContent = 'Remaining guesses: ' + (10 - guessCount);
                }
                else
                {
                    lastResult.textContent = 'Nice try! Too low.';
                    guessCountText.textContent = 'Remaining guesses: ' + (10 - guessCount);
                }

                guessCount++;
                guessField.value = '';
            }
        }
    }
}

guessSubmit.addEventListener('click', checkGuess);

function setGameOver()
{
    guessField.disabled = true;
    guessSubmit.disabled = true;

    resetButton = document.createElement('button');
    resetButton.textContent = 'Reset game';
    document.body.append(resetButton);
    resetButton.addEventListener('click', resetGame);
}

function resetGame()
{
    getRandomNum();
    guessField.disabled = false;
    guessSubmit.disabled = false;
    
    const resultDisplay = document.querySelectorAll('.result-display p');
    for(const p of resultDisplay)
    {
        p.textContent = '';
    }

    guessCount = 1;

    resetButton.parentNode.removeChild(resetButton);
}