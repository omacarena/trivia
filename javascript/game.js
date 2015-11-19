(function(exports) {

  var QuestionCategory = {
    Pop: 'Pop',
    Science: 'Science',
    Sports: 'Sports',
    Rock: 'Rock'
  };


  var QuestionFactory = function (category) {
    this.category = category;
  };
  QuestionFactory.prototype = {
    create: function (index) {
      throw new Error('create() method is not implemented.');
    }
  };

  var PopQuestionFactory = function () {
    QuestionFactory.call(this, QuestionCategory.Pop);
  };
  PopQuestionFactory.prototype = new QuestionFactory();
  PopQuestionFactory.prototype.create = function (index) {
    return "Pop Question " + index;
  };

  var ScienceQuestionFactory = function () {
    QuestionFactory.call(this, QuestionCategory.Science);
  };
  ScienceQuestionFactory.prototype = new QuestionFactory();
  ScienceQuestionFactory.prototype.create = function (index) {
    return "Science Question " + index;
  };

  var SportsQuestionFactory = function () {
    QuestionFactory.call(this, QuestionCategory.Sports);
  };
  SportsQuestionFactory.prototype = new QuestionFactory();
  SportsQuestionFactory.prototype.create = function (index) {
    return "Sports Question " + index;
  };

  var RockQuestionFactory = function () {
    QuestionFactory.call(this, QuestionCategory.Rock);
  };
  RockQuestionFactory.prototype = new QuestionFactory();
  RockQuestionFactory.prototype.create = function (index) {
    return "Rock Question " + index;
  };


  var GamePlayer = function (name) {
    this.name = name;
    this.place = 0;
    this.purse = 0;
    this.isInPenaltyBox = false;
  };
  GamePlayer.prototype = {
    isWinner: function () {
      return this.purse !== 6;
    }
  };


  var QuestionQueue = function (questionFactories, questionCount) {
    this._questionCategoryToQuestionMap = null;
    this._loadQuestions(questionFactories, questionCount);
  };
  QuestionQueue.prototype = {
    _loadQuestions: function (questionFactories, questionCount) {

      var _this = this;

      if (!questionFactories || questionFactories.length === 0) {
        throw new Error('No question factories were defined.');
      }

      _this._questionCategoryToQuestionMap = {};

      for (var index = 0; index < questionCount; index++) {
        questionFactories.forEach(function (questionFactory) {
          var questions = _this._getQuestionsByCategory(questionFactory.category)
          var newQuestion = questionFactory.create(index);
          questions.push(newQuestion);
        });
      }
    },

    _getQuestionsByCategory: function (category) {
      var questions = this._questionCategoryToQuestionMap[category];
      if (!questions) {
        questions = new Array();
        this._questionCategoryToQuestionMap[category] = questions;
      }

      return questions;
    },

    getNextQuestion: function (category) {
      var questions = this._getQuestionsByCategory(category);
      if (questions.length === 0) {
        return null;
      }

      return questions.shift();
    }
  };


  exports.Game = function (questionFactories, questionCount) {

    questionFactories = questionFactories || Game.defaultQuestionFactories;
    questionCount = questionCount || 50;

    this._players = new Array();
    this._currentPlayerIndex = 0;
    this._isGettingOutOfPenaltyBox = false;
    this._questionQueue = null;

    this._initQuestionQueue(questionFactories, questionCount);
  };
  exports.Game.defaultQuestionFactories = [
    new PopQuestionFactory(),
    new ScienceQuestionFactory(),
    new SportsQuestionFactory(),
    new RockQuestionFactory()
  ];
  exports.Game.prototype = {
    _initQuestionQueue: function (questionFactories, questionCount) {
      this._questionQueue = new QuestionQueue(questionFactories, questionCount)
    },

    addPlayer: function (name) {
      var player = new GamePlayer(name);
      this._players.push(player);

      console.log(name + " was added");
      console.log("They are player number " + this._players.length);

      return true;
    },

    play: function () {

      var notAWinner = false;

      do
      {
        var roll = Math.floor(Math.random() * 6) + 1;
        this._roll(roll);

        if (Math.floor(Math.random() * 10) == 7) {
          notAWinner = this._wrongAnswer();
        }
        else {
          notAWinner = this._wasCorrectlyAnswered();
        }
      }
      while (notAWinner);
    },

    _wasCorrectlyAnswered: function () {

      var currentPlayer = this._players[this._currentPlayerIndex];

      if (currentPlayer.isInPenaltyBox) {
        if (this._isGettingOutOfPenaltyBox) {
          console.log('Answer was correct!!!!');
          currentPlayer.purse += 1;
          console.log(currentPlayer.name + " now has " + currentPlayer.purse + " Gold Coins.");

          var winner = currentPlayer.isWinner();

          this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;

          return winner;
        }
        else {
          this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;
          return true;
        }
      }
      else {
        console.log("Answer was correct!!!!");

        currentPlayer.purse += 1;

        console.log(currentPlayer.name + " now has " + currentPlayer.purse + " Gold Coins.");

        var winner = currentPlayer.isWinner();

        this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;

        return winner;
      }
    },

    _wrongAnswer: function () {
      var currentPlayer = this._players[this._currentPlayerIndex];

      console.log('Question was incorrectly answered');
      console.log(currentPlayer.name + " was sent to the penalty box");

      currentPlayer.isInPenaltyBox = true;

      this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;

      return true;
    },

    _roll: function (roll) {
      var currentPlayer = this._players[this._currentPlayerIndex];

      console.log(currentPlayer.name + " is the current player");
      console.log("They have rolled a " + roll);

      if (currentPlayer.isInPenaltyBox) {
        if (roll % 2 != 0) {
          this._isGettingOutOfPenaltyBox = true;
          console.log(currentPlayer.name + " is getting out of the penalty box");

          currentPlayer.place = (currentPlayer.place + roll) % 12;

          console.log(currentPlayer.name + "'s new location is " + currentPlayer.place);
          console.log("The category is " + this._getNextQuestionCategory());

          this._askQuestion();
        }
        else {
          console.log(currentPlayer.name + " is not getting out of the penalty box");
          this._isGettingOutOfPenaltyBox = false;
        }
      }
      else {

        currentPlayer.place = (currentPlayer.place + roll) % 12;

        console.log(currentPlayer.name + "'s new location is " + currentPlayer.place);
        console.log("The category is " + this._getNextQuestionCategory());

        this._askQuestion();
      }
    },

    _askQuestion: function () {
      var nextQuestion = this._getNextQuestion();
      console.log(nextQuestion);
    },

    _getNextQuestion: function () {
      var nextQuestionCategory = this._getNextQuestionCategory();
      var question = this._questionQueue.getNextQuestion(nextQuestionCategory);
      return question;
    },

    _getNextQuestionCategory: function () {
      var currentPlayer = this._players[this._currentPlayerIndex];

      switch (currentPlayer.place) {
        case 0:
        case 4:
        case 8:
          return QuestionCategory.Pop;
        case 1:
        case 5:
        case 9:
          return QuestionCategory.Science;
        case 2:
        case 6:
        case 10:
          return QuestionCategory.Sports;
        default:
          return QuestionCategory.Rock;
      }
    }
  };

})(typeof window !== "undefined" && window !== null ? window : global);


var game = new Game();

game.addPlayer('Chet');
game.addPlayer('Pat');
game.addPlayer('Sue');

game.play();