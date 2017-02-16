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
        link: "http://www.vim.org",
        score: 0,
        ineligible: false
    },
	gvim: {
        name: "Graphical Vim (gVim)",
        link: "http://www.vim.org",
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
    },
	micro: {
        name: "micro",
        link: "https://micro-editor.github.io/",
        score: 0,
        ineligible: false
    }
};

// The list of questions to ask the user. Each question has a prompt text
// followed by a list of options that the user may select and use. Options
// have a text label, a list of candidates they benefit/disadvantages,
// how important that question is (added score) for both advantages and
// disadvantages, and a list of candidates that are registered ineligible.
var questions = [
    {
        text: "Would you like to work in the Terminal, or in a GUI?",
		bimportance: 0.8,
		dimportance: 0.6,
        options: [
            {
                text: "Terminal",
                benefits: ["nano", "vim", "micro"],
				disadvantages: ["kwrite", "gedit", "spacemacs", "atom", "emacs"],
                ineligible: ["gvim"]
            },
            {
                text: "GUI",
                benefits: ["atom", "kwrite", "gedit", "spacemacs", "emacs", "gvim"],
				disadvantages: ["nano"],
                ineligible: ["vim"]
            },
            {
                text: "Either One",
                benefits: [],
				disadvantages: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Intuitive or Advanced Controls?",
		bimportance: 1,
		dimportance: 1,
        options: [
            {
                text: "Intuitive",
                benefits: ["nano", "atom", "gedit", "kwrite", "micro"],
				disadvantages: ["vim", "gvim"],
                ineligible: []
            },
            {
                text: "Advanced",
                benefits: ["emacs", "vim", "gvim", "spacemacs"],
				disadvantages: ["nano", "gedit", "micro"],
                ineligible: []
            },
            {
                text: "Whichever",
                benefits: [],
				disadvantages: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Do you need advanced features like split views?",
		bimportance: 1,
		dimportance: 1.5,
        options: [
            {
                text: "Definitely!",
                benefits: ["vim", "gvim", "emacs", "spacemacs", "atom", "micro"],
				disadvantages: [],
                ineligible: ["nano", "gedit", "kwrite"]
            },
            {
                text: "Not Really.",
                benefits: [],
				disadvantages: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Do you prefer vim or emacs's editing style?",
		bimportance: 1.5,
		dimportance: 2,
        options: [
            {
                text: "Vim all the way!",
                benefits: ["vim", "gvim", "spacemacs"],
				disadvantages: ["emacs", "atom", "gedit", "kwrite", "nano", "micro"],
                ineligible: []
            },
            {
                text: "Emacs forever!",
                benefits: ["emacs", "spacemacs"],
				disadvantages: ["vim", "gvim", "atom", "gedit", "kwrite", "nano", "micro"],
                ineligible: []
            },
            {
                text: "Neither!",
                benefits: ["atom", "gedit", "kwrite", "nano", "micro"],
				disadvantages: ["emacs", "vim", "gvim", "spacemacs"],
                ineligible: []
            },
            {
                text: "I Don't Know!",
                benefits: ["spacemacs", "nano", "gedit", "kwrite", "atom", "micro"],
				disadvantages: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Want something nice and stable or modern?",
		bimportance: 1,
		dimportance: 0.75,
        options: [
            {
                text: "Stable!",
                benefits: ["vim", "gvim", "emacs", "nano"],
				disadvantages: ["atom", "gedit", "kwrite", "spacemacs", "micro"],
                ineligible: []
            },
            {
                text: "Modern!",
                benefits: ["atom", "spacemacs", "micro"],
				disadvantages: ["vim", "gvim", "emacs"],
                ineligible: []
            },
            {
                text: "Either One!",
                benefits: [],
				disadvantages: [],
                ineligible: []
            }
        ]
    },
    {
        text: "Want to theme and customize your editor?",
		bimportance: 1,
		dimportance: 1.5,
        options: [
            {
                text: "Of course!",
                benefits: ["spacemacs", "atom", "vim", "gvim", "emacs", "kwrite", "micro"],
				disadvantages: ["nano"],
                ineligible: []
            },
            {
                text: "Doesn't matter!",
                benefits: [],
				disadvantages: [],
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
	
	console.debug(candidateArray)

    // Sort candidates by score.
    candidateArray.sort(function (a, b) {
        if (a.score === b.score) return 0;
        if (a.score > b.score) return -1; //I dont know why, but I had to reverse this, as the
        if (a.score < b.score) return 1;  //picker picked the editor with the lowest(!) score.
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
                candidates[benefits].score += questions[question].bimportance;
				console.debug(candidates[benefits].name, candidates[benefits].score)
            });
			
			answer.disadvantages.forEach(function(disadvantages) {
                candidates[disadvantages].score -= questions[question].dimportance;
				console.debug(candidates[disadvantages].name, candidates[disadvantages].score)
            });

            // Mark newly ineligible candidates.
            answer.ineligible.forEach(function(ineligible) {
                candidates[ineligible].ineligible = true;
				console.debug(candidates[ineligible].name, candidates[ineligible].ineligible)
            });
			
			console.debug("") //Print newline for making debug logs make more sense.
			
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
