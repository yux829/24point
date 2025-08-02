document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const playerSetup = document.getElementById('playerSetup');
    const mainGame = document.getElementById('mainGame');
    const playerNameInput = document.getElementById('playerNameInput');
    const playerGradeSelect = document.getElementById('playerGradeSelect');
    const savePlayerBtn = document.getElementById('savePlayerBtn');
    
    const playerNameDisplay = document.getElementById('playerNameDisplay');
    const playerGradeDisplay = document.getElementById('playerGradeDisplay');
    const playerScoreDisplay = document.getElementById('playerScoreDisplay');

    const difficultySelector = document.getElementById('difficultySelector');
    const startGameBtn = document.getElementById('startGameBtn');
    const muteBtn = document.getElementById('muteBtn');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const gameContainer = document.getElementById('gameContainer');
    const loaderContainer = document.getElementById('loaderContainer');
    const number1 = document.getElementById('number1');
    const number2 = document.getElementById('number2');
    const number3 = document.getElementById('number3');
    const number4 = document.getElementById('number4');
    const combinationCount = document.getElementById('combinationCount');
    const solutionInput = document.getElementById('solutionInput');
    const checkBtn = document.getElementById('checkBtn');
    const showSolutionBtn = document.getElementById('showSolutionBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const result = document.getElementById('result');
    const solutions = document.getElementById('solutions');
    const resetScoreBtn = document.getElementById('resetScoreBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // 游戏状态
    let currentNumbers = [];
    let allSolutions = [];
    let foundSolutions = new Set(); // 用于存储本局已找到的解法
    let hasViewedSolutions = false; // 用于标记本局是否已查看答案
    let currentDifficulty = 'gold';
    let isMusicPlaying = false;
    let playerData = {};

    // 难度设置
    const difficulties = {
        paper: { min: 10, max: 50 },
        plastic: { min: 8, max: 9 },
        wood: { min: 7, max: 7 },
        bronze: { min: 6, max: 6 },
        silver: { min: 5, max: 5 },
        gold: { min: 4, max: 4 },
        platinum: { min: 3, max: 3 },
        diamond: { min: 2, max: 2 },
        king: { min: 1, max: 1 },
        extreme: { min: 1, max: 1, findHardest: true }
    };

    // --- 玩家数据处理 ---
    function loadPlayerData() {
        const data = localStorage.getItem('playerData');
        if (data) {
            playerData = JSON.parse(data);
            return true;
        }
        return false;
    }

    function savePlayerData() {
        localStorage.setItem('playerData', JSON.stringify(playerData));
    }

    function updatePlayerInfoDisplay() {
        playerNameDisplay.textContent = playerData.name;
        playerGradeDisplay.textContent = `${playerData.grade}年级`;
        playerScoreDisplay.textContent = playerData.score;
    }

    function initializePlayer() {
        if (loadPlayerData()) {
            playerSetup.style.display = 'none';
            mainGame.style.display = 'block';
            updatePlayerInfoDisplay();
            setMusicState(true); // 尝试自动播放音乐
        } else {
            playerSetup.style.display = 'block';
            mainGame.style.display = 'none';
        }
    }

    savePlayerBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (!name) {
            alert('请输入你的姓名！');
            return;
        }
        playerData = {
            name: name,
            grade: playerGradeSelect.value,
            score: 0
        };
        savePlayerData();
        initializePlayer();
    });

    // --- 音乐控制 ---
    function setMusicState(play) {
        if (play) {
            const promise = backgroundMusic.play();
            if (promise !== undefined) {
                promise.then(() => {
                    isMusicPlaying = true;
                    muteBtn.textContent = '🔊';
                }).catch(() => {
                    isMusicPlaying = false;
                    muteBtn.textContent = '🔇';
                });
            }
        } else {
            backgroundMusic.pause();
            isMusicPlaying = false;
            muteBtn.textContent = '🔇';
        }
    }
    muteBtn.addEventListener('click', () => setMusicState(!isMusicPlaying));

    // --- 游戏逻辑 ---
    startGameBtn.addEventListener('click', () => {
        const selectedDifficulty = difficultySelector.value;
        startGame(selectedDifficulty);
    });
    checkBtn.addEventListener('click', checkSolution);
    showSolutionBtn.addEventListener('click', showAllSolutions);
    newGameBtn.addEventListener('click', () => startGame(currentDifficulty));
    resetScoreBtn.addEventListener('click', resetScore);
    logoutBtn.addEventListener('click', logout);

    function resetScore() {
        if (confirm('你确定要将分数重置为0吗？')) {
            playerData.score = 0;
            savePlayerData();
            updatePlayerInfoDisplay();
            alert('分数已成功重置！');
        }
    }

    function logout() {
        if (confirm('你确定要退出登录吗？所有进度将不会被保存。')) {
            localStorage.removeItem('playerData');
            playerData = {};
            
            mainGame.style.display = 'none';
            playerSetup.style.display = 'block';
            
            setMusicState(false);
        }
    }

    function startGame(difficulty) {
        currentDifficulty = difficulty;
        loaderContainer.style.display = 'flex';
        gameContainer.style.display = 'none';
        foundSolutions.clear();
        hasViewedSolutions = false;

        // Hide old results and solutions using classes
        result.classList.remove('show');
        solutions.classList.remove('show');

        // Animate cards by removing the 'dealt' class, which resets their state
        const cards = [number1, number2, number3, number4];
        cards.forEach(card => {
            card.classList.remove('dealt');
        });

        // A short delay allows the loader to be visible and animations to reset properly
        setTimeout(() => {
            solutions.innerHTML = '';
            solutionInput.value = '';
            
            const success = generateValidNumbers(difficulty);

            if (success) {
                const numbers = [number1, number2, number3, number4];
                numbers.forEach((card, index) => {
                    card.textContent = currentNumbers[index];
                    // Add the 'dealt' class to trigger the transition animation
                    card.classList.add('dealt');
                });
                combinationCount.textContent = allSolutions.length;
            }

            loaderContainer.style.display = 'none';
            gameContainer.style.display = 'block';
        }, 500);
    }

    function checkSolution() {
        const userInput = solutionInput.value.trim();
        if (!userInput) return;

        try {
            if (!/^[\d\s\(\)\+\-\*\/\.]+$/.test(userInput)) {
                throw new Error('输入包含无效字符');
            }

            const inputNumbers = userInput.match(/\d+(\.\d+)?/g);
            if (!inputNumbers || inputNumbers.length !== 4) {
                throw new Error('必须使用所有4个数字，每个数字只能使用一次');
            }

            const sortedInputNumbers = inputNumbers.map(Number).sort((a, b) => a - b);
            const sortedCurrentNumbers = [...currentNumbers].sort((a, b) => a - b);
            
            if (!arraysEqual(sortedInputNumbers, sortedCurrentNumbers)) {
                throw new Error('使用的数字与给定的数字不匹配');
            }

            const calculatedResult = eval(userInput);
            
            if (Math.abs(calculatedResult - 24) < 1e-10) {
                if (hasViewedSolutions) {
                    showResult(true, '你已经查看过答案了，本次不能得分。');
                    return;
                }

                if (foundSolutions.has(userInput)) {
                    showResult(true, '解法正确，但你已经提交过这个答案了。');
                } else {
                    foundSolutions.add(userInput);
                    playerData.score += 10;
                    savePlayerData();
                    updatePlayerInfoDisplay();
                    showResult(true, '恭喜！解法正确！获得10分！');
                    sounds.playCorrectSound();
                }
            } else {
                showResult(false, `结果为 ${calculatedResult}，不等于24`);
                sounds.playWrongSound();
            }
        } catch (e) {
            showResult(false, `错误：${e.message}`);
            sounds.playWrongSound();
        }
    }

    function showResult(isCorrect, message) {
        result.textContent = message;
        result.className = 'result'; // Reset classes
        result.classList.add(isCorrect ? 'correct' : 'wrong');
        result.classList.add('show');
    }

    function showAllSolutions() {
        hasViewedSolutions = true; // 标记已查看答案
        if (allSolutions.length === 0) {
            solutions.innerHTML = '<p>没有找到解法</p>';
        } else {
            solutions.innerHTML = '<h3>所有可能的解法：</h3>';
            allSolutions.forEach((solution, index) => {
                const solutionItem = document.createElement('div');
                solutionItem.className = 'solution-item';
                solutionItem.textContent = `${index + 1}. ${solution} = 24`;
                solutions.appendChild(solutionItem);
            });
        }
        solutions.classList.add('show');
    }

    function generateValidNumbers(difficulty) {
        let validCombination = false;
        let attempts = 0;
        const maxAttempts = 10000;

        while (!validCombination && attempts < maxAttempts) {
            currentNumbers = Array.from({length: 4}, () => Math.floor(Math.random() * 10) + 1);
            allSolutions = findAllSolutions(currentNumbers);
            const solutionCount = allSolutions.length;
            const { min, max } = difficulties[difficulty];
            if (solutionCount >= min && solutionCount <= max) {
                validCombination = true;
            }
            attempts++;
        }

        if (!validCombination) {
            alert(`无法找到符合'${currentDifficulty}'难度的数组合。请重试或选择其他难度。`);
            return false;
        }
        return true;
    }

    function generatePermutations(arr) {
    const result = [];
    const used = new Array(arr.length).fill(false);
    const path = [];

    // Sort to handle duplicates correctly
    arr.sort((a, b) => a - b);

    function backtrack() {
        if (path.length === arr.length) {
            result.push([...path]);
            return;
        }

        for (let i = 0; i < arr.length; i++) {
            if (used[i] || (i > 0 && arr[i] === arr[i - 1] && !used[i - 1])) {
                continue;
            }
            path.push(arr[i]);
            used[i] = true;
            backtrack();
            used[i] = false;
            path.pop();
        }
    }

    backtrack();
    return result;
}

function findAllSolutions(numbers) {
    const solutionsMap = new Map();
    const ops = ['+', '-', '*', '/'];
    const permutations = generatePermutations([...numbers]);

    for (const perm of permutations) {
        for (const op1 of ops) {
            for (const op2 of ops) {
                for (const op3 of ops) {
                    tryExpressionAndAddToSolutions(perm, op1, op2, op3, solutionsMap);
                }
            }
        }
    }
    return Array.from(solutionsMap.values());
}

function tryExpressionAndAddToSolutions(numbers, op1, op2, op3, solutionsMap) {
    const initialExprs = numbers.map(n => ({ val: n, str: n.toString(), canonical_str: n.toString() }));
    const [a, b, c, d] = initialExprs;

    const calculate = (expr1, op, expr2) => {
        if (op === '/' && (expr2.val === 0 || expr1.val % expr2.val !== 0)) return null;
        const val = eval(`${expr1.val} ${op} ${expr2.val}`);
        if (val < 0) return null;

        const str = `(${expr1.str} ${op} ${expr2.str})`;
        let canonical_str;
        if (op === '+' || op === '*') {
            // For commutative operators, sort children by their canonical string
            // to ensure the final canonical string is unique.
            if (expr1.canonical_str < expr2.canonical_str) {
                canonical_str = `(${expr1.canonical_str}${op}${expr2.canonical_str})`;
            } else {
                canonical_str = `(${expr2.canonical_str}${op}${expr1.canonical_str})`;
            }
        } else { // For - and /, order matters
            canonical_str = `(${expr1.canonical_str}${op}${expr2.canonical_str})`;
        }
        return { val, str, canonical_str };
    };

    const checkAndAdd = (expr) => {
        if (expr && Math.abs(expr.val - 24) < 1e-10) {
            // Remove the outermost parentheses for cleaner display
            const finalStr = expr.str.substring(1, expr.str.length - 1);
            if (!solutionsMap.has(expr.canonical_str)) {
                solutionsMap.set(expr.canonical_str, finalStr);
            }
        }
    };

    // Pattern 1: ((a op1 b) op2 c) op3 d
    let res1 = calculate(a, op1, b);
    if (res1) {
        let res2 = calculate(res1, op2, c);
        if (res2) {
            checkAndAdd(calculate(res2, op3, d));
        }
    }

    // Pattern 2: (a op1 (b op2 c)) op3 d
    res1 = calculate(b, op2, c);
    if (res1) {
        let res2 = calculate(a, op1, res1);
        if (res2) {
            checkAndAdd(calculate(res2, op3, d));
        }
    }

    // Pattern 3: a op1 ((b op2 c) op3 d)
    res1 = calculate(b, op2, c);
    if (res1) {
        let res2 = calculate(res1, op3, d);
        if (res2) {
            checkAndAdd(calculate(a, op1, res2));
        }
    }

    // Pattern 4: a op1 (b op2 (c op3 d))
    res1 = calculate(c, op3, d);
    if (res1) {
        let res2 = calculate(b, op2, res1);
        if (res2) {
            checkAndAdd(calculate(a, op1, res2));
        }
    }

    // Pattern 5: (a op1 b) op2 (c op3 d)
    res1 = calculate(a, op1, b);
    let res2 = calculate(c, op3, d);
    if (res1 && res2) {
        checkAndAdd(calculate(res1, op2, res2));
    }
}

    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (Math.abs(arr1[i] - arr2[i]) > 1e-10) return false;
        }
        return true;
    }

    // --- Initial Load ---
    initializePlayer();
});