// グローバル変数の宣言
let selectedMode = ''; // 'practice', 'learning', 'quiz', 'userCreated'
let selectedPracticeMode = ''; // 'timeattack', 'partofspeech', 'review'
let selectedPartOfSpeech = ''; // 'verbs', 'adjectives', etc.
let selectedLevel = ''; // 'beginner', 'intermediate', 'advanced'

let currentWordList = [];
let currentWordIndex = 0;
let score = 0;
let timeLeft = 60;
let timer;

let learningWordList = [];
let learningWordIndex = 0;
let studyingList = JSON.parse(localStorage.getItem('studyingList')) || [];

let quizQuestions = [];
let currentQuizQuestionIndex = 0;
let quizScore = 0;
let userAnswers = [];

// 間違えた単語のリストを保存するための変数
let incorrectWords = JSON.parse(localStorage.getItem('incorrectWords')) || [];

// ユーザー作成モード用の変数
let userWordList = JSON.parse(localStorage.getItem('userWordList')) || [];
let userQuizQuestions = [];
let currentUserQuizQuestionIndex = 0;
let userQuizScore = 0;
let editingWordIndex = null;

// DOM要素の取得
const modeSelection = document.getElementById('mode-selection');
const practiceModeSelection = document.getElementById('practice-mode-selection');
const koreanKeyboardWarning = document.getElementById('korean-keyboard-warning');
const timeattackLevelSelection = document.getElementById('timeattack-level-selection');
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

const quizScreen = document.getElementById('quiz-screen');
const quizQuestionElement = document.getElementById('quiz-question');
const quizChoicesElement = document.getElementById('quiz-choices');
const quizScoreElement = document.getElementById('quiz-score');
const quizFeedbackElement = document.getElementById('quiz-feedback');
const quizSummary = document.getElementById('quiz-summary');
const quizSummaryList = document.getElementById('quiz-summary-list');
const quizFinalScoreElement = document.getElementById('quiz-final-score');

const incorrectWordsScreen = document.getElementById('incorrect-words-screen');
const incorrectWordsListElement = document.getElementById('incorrect-words-list');

// ユーザー作成モード用のDOM要素
const userCreatedMenu = document.getElementById('user-created-menu');
const addWordScreen = document.getElementById('add-word-screen');
const userWordListScreen = document.getElementById('user-word-list-screen');
const editWordScreen = document.getElementById('edit-word-screen');
const userQuizStartScreen = document.getElementById('user-quiz-start-screen');
const userQuizScreen = document.getElementById('user-quiz-screen');
const userQuizResultScreen = document.getElementById('user-quiz-result-screen');
const userGuideScreen = document.getElementById('user-guide-screen');


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

// すべてのスクリーンを非表示にする関数
function hideAllScreens() {
    const screens = document.querySelectorAll('.screen, .modal');
    screens.forEach(screen => hideElement(screen));
}

// 共通リセット関数
function commonReset() {
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
    quizQuestions = [];
    currentQuizQuestionIndex = 0;
    quizScore = 0;
    userAnswers = [];
    userQuizQuestions = [];
    currentUserQuizQuestionIndex = 0;
    userQuizScore = 0;
}

// アプリをリセットしてタイトル画面に戻る
function resetApp() {
    hideAllScreens();
    removeElementById('learning-level-selection');
    commonReset();
    showElement(modeSelection);
}

// モード選択関数
function selectMode(mode) {
    selectedMode = mode;
    hideElement(modeSelection);
    if (mode === 'practice') {
        showElement(practiceModeSelection);
    } else if (mode === 'learning') {
        showElement(partOfSpeechSelection);
    } else if (mode === 'quiz') {
        showElement(levelSelection);
    } else if (mode === 'userCreated') {
        showUserCreatedMenu();
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
    showElement(timeattackLevelSelection);
}

// レベル選択関数（practice または quiz モード用）
function selectLevel(level) {
    selectedLevel = level;
    if (selectedMode === 'practice') {
        if (selectedPracticeMode === 'timeattack') {
            hideElement(timeattackLevelSelection);
        } else {
            hideElement(levelSelection);
        }
        startTypingPractice();
    } else if (selectedMode === 'quiz') {
        hideElement(levelSelection);
        startQuiz();
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
            startTypingPractice();
        } else {
            showElement(difficultySelection);
        }
    } else if (selectedMode === 'learning') {
        showLevelSelectionForLearning();
    }
}

// 学習モード用のレベル選択画面表示関数
function showLevelSelectionForLearning() {
    const learningLevelSelection = document.getElementById('learning-level-selection');
    if (!learningLevelSelection) {
        const learningLevelSelectionDiv = document.createElement('div');
        learningLevelSelectionDiv.id = 'learning-level-selection';
        learningLevelSelectionDiv.classList.add('screen', 'fade-in');
        learningLevelSelectionDiv.style.display = 'flex';
        learningLevelSelectionDiv.innerHTML = `
            <h2>難易度を選択してください</h2>
            <button onclick="selectLearningLevel('beginner')">初級</button>
            <button onclick="selectLearningLevel('intermediate')">中級</button>
            <button onclick="selectLearningLevel('advanced')">上級</button>
            <button onclick="confirmReturnToTitle()">戻る</button>
        `;
        document.body.appendChild(learningLevelSelectionDiv);
    }
    showElement(document.getElementById('learning-level-selection'));
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
        showElement(timerElement);
        timeLeft = 60;
        updateTimer();
        startTimer();
    } else {
        hideElement(timerElement);
    }

    if (selectedPracticeMode === 'review') {
        showNextWordReview();
    } else {
        loadWords();
    }
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
                currentWordList = [];
                for (let pos in data[selectedLevel]) {
                    if (Array.isArray(data[selectedLevel][pos])) {
                        currentWordList = currentWordList.concat(data[selectedLevel][pos]);
                    }
                }
            } else if (selectedPracticeMode === 'partofspeech') {
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
            learningWordList = data[selectedLevel][selectedPartOfSpeech] || [];
            if (learningWordList.length === 0) {
                alert('選択した品詞と難易度に対応する単語がありません。');
                return;
            }
            shuffleArray(learningWordList);
            learningWordIndex = 0;
            showElement(learningMode);
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
        return 'words_beginner.json';
    }
}

// 単語シャッフル関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 次の単語表示関数
function showNextWord() {
    if (currentWordIndex < currentWordList.length) {
        const word = currentWordList[currentWordIndex];
        koreanWordElement.textContent = word.korean;
        japaneseTranslationElement.textContent = `日本語訳: ${word.japanese}`;
        userInputElement.value = '';
        userInputElement.focus();

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
        if (selectedPracticeMode === 'review') {
            checkInputReview();
        } else {
            checkInput();
        }
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
    } else if (selectedPracticeMode === 'review') {
        currentWordIndex = 0;
        showNextWordReview();
    } else {
        loadWords();
    }
}

// レベル選択画面に戻る関数
function goToLevelSelection() {
    hideElement(scoreScreen);
    if (selectedPracticeMode === 'timeattack') {
        showElement(timeattackLevelSelection);
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
    const screens = document.querySelectorAll('.screen, .modal');
    screens.forEach(screen => hideElement(screen));

    removeElementById('learning-level-selection');

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
    quizQuestions = [];
    currentQuizQuestionIndex = 0;
    quizScore = 0;
    userAnswers = [];
    userQuizQuestions = [];
    currentUserQuizQuestionIndex = 0;
    userQuizScore = 0;

    showElement(modeSelection);
}

// ダークモード切替関数
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// ページ読み込み時の初期化処理
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    showElement(modeSelection);
});

// 四択クイズ機能の追加

// クイズ開始関数
function startQuiz() {
    quizQuestions = [];
    quizScore = 0;
    currentQuizQuestionIndex = 0;
    userAnswers = [];
    loadQuizQuestions();
}

// クイズ用の質問読み込み関数
function loadQuizQuestions() {
    const fileName = getFileName(selectedLevel);
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let allWords = [];
            for (let pos in data[selectedLevel]) {
                if (Array.isArray(data[selectedLevel][pos])) {
                    allWords = allWords.concat(data[selectedLevel][pos]);
                }
            }

            if (allWords.length === 0) {
                alert('選択したレベルに対応する単語がありません。');
                resetApp();
                return;
            }

            shuffleArray(allWords);
            const numberOfQuestions = Math.min(10, allWords.length);
            for (let i = 0; i < numberOfQuestions; i++) {
                const correctWord = allWords[i];
                const wrongChoices = getWrongChoices(allWords, correctWord, 3);
                const choices = shuffleArray([correctWord.japanese, ...wrongChoices]);
                quizQuestions.push({
                    korean: correctWord.korean,
                    correct: correctWord.japanese,
                    choices: choices
                });
            }

            showQuizQuestion();
        })
        .catch(error => {
            console.error('クイズ用の単語データの読み込みに失敗しました:', error);
            alert('クイズ用の単語データの読み込みに失敗しました。');
            resetApp();
        });
}

// 間違い選択肢を取得する関数
function getWrongChoices(allWords, correctWord, count) {
    const wrongWords = allWords.filter(word => word.japanese !== correctWord.japanese);
    shuffleArray(wrongWords);
    const choices = wrongWords.slice(0, count).map(word => word.japanese);
    return choices;
}

// クイズの質問を表示する関数
function showQuizQuestion() {
    if (currentQuizQuestionIndex < quizQuestions.length) {
        const question = quizQuestions[currentQuizQuestionIndex];
        quizQuestionElement.textContent = `「${question.korean}」の意味は？`;
        quizFeedbackElement.textContent = '';
        quizChoicesElement.innerHTML = '';
        question.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.onclick = () => handleQuizChoice(index);
            quizChoicesElement.appendChild(button);
        });
        quizScoreElement.textContent = `スコア: ${quizScore}`;
        showElement(quizScreen);
    } else {
        endQuiz();
    }
}

// クイズの選択肢を処理する関数
function handleQuizChoice(selectedIndex) {
    const question = quizQuestions[currentQuizQuestionIndex];
    const selectedChoice = question.choices[selectedIndex];
    const isCorrect = selectedChoice === question.correct;

    userAnswers.push({
        korean: question.korean,
        selected: selectedChoice,
        correct: question.correct,
        isCorrect: isCorrect
    });

    if (!isCorrect) {
        // 間違えた単語を保存
        if (!incorrectWords.some(word => word.korean === question.korean)) {
            incorrectWords.push({
                korean: question.korean,
                japanese: question.correct
            });
            localStorage.setItem('incorrectWords', JSON.stringify(incorrectWords));
        }
    }

    if (isCorrect) {
        quizScore++;
    }
    quizScoreElement.textContent = `スコア: ${quizScore}`;

    quizFeedbackElement.textContent = isCorrect ? '〇' : '✖';
    quizFeedbackElement.style.color = isCorrect ? '#28a745' : '#dc3545';

    const buttons = quizChoicesElement.querySelectorAll('button');
    buttons.forEach(button => button.disabled = true);

    setTimeout(() => {
        currentQuizQuestionIndex++;
        showQuizQuestion();
    }, 1000);
}

// クイズ終了関数
function endQuiz() {
    hideElement(quizScreen);
    populateQuizSummary();
    showElement(quizSummary);
}

// クイズ終了後の解答一覧を表示する関数
function populateQuizSummary() {
    quizSummaryList.innerHTML = '';
    userAnswers.forEach((answer, index) => {
        const li = document.createElement('li');
        li.classList.add(answer.isCorrect ? 'correct' : 'incorrect');
        li.innerHTML = `
            <p>Q${index + 1}: 「${answer.korean}」の意味は？</p>
            <p>あなたの答え: ${answer.selected} ${answer.isCorrect ? '<span style="color:#28a745;">〇</span>' : '<span style="color:#dc3545;">✖</span>'}</p>
            <p>正解: ${answer.correct}</p>
        `;
        quizSummaryList.appendChild(li);
    });
    quizFinalScoreElement.textContent = `最終スコア: ${quizScore} / ${quizQuestions.length}`;
}

// クイズをリトライする関数
function retryQuiz() {
    hideElement(quizSummary);
    startQuiz();
}

// 間違えた単語の一覧を表示する関数
function viewIncorrectWords() {
    hideElement(quizSummary);
    showElement(incorrectWordsScreen);
    displayIncorrectWords();
}

// 間違えた単語の一覧を表示する関数（レベル選択画面から）
function viewIncorrectWordsFromLevelSelection() {
    hideElement(levelSelection);
    showElement(incorrectWordsScreen);
    displayIncorrectWords();
}

// 間違えた単語のリストを表示する関数
function displayIncorrectWords() {
    incorrectWordsListElement.innerHTML = '';
    if (incorrectWords.length === 0) {
        incorrectWordsListElement.innerHTML = '<li>間違えた単語はありません。</li>';
        return;
    }
    incorrectWords.forEach((word, index) => {
        const li = document.createElement('li');
        li.classList.add('word-list-item'); // 統一されたスタイルを適用
        li.innerHTML = `
            <p><strong>韓国語:</strong> ${word.korean}</p>
            <p><strong>日本語訳:</strong> ${word.japanese}</p>
            <button onclick="removeFromIncorrectWords(${index})">削除</button>
        `;
        incorrectWordsListElement.appendChild(li);
    });
}

// 間違えた単語リストから単語を削除する関数
function removeFromIncorrectWords(index) {
    incorrectWords.splice(index, 1);
    localStorage.setItem('incorrectWords', JSON.stringify(incorrectWords));
    displayIncorrectWords();
}

// 間違えた単語一覧画面を閉じる関数
function closeIncorrectWordsScreen() {
    hideElement(incorrectWordsScreen);
    // 呼び出し元に応じて戻り先を決定
    if (quizSummary && quizSummary.style.display === 'flex') {
        showElement(quizSummary);
    } else if (levelSelection && levelSelection.style.display === 'flex') {
        showElement(levelSelection);
    } else {
        showElement(modeSelection);
    }
}

// 復習モードを開始する関数
function startReviewMode() {
    if (incorrectWords.length === 0) {
        alert('間違えた単語はありません。');
        return;
    }
    hideElement(quizSummary);
    selectedMode = 'quiz';
    quizQuestions = [];
    quizScore = 0;
    currentQuizQuestionIndex = 0;
    userAnswers = [];
    loadReviewQuizQuestions();
}

// レベル選択画面から復習モードを開始する関数
function startReviewModeFromLevelSelection() {
    if (incorrectWords.length === 0) {
        alert('間違えた単語はありません。');
        return;
    }
    hideElement(levelSelection);
    selectedMode = 'quiz';
    quizQuestions = [];
    quizScore = 0;
    currentQuizQuestionIndex = 0;
    userAnswers = [];
    loadReviewQuizQuestions();
}

// 復習モード用のクイズ質問を読み込む関数
function loadReviewQuizQuestions() {
    if (incorrectWords.length === 0) {
        alert('復習する単語がありません。');
        resetApp();
        return;
    }

    loadAllWords().then(allWords => {
        incorrectWords.forEach(word => {
            const wrongChoices = getWrongChoicesForReview(word, allWords, 3);
            const choices = shuffleArray([word.japanese, ...wrongChoices]);
            quizQuestions.push({
                korean: word.korean,
                correct: word.japanese,
                choices: choices
            });
        });

        currentQuizQuestionIndex = 0;
        showQuizQuestion();
    }).catch(error => {
        console.error('単語データの読み込みに失敗しました:', error);
        alert('単語データの読み込みに失敗しました。');
        resetApp();
    });
}

// 復習モード用に全ての単語を読み込む関数
function loadAllWords() {
    let allWords = [];
    const levels = ['beginner', 'intermediate', 'advanced'];
    const promises = levels.map(level => {
        return fetch(getFileName(level))
            .then(response => response.json())
            .then(data => {
                for (let pos in data[level]) {
                    if (Array.isArray(data[level][pos])) {
                        allWords = allWords.concat(data[level][pos]);
                    }
                }
            });
    });

    return Promise.all(promises).then(() => allWords);
}

// 復習モード用の間違い選択肢を取得する関数
function getWrongChoicesForReview(correctWord, allWords, count) {
    const wrongWords = allWords.filter(word => word.japanese !== correctWord.japanese);
    shuffleArray(wrongWords);
    const choices = wrongWords.slice(0, count).map(word => word.japanese);
    return choices;
}

// ユーザー作成モードの機能追加

// ユーザー作成モードのメニュー画面を表示
function showUserCreatedMenu() {
    hideAllScreens();
    showElement(userCreatedMenu);
}

// 単語追加画面を表示
function showAddWordScreen() {
    hideAllScreens();
    showElement(addWordScreen);
    // フォームをリセット
    document.getElementById('user-word-korean').value = '';
    document.getElementById('user-word-japanese').value = '';
    document.getElementById('user-word-example-korean').value = '';
    document.getElementById('user-word-example-japanese').value = '';
}

// 単語を追加する関数
function addUserWord() {
    const korean = document.getElementById('user-word-korean').value.trim();
    const japanese = document.getElementById('user-word-japanese').value.trim();
    const exampleKorean = document.getElementById('user-word-example-korean').value.trim();
    const exampleJapanese = document.getElementById('user-word-example-japanese').value.trim();

    if (!korean || !japanese) {
        alert('韓国語の単語と日本語訳は必須です。');
        return;
    }

    userWordList.push({
        korean: korean,
        japanese: japanese,
        example: {
            korean: exampleKorean,
            japanese: exampleJapanese
        }
    });

    localStorage.setItem('userWordList', JSON.stringify(userWordList));
    alert('単語を追加しました。');
    showUserCreatedMenu();
}

// 追加した単語の一覧画面を表示
function showUserWordList() {
    hideAllScreens();
    showElement(userWordListScreen);
    displayUserWordList();
}

// ユーザーが追加した単語のリストを表示する関数
function displayUserWordList() {
    const userWordListElement = document.getElementById('user-word-list');
    userWordListElement.innerHTML = '';

    if (userWordList.length === 0) {
        userWordListElement.innerHTML = '<li>追加した単語がありません。</li>';
        return;
    }

    userWordList.forEach((word, index) => {
        const li = document.createElement('li');
        li.classList.add('word-list-item'); // 統一されたスタイルを適用
        li.innerHTML = `
            <p><strong>韓国語:</strong> ${word.korean}</p>
            <p><strong>日本語訳:</strong> ${word.japanese}</p>
            ${word.example.korean ? `<p><strong>例文 (韓国語):</strong> ${word.example.korean}</p>` : ''}
            ${word.example.japanese ? `<p><strong>例文訳 (日本語):</strong> ${word.example.japanese}</p>` : ''}
            <button onclick="editUserWord(${index})"><i class="fas fa-edit"></i> 編集</button>
            <button onclick="deleteUserWord(${index})"><i class="fas fa-trash"></i> 削除</button>
        `;
        userWordListElement.appendChild(li);
    });
}


// 単語を編集する関数
function editUserWord(index) {
    editingWordIndex = index;
    const word = userWordList[index];
    document.getElementById('edit-word-korean').value = word.korean;
    document.getElementById('edit-word-japanese').value = word.japanese;
    document.getElementById('edit-word-example-korean').value = word.example.korean;
    document.getElementById('edit-word-example-japanese').value = word.example.japanese;

    hideAllScreens();
    showElement(editWordScreen);
}

// 編集内容を保存する関数
function saveEditedWord() {
    const korean = document.getElementById('edit-word-korean').value.trim();
    const japanese = document.getElementById('edit-word-japanese').value.trim();
    const exampleKorean = document.getElementById('edit-word-example-korean').value.trim();
    const exampleJapanese = document.getElementById('edit-word-example-japanese').value.trim();

    if (!korean || !japanese) {
        alert('韓国語の単語と日本語訳は必須です。');
        return;
    }

    userWordList[editingWordIndex] = {
        korean: korean,
        japanese: japanese,
        example: {
            korean: exampleKorean,
            japanese: exampleJapanese
        }
    };

    localStorage.setItem('userWordList', JSON.stringify(userWordList));
    alert('単語を更新しました。');
    showUserWordList();
}

// 単語を削除する関数
function deleteUserWord(index) {
    if (confirm('本当にこの単語を削除しますか？')) {
        userWordList.splice(index, 1);
        localStorage.setItem('userWordList', JSON.stringify(userWordList));
        displayUserWordList();
    }
}

// ユーザー作成クイズ開始前画面を表示
function startUserCreatedQuiz() {
    hideAllScreens();
    showElement(userQuizStartScreen);
}

// ユーザー作成クイズを開始する関数
function startUserQuiz() {
    if (userWordList.length < 4) {
        alert('クイズを始めるには、最低4つの単語が必要です。');
        return;
    }

    userQuizQuestions = [];
    userQuizScore = 0;
    currentUserQuizQuestionIndex = 0;
    generateUserQuizQuestions();
}

// ユーザー作成クイズの問題を生成する関数
function generateUserQuizQuestions() {
    userQuizQuestions = [...userWordList];
    shuffleArray(userQuizQuestions);
    showUserQuizQuestion();
}

// ユーザー作成クイズの質問を表示する関数
function showUserQuizQuestion() {
    if (currentUserQuizQuestionIndex < userQuizQuestions.length) {
        const question = userQuizQuestions[currentUserQuizQuestionIndex];
        const choices = getUserQuizChoices(question);

        const userQuizQuestionElement = document.getElementById('user-quiz-question');
        const userQuizChoicesElement = document.getElementById('user-quiz-choices');
        const userQuizScoreElement = document.getElementById('user-quiz-score');
        const userQuizFeedbackElement = document.getElementById('user-quiz-feedback');

        userQuizQuestionElement.textContent = `「${question.korean}」の意味は？`;
        userQuizFeedbackElement.textContent = '';
        userQuizChoicesElement.innerHTML = '';

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.onclick = () => handleUserQuizChoice(choice);
            userQuizChoicesElement.appendChild(button);
        });

        userQuizScoreElement.textContent = `スコア: ${userQuizScore}`;
        hideAllScreens();
        showElement(document.getElementById('user-quiz-screen'));
    } else {
        endUserQuiz();
    }
}

// ユーザー作成クイズの選択肢を取得する関数
function getUserQuizChoices(correctQuestion) {
    const incorrectChoices = userWordList.filter(word => word.japanese !== correctQuestion.japanese);
    shuffleArray(incorrectChoices);
    const choices = incorrectChoices.slice(0, 3).map(word => word.japanese);
    choices.push(correctQuestion.japanese);
    return shuffleArray(choices);
}

// ユーザー作成クイズの選択肢を処理する関数
function handleUserQuizChoice(selectedChoice) {
    const question = userQuizQuestions[currentUserQuizQuestionIndex];
    const isCorrect = selectedChoice === question.japanese;

    if (isCorrect) {
        userQuizScore++;
    }

    const userQuizScoreElement = document.getElementById('user-quiz-score');
    const userQuizFeedbackElement = document.getElementById('user-quiz-feedback');
    const userQuizChoicesElement = document.getElementById('user-quiz-choices');

    userQuizScoreElement.textContent = `スコア: ${userQuizScore}`;
    userQuizFeedbackElement.textContent = isCorrect ? '〇' : '✖';
    userQuizFeedbackElement.style.color = isCorrect ? '#28a745' : '#dc3545';

    const buttons = userQuizChoicesElement.querySelectorAll('button');
    buttons.forEach(button => button.disabled = true);

    setTimeout(() => {
        currentUserQuizQuestionIndex++;
        showUserQuizQuestion();
    }, 1000);
}

// ユーザー作成クイズを終了する関数
function endUserQuiz() {
    hideAllScreens();
    populateUserQuizSummary();
    showElement(document.getElementById('user-quiz-result-screen'));
}

// ユーザー作成クイズの結果を表示する関数
function populateUserQuizSummary() {
    const userQuizSummaryList = document.getElementById('user-quiz-summary-list');
    const userQuizFinalScoreElement = document.getElementById('user-quiz-final-score');

    userQuizSummaryList.innerHTML = '';

    userQuizQuestions.forEach((question, index) => {
        const isCorrect = index < userQuizScore;
        const li = document.createElement('li');
        li.classList.add(isCorrect ? 'correct' : 'incorrect');
        li.innerHTML = `
            <p>Q${index + 1}: 「${question.korean}」の意味は？</p>
            <p>あなたの答え: ${isCorrect ? question.japanese : '不正解'}</p>
            <p>正解: ${question.japanese}</p>
        `;
        userQuizSummaryList.appendChild(li);
    });

    userQuizFinalScoreElement.textContent = `最終スコア: ${userQuizScore} / ${userQuizQuestions.length}`;
}

// ユーザー作成クイズを再試行する関数
function retryUserQuiz() {
    startUserQuiz();
}

// 使い方ガイド画面を表示する関数
function showUserGuide() {
    hideAllScreens();
    showElement(document.getElementById('user-guide-screen'));
}

// すべてのスクリーンを非表示にする関数
function hideAllScreens() {
    const screens = document.querySelectorAll('.screen, .modal');
    screens.forEach(screen => hideElement(screen));
}

// アプリ全体をリセットしてタイトル画面に戻る関数
function resetApp() {
    const screens = document.querySelectorAll('.screen, .modal');
    screens.forEach(screen => hideElement(screen));

    removeElementById('learning-level-selection');

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
    quizQuestions = [];
    currentQuizQuestionIndex = 0;
    quizScore = 0;
    userAnswers = [];
    userQuizQuestions = [];
    currentUserQuizQuestionIndex = 0;
    userQuizScore = 0;

    showElement(modeSelection);
}

// ページ読み込み時の初期化処理
document.addEventListener('DOMContentLoaded', function() {
    showElement(modeSelection);
    assignColorsToScreens();
});

// 色の配列を準備
const colors = ['#FFB6C1', '#FFA07A', '#FFD700', '#ADFF2F', '#40E0D0', '#1E90FF', '#9370DB', '#FF69B4'];

// 各画面のボタンと背景にランダムな色を適用する関数
function assignColorsToScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        // 背景色を設定
        screen.style.backgroundColor = randomColor;
        // その画面内のボタンを取得
        const buttons = screen.querySelectorAll('button');
        buttons.forEach(button => {
            // ボタンの色を明るくするために色を調整
            button.style.backgroundColor = lightenColor(randomColor, 20);
        });
    });
}

// 色を明るくするためのユーティリティ関数
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (
        0x1000000 +
        (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 +
        (B<255?B<1?0:B:255)
    ).toString(16).slice(1);
}

