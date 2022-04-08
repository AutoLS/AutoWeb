//const { create } = require("domain");

const mat4 = glMatrix.mat4;

let gl;

let shaderInfo = {};
let lastRender = 0;

const directions = {
    none: 0,
    left: 1,
    right: 2,
    up: 3,
    down: 4
};

const gameState = {
    snakeRadius: {x: 10, y: 10},
    snake: [],
    score: 0,
    highscore: 0,
    pressedKeys: {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false,
    },
    fruits: [],
    fruitTimer: {
        t: 0,
        t_end: 5,
        complete: false,
        active: true,
    },
    updateTimer: {
        t: 0,
        t_end: 0.16,
        complete: false,
        active: true,
    },
    currentDir: directions.none,
};

const keyMap = {
    37: 'left',
    39: 'right',
    38: 'up',
    40: 'down',
    32: 'space'
};

function V3(v)
{
    return [v.x, v.y, v.z];
}

async function main() 
{
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    gl = canvas.getContext("webgl");
    // Only continue if WebGL is available and working
    if (gl === null) 
    {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    
    let renderer;

    renderer = await createRenderer('vertex.glsl', 'fragment.glsl');

    if(renderer.ok)
    {
        shaderInfo = {
            program: renderer.shader,
            attribLocs: {
                vertexPosition: gl.getAttribLocation(renderer.shader, 'aVertexPosition'),
            },
            uniformLocs: {
                projectionMatrix: gl.getUniformLocation(renderer.shader, 'projection'),
                modelMatrix: gl.getUniformLocation(renderer.shader, 'model'),
            },
        };
    
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        
        const rectVert = [
            0.5, 0.5,
            -0.5, 0.5,
            0.5, -0.5,
            -0.5, -0.5,
        ];
    
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectVert), gl.STATIC_DRAW);
        gl.vertexAttribPointer(shaderInfo.attribLocs.vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderInfo.attribLocs.vertexPosition);
    
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    
        //Initialize game state
        let head = {p: {x: 110, y: 110, z: 0}, color: [1, 1, 0, 1]};
        gameState.snake.push(head);
        for(let i = 1; i < 5; ++i)
        {
            //NOTE: why is everything a reference in js? wtf? This is very prone to bugs
            let node = structuredClone(head);
            node.color = [1, 1, 1, 1];
            node.p.x += (gameState.snakeRadius.x)*2*i;
            gameState.snake.push(node);
        }
    
        window.requestAnimationFrame(game);
    }
}

function keyDown(e)
{
    let key = keyMap[e.keyCode];
    gameState.pressedKeys[key] = true;
}

function keyUp(e)
{
    let key = keyMap[e.keyCode];
    gameState.pressedKeys[key] = false;
}

function processTimer(timer, dt)
{
    if(timer.active)
    {
        timer.t += dt;
        if(timer.t >= timer.t_end)
        {
            timer.complete = true;
        }
    }
}

function resetTimer(timer)
{
    timer.t = 0;
    timer.complete = false;
}

function sleep(milliseconds) 
{
    const date = Date.now();
    let currentDate = null;
    do 
    {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function sleep_p(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener('keydown', keyDown, false);
window.addEventListener('keyup', keyUp, false);

function testAABB(a, b)
{
    if(Math.abs(a.p.x - b.p.x) > (a.r.x + b.r.x)) return false;
    if(Math.abs(a.p.y - b.p.y) > (a.r.y + b.r.y)) return false;

    return true;
}

function resetGame()
{
    if(gameState.score > gameState.highscore)
    {
        gameState.highscore = gameState.score;
        document.querySelector('#highscore').textContent = `highscore: ${gameState.highscore}`;
    }
    gameState.score = 0;
    document.querySelector('#score').textContent = `score: ${gameState.score}`;
    gameState.snake = [];
    gameState.currentDir = directions.none;
    gameState.updateTimer.t = 0;
    gameState.fruitTimer.t = 0;
    gameState.fruits = [];
    let head = {p: {x: 110, y: 110, z: 0}, color: [1, 1, 0, 1]};
    gameState.snake.push(head);
    for(let i = 1; i < 5; ++i)
    {
        let node = structuredClone(head);
        node.color = [1, 1, 1, 1];
        node.p.x += (gameState.snakeRadius.x)*2*i;
        gameState.snake.push(node);
    }
}

function game(timestamp) 
{
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let dt = timestamp - lastRender;
    let dt_s = dt / 1000;

    if(gameState.currentDir != directions.none)
    {
        processTimer(gameState.fruitTimer, dt_s);
        processTimer(gameState.updateTimer, dt_s);
    }
    
    if(gameState.fruitTimer.complete && gameState.currentDir != directions.none)
    {
        resetTimer(gameState.fruitTimer);
        let f_x = (Math.random() * 31) * 20 + 5;
        let f_y = (Math.random() * 23) * 20 + 5;
        let fruit = 
        {
            position: {x: f_x, y: f_y, z: 0},
            dim: {x: 10, y: 10, z: 0},
            color: [0, 1, 1, 1],
        };

        gameState.fruits.push(fruit);
    }

    let speed = 20;

    if(gameState.pressedKeys.left && gameState.currentDir != directions.right)
    {
        gameState.currentDir = directions.left;
    }
    if(gameState.pressedKeys.right && gameState.currentDir != directions.left)
    {
        gameState.currentDir = directions.right;
    }
    if(gameState.pressedKeys.up && gameState.currentDir != directions.down)
    {
        gameState.currentDir = directions.up;
    }
    if(gameState.pressedKeys.down && gameState.currentDir != directions.up)
    {
        gameState.currentDir = directions.down;
    }

    if(gameState.pressedKeys.space)
    {
        gameState.currentDir = directions.none;
    }

    if(gameState.currentDir != directions.none && gameState.updateTimer.complete)
    {
        for(let i = gameState.snake.length - 1; i > 0; i--)
        {
            gameState.snake[i].p = structuredClone(gameState.snake[i-1].p);
        }
    }
    
    if(gameState.updateTimer.complete)
    {
        resetTimer(gameState.updateTimer);
        switch(gameState.currentDir)
        {
            case directions.left: gameState.snake[0].p.x += -speed; break;
            case directions.right: gameState.snake[0].p.x += speed; break;
            case directions.up: gameState.snake[0].p.y += speed; break;
            case directions.down: gameState.snake[0].p.y += -speed; break;
        }
    }

    switch(gameState.currentDir)
    {
        case directions.left: 
        {
            if(gameState.snake[0].p.x < 0)
            {
                resetGame();
            }
        } break;
        case directions.right: 
        {
            if(gameState.snake[0].p.x > 640)
            {
                resetGame();
            }
        } break;
        case directions.up: 
        {
            if(gameState.snake[0].p.y > 480)
            {
                resetGame();
            }
        } break;
        case directions.down: 
        {
            if(gameState.snake[0].p.y < 0)
            {
                resetGame();
            }
        } break;
    }

    for(node of gameState.snake)
    {
        if(node !== gameState.snake[0])
        {
            let nodeAABB = 
            {
                p: {x: node.p.x, y: node.p.y},
                r: gameState.snakeRadius,
            };

            let headAABB = 
            {
                p: {x: gameState.snake[0].p.x, y: gameState.snake[0].p.y},
                r: {x: gameState.snakeRadius.x-1, y: gameState.snakeRadius.y-1},
            };

            if(testAABB(headAABB, nodeAABB))
            {
                resetGame();
            }
        }
    }
    
    for(let i = 0; i < gameState.fruits.length; ++i)
    {
        let fruit = gameState.fruits[i];
        let fruitAABB = 
        {
            p: {x: fruit.position.x, y: fruit.position.y},
            r: {x: fruit.dim.x * 0.5, y: fruit.dim.y * 0.5},
        };

        let headAABB = 
        {
            p: {x: gameState.snake[0].p.x, y: gameState.snake[0].p.y},
            r: gameState.snakeRadius,
        };

        if(testAABB(headAABB, fruitAABB))
        {
            gameState.score += 5;
            document.querySelector('#score').textContent = `score: ${gameState.score}`;
            gameState.fruits.splice(i, 1);
            
            let new_node = structuredClone(gameState.snake[gameState.snake.length-1]);
            gameState.snake.push(new_node);
        }
    }

    const projection = mat4.create();
    mat4.ortho(projection, 0, 640, 0, 480, -1, 1);
    setMat4(shaderInfo, projection, 'projection');

    for(fruit of gameState.fruits)
    {
        drawRect(shaderInfo, V3(fruit.position), V3(fruit.dim), fruit.color);
    }
    for(node of gameState.snake)
    {
        drawRect(shaderInfo, V3(node.p), [20, 20, 0], node.color);
    }

    sleep_p(16).then();
    lastRender = timestamp;
    window.requestAnimationFrame(game);
}

function setMat4(shaderInfo, matrix, loc)
{
    gl.useProgram(shaderInfo.program);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderInfo.program, loc), false, matrix);
}

function drawRect(shaderInfo, position, dim, color)
{
    const model = mat4.create();
    mat4.translate(model, model, position);
    mat4.scale(model, model, dim);

    gl.useProgram(shaderInfo.program);

    gl.uniform4fv(gl.getUniformLocation(shaderInfo.program, 'color'), color);
    setMat4(shaderInfo, model, 'model');

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

//NOTE: This piece of shit doesnt work, why??
async function getShader(shader)
{
    const result = await fetch(shader);

    if(result.ok)
    {
        let text = await result.text();
        return {src: text, ok: true};
    }
    else
    {
        return {err: 'FILE NOT FOUND', ok: false};
    }
}

async function createRenderer(v, f)
{
    const vsrc = await getShader(v);
    const fsrc = await getShader(f);

    if(vsrc.ok && fsrc.ok) return {shader: createShader(vsrc, fsrc), ok: true};

    return {err: 'create renderer failed!', ok: false};
}

function createShader(v, f)
{
    let vertexShader = loadShader(gl, gl.VERTEX_SHADER, v.src);
    let fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, f.src);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source)
{
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}
  
  window.onload = main;