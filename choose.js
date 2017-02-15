// Choose an Editor
// An intelligent text-editor choosing adventure!
//
// This script uses an intelligent scoring system mixed with a survey to
// determined which of the many text editors available may be the best for this
// user.
//
// Copyright (C) 2017 Ethan McTague - http://tague.me - @_mctague

// The DOM nodes we will need to use for this script.
var dom = {
    // The question text to be asked.
    question: document.getElementById("question"),

    // A container for <button>s containing answers.
    answers: document.getElementById("answers"),

    // A button inside of answers, there by default, that starts the survey.
    startButton: document.getElementById("start"),

    // The query area containing the quiz.
    query: document.getElementById("query")
};

// A list of candidates for editor to be recommended.
// Each candidate has a name, a URL (link), a score based on the user's choices, and
// an indicator to indicate if the editor is rendered ineligible by one of the user's
// choices.
var candidates = {
    emacs: {
        name: "GNU Emacs",
        link: "http://gnu.org/s/emacs",
        score: 0,
        ineligible: false
    },
    vim: {
        name: "Vi Improved (Vim)",
        link: "http://vim.org",
        score: 0,
        ineligible: false
    },
	gvim: {
        name: "Graphical Vim (gVim)",
        link: "http://vim.org",
        score: 0,
        ineligible: false
    },
    nano: {
        name: "GNU Nano",
        link: "http://gnu.org/s/nano",
        score: 0,
        ineligible: false
    },
    atom: {
        name: "Atom",
        link: "http://atom.io",
        score: 0,
        ineligible: false
    },
    spacemacs: {
        name: "Spacemacs",
        link: "http://spacemacs.org",
        score: 0,
        ineligible: false
    },
    gedit: {
        name: "GEdit",
        link: "https://wiki.gnome.org/Apps/Gedit",
        score: 0,
        ineligible: false
    },
    kwrite: {
        name: "KWrite",
        link: "https://kde.org/applications/utilities/kwrite",
        score: 0,
        ineligible: false
    }
};

// The list of questions to ask the user. Each question has a prompt text
// followed by a list of options that the user may select and use. Options
// have a text label, a list of candidates they benefit, and a list of
// candidates that are registered ineligible.
var questions = [
    {
        text: "Would you like to work in the Terminal, or in a GUI?",
        options: [
            {
                text: "Terminal",
                benefits: ["nano", "vim"],
                ineligible: ["kwrite", "gedit", "spacemacs", "atom", "gvim"]
            },
            {
                text: "GUI",
                benefits: ["atom", "kwrite", "gedit", "spacemacs", "emacs", "gvim"],
                ineligible: ["nano", "vim"]
            },
            {
                text: "Either One",
                benefits: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Intuitive or Advanced Controls?",
        options: [
            {
                text: "Intuitive",
                benefits: ["nano", "atom", "gedit", "kwrite"],
                ineligible: ["vim", "gvim"]
            },
            {
                text: "Advanced",
                benefits: ["emacs", "vim", "gvim", "spacemacs"],
                ineligible: ["nano", "gedit"]
            },
            {
                text: "Whichever",
                benefits: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Do you need advanced features like split views?",
        options: [
            {
                text: "Definitely!",
                benefits: ["vim", "gvim", "emacs", "spacemacs", "atom"],
                ineligible: ["nano", "gedit", "kwrite"]
            },
            {
                text: "Not Really.",
                benefits: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Do you prefer vim or emacs's editing style?",
        options: [
            {
                text: "Vim all the way!",
                benefits: ["vim", "gvim", "spacemacs"],
                ineligible: ["emacs", "atom", "gedit", "kwrite", "nano"]
            },
            {
                text: "Emacs forever!",
                benefits: ["emacs", "spacemacs"],
                ineligible: ["vim", "gvim", "atom", "gedit", "kwrite", "nano"]
            },
            {
                text: "Neither!",
                benefits: ["atom", "gedit", "kwrite", "nano"],
                ineligible: ["emacs", "vim", "gvim", "spacemacs"]
            },
            {
                text: "I Don't Know!",
                benefits: ["spacemacs", "nano", "gedit", "kwrite", "atom"],
                ineligible: []
            }
        ]
    },
    {
        text: "Want something nice and stable or modern?",
        options: [
            {
                text: "Stable!",
                benefits: ["vim", "gvim", "emacs"],
                ineligible: ["atom", "gedit", "kwrite", "spacemacs"]
            },
            {
                text: "Modern!",
                benefits: ["atom", "spacemacs"],
                ineligible: ["vim", "gvim", "emacs"]
            },
            {
                text: "Either One!",
                benefits: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Want to theme and customize your editor?",
        options: [
            {
                text: "Of course!",
                benefits: ["spacemacs", "atom", "vim", "gvim", "emacs", "kwrite"],
                ineligible: ["nano"]
            },
            {
                text: "Doesn't matter!",
                benefits: [],
                ineligible: []
            }
        ]
    }
];

// Display the user's results.
var displayResults = function () {
    // Put candidates in an array for sorting, filtering out ineligible
    // candidates.
    var candidateArray = Object.keys(candidates).map(function (key) {
        return candidates[key];
    }).filter(function (candidate) {
        return !candidate.ineligible;
    });

    // Sort candidates by score.
    candidateArray.sort(function (a, b) {
        if (a.score === b.score) return 0;
        if (a.score > b.score) return 1;
        if (a.score < b.score) return -1;
    });

    if (!candidateArray[0]) {
        candidateArray[0] = {
            name: "Unknown! Try again!",
            link: "#"
        };
    }

    // Show the ideal editor name and link.
    dom.question.innerHTML = candidateArray[0].name;
    dom.question.href = candidateArray[0].link;

    // Classify the quiz as finished / link-mode.
    dom.query.classList.add("link");
};

// The current question.
var question = -1;

// Prompt for a question.
var questionPrompt = function () {
    question++; // Increment the question number.
    dom.answers.innerHTML = ""; // Clear answer button DOM.

    if (!questions[question]) return displayResults(); // Show results if done.

    dom.question.innerHTML = questions[question].text; // Update the question text.

    // Iterate through possible answers.
    questions[question].options.forEach(function(answer) {
        // Make a button for this answer option.
        var answerButton = document.createElement("button");
        answerButton.innerHTML = answer.text;

        // Bind an event when the button is selected.
        answerButton.onclick = function () {
            // Increase score of benefiting candidates.
            answer.benefits.forEach(function(benefits) {
                candidates[benefits].score++;
            });

            // Mark newly ineligible candidates.
            answer.ineligible.forEach(function(ineligible) {
                candidates[ineligible].ineligible = true;
            });

            // Prompt for the next question.
            questionPrompt();
        };

        // Add the button to the answer container.
        dom.answers.appendChild(answerButton);
    });
};

// Start the questionnaire when the start button is clicked.
dom.startButton.onclick = function () {
    questionPrompt();
};
