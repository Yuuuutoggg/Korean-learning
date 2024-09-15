// グローバル変数の宣言
let selectedMode = ''; // 'practice' または 'learning'
let selectedPracticeMode = ''; // 'timeattack' または 'partofspeech'
let selectedPartOfSpeech = ''; // 'verbs', 'adjectives', etc.
let selectedLevel = ''; // 'beginner', 'intermediate', 'advanced'

let currentWordList = []; // 現在のタイピング練習単語リスト
let currentWordIndex = 0; // 現在の単語インデックス
let score = 0; // タイムアタックモードのスコア
let timeLeft = 60; // タイムアタックモードの残り時間
let timer; // タイマーの識別子

let learningWordList = []; // 現在の学習モード単語リスト
let learningWordIndex = 0; // 現在表示中の学習モード単語インデックス

let studyingList = JSON.parse(localStorage.getItem('studyingList')) || []; // 勉強中の単語リスト

// DOM要素の取得
const modeSelection = document.getElementById('mode-selection');
const practiceModeSelection = document.getElementById('practice-mode-selection');
const koreanKeyboardWarning = document.getElementById('korean-keyboard-warning');
const levelSelection = document.getElementById('level-selection');
const partOfSpeechSelection = document.getElementById('part-of-speech-selection');
const difficultySelection = document.getElementById('difficulty-selection');
const typingPractice = document.getElementById('typing-practice');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const progressElement = document.getElementById('progress');
const koreanWordElement = document.getElementById('korean-word');
const japaneseTranslationElement = document.getElementById('japanese-translation');
const userInputElement = document.getElementById('user-input');
const scoreScreen = document.getElementById('score-screen');
const finalScoreElement = document.getElementById('final-score');
const learningMode = document.getElementById('learning-mode');
const learningKoreanWordElement = document.getElementById('learning-korean-word');
const learningJapaneseTranslationElement = document.getElementById('learning-japanese-translation');
const learningExampleKoreanElement = document.getElementById('learning-example-korean');
const learningExampleJapaneseElement = document.getElementById('learning-example-japanese');
const studyingWords = document.getElementById('studying-words');
const studyingListElement = document.getElementById('studying-list');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmYesButton = document.getElementById('confirm-yes');
const confirmNoButton = document.getElementById('confirm-no');
const darkModeButton = document.getElementById('dark-mode-button');

// ユーティリティ関数
function showElement(element) {
    element.style.display = 'flex';
}

function hideElement(element) {
    element.style.display = 'none';
}

function removeElementById(id) {
    const element = document.getElementById(id);
    if (element) {
        element.parentNode.removeChild(element);
    }
}

// モード選択関数
function selectMode(mode) {
    selectedMode = mode;
    hideElement(modeSelection);
    if (mode === 'practice') {
        showElement(practiceModeSelection);
    } else if (mode === 'learning') {
        showElement(partOfSpeechSelection);
    }
}

// タイピング練習モードのサブモード選択関数
function selectPracticeMode(practiceMode) {
    selectedPracticeMode = practiceMode;
    hideElement(practiceModeSelection);
    if (practiceMode === 'timeattack') {
        showElement(koreanKeyboardWarning);
    } else if (practiceMode === 'partofspeech') {
        showElement(partOfSpeechSelection);
    }
}

// タイムアタックモードの韓国語キーボード警告を確認
function acknowledgeKoreanKeyboard() {
    hideElement(koreanKeyboardWarning);
    showElement(levelSelection);
}

// レベル選択関数（タイムアタックモード用）
function selectLevel(level) {
    selectedLevel = level;
    hideElement(levelSelection);
    if (selectedMode === 'practice') {
        startTypingPractice();
    } else if (selectedMode === 'learning') {
        fetchLearningWords();
    }
}

// 難易度選択関数（品詞別モード用）
function selectDifficulty(level) {
    selectedLevel = level;
    hideElement(difficultySelection);
    startTypingPractice();
}

// 品詞選択関数
function selectPartOfSpeech(partOfSpeech, skipDifficulty = false) {
    selectedPartOfSpeech = partOfSpeech;
    hideElement(partOfSpeechSelection);
    if (selectedMode === 'practice') {
        if (skipDifficulty) {
            // 数詞の場合、難易度選択をスキップして直接開始
            startTypingPractice();
        } else {
            // 品詞別モードでは難易度選択を表示
            showElement(difficultySelection);
        }
    } else if (selectedMode === 'learning') {
        // 学習モードではレベル選択を表示
        showLevelSelectionForLearning();
    }
}

// 学習モード用のレベル選択画面表示関数
function showLevelSelectionForLearning() {
    // 新しいレベル選択画面を表示
    const learningLevelSelection = document.createElement('div');
    learningLevelSelection.id = 'learning-level-selection';
    learningLevelSelection.classList.add('screen', 'fade-in');
    learningLevelSelection.style.display = 'flex';
    learningLevelSelection.innerHTML = `
        <h2>難易度を選択してください</h2>
        <button onclick="selectLearningLevel('beginner')">初級</button>
        <button onclick="selectLearningLevel('intermediate')">中級</button>
        <button onclick="selectLearningLevel('advanced')">上級</button>
        <button onclick="confirmReturnToTitle()">戻る</button>
    `;
    document.body.appendChild(learningLevelSelection);
    showElement(learningLevelSelection);
}

// 学習モード用のレベル選択関数
function selectLearningLevel(level) {
    selectedLevel = level;
    const learningLevelSelection = document.getElementById('learning-level-selection');
    hideElement(learningLevelSelection);
    removeElementById('learning-level-selection');
    fetchLearningWords();
}

// タイピング練習開始関数
function startTypingPractice() {
    showElement(typingPractice);
    typingPractice.scrollIntoView({ behavior: 'smooth' });
    userInputElement.value = '';
    userInputElement.focus();
    score = 0;
    currentWordIndex = 0;
    updateScore();

    if (selectedPracticeMode === 'timeattack') {
        // タイムアタックモード設定
        showElement(timerElement);
        timeLeft = 60;
        updateTimer();
        startTimer();
    } else {
        // 品詞別モード設定（タイマー非表示）
        hideElement(timerElement);
    }

    loadWords();
}

// 単語読み込み関数
function loadWords() {
    let fileName = '';
    if (selectedPracticeMode === 'timeattack' || selectedPracticeMode === 'partofspeech') {
        fileName = getFileName(selectedLevel);
    }

    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (selectedPracticeMode === 'timeattack') {
                // タイムアタックモードでは全品詞の単語を統合
                currentWordList = [];
                for (let pos in data[selectedLevel]) {
                    if (Array.isArray(data[selectedLevel][pos])) {
                        currentWordList = currentWordList.concat(data[selectedLevel][pos]);
                    }
                }
            } else if (selectedPracticeMode === 'partofspeech') {
                // 品詞別モードでは選択した品詞の単語を取得
                currentWordList = data[selectedLevel][selectedPartOfSpeech] || [];
            }

            if (currentWordList.length === 0) {
                alert('選択したレベルや品詞に対応する単語がありません。');
                return;
            }

            shuffleArray(currentWordList);
            showNextWord();
        })
        .catch(error => {
            console.error('単語データの読み込みに失敗しました:', error);
            alert('単語データの読み込みに失敗しました。');
        });
}

// 学習モードの単語読み込み関数
function fetchLearningWords() {
    const fileName = getFileName(selectedLevel);
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 学習モードでは、選択されたレベルと品詞に基づいて単語を取得
            learningWordList = data[selectedLevel][selectedPartOfSpeech] || [];
            if (learningWordList.length === 0) {
                alert('選択した品詞と難易度に対応する単語がありません。');
                return;
            }
            shuffleArray(learningWordList);
            learningWordIndex = 0;
            showElement(learningMode); // 学習モードを表示
            showLearningWord();
        })
        .catch(error => {
            console.error('学習モードの単語データの読み込みに失敗しました:', error);
            alert('学習モードの単語データの読み込みに失敗しました。');
        });
}

// ファイル名取得関数
function getFileName(level) {
    if (level === 'beginner') {
        return 'words_beginner.json';
    } else if (level === 'intermediate') {
        return 'words_intermediate.json';
    } else if (level === 'advanced') {
        return 'words_advanced.json';
    } else {
        return 'words_beginner.json'; // デフォルト
    }
}

// 単語シャッフル関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 次の単語表示関数（タイピング練習モード）
function showNextWord() {
    if (currentWordIndex < currentWordList.length) {
        const word = currentWordList[currentWordIndex];
        koreanWordElement.textContent = word.korean;
        japaneseTranslationElement.textContent = `日本語訳: ${word.japanese}`;
        userInputElement.value = '';
        userInputElement.focus();

        // 進行状況の更新
        if (progressElement) {
            progressElement.textContent = `単語 ${currentWordIndex + 1} / ${currentWordList.length}`;
        }
    } else {
        endTypingPractice('completed');
    }
}

// 入力チェック関数
userInputElement.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkInput();
    }
});

function checkInput() {
    const userInput = userInputElement.value.trim();
    const currentWord = currentWordList[currentWordIndex];

    if (userInput === currentWord.korean) {
        score++;
        updateScore();
        currentWordIndex++;
        showNextWord();
    }
}

// スコア更新関数
function updateScore() {
    scoreElement.textContent = `スコア: ${score}`;
}

// タイマー更新関数
function updateTimer() {
    timerElement.textContent = `残り時間: ${timeLeft}秒`;
}

// タイマー開始関数
function startTimer() {
    timer = setInterval(function() {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            endTypingPractice('timeup');
        }
    }, 1000);
}

// タイピング練習終了関数
function endTypingPractice(reason) {
    clearInterval(timer);
    hideElement(typingPractice);

    let message = '';
    if (reason === 'completed') {
        message = `すべて終了しました！あなたのスコアは ${score} です。`;
    } else if (reason === 'timeup') {
        message = `時間切れです！あなたのスコアは ${score} です。`;
    }

    finalScoreElement.textContent = message;
    showElement(scoreScreen);
}

// スコアをX（Twitter）で共有する関数
function postToX() {
    const message = encodeURIComponent(`私は韓国語タイピング練習でスコア ${score} を獲得しました！`);
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${message}&url=${url}`;
    window.open(shareUrl, '_blank');
}

// ゲームをリトライする関数
function retryGame() {
    hideElement(scoreScreen);
    showElement(typingPractice);
    userInputElement.value = '';
    userInputElement.focus();
    score = 0;
    currentWordIndex = 0;
    updateScore();

    if (selectedPracticeMode === 'timeattack') {
        timeLeft = 60;
        updateTimer();
        startTimer();
        loadWords();
    } else {
        loadWords();
    }
}

// レベル選択画面に戻る関数
function goToLevelSelection() {
    hideElement(scoreScreen);
    if (selectedPracticeMode === 'timeattack') {
        showElement(levelSelection);
    } else if (selectedPracticeMode === 'partofspeech') {
        showElement(difficultySelection);
    }
}

// 学習モードの単語表示関数
function showLearningWord() {
    if (learningWordIndex < learningWordList.length) {
        const word = learningWordList[learningWordIndex];
        learningKoreanWordElement.textContent = `韓国語: ${word.korean}`;
        learningJapaneseTranslationElement.textContent = `日本語訳: ${word.japanese}`;
        learningExampleKoreanElement.textContent = `例文 (韓国語): ${word.example.korean || 'なし'}`;
        learningExampleJapaneseElement.textContent = `例文訳 (日本語): ${word.example.japanese || 'なし'}`;
    } else {
        alert('選択した品詞のすべての単語を学習しました。');
        endLearningMode();
    }
}

// 学習モードで次の単語に進む関数
function nextLearningWord() {
    learningWordIndex++;
    showLearningWord();
}

// 学習モードで「勉強中」リストに単語を追加する関数
function addToStudyingList() {
    const currentWord = learningWordList[learningWordIndex];
    // 重複チェック
    if (!studyingList.some(word => word.korean === currentWord.korean)) {
        studyingList.push(currentWord);
        localStorage.setItem('studyingList', JSON.stringify(studyingList));
        alert('この単語を勉強中リストに追加しました！');
    } else {
        alert('この単語は既に勉強中リストに含まれています。');
    }
}

// 学習モードの終了関数
function endLearningMode() {
    hideElement(learningMode);
    showElement(partOfSpeechSelection);
}

// 勉強中の単語リストを表示する関数
function viewStudyingWords() {
    hideElement(learningMode);
    hideElement(partOfSpeechSelection);
    showElement(studyingWords);
    displayStudyingList();
    studyingWords.scrollTop = 0;
}

// 勉強中リストを表示する関数
function displayStudyingList() {
    studyingListElement.innerHTML = '';
    if (studyingList.length === 0) {
        studyingListElement.innerHTML = '<li>勉強中の単語がありません。</li>';
        return;
    }
    studyingList.forEach((word, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="studying-word">
                <p>韓国語: ${word.korean}</p>
                <p>日本語訳: ${word.japanese}</p>
                <p>例文 (韓国語): ${word.example.korean || 'なし'}</p>
                <p>例文訳 (日本語): ${word.example.japanese || 'なし'}</p>
                <button onclick="removeFromStudyingList(${index})">削除</button>
            </div>
        `;
        studyingListElement.appendChild(li);
    });
}

// 勉強中リストから単語を削除する関数
function removeFromStudyingList(index) {
    studyingList.splice(index, 1);
    localStorage.setItem('studyingList', JSON.stringify(studyingList));
    displayStudyingList();
}

// 勉強中の単語確認画面を閉じる関数
function closeStudyingWords() {
    hideElement(studyingWords);
    if (selectedMode === 'practice') {
        showElement(partOfSpeechSelection);
    } else if (selectedMode === 'learning') {
        showElement(partOfSpeechSelection);
    }
}

// 確認ダイアログを表示する関数
function confirmReturnToTitle() {
    showElement(confirmationModal);
}

// 確認ダイアログで「はい」をクリックした時の処理
confirmYesButton.addEventListener('click', function() {
    hideElement(confirmationModal);
    resetApp();
});

// 確認ダイアログで「いいえ」をクリックした時の処理
confirmNoButton.addEventListener('click', function() {
    hideElement(confirmationModal);
});

// アプリ全体をリセットしてタイトル画面に戻る関数
function resetApp() {
    // すべてのスクリーンを非表示に
    const screens = document.querySelectorAll('.screen, .modal');
    screens.forEach(screen => hideElement(screen));

    // 学習モード用の動的に追加したレベル選択画面を削除
    removeElementById('learning-level-selection');

    // 初期化
    selectedMode = '';
    selectedPracticeMode = '';
    selectedPartOfSpeech = '';
    selectedLevel = '';
    currentWordList = [];
    currentWordIndex = 0;
    score = 0;
    timeLeft = 60;
    clearInterval(timer);
    learningWordList = [];
    learningWordIndex = 0;

    // 初期画面を表示
    showElement(modeSelection);
}

// ダークモード切替関数
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // 現在のテーマを保存
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// ページ読み込み時の初期化処理
document.addEventListener('DOMContentLoaded', function() {
    // 保存されたテーマを適用
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // 初期画面を表示
    showElement(modeSelection);
});
