const keys = document.querySelector('.calculator-keys');
const resultDisplay = document.querySelector('.result-display');
const currentCalculation = document.querySelector('.current-calculation');

let actionsArr = [];

keys.addEventListener('click', e => {
    if(e.target.matches('button'))
    {
        let key = e.target;
        let action = key.dataset.action;
        let keyText = key.textContent;

        switch(action)
        {
            case 'add': 
            case 'subtract': 
            case 'multiply': 
            case 'divide': 
            {    
                /*  NOTE: We need to handle these cases
                    1. Pressing operator again when previous action is operator
                    2. Pressing operator when current result is 0
                */
                console.log(action + ' key pressed');

                if(actionsArr.length === 0)
                {
                    actionsArr.push(resultDisplay.textContent);
                }

                let prevAction = actionsArr[actionsArr.length-1];
                console.log(prevAction);
                
                let isOperator = prevAction === 'add' ||
                prevAction === 'subtract' ||
                prevAction === 'multiply' ||
                prevAction === 'divide';
                
                if(isOperator)
                {
                    actionsArr.pop();
                    actionsArr.push(action);
                }
                else
                {  
                    actionsArr.push(action);
                    resultDisplay.textContent = '0';
                }

                let arr = actionsArr.map(a => {
                    switch(a)
                    {
                        case 'add': return ' + ';
                        case 'subtract': return ' - ';
                        case 'multiply': return ' * ';
                        case 'divide': return ' / ';
                        default: return a;
                    }
                });

                let arrText = arr.join('');
                currentCalculation.textContent = arrText;
                
                console.log(actionsArr);
            } break;
            case 'calculate': 
            {
                let arr = currentCalculation.textContent.split(' ');
                arr.pop();
                arr.push(resultDisplay.textContent);

                while(arr.length > 1)
                {
                    while(arr.includes('*'))
                    {
                        let index = arr.indexOf('*');
                        let a = Number(arr[index-1]);
                        let b = Number(arr[index+1]);
                        let c = a * b;

                        arr.splice(index-1, 3, c.toString());
                    }

                    while(arr.includes('/'))
                    {
                        let index = arr.indexOf('/');
                        let a = Number(arr[index-1]);
                        let b = Number(arr[index+1]);
                        let c = a / b;

                        arr.splice(index-1, 3, c.toString());
                    }

                    while(arr.includes('+'))
                    {
                        let index = arr.indexOf('+');
                        let a = Number(arr[index-1]);
                        let b = Number(arr[index+1]);
                        let c = a + b;

                        arr.splice(index-1, 3, c.toString());
                    }

                    while(arr.includes('-'))
                    {
                        let index = arr.indexOf('-');
                        let a = Number(arr[index-1]);
                        let b = Number(arr[index+1]);
                        let c = a - b;

                        arr.splice(index-1, 3, c.toString());
                    }
                }

                console.log(arr);
                resultDisplay.textContent = Number(arr[0]).toFixed(6);
                currentCalculation.textContent = '';
                actionsArr = [];
            } break;
            case 'clear': 
            {
                resultDisplay.textContent = '0';
                currentCalculation.textContent = '';
                actionsArr = [];
            } break;
            case 'decimal': 
            {
                if(!resultDisplay.textContent.includes('.'))
                {
                    resultDisplay.textContent += '.';
                    actionsArr.push(keyText);
                }
            } break;
            default:
            {
                if(resultDisplay.textContent === '0' || resultDisplay.textContent == 'Infinity' || actionsArr.length === 0)
                {
                    resultDisplay.textContent = keyText;
                }
                else
                {
                    resultDisplay.textContent += keyText;
                }

                actionsArr.push(keyText);
            }
        }
    }
});