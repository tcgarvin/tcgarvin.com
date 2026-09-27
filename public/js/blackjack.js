(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var bjjs = require('bjjs');

var gamethrottle = 20 // ms per hand target

// A little timeseries-style graph to show how things go.
function BlackjackSimpleHistory() {
  var width;
  var height;
  var colors = ["#BC772F","#9876AA","#619647","#BED6FF","#D25252"];

  // init X-axis with scale
  var xScale = d3.scale.linear();
  var xAxis = d3.svg.axis()
    .orient("bottom")
    .tickFormat(function(tick) { return tick != 0 ? tick : ""; })
    .scale(xScale);

  // init X-axis with scale
  var yScale = d3.scale.linear();
  var yAxis = d3.svg.axis()
    .orient("right") // Picked because of the resulting text-anchor.  Wrong?
    .tickFormat(function(tick) { return tick != 0 ? tick : ""; })
    .scale(yScale);

  // Init Line generator
  var contentPath = d3.svg.line()
    .x(function(d,i) { return xScale(i); })
    .y(function(d) { return yScale(d); });

  // The render function proper
  var history = function(selection) {
    // Init axis if not already present
    var xAxisSelection = selection.selectAll("g.xaxis").data([0]);
    xAxisSelection
      .enter()
        .append("svg:g")
        .classed("xaxis", true);

    xAxisSelection
        .attr("transform", function() { return "translate(0,"+yScale(0)+")"; })
        .call(xAxis);

    yAxis.tickSize(width);
    var yAxisSelection = selection.selectAll("g.yaxis").data([0]);
    yAxisSelection
      .enter()
        .append("svg:g")
        .classed("yaxis", true);

    yAxisSelection.call(yAxis);

    yAxisSelection.selectAll("g.tick text")
        .attr("x","1em")
        .attr("y","-0.72em");

    // Init and render paths
    var d3Paths = selection.selectAll("path.content")
      .data(function(players) {
        return players.map(function(playerHistory) {
          return playerHistory.history;
        });
      });

    d3Paths.enter()
      .append("svg:path")
      .style("stroke", function(d,i) { return colors[i]; })
      .classed("content",true);

    d3Paths.attr("d", contentPath);
  }

  history.height = function(value) {
    if (!arguments.length) return height;
    // XXX: Two sources of truth?
    height = value;
    yScale.range([height,0]);
    return history;
  };

  history.width = function(value) {
    if (!arguments.length) return width;
    // XXX: Two sources of truth?
    width = value;
    xScale.range([0,width]);
    return history;
  };

  // Delegate range get/setting to internal handlers
  history.xDomain = function(value) {
    if (!arguments.length) return xScale.domain();
    xScale.domain(value);
    return history;
  };

  history.yDomain = function(value) {
    if (!arguments.length) return yScale.domain();
    yScale.domain(value);
    return history;
  };

  return history;
}

var CARDS_URL = "../svg/cards.svg";
function getCardSVGUrl(card) {
  var rank = card.getRank();
  if (rank === "A") { rank = "ace"; }
  else if (rank === "K") { rank = "king"; }
  else if (rank === "Q") { rank = "queen"; }
  else if (rank === "J") { rank = "jack"; }
  return CARDS_URL + "#card-" + rank + "-" + card.getSuit();
}

var curOid = 0;
function idObject(o) {
  if (!o.__id) {
    o.__id = curOid
    curOid += 1;
  }
  return o.__id;
}

function BlackjackTable() {
  var height;
  var width;

  var playerHands = [];
  var dealerHand;

  function render(selection) {
    // There's two approaches we could take here.  We could attach location
    // info to each card as we collect information about it, before handing
    // it off to d3, or we could give d3 functions to determine location as
    // needed.
    //
    // Normally, I'd be in favor of pushing that logic out as far as possible,
    // so we don't have potential sync issues, but it just seems so slow..
    // Let's try attaching info as we go, for now.

    var game = selection.data()[0]; // Bleh
    var cards = [];
    function syncCardInfo(playerHand) {
      var player = playerHand.player;
      var hand = playerHand.hand;

      var handX, handY, handDY;

      if (player === "dealer") {
        handX = 50;
        handY = 0;
        handDY = 10;
      } else if (player === game.getPlayers()[0]) {
        handX = 50;
        handY = height - 310;
        handDY = -10;
      } else {
        handX = -1000;
        handY = -1000;
        handDY = -10;
      }

      hand.getCards().forEach(function(card, i) {
        card.x = handX + (30 * i);
        card.y = handY + (handDY * i);
        cards.push(card);
      });
    }

    syncCardInfo({hand:dealerHand, player:"dealer"});
    playerHands.forEach(function(playerHand) {
      syncCardInfo(playerHand);
    });

    // Display cards
    var d3cards = selection.selectAll("use.card")
      .data(cards, function(d,i) {
        return idObject(d);
      });

    d3cards.enter()
      .append("svg:use")
        .classed("card", true)
        .attr("xlink:href", getCardSVGUrl);

    d3cards
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });

    d3cards.exit().remove();

    //Display Win/Lose/Bust?

      
  }

  function table(selection) {
    // This isn't really the render function.  This just sets things up so that
    // we render on game changes correctly.
    var game = selection.data()[0]; // Bleh
    game.on("endround", function(ph, dh) {
      playerHands = ph;
      dealerHand = dh;
      render(selection);
    });
  }

  table.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return table;
  };

  table.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return table;
  };

  return table;
}

$(function() {
  var height = $(window).height() - 100 // px
  var width = $(window).width(); // px

  var numToSimulate = 1000;

  // init poker
  var game = new bjjs.blackjack({});
  var basic = new bjjs.player(new bjjs.strategy.basic());
  var basic2 = new bjjs.player(new bjjs.strategy.basic());
  game.addPlayer(basic);
  //game.addPlayer(basic2);
  
  // We're going to keep history in a simple little object.  Someday it might
  // be formalized.
  game.getPlayers().forEach(function(player) {
    player.history = [];
  });

  // Init visualization logic
  var tableVis = BlackjackTable()
    .height(height)
    .width(width / 3);

  var histVis = BlackjackSimpleHistory()
    .height(height)
    .width(width * 2 / 3)
    .xDomain([0,numToSimulate])
    .yDomain([-900, 900]);

  // Find/init svg
  var d3Svg = d3.select('svg.blackjack')
    .attr("height", height)
    .attr("width", width);

  // Find init svg groups for visualizations
  var d3CardTable = d3Svg.selectAll('g.cardtable').data([game]);
  d3CardTable.enter()
    .append('svg:g')
    .classed('cardtable', true)
    .call(tableVis);

  var d3Hist = d3Svg.selectAll('g.history').data([game.getPlayers()]);
  d3Hist.enter()
    .append('svg:g')
    .classed('history', true)
    .attr("transform", "translate(" + (width / 3) + ",0)")
    .call(histVis);

  // A decision here.  Since we're not doing web workers, we need to
  // keep the simulation throttled.  We'll do that by setting a little timer
  // between runs.  This gives the UI a chance to keep up in real time.
  var runCount = 0;
  var players = game.getPlayers();
  var simulate = function() {
    game.doOneRound();
    runCount += 1;
    players.forEach(function(player) {
      player.history.push(player.getBalance());
    });
    d3Hist.call(histVis);

    if (runCount < numToSimulate) {
      window.setTimeout(simulate, gamethrottle);
    }
  }

  $('.modal').modal({backdrop:"static"});
  //$('.modal').modal("show");
  $('button.runSpike').on("click", function() {
    $('.modal').modal("hide");
    window.setTimeout(simulate, gamethrottle);
  });
  
});

},{"bjjs":2}],2:[function(require,module,exports){
module.exports = {
  card: require('./src/card.js'),
  player: require('./src/player.js'),
  blackjack: require('./src/blackjack.js'),
  strategy: {
    basic: require('./src/strategy/BasicStrategy.js'),
    dealer: require('./src/strategy/BasicStrategy.js')
  }
};

},{"./src/blackjack.js":4,"./src/card.js":5,"./src/player.js":7,"./src/strategy/BasicStrategy.js":9}],3:[function(require,module,exports){
/**
 * Logic and rules for a single bet in BlackJack.
 */
function Bet(amount) {
  var winnings = 0;
  var doubled = false;
  var surrendered = false;

  // Double down
  this.double = function() {
    amount *= 2;
    doubled = true;
  }
  
  this.isDoubled = function() {
    return doubled;
  }

  // Get half your money back.
  this.surrender = function() {
    surrendered = true;
  }

  this.isSurrendered = function() {
    return surrendered;
  }

  this.setWinnings = function(howMuch) {
    if (surrendered) {
      // Fail silently?
      return;
    }
    winnings = howMuch;
  }

  this.getWinnings = function() {
    result = winnings;
    if (surrendered) {
      result = amount / 2;
    }
    return result;
  };

  this.getAmount = function() { return amount; };
}

module.exports = Bet;

},{}],4:[function(require,module,exports){
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Shoe = require('./shoe.js');
var Hand = require('./hand.js');
var Player = require('./player.js');
var DealerStrategy = require('./strategy/DealerStrategy.js');

/**
 * The game itself.  Handles house rules, deciding results, dealing, etc.  You
 * could almost think of this as a Dealer object.  (The actual dealer is a
 * seperate object that runs the game, and makes no deciions about the actual
 * game progression, mirroring real life.)
 */
function BlackJackGame(houseRules) {
  EventEmitter.call(this);
  initHouseRules();

  var maxPlayers = houseRules.decks * 5; // Most games shouldn't get near this.
  var players = [];
  var shoe = new Shoe(houseRules.decks);

  //We model the dealer after a player, which may buy us some code reuse.
  var dealer = new Player(new DealerStrategy());
  dealer.setName("Dealer");

  /**
   * A a player to the game.  If position (given as a player to sit before)
   * isn't given, player is added to last seat at the table.  (Rules about
   * table size are outside of this object, but we set a ceiling based on the
   * max number of cards possibly needed to deal to all these people )
   */
  this.addPlayer = function(player, position) {
    if (players.length >= maxPlayers) {
      throw "Too many players."
    }

    // TODO: Position
    players.push(player);
  }

  this.getPlayers = function() {
    return players.slice();
  }

  this.doOneRound = function() {
    var game = this;
    var playersInThisRound = [];
    var playerHands = [];

    game.emit("story", "Starting Round");

    // Shuffle, if we need to. (TODO: How best to model the timing of a shuffle?)
    // Let's say we want 5 cards available per hand being dealt. If we can't
    // have that, we shuffle.
    var desiredShoeSize = (players.length + 1) * 6;
    if (shoe.cardsLeft() < desiredShoeSize) {
      game.emit("story", "Shuffling deck.");
      shoe.shuffle();
    }

    // Gather bets
    players.forEach(function(player) {
      var bet = player.chooseBet();
      if (bet.getAmount() > 0) {
        game.emit("story", player.getName() + " bets " + bet.getAmount());
        playersInThisRound.push(player);

        // Alright, so I want to associate players and their hands in the
        // context of this current round.  I could make hands aware of players
        // or vis-versa, but those types don't really need to know about
        // eachother.  I could just set hand.player, which is almost certainly
        // an anti-pattern, though I can't really say why.  I think making a
        // playerhand object sounds like a pretty good way of doing things.
        // I'll just make that up here for now.. maybe I'll formalize it later.
        playerHands.push({
          hand: new Hand(),
          player: player,
          bet: bet
        });
      }
      else {
        game.emit("story", player.getName() + " sits out.");
      }
    });

    // If nobody is going to play, then that's that.
    if (playersInThisRound.length == 0) {
      return;
    }

    // Deal first card
    playerHands.forEach(function(playerHand) {
      playerHand.hand.dealCard(shoe.draw());
    });

    // Deal second card. Also check for Yeah yeah, it doesn't matter, I know.
    playerHands.forEach(function(playerHand) {
      playerHand.hand.dealCard(shoe.draw());
      game.emit("story", playerHand.player.getName() + " draws a " + playerHand.hand.toString() + ".");
    });

    // Deal dealer
    dealerHand = new Hand();
    dealerHand.dealCard(shoe.draw());
    dealerHand.dealCard(shoe.draw());

    // If dealer first card is an ace, call for insurance
    var showingCard = dealerHand.getCardAt(0);
    this.emit("story", "Dealer shows " + showingCard.toString());
    if (showingCard.getRank() == "A") {
      // Offer insurance. XXX: Everyone knows you don't take insurance.
      this.emit("story", "Insurance? No takers.");
      // Check for dealer blackjack
      if (dealerHand.getValue() == 21) {
        this.emit("story", "Dealer blackjack with " + showingCard.toString() + " and " + dealerHand.getCardAt(1).toString());
        // In the event of a dealer blackjack, we just resolve winnings without
        // letting players play.  A player blackjack will result in a push.
        this.resolveWinnings(playerHands, dealerHand)
        return;
      }
    }

    // Go around the table so players can play
    for(var i = 0; i < playerHands.length; i++) {
      var resultingHands = this.playHand(playerHands[i], showingCard);
      // If the hands split, splice them into the hand list, and make sure we
      // fast forward past them, as they're already played.
      if (resultingHands.length > 1) {
        spliceArgs = [i, 1];
        spliceArgs.push.apply(spliceArgs, resultingHands);
        playerHands.splice.apply(playerHands, spliceArgs);
        i += resultingHands.length - 1;
      }
    }

    // If all players have busted, the dealer need not play.
    var everyoneLost = playerHands.every(function(playerHand) {
      return playerHand.hand.getValue() > 21 || playerHand.bet.isSurrendered();
    });
    if (everyoneLost) {
      this.emit("story", "Everyone has busted or surrendered.");
      this.resolveWinnings(playerHands, dealerHand);
      return;
    }
    
    this.emit("story", dealer.getName() + " has a " + dealerHand.toString() + ".");
    this.playHand({
      hand: dealerHand,
      player: dealer
    });

    this.resolveWinnings(playerHands, dealerHand);
  };

  this.getValidPlaysFor = function(hand, isSplit, splitOK) {
    var valid = ["stay", "hit"];
    var cards = hand.getCards();
    if (cards.length == 2) {
      // If it's the start of a hand, there may be other options.
      valid.push("double");
      if (!isSplit) {
        valid.push("surrender");
      }
      if (splitOK && (cards[0].rank == cards[1].rank)) {
        valid.push("split");
      }
    }
    return valid;
  };

  this.playHand = function(playerHand, dealerCard, handsAfterSplits) {
    var game = this;
    var player = playerHand.player;
    var hand = playerHand.hand;
    var bet = playerHand.bet;
    if (!handsAfterSplits) { handsAfterSplits = 1; }
    var splitOK = ( handsAfterSplits < houseRules.maxHandsAfterSplit ); 
    var isSplit = ( handsAfterSplits > 1 );

    var resultingHands = [playerHand];

    function playerDoes(what) {
      game.emit("story", player.getName() + " " + what);
    }

    var playerDone = false;
    if (hand.getValue() == 21) {
      playerDoes("has blackjack!");
      playerDone = true;
    }
    while(!playerDone) {
      var validPlays = this.getValidPlaysFor(hand, isSplit, splitOK);
      var play = player.choosePlay(hand, dealerCard, validPlays, this);

      if (validPlays.indexOf(play) == -1) {
        throw "Invalid play " + play + " selected!";
      }

      switch (play) {
        case "stay":
          playerDoes("stays");
          playerDone = true;
          break;
          
        case "hit":
          playerDoes("hits");
          var card = shoe.draw();
          hand.dealCard(card);
          playerDoes("draws a " + card.toString() + ". (" + (hand.isSoft() ? "soft" : "hard") + " " + hand.getValue() + ")");
          break;

        case "split":
          playerDoes("splits");
          handsAfterSplits++;

          var split1 = new Hand();
          split1.dealCard(hand.getCardAt(0));
          split1.dealCard(shoe.draw());
          var split1PlayerHand = {
            player: player,
            hand: split1,
            bet: bet
          };
          var split1Hands = this.playHand(split1PlayerHand, dealerHand, handsAfterSplits);

          var split2 = new Hand();
          var newBet = new Bet(bet.getAmount());
          player.changeBalance(newBet.getAmount() * -1);
          split2.dealCard(hand.getCardAt(1));
          split2.dealCard(shoe.draw());
          var split2PlayerHand = {
            player: player,
            hand: split2,
            bet: newBet
          };
          var split2Hands = this.playHand(split2PlayerHand, dealerHand, handsAfterSplits);

          resultingHands = split1hands;
          resultingHands.push.apply(resultingHands, split2Hands);

          playerDone = true;
          break;

        case "double":
          playerDoes("doubles down");
          player.changeBalance(playerHand.bet.getAmount() * -1);
          playerHand.bet.double();
          var card = shoe.draw();
          hand.dealCard(card);
          playerDoes("draws a " + card.toString() + ". (" + (hand.isSoft() ? "soft" : "hard") + " " + hand.getValue() + ")");
          playerDone = true;
          break;

        case "surrender":
          playerDoes("surrenders");
          playerHand.bet.surrender();
          playerDone = true;
          break;
      }

      if (hand.getValue() == 21) {
        playerDoes("stops with 21");
        playerDone = true;
      } else if (hand.getValue() > 21) {
        playerDoes("busts");
        playerDone = true;
      }
    }

    return resultingHands;
  }

  this.resolveWinnings = function(playerHands, dealerHand) {
    var game = this;
    var dealerHandValue = dealerHand.getValue();
    playerHands.forEach(function(playerHand) {
      var playerHandValue = playerHand.hand.getValue();
      var bet = playerHand.bet;
      var player = playerHand.player;

      var winRatio = 2; // That is, 1 + 1 = 2;  
      // If a player has blackjack, they're eligible to win more.
      if (playerHand.hand.isBlackJack()) {
        winRatio = 3; // That is, 1 + 2 = 3.
      }

      // If the player has busted or surrendered, all is lost.
      if (playerHandValue > 21 || bet.isSurrendered()) {
        game.emit("story", player.getName() + " loses.");
      }
      // If Dealer busted, all unbusted hands win
      else if (dealerHandValue > 21 && playerHandValue <= 21) {
        game.emit("story", player.getName() + " wins.");
        bet.setWinnings(bet.getAmount() * winRatio);
      }
      // If dealer didn't bust, player must beat dealer score.
      else if ( playerHandValue > dealerHandValue ) {
        game.emit("story", player.getName() + " wins.");
        bet.setWinnings(bet.getAmount() * winRatio);
      }
      else if ( playerHandValue == dealerHandValue ) {
        game.emit("story", player.getName() + " pushes.");
        bet.setWinnings(bet.getAmount());
      }
      else {
        game.emit("story", player.getName() + " loses.");
      }

      playerHand.player.collectWinnings(bet);
    });
    game.emit("endround", playerHands, dealerHand);
  }

  function initHouseRules() {
    if (!houseRules.decks) {
      houseRules.decks = 2;
    }
    if (!houseRules.maxHandsAfterSplits) {
      houseRules.maxHandsAfterSplits = 2;
    }

  }
}
util.inherits(BlackJackGame, EventEmitter);

module.exports = BlackJackGame;

},{"./hand.js":6,"./player.js":7,"./shoe.js":8,"./strategy/DealerStrategy.js":10,"events":11,"util":15}],5:[function(require,module,exports){
/**
 * A card, valued for blackjack
 */

function Card(rank, suit) {
  var value;

  switch (rank) {
    case "A":
      value = 11;
      break;
    case "2":
      value = 2;
      break;
    case "3":
      value = 3;
      break;
    case "4":
      value = 4;
      break;
    case "5":
      value = 5;
      break;
    case "6":
      value = 6;
      break;
    case "7":
      value = 7;
      break;
    case "8":
      value = 8;
      break;
    case "9":
      value = 9;
      break;
    case "10":
    case "J":
    case "Q":
    case "K":
      value = 10;
      break;
    default:
      throw rank + " is not a real card rand."
  }

  this.getRank = function() { return rank; };
  this.getSuit = function() { return suit; };
  this.getValue = function() { return value; };
  this.toString = function() { return rank + " of " + suit; };
}

// I don't want to use unicode suits.
Card.suits = ["hearts", "spades", "clubs", "diamonds"];
Card.ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

module.exports = Card;

},{}],6:[function(require,module,exports){
/**
 * Logic and rules for a single hand of blackjack.  Should be able to handle
 * either a dealer hand or a player hand.  All it really does is keep track of
 * hard and soft hands.
 */
function Hand() {
  var cards = [];
  var value = 0;
  var aces = 0; // Number of aces.
  var hardenedAces = 0; // Number of aces considered hard.
  var isSoft = false;

  // Add one card to the hand.
  this.dealCard = function(card) {
    cards.push(card);
    value += card.getValue();

    // Handle Aces
    if (card.getRank() == "A") {
      aces += 1;
      isSoft = true;
    }

    if (value > 21 && hardenedAces < aces) {
      value -= 10;
      hardenedAces += 1;
      if (hardenedAces == aces) {
        isSoft = false;
      }
    }
  }

  // Get the blackjack value of this hand.
  this.getValue = function() {
    return value;
  };

  // Return whether or not any aces are considered soft.
  this.isSoft = function() {
    return isSoft;
  };

  this.isBlackJack = function() {
    return cards.length == 2 && this.getValue() == 21;
  }

  // Returns a copy of the cards.
  this.getCards = function() {
    return cards.slice();
  };

  this.getCardAt = function(i) {
    return cards[i];
  }

  this.toString = function() {
    var result = cards.reduce(function(a,b) {
      return a + " and " + b;
    });
    return result + " (" + (this.isSoft() ? "soft" : "hard") + " " + this.getValue() + ")";
  }
}

module.exports = Hand;

},{}],7:[function(require,module,exports){
var Bet = require('./bet.js');

/*return*
 * A blackjack player has a cash balance and a strategy.  The game interacts 
 * with the player, which causes the game to progress.
 */
function Player(strategy) {
  var balance = 0;
  var name = "Player";
  
  this.chooseBet = function(game) {
    var amount = strategy.chooseBet(this, game);
    var bet = new Bet(amount);
    this.changeBalance(amount * -1);
    return bet;
  };

  this.choosePlay = function(hand, dealerCard, validPlays, game) {
    return strategy.choosePlay(hand, dealerCard, validPlays, this, game);
  };

  this.collectWinnings = function(bet) {
    this.changeBalance(bet.getWinnings());
  }

  this.changeBalance = function(amount) {
    balance += amount;
  };

  this.getBalance = function(){
    return balance;
  };

  this.setName = function(value) {
    name = value;
  }

  this.getName = function() {
    return name;
  }
}

module.exports = Player;

},{"./bet.js":3}],8:[function(require,module,exports){
/**
 * A jackjack shoe,  a 1-8 deck stack of cards.  
 */

var Card = require('./card.js');

function Shoe(size) {
  var stack = [];
  var cursor = 0;
  
  for (var i = 0; i < size; i++) {
    Card.suits.forEach(function(suit) {
      Card.ranks.forEach(function(rank) {
        var card = new Card(rank, suit);
        stack.splice(Math.floor((stack.length + 1) * Math.random()),0,card);
      });
    });
  }

  // Get the next card from the shoe.
  this.draw = function() {
    if (cursor >= stack.length) {
      throw("The deck has been exhausted");
    }
    var topCard = stack[cursor];
    cursor += 1;
    return topCard;
  };

  this.cardsLeft = function() {
    return stack.length - cursor;
  }

  // Shuffles the deck.  All cards are assumed to be gathered back.
  this.shuffle = function() {
    cursor = 0;
    var newstack = [];
    stack.forEach(function(card) {
      newstack.splice(Math.floor((stack.length + 1) * Math.random()),0,card);
    });
    stack = newstack;
  };
  
  // Return a copy of the remaining stack
  this.getRemainingCards = function() {
    return stack.slice(cursor, stack.length);
  };
}

module.exports = Shoe;

},{"./card.js":5}],9:[function(require,module,exports){
/**
 * This is the strategy a dealer follows.  It's very simple.
 */

// With thanks to http://wizardofodds.com/games/blackjack/strategy/calculator/
var basicHard = {
    //     2     3     4     5     6     7     8     9     T     A

    4:  [ "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H"],   // Hard  4
    5:  [ "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H"],   // Hard  5
    6:  [ "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H"],   // Hard  6
    7:  [ "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H"],   // Hard  7
    8:  [ "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H"],   // Hard  8
    9:  [ "H", "DH", "DH", "DH", "DH",  "H",  "H",  "H",  "H",  "H"],   // Hard  9
    10: ["DH", "DH", "DH", "DH", "DH", "DH", "DH", "DH",  "H",  "H"],   // Hard 10
    11: ["DH", "DH", "DH", "DH", "DH", "DH", "DH", "DH", "DH",  "H"],   // Hard 11
    12: [ "H",  "H",  "S",  "S",  "S",  "H",  "H",  "H",  "H",  "H"],   // Hard 12
    13: [ "S",  "S",  "S",  "S",  "S",  "H",  "H",  "H",  "H",  "H"],   // Hard 13
    14: [ "S",  "S",  "S",  "S",  "S",  "H",  "H",  "H",  "H",  "H"],   // Hard 14
    15: [ "S",  "S",  "S",  "S",  "S",  "H",  "H",  "H", "RH",  "H"],   // Hard 15
    16: [ "S",  "S",  "S",  "S",  "S",  "H",  "H", "RH", "RH", "RH"],   // Hard 16
    17: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"],   // Hard 17
    18: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"],   // Hard 18
    19: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"],   // Hard 19
    20: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"],   // Hard 20
    21: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"]    // Hard 21
};

var basicSoft = {
    12: [ "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H",  "H"],   // Soft 12
    13: [ "H",  "H",  "H", "DH", "DH",  "H",  "H",  "H",  "H",  "H"],   // Soft 13
    14: [ "H",  "H",  "H", "DH", "DH",  "H",  "H",  "H",  "H",  "H"],   // Soft 14
    15: [ "H",  "H", "DH", "DH", "DH",  "H",  "H",  "H",  "H",  "H"],   // Soft 15
    16: [ "H",  "H", "DH", "DH", "DH",  "H",  "H",  "H",  "H",  "H"],   // Soft 16
    17: [ "H", "DH", "DH", "DH", "DH",  "H",  "H",  "H",  "H",  "H"],   // Soft 17
    18: [ "S", "DS", "DS", "DS", "DS",  "S",  "S",  "H",  "H",  "H"],   // Soft 18
    19: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"],   // Soft 19
    20: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"],   // Soft 20
    21: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"]    // Soft 21
};

var basicSplit = {
    2:  ["QH", "QH",  "P",  "P",  "P",  "P",  "H",  "H",  "H",  "H"],   // 2,2
    3:  ["QH", "QH",  "P",  "P",  "P",  "P",  "H",  "H",  "H",  "H"],   // 3,3
    4:  [ "H",  "H",  "H", "QH", "QH",  "H",  "H",  "H",  "H",  "H"],   // 4,4
    5:  ["DH", "DH", "DH", "DH", "DH", "DH", "DH", "DH",  "H",  "H"],   // 5,5
    6:  ["QH",  "P",  "P",  "P",  "P",  "H",  "H",  "H",  "H",  "H"],   // 6,6
    7:  [ "P",  "P",  "P",  "P",  "P",  "P",  "H",  "H",  "H",  "H"],   // 7,7
    8:  [ "P",  "P",  "P",  "P",  "P",  "P",  "P",  "P",  "P",  "P"],   // 8,8
    9:  [ "P",  "P",  "P",  "P",  "P",  "S",  "P",  "P",  "S",  "S"],   // 9,9
    10: [ "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S",  "S"],   // T,T
    11: [ "P",  "P",  "P",  "P",  "P",  "P",  "P",  "P",  "P",  "P"]    // A,A
};

var dealerRankToIndex = {
  "2": 0,
  "3": 1,
  "4": 2,
  "5": 3,
  "6": 4,
  "7": 5,
  "8": 6,
  "9": 7,
  "10": 8,
  "J": 8,
  "Q": 8,
  "K": 8,
  "A": 9,
};

solutionCodeToAction = {
  "S": "stay",
  "H": "hit",
  "P": "split",
  "D": "double",
  "R": "surrender",
  "Q": "invalid"
};

function BasicStrategy() {
  this.chooseBet = function() {
    return 10;
  }

  // Returns a string if we find a valid play, otherwise false;
  this.solutionToPlay = function(solution, allowedPlays) {
    var play;
    for(var i = 0; i < solution.length && !play; i++) {
      var code = solution.charAt(i);
      var candidate = solutionCodeToAction[code];
      if (allowedPlays.indexOf(candidate) >= 0) {
        play = candidate;
      }
    }
    
    if (!play) {
      play = false;
    }

    return play;
  }

  this.choosePlay = function(hand, dealerCard, allowedPlays, player, game) {
    var dealerRank = dealerCard.getRank();
    var dealerLookupIndex = dealerRankToIndex[dealerRank];

    var finalAnswer;

    // First check split.
    var firstCard = hand.getCardAt(0);
    if (firstCard.getRank() == hand.getCardAt(1).getRank()) {
      var solutionRow = basicSplit[firstCard.getValue()];
      finalAnswer = this.solutionToPlay(solutionRow[dealerLookupIndex], allowedPlays);
    }

    // If we don't have anything yet, try the regular tables.
    if (!finalAnswer) {
      var solutionRow;
      if (hand.isSoft()) {
        solutionRow = basicSoft[hand.getValue()];
      }
      else if (!finalAnswer) {
        solutionRow = basicHard[hand.getValue()];
      }
      finalAnswer = this.solutionToPlay(solutionRow[dealerLookupIndex], allowedPlays);
    }

    // If we don't have something by now, something is wrong.
    if (!finalAnswer) {
      throw "My basic strategy is failing me!";
    }

    return finalAnswer;
  }
}

module.exports = BasicStrategy;

},{}],10:[function(require,module,exports){
/**
 * This is the strategy a dealer follows.  It's very simple.
 */

function DealerStrategy() {
  // Dealers don't bet, obviously, but this fulfills the interface in case we
  // want to test with it or something.
  this.chooseBet = function() {
    return 10;
  }

  // A dealer only looks at his own hand.  We don't even need the other arguments.
  this.choosePlay = function(hand) {
    // TODO: handle rules about things like soft 17.
    if (hand.getValue() < 17) {
      return "hit";
    }
    return "stay";
  }
}

module.exports = DealerStrategy;

},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],14:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],15:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":14,"_process":12,"inherits":13}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9ibGFja2phY2suanMiLCJub2RlX21vZHVsZXMvYmpqcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iampzL3NyYy9iZXQuanMiLCJub2RlX21vZHVsZXMvYmpqcy9zcmMvYmxhY2tqYWNrLmpzIiwibm9kZV9tb2R1bGVzL2JqanMvc3JjL2NhcmQuanMiLCJub2RlX21vZHVsZXMvYmpqcy9zcmMvaGFuZC5qcyIsIm5vZGVfbW9kdWxlcy9iampzL3NyYy9wbGF5ZXIuanMiLCJub2RlX21vZHVsZXMvYmpqcy9zcmMvc2hvZS5qcyIsIm5vZGVfbW9kdWxlcy9iampzL3NyYy9zdHJhdGVneS9CYXNpY1N0cmF0ZWd5LmpzIiwibm9kZV9tb2R1bGVzL2JqanMvc3JjL3N0cmF0ZWd5L0RlYWxlclN0cmF0ZWd5LmpzIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBiampzID0gcmVxdWlyZSgnYmpqcycpO1xuXG52YXIgZ2FtZXRocm90dGxlID0gMjAgLy8gbXMgcGVyIGhhbmQgdGFyZ2V0XG5cbi8vIEEgbGl0dGxlIHRpbWVzZXJpZXMtc3R5bGUgZ3JhcGggdG8gc2hvdyBob3cgdGhpbmdzIGdvLlxuZnVuY3Rpb24gQmxhY2tqYWNrU2ltcGxlSGlzdG9yeSgpIHtcbiAgdmFyIHdpZHRoO1xuICB2YXIgaGVpZ2h0O1xuICB2YXIgY29sb3JzID0gW1wiI0JDNzcyRlwiLFwiIzk4NzZBQVwiLFwiIzYxOTY0N1wiLFwiI0JFRDZGRlwiLFwiI0QyNTI1MlwiXTtcblxuICAvLyBpbml0IFgtYXhpcyB3aXRoIHNjYWxlXG4gIHZhciB4U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKTtcbiAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgIC5vcmllbnQoXCJib3R0b21cIilcbiAgICAudGlja0Zvcm1hdChmdW5jdGlvbih0aWNrKSB7IHJldHVybiB0aWNrICE9IDAgPyB0aWNrIDogXCJcIjsgfSlcbiAgICAuc2NhbGUoeFNjYWxlKTtcblxuICAvLyBpbml0IFgtYXhpcyB3aXRoIHNjYWxlXG4gIHZhciB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKTtcbiAgdmFyIHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgIC5vcmllbnQoXCJyaWdodFwiKSAvLyBQaWNrZWQgYmVjYXVzZSBvZiB0aGUgcmVzdWx0aW5nIHRleHQtYW5jaG9yLiAgV3Jvbmc/XG4gICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24odGljaykgeyByZXR1cm4gdGljayAhPSAwID8gdGljayA6IFwiXCI7IH0pXG4gICAgLnNjYWxlKHlTY2FsZSk7XG5cbiAgLy8gSW5pdCBMaW5lIGdlbmVyYXRvclxuICB2YXIgY29udGVudFBhdGggPSBkMy5zdmcubGluZSgpXG4gICAgLngoZnVuY3Rpb24oZCxpKSB7IHJldHVybiB4U2NhbGUoaSk7IH0pXG4gICAgLnkoZnVuY3Rpb24oZCkgeyByZXR1cm4geVNjYWxlKGQpOyB9KTtcblxuICAvLyBUaGUgcmVuZGVyIGZ1bmN0aW9uIHByb3BlclxuICB2YXIgaGlzdG9yeSA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuICAgIC8vIEluaXQgYXhpcyBpZiBub3QgYWxyZWFkeSBwcmVzZW50XG4gICAgdmFyIHhBeGlzU2VsZWN0aW9uID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcImcueGF4aXNcIikuZGF0YShbMF0pO1xuICAgIHhBeGlzU2VsZWN0aW9uXG4gICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKFwic3ZnOmdcIilcbiAgICAgICAgLmNsYXNzZWQoXCJ4YXhpc1wiLCB0cnVlKTtcblxuICAgIHhBeGlzU2VsZWN0aW9uXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoMCxcIit5U2NhbGUoMCkrXCIpXCI7IH0pXG4gICAgICAgIC5jYWxsKHhBeGlzKTtcblxuICAgIHlBeGlzLnRpY2tTaXplKHdpZHRoKTtcbiAgICB2YXIgeUF4aXNTZWxlY3Rpb24gPSBzZWxlY3Rpb24uc2VsZWN0QWxsKFwiZy55YXhpc1wiKS5kYXRhKFswXSk7XG4gICAgeUF4aXNTZWxlY3Rpb25cbiAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxuICAgICAgICAuY2xhc3NlZChcInlheGlzXCIsIHRydWUpO1xuXG4gICAgeUF4aXNTZWxlY3Rpb24uY2FsbCh5QXhpcyk7XG5cbiAgICB5QXhpc1NlbGVjdGlvbi5zZWxlY3RBbGwoXCJnLnRpY2sgdGV4dFwiKVxuICAgICAgICAuYXR0cihcInhcIixcIjFlbVwiKVxuICAgICAgICAuYXR0cihcInlcIixcIi0wLjcyZW1cIik7XG5cbiAgICAvLyBJbml0IGFuZCByZW5kZXIgcGF0aHNcbiAgICB2YXIgZDNQYXRocyA9IHNlbGVjdGlvbi5zZWxlY3RBbGwoXCJwYXRoLmNvbnRlbnRcIilcbiAgICAgIC5kYXRhKGZ1bmN0aW9uKHBsYXllcnMpIHtcbiAgICAgICAgcmV0dXJuIHBsYXllcnMubWFwKGZ1bmN0aW9uKHBsYXllckhpc3RvcnkpIHtcbiAgICAgICAgICByZXR1cm4gcGxheWVySGlzdG9yeS5oaXN0b3J5O1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgZDNQYXRocy5lbnRlcigpXG4gICAgICAuYXBwZW5kKFwic3ZnOnBhdGhcIilcbiAgICAgIC5zdHlsZShcInN0cm9rZVwiLCBmdW5jdGlvbihkLGkpIHsgcmV0dXJuIGNvbG9yc1tpXTsgfSlcbiAgICAgIC5jbGFzc2VkKFwiY29udGVudFwiLHRydWUpO1xuXG4gICAgZDNQYXRocy5hdHRyKFwiZFwiLCBjb250ZW50UGF0aCk7XG4gIH1cblxuICBoaXN0b3J5LmhlaWdodCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaGVpZ2h0O1xuICAgIC8vIFhYWDogVHdvIHNvdXJjZXMgb2YgdHJ1dGg/XG4gICAgaGVpZ2h0ID0gdmFsdWU7XG4gICAgeVNjYWxlLnJhbmdlKFtoZWlnaHQsMF0pO1xuICAgIHJldHVybiBoaXN0b3J5O1xuICB9O1xuXG4gIGhpc3Rvcnkud2lkdGggPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHdpZHRoO1xuICAgIC8vIFhYWDogVHdvIHNvdXJjZXMgb2YgdHJ1dGg/XG4gICAgd2lkdGggPSB2YWx1ZTtcbiAgICB4U2NhbGUucmFuZ2UoWzAsd2lkdGhdKTtcbiAgICByZXR1cm4gaGlzdG9yeTtcbiAgfTtcblxuICAvLyBEZWxlZ2F0ZSByYW5nZSBnZXQvc2V0dGluZyB0byBpbnRlcm5hbCBoYW5kbGVyc1xuICBoaXN0b3J5LnhEb21haW4gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHhTY2FsZS5kb21haW4oKTtcbiAgICB4U2NhbGUuZG9tYWluKHZhbHVlKTtcbiAgICByZXR1cm4gaGlzdG9yeTtcbiAgfTtcblxuICBoaXN0b3J5LnlEb21haW4gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHlTY2FsZS5kb21haW4oKTtcbiAgICB5U2NhbGUuZG9tYWluKHZhbHVlKTtcbiAgICByZXR1cm4gaGlzdG9yeTtcbiAgfTtcblxuICByZXR1cm4gaGlzdG9yeTtcbn1cblxudmFyIENBUkRTX1VSTCA9IFwiaW1hZ2VzL2NhcmRzLnN2Z1wiO1xuZnVuY3Rpb24gZ2V0Q2FyZFNWR1VybChjYXJkKSB7XG4gIHZhciByYW5rID0gY2FyZC5nZXRSYW5rKCk7XG4gIGlmIChyYW5rID09PSBcIkFcIikgeyByYW5rID0gXCJhY2VcIjsgfVxuICBlbHNlIGlmIChyYW5rID09PSBcIktcIikgeyByYW5rID0gXCJraW5nXCI7IH1cbiAgZWxzZSBpZiAocmFuayA9PT0gXCJRXCIpIHsgcmFuayA9IFwicXVlZW5cIjsgfVxuICBlbHNlIGlmIChyYW5rID09PSBcIkpcIikgeyByYW5rID0gXCJqYWNrXCI7IH1cbiAgcmV0dXJuIENBUkRTX1VSTCArIFwiI2NhcmQtXCIgKyByYW5rICsgXCItXCIgKyBjYXJkLmdldFN1aXQoKTtcbn1cblxudmFyIGN1ck9pZCA9IDA7XG5mdW5jdGlvbiBpZE9iamVjdChvKSB7XG4gIGlmICghby5fX2lkKSB7XG4gICAgby5fX2lkID0gY3VyT2lkXG4gICAgY3VyT2lkICs9IDE7XG4gIH1cbiAgcmV0dXJuIG8uX19pZDtcbn1cblxuZnVuY3Rpb24gQmxhY2tqYWNrVGFibGUoKSB7XG4gIHZhciBoZWlnaHQ7XG4gIHZhciB3aWR0aDtcblxuICB2YXIgcGxheWVySGFuZHMgPSBbXTtcbiAgdmFyIGRlYWxlckhhbmQ7XG5cbiAgZnVuY3Rpb24gcmVuZGVyKHNlbGVjdGlvbikge1xuICAgIC8vIFRoZXJlJ3MgdHdvIGFwcHJvYWNoZXMgd2UgY291bGQgdGFrZSBoZXJlLiAgV2UgY291bGQgYXR0YWNoIGxvY2F0aW9uXG4gICAgLy8gaW5mbyB0byBlYWNoIGNhcmQgYXMgd2UgY29sbGVjdCBpbmZvcm1hdGlvbiBhYm91dCBpdCwgYmVmb3JlIGhhbmRpbmdcbiAgICAvLyBpdCBvZmYgdG8gZDMsIG9yIHdlIGNvdWxkIGdpdmUgZDMgZnVuY3Rpb25zIHRvIGRldGVybWluZSBsb2NhdGlvbiBhc1xuICAgIC8vIG5lZWRlZC5cbiAgICAvL1xuICAgIC8vIE5vcm1hbGx5LCBJJ2QgYmUgaW4gZmF2b3Igb2YgcHVzaGluZyB0aGF0IGxvZ2ljIG91dCBhcyBmYXIgYXMgcG9zc2libGUsXG4gICAgLy8gc28gd2UgZG9uJ3QgaGF2ZSBwb3RlbnRpYWwgc3luYyBpc3N1ZXMsIGJ1dCBpdCBqdXN0IHNlZW1zIHNvIHNsb3cuLlxuICAgIC8vIExldCdzIHRyeSBhdHRhY2hpbmcgaW5mbyBhcyB3ZSBnbywgZm9yIG5vdy5cblxuICAgIHZhciBnYW1lID0gc2VsZWN0aW9uLmRhdGEoKVswXTsgLy8gQmxlaFxuICAgIHZhciBjYXJkcyA9IFtdO1xuICAgIGZ1bmN0aW9uIHN5bmNDYXJkSW5mbyhwbGF5ZXJIYW5kKSB7XG4gICAgICB2YXIgcGxheWVyID0gcGxheWVySGFuZC5wbGF5ZXI7XG4gICAgICB2YXIgaGFuZCA9IHBsYXllckhhbmQuaGFuZDtcblxuICAgICAgdmFyIGhhbmRYLCBoYW5kWSwgaGFuZERZO1xuXG4gICAgICBpZiAocGxheWVyID09PSBcImRlYWxlclwiKSB7XG4gICAgICAgIGhhbmRYID0gNTA7XG4gICAgICAgIGhhbmRZID0gMDtcbiAgICAgICAgaGFuZERZID0gMTA7XG4gICAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gZ2FtZS5nZXRQbGF5ZXJzKClbMF0pIHtcbiAgICAgICAgaGFuZFggPSA1MDtcbiAgICAgICAgaGFuZFkgPSBoZWlnaHQgLSAzMTA7XG4gICAgICAgIGhhbmREWSA9IC0xMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhhbmRYID0gLTEwMDA7XG4gICAgICAgIGhhbmRZID0gLTEwMDA7XG4gICAgICAgIGhhbmREWSA9IC0xMDtcbiAgICAgIH1cblxuICAgICAgaGFuZC5nZXRDYXJkcygpLmZvckVhY2goZnVuY3Rpb24oY2FyZCwgaSkge1xuICAgICAgICBjYXJkLnggPSBoYW5kWCArICgzMCAqIGkpO1xuICAgICAgICBjYXJkLnkgPSBoYW5kWSArIChoYW5kRFkgKiBpKTtcbiAgICAgICAgY2FyZHMucHVzaChjYXJkKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN5bmNDYXJkSW5mbyh7aGFuZDpkZWFsZXJIYW5kLCBwbGF5ZXI6XCJkZWFsZXJcIn0pO1xuICAgIHBsYXllckhhbmRzLmZvckVhY2goZnVuY3Rpb24ocGxheWVySGFuZCkge1xuICAgICAgc3luY0NhcmRJbmZvKHBsYXllckhhbmQpO1xuICAgIH0pO1xuXG4gICAgLy8gRGlzcGxheSBjYXJkc1xuICAgIHZhciBkM2NhcmRzID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcInVzZS5jYXJkXCIpXG4gICAgICAuZGF0YShjYXJkcywgZnVuY3Rpb24oZCxpKSB7XG4gICAgICAgIHJldHVybiBpZE9iamVjdChkKTtcbiAgICAgIH0pO1xuXG4gICAgZDNjYXJkcy5lbnRlcigpXG4gICAgICAuYXBwZW5kKFwic3ZnOnVzZVwiKVxuICAgICAgICAuY2xhc3NlZChcImNhcmRcIiwgdHJ1ZSlcbiAgICAgICAgLmF0dHIoXCJ4bGluazpocmVmXCIsIGdldENhcmRTVkdVcmwpO1xuXG4gICAgZDNjYXJkc1xuICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQueDsgfSlcbiAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnk7IH0pO1xuXG4gICAgZDNjYXJkcy5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICAvL0Rpc3BsYXkgV2luL0xvc2UvQnVzdD9cblxuICAgICAgXG4gIH1cblxuICBmdW5jdGlvbiB0YWJsZShzZWxlY3Rpb24pIHtcbiAgICAvLyBUaGlzIGlzbid0IHJlYWxseSB0aGUgcmVuZGVyIGZ1bmN0aW9uLiAgVGhpcyBqdXN0IHNldHMgdGhpbmdzIHVwIHNvIHRoYXRcbiAgICAvLyB3ZSByZW5kZXIgb24gZ2FtZSBjaGFuZ2VzIGNvcnJlY3RseS5cbiAgICB2YXIgZ2FtZSA9IHNlbGVjdGlvbi5kYXRhKClbMF07IC8vIEJsZWhcbiAgICBnYW1lLm9uKFwiZW5kcm91bmRcIiwgZnVuY3Rpb24ocGgsIGRoKSB7XG4gICAgICBwbGF5ZXJIYW5kcyA9IHBoO1xuICAgICAgZGVhbGVySGFuZCA9IGRoO1xuICAgICAgcmVuZGVyKHNlbGVjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICB0YWJsZS5oZWlnaHQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGhlaWdodDtcbiAgICBoZWlnaHQgPSB2YWx1ZTtcbiAgICByZXR1cm4gdGFibGU7XG4gIH07XG5cbiAgdGFibGUud2lkdGggPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHdpZHRoO1xuICAgIHdpZHRoID0gdmFsdWU7XG4gICAgcmV0dXJuIHRhYmxlO1xuICB9O1xuXG4gIHJldHVybiB0YWJsZTtcbn1cblxuJChmdW5jdGlvbigpIHtcbiAgdmFyIGhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSAtIDEwMCAvLyBweFxuICB2YXIgd2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTsgLy8gcHhcblxuICB2YXIgbnVtVG9TaW11bGF0ZSA9IDEwMDA7XG5cbiAgLy8gaW5pdCBwb2tlclxuICB2YXIgZ2FtZSA9IG5ldyBiampzLmJsYWNramFjayh7fSk7XG4gIHZhciBiYXNpYyA9IG5ldyBiampzLnBsYXllcihuZXcgYmpqcy5zdHJhdGVneS5iYXNpYygpKTtcbiAgdmFyIGJhc2ljMiA9IG5ldyBiampzLnBsYXllcihuZXcgYmpqcy5zdHJhdGVneS5iYXNpYygpKTtcbiAgZ2FtZS5hZGRQbGF5ZXIoYmFzaWMpO1xuICAvL2dhbWUuYWRkUGxheWVyKGJhc2ljMik7XG4gIFxuICAvLyBXZSdyZSBnb2luZyB0byBrZWVwIGhpc3RvcnkgaW4gYSBzaW1wbGUgbGl0dGxlIG9iamVjdC4gIFNvbWVkYXkgaXQgbWlnaHRcbiAgLy8gYmUgZm9ybWFsaXplZC5cbiAgZ2FtZS5nZXRQbGF5ZXJzKCkuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICBwbGF5ZXIuaGlzdG9yeSA9IFtdO1xuICB9KTtcblxuICAvLyBJbml0IHZpc3VhbGl6YXRpb24gbG9naWNcbiAgdmFyIHRhYmxlVmlzID0gQmxhY2tqYWNrVGFibGUoKVxuICAgIC5oZWlnaHQoaGVpZ2h0KVxuICAgIC53aWR0aCh3aWR0aCAvIDMpO1xuXG4gIHZhciBoaXN0VmlzID0gQmxhY2tqYWNrU2ltcGxlSGlzdG9yeSgpXG4gICAgLmhlaWdodChoZWlnaHQpXG4gICAgLndpZHRoKHdpZHRoICogMiAvIDMpXG4gICAgLnhEb21haW4oWzAsbnVtVG9TaW11bGF0ZV0pXG4gICAgLnlEb21haW4oWy05MDAsIDkwMF0pO1xuXG4gIC8vIEZpbmQvaW5pdCBzdmdcbiAgdmFyIGQzU3ZnID0gZDMuc2VsZWN0KCdzdmcuYmxhY2tqYWNrJylcbiAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCk7XG5cbiAgLy8gRmluZCBpbml0IHN2ZyBncm91cHMgZm9yIHZpc3VhbGl6YXRpb25zXG4gIHZhciBkM0NhcmRUYWJsZSA9IGQzU3ZnLnNlbGVjdEFsbCgnZy5jYXJkdGFibGUnKS5kYXRhKFtnYW1lXSk7XG4gIGQzQ2FyZFRhYmxlLmVudGVyKClcbiAgICAuYXBwZW5kKCdzdmc6ZycpXG4gICAgLmNsYXNzZWQoJ2NhcmR0YWJsZScsIHRydWUpXG4gICAgLmNhbGwodGFibGVWaXMpO1xuXG4gIHZhciBkM0hpc3QgPSBkM1N2Zy5zZWxlY3RBbGwoJ2cuaGlzdG9yeScpLmRhdGEoW2dhbWUuZ2V0UGxheWVycygpXSk7XG4gIGQzSGlzdC5lbnRlcigpXG4gICAgLmFwcGVuZCgnc3ZnOmcnKVxuICAgIC5jbGFzc2VkKCdoaXN0b3J5JywgdHJ1ZSlcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArICh3aWR0aCAvIDMpICsgXCIsMClcIilcbiAgICAuY2FsbChoaXN0VmlzKTtcblxuICAvLyBBIGRlY2lzaW9uIGhlcmUuICBTaW5jZSB3ZSdyZSBub3QgZG9pbmcgd2ViIHdvcmtlcnMsIHdlIG5lZWQgdG9cbiAgLy8ga2VlcCB0aGUgc2ltdWxhdGlvbiB0aHJvdHRsZWQuICBXZSdsbCBkbyB0aGF0IGJ5IHNldHRpbmcgYSBsaXR0bGUgdGltZXJcbiAgLy8gYmV0d2VlbiBydW5zLiAgVGhpcyBnaXZlcyB0aGUgVUkgYSBjaGFuY2UgdG8ga2VlcCB1cCBpbiByZWFsIHRpbWUuXG4gIHZhciBydW5Db3VudCA9IDA7XG4gIHZhciBwbGF5ZXJzID0gZ2FtZS5nZXRQbGF5ZXJzKCk7XG4gIHZhciBzaW11bGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGdhbWUuZG9PbmVSb3VuZCgpO1xuICAgIHJ1bkNvdW50ICs9IDE7XG4gICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcikge1xuICAgICAgcGxheWVyLmhpc3RvcnkucHVzaChwbGF5ZXIuZ2V0QmFsYW5jZSgpKTtcbiAgICB9KTtcbiAgICBkM0hpc3QuY2FsbChoaXN0VmlzKTtcblxuICAgIGlmIChydW5Db3VudCA8IG51bVRvU2ltdWxhdGUpIHtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHNpbXVsYXRlLCBnYW1ldGhyb3R0bGUpO1xuICAgIH1cbiAgfVxuXG4gICQoJy5tb2RhbCcpLm1vZGFsKHtiYWNrZHJvcDpcInN0YXRpY1wifSk7XG4gIC8vJCgnLm1vZGFsJykubW9kYWwoXCJzaG93XCIpO1xuICAkKCdidXR0b24ucnVuU3Bpa2UnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICQoJy5tb2RhbCcpLm1vZGFsKFwiaGlkZVwiKTtcbiAgICB3aW5kb3cuc2V0VGltZW91dChzaW11bGF0ZSwgZ2FtZXRocm90dGxlKTtcbiAgfSk7XG4gIFxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY2FyZDogcmVxdWlyZSgnLi9zcmMvY2FyZC5qcycpLFxuICBwbGF5ZXI6IHJlcXVpcmUoJy4vc3JjL3BsYXllci5qcycpLFxuICBibGFja2phY2s6IHJlcXVpcmUoJy4vc3JjL2JsYWNramFjay5qcycpLFxuICBzdHJhdGVneToge1xuICAgIGJhc2ljOiByZXF1aXJlKCcuL3NyYy9zdHJhdGVneS9CYXNpY1N0cmF0ZWd5LmpzJyksXG4gICAgZGVhbGVyOiByZXF1aXJlKCcuL3NyYy9zdHJhdGVneS9CYXNpY1N0cmF0ZWd5LmpzJylcbiAgfVxufTtcbiIsIi8qKlxuICogTG9naWMgYW5kIHJ1bGVzIGZvciBhIHNpbmdsZSBiZXQgaW4gQmxhY2tKYWNrLlxuICovXG5mdW5jdGlvbiBCZXQoYW1vdW50KSB7XG4gIHZhciB3aW5uaW5ncyA9IDA7XG4gIHZhciBkb3VibGVkID0gZmFsc2U7XG4gIHZhciBzdXJyZW5kZXJlZCA9IGZhbHNlO1xuXG4gIC8vIERvdWJsZSBkb3duXG4gIHRoaXMuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgYW1vdW50ICo9IDI7XG4gICAgZG91YmxlZCA9IHRydWU7XG4gIH1cbiAgXG4gIHRoaXMuaXNEb3VibGVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRvdWJsZWQ7XG4gIH1cblxuICAvLyBHZXQgaGFsZiB5b3VyIG1vbmV5IGJhY2suXG4gIHRoaXMuc3VycmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgc3VycmVuZGVyZWQgPSB0cnVlO1xuICB9XG5cbiAgdGhpcy5pc1N1cnJlbmRlcmVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHN1cnJlbmRlcmVkO1xuICB9XG5cbiAgdGhpcy5zZXRXaW5uaW5ncyA9IGZ1bmN0aW9uKGhvd011Y2gpIHtcbiAgICBpZiAoc3VycmVuZGVyZWQpIHtcbiAgICAgIC8vIEZhaWwgc2lsZW50bHk/XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHdpbm5pbmdzID0gaG93TXVjaDtcbiAgfVxuXG4gIHRoaXMuZ2V0V2lubmluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICByZXN1bHQgPSB3aW5uaW5ncztcbiAgICBpZiAoc3VycmVuZGVyZWQpIHtcbiAgICAgIHJlc3VsdCA9IGFtb3VudCAvIDI7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgdGhpcy5nZXRBbW91bnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFtb3VudDsgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCZXQ7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG5cbnZhciBTaG9lID0gcmVxdWlyZSgnLi9zaG9lLmpzJyk7XG52YXIgSGFuZCA9IHJlcXVpcmUoJy4vaGFuZC5qcycpO1xudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyLmpzJyk7XG52YXIgRGVhbGVyU3RyYXRlZ3kgPSByZXF1aXJlKCcuL3N0cmF0ZWd5L0RlYWxlclN0cmF0ZWd5LmpzJyk7XG5cbi8qKlxuICogVGhlIGdhbWUgaXRzZWxmLiAgSGFuZGxlcyBob3VzZSBydWxlcywgZGVjaWRpbmcgcmVzdWx0cywgZGVhbGluZywgZXRjLiAgWW91XG4gKiBjb3VsZCBhbG1vc3QgdGhpbmsgb2YgdGhpcyBhcyBhIERlYWxlciBvYmplY3QuICAoVGhlIGFjdHVhbCBkZWFsZXIgaXMgYVxuICogc2VwZXJhdGUgb2JqZWN0IHRoYXQgcnVucyB0aGUgZ2FtZSwgYW5kIG1ha2VzIG5vIGRlY2lpb25zIGFib3V0IHRoZSBhY3R1YWxcbiAqIGdhbWUgcHJvZ3Jlc3Npb24sIG1pcnJvcmluZyByZWFsIGxpZmUuKVxuICovXG5mdW5jdGlvbiBCbGFja0phY2tHYW1lKGhvdXNlUnVsZXMpIHtcbiAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG4gIGluaXRIb3VzZVJ1bGVzKCk7XG5cbiAgdmFyIG1heFBsYXllcnMgPSBob3VzZVJ1bGVzLmRlY2tzICogNTsgLy8gTW9zdCBnYW1lcyBzaG91bGRuJ3QgZ2V0IG5lYXIgdGhpcy5cbiAgdmFyIHBsYXllcnMgPSBbXTtcbiAgdmFyIHNob2UgPSBuZXcgU2hvZShob3VzZVJ1bGVzLmRlY2tzKTtcblxuICAvL1dlIG1vZGVsIHRoZSBkZWFsZXIgYWZ0ZXIgYSBwbGF5ZXIsIHdoaWNoIG1heSBidXkgdXMgc29tZSBjb2RlIHJldXNlLlxuICB2YXIgZGVhbGVyID0gbmV3IFBsYXllcihuZXcgRGVhbGVyU3RyYXRlZ3koKSk7XG4gIGRlYWxlci5zZXROYW1lKFwiRGVhbGVyXCIpO1xuXG4gIC8qKlxuICAgKiBBIGEgcGxheWVyIHRvIHRoZSBnYW1lLiAgSWYgcG9zaXRpb24gKGdpdmVuIGFzIGEgcGxheWVyIHRvIHNpdCBiZWZvcmUpXG4gICAqIGlzbid0IGdpdmVuLCBwbGF5ZXIgaXMgYWRkZWQgdG8gbGFzdCBzZWF0IGF0IHRoZSB0YWJsZS4gIChSdWxlcyBhYm91dFxuICAgKiB0YWJsZSBzaXplIGFyZSBvdXRzaWRlIG9mIHRoaXMgb2JqZWN0LCBidXQgd2Ugc2V0IGEgY2VpbGluZyBiYXNlZCBvbiB0aGVcbiAgICogbWF4IG51bWJlciBvZiBjYXJkcyBwb3NzaWJseSBuZWVkZWQgdG8gZGVhbCB0byBhbGwgdGhlc2UgcGVvcGxlIClcbiAgICovXG4gIHRoaXMuYWRkUGxheWVyID0gZnVuY3Rpb24ocGxheWVyLCBwb3NpdGlvbikge1xuICAgIGlmIChwbGF5ZXJzLmxlbmd0aCA+PSBtYXhQbGF5ZXJzKSB7XG4gICAgICB0aHJvdyBcIlRvbyBtYW55IHBsYXllcnMuXCJcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBQb3NpdGlvblxuICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICB9XG5cbiAgdGhpcy5nZXRQbGF5ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHBsYXllcnMuc2xpY2UoKTtcbiAgfVxuXG4gIHRoaXMuZG9PbmVSb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBnYW1lID0gdGhpcztcbiAgICB2YXIgcGxheWVyc0luVGhpc1JvdW5kID0gW107XG4gICAgdmFyIHBsYXllckhhbmRzID0gW107XG5cbiAgICBnYW1lLmVtaXQoXCJzdG9yeVwiLCBcIlN0YXJ0aW5nIFJvdW5kXCIpO1xuXG4gICAgLy8gU2h1ZmZsZSwgaWYgd2UgbmVlZCB0by4gKFRPRE86IEhvdyBiZXN0IHRvIG1vZGVsIHRoZSB0aW1pbmcgb2YgYSBzaHVmZmxlPylcbiAgICAvLyBMZXQncyBzYXkgd2Ugd2FudCA1IGNhcmRzIGF2YWlsYWJsZSBwZXIgaGFuZCBiZWluZyBkZWFsdC4gSWYgd2UgY2FuJ3RcbiAgICAvLyBoYXZlIHRoYXQsIHdlIHNodWZmbGUuXG4gICAgdmFyIGRlc2lyZWRTaG9lU2l6ZSA9IChwbGF5ZXJzLmxlbmd0aCArIDEpICogNjtcbiAgICBpZiAoc2hvZS5jYXJkc0xlZnQoKSA8IGRlc2lyZWRTaG9lU2l6ZSkge1xuICAgICAgZ2FtZS5lbWl0KFwic3RvcnlcIiwgXCJTaHVmZmxpbmcgZGVjay5cIik7XG4gICAgICBzaG9lLnNodWZmbGUoKTtcbiAgICB9XG5cbiAgICAvLyBHYXRoZXIgYmV0c1xuICAgIHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgIHZhciBiZXQgPSBwbGF5ZXIuY2hvb3NlQmV0KCk7XG4gICAgICBpZiAoYmV0LmdldEFtb3VudCgpID4gMCkge1xuICAgICAgICBnYW1lLmVtaXQoXCJzdG9yeVwiLCBwbGF5ZXIuZ2V0TmFtZSgpICsgXCIgYmV0cyBcIiArIGJldC5nZXRBbW91bnQoKSk7XG4gICAgICAgIHBsYXllcnNJblRoaXNSb3VuZC5wdXNoKHBsYXllcik7XG5cbiAgICAgICAgLy8gQWxyaWdodCwgc28gSSB3YW50IHRvIGFzc29jaWF0ZSBwbGF5ZXJzIGFuZCB0aGVpciBoYW5kcyBpbiB0aGVcbiAgICAgICAgLy8gY29udGV4dCBvZiB0aGlzIGN1cnJlbnQgcm91bmQuICBJIGNvdWxkIG1ha2UgaGFuZHMgYXdhcmUgb2YgcGxheWVyc1xuICAgICAgICAvLyBvciB2aXMtdmVyc2EsIGJ1dCB0aG9zZSB0eXBlcyBkb24ndCByZWFsbHkgbmVlZCB0byBrbm93IGFib3V0XG4gICAgICAgIC8vIGVhY2hvdGhlci4gIEkgY291bGQganVzdCBzZXQgaGFuZC5wbGF5ZXIsIHdoaWNoIGlzIGFsbW9zdCBjZXJ0YWlubHlcbiAgICAgICAgLy8gYW4gYW50aS1wYXR0ZXJuLCB0aG91Z2ggSSBjYW4ndCByZWFsbHkgc2F5IHdoeS4gIEkgdGhpbmsgbWFraW5nIGFcbiAgICAgICAgLy8gcGxheWVyaGFuZCBvYmplY3Qgc291bmRzIGxpa2UgYSBwcmV0dHkgZ29vZCB3YXkgb2YgZG9pbmcgdGhpbmdzLlxuICAgICAgICAvLyBJJ2xsIGp1c3QgbWFrZSB0aGF0IHVwIGhlcmUgZm9yIG5vdy4uIG1heWJlIEknbGwgZm9ybWFsaXplIGl0IGxhdGVyLlxuICAgICAgICBwbGF5ZXJIYW5kcy5wdXNoKHtcbiAgICAgICAgICBoYW5kOiBuZXcgSGFuZCgpLFxuICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgIGJldDogYmV0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGdhbWUuZW1pdChcInN0b3J5XCIsIHBsYXllci5nZXROYW1lKCkgKyBcIiBzaXRzIG91dC5cIik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiBub2JvZHkgaXMgZ29pbmcgdG8gcGxheSwgdGhlbiB0aGF0J3MgdGhhdC5cbiAgICBpZiAocGxheWVyc0luVGhpc1JvdW5kLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGVhbCBmaXJzdCBjYXJkXG4gICAgcGxheWVySGFuZHMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXJIYW5kKSB7XG4gICAgICBwbGF5ZXJIYW5kLmhhbmQuZGVhbENhcmQoc2hvZS5kcmF3KCkpO1xuICAgIH0pO1xuXG4gICAgLy8gRGVhbCBzZWNvbmQgY2FyZC4gQWxzbyBjaGVjayBmb3IgWWVhaCB5ZWFoLCBpdCBkb2Vzbid0IG1hdHRlciwgSSBrbm93LlxuICAgIHBsYXllckhhbmRzLmZvckVhY2goZnVuY3Rpb24ocGxheWVySGFuZCkge1xuICAgICAgcGxheWVySGFuZC5oYW5kLmRlYWxDYXJkKHNob2UuZHJhdygpKTtcbiAgICAgIGdhbWUuZW1pdChcInN0b3J5XCIsIHBsYXllckhhbmQucGxheWVyLmdldE5hbWUoKSArIFwiIGRyYXdzIGEgXCIgKyBwbGF5ZXJIYW5kLmhhbmQudG9TdHJpbmcoKSArIFwiLlwiKTtcbiAgICB9KTtcblxuICAgIC8vIERlYWwgZGVhbGVyXG4gICAgZGVhbGVySGFuZCA9IG5ldyBIYW5kKCk7XG4gICAgZGVhbGVySGFuZC5kZWFsQ2FyZChzaG9lLmRyYXcoKSk7XG4gICAgZGVhbGVySGFuZC5kZWFsQ2FyZChzaG9lLmRyYXcoKSk7XG5cbiAgICAvLyBJZiBkZWFsZXIgZmlyc3QgY2FyZCBpcyBhbiBhY2UsIGNhbGwgZm9yIGluc3VyYW5jZVxuICAgIHZhciBzaG93aW5nQ2FyZCA9IGRlYWxlckhhbmQuZ2V0Q2FyZEF0KDApO1xuICAgIHRoaXMuZW1pdChcInN0b3J5XCIsIFwiRGVhbGVyIHNob3dzIFwiICsgc2hvd2luZ0NhcmQudG9TdHJpbmcoKSk7XG4gICAgaWYgKHNob3dpbmdDYXJkLmdldFJhbmsoKSA9PSBcIkFcIikge1xuICAgICAgLy8gT2ZmZXIgaW5zdXJhbmNlLiBYWFg6IEV2ZXJ5b25lIGtub3dzIHlvdSBkb24ndCB0YWtlIGluc3VyYW5jZS5cbiAgICAgIHRoaXMuZW1pdChcInN0b3J5XCIsIFwiSW5zdXJhbmNlPyBObyB0YWtlcnMuXCIpO1xuICAgICAgLy8gQ2hlY2sgZm9yIGRlYWxlciBibGFja2phY2tcbiAgICAgIGlmIChkZWFsZXJIYW5kLmdldFZhbHVlKCkgPT0gMjEpIHtcbiAgICAgICAgdGhpcy5lbWl0KFwic3RvcnlcIiwgXCJEZWFsZXIgYmxhY2tqYWNrIHdpdGggXCIgKyBzaG93aW5nQ2FyZC50b1N0cmluZygpICsgXCIgYW5kIFwiICsgZGVhbGVySGFuZC5nZXRDYXJkQXQoMSkudG9TdHJpbmcoKSk7XG4gICAgICAgIC8vIEluIHRoZSBldmVudCBvZiBhIGRlYWxlciBibGFja2phY2ssIHdlIGp1c3QgcmVzb2x2ZSB3aW5uaW5ncyB3aXRob3V0XG4gICAgICAgIC8vIGxldHRpbmcgcGxheWVycyBwbGF5LiAgQSBwbGF5ZXIgYmxhY2tqYWNrIHdpbGwgcmVzdWx0IGluIGEgcHVzaC5cbiAgICAgICAgdGhpcy5yZXNvbHZlV2lubmluZ3MocGxheWVySGFuZHMsIGRlYWxlckhhbmQpXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHbyBhcm91bmQgdGhlIHRhYmxlIHNvIHBsYXllcnMgY2FuIHBsYXlcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcGxheWVySGFuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByZXN1bHRpbmdIYW5kcyA9IHRoaXMucGxheUhhbmQocGxheWVySGFuZHNbaV0sIHNob3dpbmdDYXJkKTtcbiAgICAgIC8vIElmIHRoZSBoYW5kcyBzcGxpdCwgc3BsaWNlIHRoZW0gaW50byB0aGUgaGFuZCBsaXN0LCBhbmQgbWFrZSBzdXJlIHdlXG4gICAgICAvLyBmYXN0IGZvcndhcmQgcGFzdCB0aGVtLCBhcyB0aGV5J3JlIGFscmVhZHkgcGxheWVkLlxuICAgICAgaWYgKHJlc3VsdGluZ0hhbmRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgc3BsaWNlQXJncyA9IFtpLCAxXTtcbiAgICAgICAgc3BsaWNlQXJncy5wdXNoLmFwcGx5KHNwbGljZUFyZ3MsIHJlc3VsdGluZ0hhbmRzKTtcbiAgICAgICAgcGxheWVySGFuZHMuc3BsaWNlLmFwcGx5KHBsYXllckhhbmRzLCBzcGxpY2VBcmdzKTtcbiAgICAgICAgaSArPSByZXN1bHRpbmdIYW5kcy5sZW5ndGggLSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIGFsbCBwbGF5ZXJzIGhhdmUgYnVzdGVkLCB0aGUgZGVhbGVyIG5lZWQgbm90IHBsYXkuXG4gICAgdmFyIGV2ZXJ5b25lTG9zdCA9IHBsYXllckhhbmRzLmV2ZXJ5KGZ1bmN0aW9uKHBsYXllckhhbmQpIHtcbiAgICAgIHJldHVybiBwbGF5ZXJIYW5kLmhhbmQuZ2V0VmFsdWUoKSA+IDIxIHx8IHBsYXllckhhbmQuYmV0LmlzU3VycmVuZGVyZWQoKTtcbiAgICB9KTtcbiAgICBpZiAoZXZlcnlvbmVMb3N0KSB7XG4gICAgICB0aGlzLmVtaXQoXCJzdG9yeVwiLCBcIkV2ZXJ5b25lIGhhcyBidXN0ZWQgb3Igc3VycmVuZGVyZWQuXCIpO1xuICAgICAgdGhpcy5yZXNvbHZlV2lubmluZ3MocGxheWVySGFuZHMsIGRlYWxlckhhbmQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLmVtaXQoXCJzdG9yeVwiLCBkZWFsZXIuZ2V0TmFtZSgpICsgXCIgaGFzIGEgXCIgKyBkZWFsZXJIYW5kLnRvU3RyaW5nKCkgKyBcIi5cIik7XG4gICAgdGhpcy5wbGF5SGFuZCh7XG4gICAgICBoYW5kOiBkZWFsZXJIYW5kLFxuICAgICAgcGxheWVyOiBkZWFsZXJcbiAgICB9KTtcblxuICAgIHRoaXMucmVzb2x2ZVdpbm5pbmdzKHBsYXllckhhbmRzLCBkZWFsZXJIYW5kKTtcbiAgfTtcblxuICB0aGlzLmdldFZhbGlkUGxheXNGb3IgPSBmdW5jdGlvbihoYW5kLCBpc1NwbGl0LCBzcGxpdE9LKSB7XG4gICAgdmFyIHZhbGlkID0gW1wic3RheVwiLCBcImhpdFwiXTtcbiAgICB2YXIgY2FyZHMgPSBoYW5kLmdldENhcmRzKCk7XG4gICAgaWYgKGNhcmRzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAvLyBJZiBpdCdzIHRoZSBzdGFydCBvZiBhIGhhbmQsIHRoZXJlIG1heSBiZSBvdGhlciBvcHRpb25zLlxuICAgICAgdmFsaWQucHVzaChcImRvdWJsZVwiKTtcbiAgICAgIGlmICghaXNTcGxpdCkge1xuICAgICAgICB2YWxpZC5wdXNoKFwic3VycmVuZGVyXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHNwbGl0T0sgJiYgKGNhcmRzWzBdLnJhbmsgPT0gY2FyZHNbMV0ucmFuaykpIHtcbiAgICAgICAgdmFsaWQucHVzaChcInNwbGl0XCIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH07XG5cbiAgdGhpcy5wbGF5SGFuZCA9IGZ1bmN0aW9uKHBsYXllckhhbmQsIGRlYWxlckNhcmQsIGhhbmRzQWZ0ZXJTcGxpdHMpIHtcbiAgICB2YXIgZ2FtZSA9IHRoaXM7XG4gICAgdmFyIHBsYXllciA9IHBsYXllckhhbmQucGxheWVyO1xuICAgIHZhciBoYW5kID0gcGxheWVySGFuZC5oYW5kO1xuICAgIHZhciBiZXQgPSBwbGF5ZXJIYW5kLmJldDtcbiAgICBpZiAoIWhhbmRzQWZ0ZXJTcGxpdHMpIHsgaGFuZHNBZnRlclNwbGl0cyA9IDE7IH1cbiAgICB2YXIgc3BsaXRPSyA9ICggaGFuZHNBZnRlclNwbGl0cyA8IGhvdXNlUnVsZXMubWF4SGFuZHNBZnRlclNwbGl0ICk7IFxuICAgIHZhciBpc1NwbGl0ID0gKCBoYW5kc0FmdGVyU3BsaXRzID4gMSApO1xuXG4gICAgdmFyIHJlc3VsdGluZ0hhbmRzID0gW3BsYXllckhhbmRdO1xuXG4gICAgZnVuY3Rpb24gcGxheWVyRG9lcyh3aGF0KSB7XG4gICAgICBnYW1lLmVtaXQoXCJzdG9yeVwiLCBwbGF5ZXIuZ2V0TmFtZSgpICsgXCIgXCIgKyB3aGF0KTtcbiAgICB9XG5cbiAgICB2YXIgcGxheWVyRG9uZSA9IGZhbHNlO1xuICAgIGlmIChoYW5kLmdldFZhbHVlKCkgPT0gMjEpIHtcbiAgICAgIHBsYXllckRvZXMoXCJoYXMgYmxhY2tqYWNrIVwiKTtcbiAgICAgIHBsYXllckRvbmUgPSB0cnVlO1xuICAgIH1cbiAgICB3aGlsZSghcGxheWVyRG9uZSkge1xuICAgICAgdmFyIHZhbGlkUGxheXMgPSB0aGlzLmdldFZhbGlkUGxheXNGb3IoaGFuZCwgaXNTcGxpdCwgc3BsaXRPSyk7XG4gICAgICB2YXIgcGxheSA9IHBsYXllci5jaG9vc2VQbGF5KGhhbmQsIGRlYWxlckNhcmQsIHZhbGlkUGxheXMsIHRoaXMpO1xuXG4gICAgICBpZiAodmFsaWRQbGF5cy5pbmRleE9mKHBsYXkpID09IC0xKSB7XG4gICAgICAgIHRocm93IFwiSW52YWxpZCBwbGF5IFwiICsgcGxheSArIFwiIHNlbGVjdGVkIVwiO1xuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKHBsYXkpIHtcbiAgICAgICAgY2FzZSBcInN0YXlcIjpcbiAgICAgICAgICBwbGF5ZXJEb2VzKFwic3RheXNcIik7XG4gICAgICAgICAgcGxheWVyRG9uZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgXG4gICAgICAgIGNhc2UgXCJoaXRcIjpcbiAgICAgICAgICBwbGF5ZXJEb2VzKFwiaGl0c1wiKTtcbiAgICAgICAgICB2YXIgY2FyZCA9IHNob2UuZHJhdygpO1xuICAgICAgICAgIGhhbmQuZGVhbENhcmQoY2FyZCk7XG4gICAgICAgICAgcGxheWVyRG9lcyhcImRyYXdzIGEgXCIgKyBjYXJkLnRvU3RyaW5nKCkgKyBcIi4gKFwiICsgKGhhbmQuaXNTb2Z0KCkgPyBcInNvZnRcIiA6IFwiaGFyZFwiKSArIFwiIFwiICsgaGFuZC5nZXRWYWx1ZSgpICsgXCIpXCIpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJzcGxpdFwiOlxuICAgICAgICAgIHBsYXllckRvZXMoXCJzcGxpdHNcIik7XG4gICAgICAgICAgaGFuZHNBZnRlclNwbGl0cysrO1xuXG4gICAgICAgICAgdmFyIHNwbGl0MSA9IG5ldyBIYW5kKCk7XG4gICAgICAgICAgc3BsaXQxLmRlYWxDYXJkKGhhbmQuZ2V0Q2FyZEF0KDApKTtcbiAgICAgICAgICBzcGxpdDEuZGVhbENhcmQoc2hvZS5kcmF3KCkpO1xuICAgICAgICAgIHZhciBzcGxpdDFQbGF5ZXJIYW5kID0ge1xuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICBoYW5kOiBzcGxpdDEsXG4gICAgICAgICAgICBiZXQ6IGJldFxuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIHNwbGl0MUhhbmRzID0gdGhpcy5wbGF5SGFuZChzcGxpdDFQbGF5ZXJIYW5kLCBkZWFsZXJIYW5kLCBoYW5kc0FmdGVyU3BsaXRzKTtcblxuICAgICAgICAgIHZhciBzcGxpdDIgPSBuZXcgSGFuZCgpO1xuICAgICAgICAgIHZhciBuZXdCZXQgPSBuZXcgQmV0KGJldC5nZXRBbW91bnQoKSk7XG4gICAgICAgICAgcGxheWVyLmNoYW5nZUJhbGFuY2UobmV3QmV0LmdldEFtb3VudCgpICogLTEpO1xuICAgICAgICAgIHNwbGl0Mi5kZWFsQ2FyZChoYW5kLmdldENhcmRBdCgxKSk7XG4gICAgICAgICAgc3BsaXQyLmRlYWxDYXJkKHNob2UuZHJhdygpKTtcbiAgICAgICAgICB2YXIgc3BsaXQyUGxheWVySGFuZCA9IHtcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgICAgaGFuZDogc3BsaXQyLFxuICAgICAgICAgICAgYmV0OiBuZXdCZXRcbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBzcGxpdDJIYW5kcyA9IHRoaXMucGxheUhhbmQoc3BsaXQyUGxheWVySGFuZCwgZGVhbGVySGFuZCwgaGFuZHNBZnRlclNwbGl0cyk7XG5cbiAgICAgICAgICByZXN1bHRpbmdIYW5kcyA9IHNwbGl0MWhhbmRzO1xuICAgICAgICAgIHJlc3VsdGluZ0hhbmRzLnB1c2guYXBwbHkocmVzdWx0aW5nSGFuZHMsIHNwbGl0MkhhbmRzKTtcblxuICAgICAgICAgIHBsYXllckRvbmUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJkb3VibGVcIjpcbiAgICAgICAgICBwbGF5ZXJEb2VzKFwiZG91YmxlcyBkb3duXCIpO1xuICAgICAgICAgIHBsYXllci5jaGFuZ2VCYWxhbmNlKHBsYXllckhhbmQuYmV0LmdldEFtb3VudCgpICogLTEpO1xuICAgICAgICAgIHBsYXllckhhbmQuYmV0LmRvdWJsZSgpO1xuICAgICAgICAgIHZhciBjYXJkID0gc2hvZS5kcmF3KCk7XG4gICAgICAgICAgaGFuZC5kZWFsQ2FyZChjYXJkKTtcbiAgICAgICAgICBwbGF5ZXJEb2VzKFwiZHJhd3MgYSBcIiArIGNhcmQudG9TdHJpbmcoKSArIFwiLiAoXCIgKyAoaGFuZC5pc1NvZnQoKSA/IFwic29mdFwiIDogXCJoYXJkXCIpICsgXCIgXCIgKyBoYW5kLmdldFZhbHVlKCkgKyBcIilcIik7XG4gICAgICAgICAgcGxheWVyRG9uZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcInN1cnJlbmRlclwiOlxuICAgICAgICAgIHBsYXllckRvZXMoXCJzdXJyZW5kZXJzXCIpO1xuICAgICAgICAgIHBsYXllckhhbmQuYmV0LnN1cnJlbmRlcigpO1xuICAgICAgICAgIHBsYXllckRvbmUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoaGFuZC5nZXRWYWx1ZSgpID09IDIxKSB7XG4gICAgICAgIHBsYXllckRvZXMoXCJzdG9wcyB3aXRoIDIxXCIpO1xuICAgICAgICBwbGF5ZXJEb25lID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoaGFuZC5nZXRWYWx1ZSgpID4gMjEpIHtcbiAgICAgICAgcGxheWVyRG9lcyhcImJ1c3RzXCIpO1xuICAgICAgICBwbGF5ZXJEb25lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0aW5nSGFuZHM7XG4gIH1cblxuICB0aGlzLnJlc29sdmVXaW5uaW5ncyA9IGZ1bmN0aW9uKHBsYXllckhhbmRzLCBkZWFsZXJIYW5kKSB7XG4gICAgdmFyIGdhbWUgPSB0aGlzO1xuICAgIHZhciBkZWFsZXJIYW5kVmFsdWUgPSBkZWFsZXJIYW5kLmdldFZhbHVlKCk7XG4gICAgcGxheWVySGFuZHMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXJIYW5kKSB7XG4gICAgICB2YXIgcGxheWVySGFuZFZhbHVlID0gcGxheWVySGFuZC5oYW5kLmdldFZhbHVlKCk7XG4gICAgICB2YXIgYmV0ID0gcGxheWVySGFuZC5iZXQ7XG4gICAgICB2YXIgcGxheWVyID0gcGxheWVySGFuZC5wbGF5ZXI7XG5cbiAgICAgIHZhciB3aW5SYXRpbyA9IDI7IC8vIFRoYXQgaXMsIDEgKyAxID0gMjsgIFxuICAgICAgLy8gSWYgYSBwbGF5ZXIgaGFzIGJsYWNramFjaywgdGhleSdyZSBlbGlnaWJsZSB0byB3aW4gbW9yZS5cbiAgICAgIGlmIChwbGF5ZXJIYW5kLmhhbmQuaXNCbGFja0phY2soKSkge1xuICAgICAgICB3aW5SYXRpbyA9IDM7IC8vIFRoYXQgaXMsIDEgKyAyID0gMy5cbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIHBsYXllciBoYXMgYnVzdGVkIG9yIHN1cnJlbmRlcmVkLCBhbGwgaXMgbG9zdC5cbiAgICAgIGlmIChwbGF5ZXJIYW5kVmFsdWUgPiAyMSB8fCBiZXQuaXNTdXJyZW5kZXJlZCgpKSB7XG4gICAgICAgIGdhbWUuZW1pdChcInN0b3J5XCIsIHBsYXllci5nZXROYW1lKCkgKyBcIiBsb3Nlcy5cIik7XG4gICAgICB9XG4gICAgICAvLyBJZiBEZWFsZXIgYnVzdGVkLCBhbGwgdW5idXN0ZWQgaGFuZHMgd2luXG4gICAgICBlbHNlIGlmIChkZWFsZXJIYW5kVmFsdWUgPiAyMSAmJiBwbGF5ZXJIYW5kVmFsdWUgPD0gMjEpIHtcbiAgICAgICAgZ2FtZS5lbWl0KFwic3RvcnlcIiwgcGxheWVyLmdldE5hbWUoKSArIFwiIHdpbnMuXCIpO1xuICAgICAgICBiZXQuc2V0V2lubmluZ3MoYmV0LmdldEFtb3VudCgpICogd2luUmF0aW8pO1xuICAgICAgfVxuICAgICAgLy8gSWYgZGVhbGVyIGRpZG4ndCBidXN0LCBwbGF5ZXIgbXVzdCBiZWF0IGRlYWxlciBzY29yZS5cbiAgICAgIGVsc2UgaWYgKCBwbGF5ZXJIYW5kVmFsdWUgPiBkZWFsZXJIYW5kVmFsdWUgKSB7XG4gICAgICAgIGdhbWUuZW1pdChcInN0b3J5XCIsIHBsYXllci5nZXROYW1lKCkgKyBcIiB3aW5zLlwiKTtcbiAgICAgICAgYmV0LnNldFdpbm5pbmdzKGJldC5nZXRBbW91bnQoKSAqIHdpblJhdGlvKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBwbGF5ZXJIYW5kVmFsdWUgPT0gZGVhbGVySGFuZFZhbHVlICkge1xuICAgICAgICBnYW1lLmVtaXQoXCJzdG9yeVwiLCBwbGF5ZXIuZ2V0TmFtZSgpICsgXCIgcHVzaGVzLlwiKTtcbiAgICAgICAgYmV0LnNldFdpbm5pbmdzKGJldC5nZXRBbW91bnQoKSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZ2FtZS5lbWl0KFwic3RvcnlcIiwgcGxheWVyLmdldE5hbWUoKSArIFwiIGxvc2VzLlwiKTtcbiAgICAgIH1cblxuICAgICAgcGxheWVySGFuZC5wbGF5ZXIuY29sbGVjdFdpbm5pbmdzKGJldCk7XG4gICAgfSk7XG4gICAgZ2FtZS5lbWl0KFwiZW5kcm91bmRcIiwgcGxheWVySGFuZHMsIGRlYWxlckhhbmQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdEhvdXNlUnVsZXMoKSB7XG4gICAgaWYgKCFob3VzZVJ1bGVzLmRlY2tzKSB7XG4gICAgICBob3VzZVJ1bGVzLmRlY2tzID0gMjtcbiAgICB9XG4gICAgaWYgKCFob3VzZVJ1bGVzLm1heEhhbmRzQWZ0ZXJTcGxpdHMpIHtcbiAgICAgIGhvdXNlUnVsZXMubWF4SGFuZHNBZnRlclNwbGl0cyA9IDI7XG4gICAgfVxuXG4gIH1cbn1cbnV0aWwuaW5oZXJpdHMoQmxhY2tKYWNrR2FtZSwgRXZlbnRFbWl0dGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbGFja0phY2tHYW1lO1xuIiwiLyoqXG4gKiBBIGNhcmQsIHZhbHVlZCBmb3IgYmxhY2tqYWNrXG4gKi9cblxuZnVuY3Rpb24gQ2FyZChyYW5rLCBzdWl0KSB7XG4gIHZhciB2YWx1ZTtcblxuICBzd2l0Y2ggKHJhbmspIHtcbiAgICBjYXNlIFwiQVwiOlxuICAgICAgdmFsdWUgPSAxMTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCIyXCI6XG4gICAgICB2YWx1ZSA9IDI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiM1wiOlxuICAgICAgdmFsdWUgPSAzO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIjRcIjpcbiAgICAgIHZhbHVlID0gNDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCI1XCI6XG4gICAgICB2YWx1ZSA9IDU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiNlwiOlxuICAgICAgdmFsdWUgPSA2O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIjdcIjpcbiAgICAgIHZhbHVlID0gNztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCI4XCI6XG4gICAgICB2YWx1ZSA9IDg7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiOVwiOlxuICAgICAgdmFsdWUgPSA5O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIjEwXCI6XG4gICAgY2FzZSBcIkpcIjpcbiAgICBjYXNlIFwiUVwiOlxuICAgIGNhc2UgXCJLXCI6XG4gICAgICB2YWx1ZSA9IDEwO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IHJhbmsgKyBcIiBpcyBub3QgYSByZWFsIGNhcmQgcmFuZC5cIlxuICB9XG5cbiAgdGhpcy5nZXRSYW5rID0gZnVuY3Rpb24oKSB7IHJldHVybiByYW5rOyB9O1xuICB0aGlzLmdldFN1aXQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHN1aXQ7IH07XG4gIHRoaXMuZ2V0VmFsdWUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHZhbHVlOyB9O1xuICB0aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiByYW5rICsgXCIgb2YgXCIgKyBzdWl0OyB9O1xufVxuXG4vLyBJIGRvbid0IHdhbnQgdG8gdXNlIHVuaWNvZGUgc3VpdHMuXG5DYXJkLnN1aXRzID0gW1wiaGVhcnRzXCIsIFwic3BhZGVzXCIsIFwiY2x1YnNcIiwgXCJkaWFtb25kc1wiXTtcbkNhcmQucmFua3MgPSBbXCJBXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiLCBcIjZcIiwgXCI3XCIsIFwiOFwiLCBcIjlcIiwgXCIxMFwiLCBcIkpcIiwgXCJRXCIsIFwiS1wiXTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYXJkO1xuIiwiLyoqXG4gKiBMb2dpYyBhbmQgcnVsZXMgZm9yIGEgc2luZ2xlIGhhbmQgb2YgYmxhY2tqYWNrLiAgU2hvdWxkIGJlIGFibGUgdG8gaGFuZGxlXG4gKiBlaXRoZXIgYSBkZWFsZXIgaGFuZCBvciBhIHBsYXllciBoYW5kLiAgQWxsIGl0IHJlYWxseSBkb2VzIGlzIGtlZXAgdHJhY2sgb2ZcbiAqIGhhcmQgYW5kIHNvZnQgaGFuZHMuXG4gKi9cbmZ1bmN0aW9uIEhhbmQoKSB7XG4gIHZhciBjYXJkcyA9IFtdO1xuICB2YXIgdmFsdWUgPSAwO1xuICB2YXIgYWNlcyA9IDA7IC8vIE51bWJlciBvZiBhY2VzLlxuICB2YXIgaGFyZGVuZWRBY2VzID0gMDsgLy8gTnVtYmVyIG9mIGFjZXMgY29uc2lkZXJlZCBoYXJkLlxuICB2YXIgaXNTb2Z0ID0gZmFsc2U7XG5cbiAgLy8gQWRkIG9uZSBjYXJkIHRvIHRoZSBoYW5kLlxuICB0aGlzLmRlYWxDYXJkID0gZnVuY3Rpb24oY2FyZCkge1xuICAgIGNhcmRzLnB1c2goY2FyZCk7XG4gICAgdmFsdWUgKz0gY2FyZC5nZXRWYWx1ZSgpO1xuXG4gICAgLy8gSGFuZGxlIEFjZXNcbiAgICBpZiAoY2FyZC5nZXRSYW5rKCkgPT0gXCJBXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICAgIGlzU29mdCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlID4gMjEgJiYgaGFyZGVuZWRBY2VzIDwgYWNlcykge1xuICAgICAgdmFsdWUgLT0gMTA7XG4gICAgICBoYXJkZW5lZEFjZXMgKz0gMTtcbiAgICAgIGlmIChoYXJkZW5lZEFjZXMgPT0gYWNlcykge1xuICAgICAgICBpc1NvZnQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBHZXQgdGhlIGJsYWNramFjayB2YWx1ZSBvZiB0aGlzIGhhbmQuXG4gIHRoaXMuZ2V0VmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHdoZXRoZXIgb3Igbm90IGFueSBhY2VzIGFyZSBjb25zaWRlcmVkIHNvZnQuXG4gIHRoaXMuaXNTb2Z0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGlzU29mdDtcbiAgfTtcblxuICB0aGlzLmlzQmxhY2tKYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNhcmRzLmxlbmd0aCA9PSAyICYmIHRoaXMuZ2V0VmFsdWUoKSA9PSAyMTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBjb3B5IG9mIHRoZSBjYXJkcy5cbiAgdGhpcy5nZXRDYXJkcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjYXJkcy5zbGljZSgpO1xuICB9O1xuXG4gIHRoaXMuZ2V0Q2FyZEF0ID0gZnVuY3Rpb24oaSkge1xuICAgIHJldHVybiBjYXJkc1tpXTtcbiAgfVxuXG4gIHRoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzdWx0ID0gY2FyZHMucmVkdWNlKGZ1bmN0aW9uKGEsYikge1xuICAgICAgcmV0dXJuIGEgKyBcIiBhbmQgXCIgKyBiO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQgKyBcIiAoXCIgKyAodGhpcy5pc1NvZnQoKSA/IFwic29mdFwiIDogXCJoYXJkXCIpICsgXCIgXCIgKyB0aGlzLmdldFZhbHVlKCkgKyBcIilcIjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmQ7XG4iLCJ2YXIgQmV0ID0gcmVxdWlyZSgnLi9iZXQuanMnKTtcblxuLypyZXR1cm4qXG4gKiBBIGJsYWNramFjayBwbGF5ZXIgaGFzIGEgY2FzaCBiYWxhbmNlIGFuZCBhIHN0cmF0ZWd5LiAgVGhlIGdhbWUgaW50ZXJhY3RzIFxuICogd2l0aCB0aGUgcGxheWVyLCB3aGljaCBjYXVzZXMgdGhlIGdhbWUgdG8gcHJvZ3Jlc3MuXG4gKi9cbmZ1bmN0aW9uIFBsYXllcihzdHJhdGVneSkge1xuICB2YXIgYmFsYW5jZSA9IDA7XG4gIHZhciBuYW1lID0gXCJQbGF5ZXJcIjtcbiAgXG4gIHRoaXMuY2hvb3NlQmV0ID0gZnVuY3Rpb24oZ2FtZSkge1xuICAgIHZhciBhbW91bnQgPSBzdHJhdGVneS5jaG9vc2VCZXQodGhpcywgZ2FtZSk7XG4gICAgdmFyIGJldCA9IG5ldyBCZXQoYW1vdW50KTtcbiAgICB0aGlzLmNoYW5nZUJhbGFuY2UoYW1vdW50ICogLTEpO1xuICAgIHJldHVybiBiZXQ7XG4gIH07XG5cbiAgdGhpcy5jaG9vc2VQbGF5ID0gZnVuY3Rpb24oaGFuZCwgZGVhbGVyQ2FyZCwgdmFsaWRQbGF5cywgZ2FtZSkge1xuICAgIHJldHVybiBzdHJhdGVneS5jaG9vc2VQbGF5KGhhbmQsIGRlYWxlckNhcmQsIHZhbGlkUGxheXMsIHRoaXMsIGdhbWUpO1xuICB9O1xuXG4gIHRoaXMuY29sbGVjdFdpbm5pbmdzID0gZnVuY3Rpb24oYmV0KSB7XG4gICAgdGhpcy5jaGFuZ2VCYWxhbmNlKGJldC5nZXRXaW5uaW5ncygpKTtcbiAgfVxuXG4gIHRoaXMuY2hhbmdlQmFsYW5jZSA9IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgIGJhbGFuY2UgKz0gYW1vdW50O1xuICB9O1xuXG4gIHRoaXMuZ2V0QmFsYW5jZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGJhbGFuY2U7XG4gIH07XG5cbiAgdGhpcy5zZXROYW1lID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBuYW1lID0gdmFsdWU7XG4gIH1cblxuICB0aGlzLmdldE5hbWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmFtZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcbiIsIi8qKlxuICogQSBqYWNramFjayBzaG9lLCAgYSAxLTggZGVjayBzdGFjayBvZiBjYXJkcy4gIFxuICovXG5cbnZhciBDYXJkID0gcmVxdWlyZSgnLi9jYXJkLmpzJyk7XG5cbmZ1bmN0aW9uIFNob2Uoc2l6ZSkge1xuICB2YXIgc3RhY2sgPSBbXTtcbiAgdmFyIGN1cnNvciA9IDA7XG4gIFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIENhcmQuc3VpdHMuZm9yRWFjaChmdW5jdGlvbihzdWl0KSB7XG4gICAgICBDYXJkLnJhbmtzLmZvckVhY2goZnVuY3Rpb24ocmFuaykge1xuICAgICAgICB2YXIgY2FyZCA9IG5ldyBDYXJkKHJhbmssIHN1aXQpO1xuICAgICAgICBzdGFjay5zcGxpY2UoTWF0aC5mbG9vcigoc3RhY2subGVuZ3RoICsgMSkgKiBNYXRoLnJhbmRvbSgpKSwwLGNhcmQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBHZXQgdGhlIG5leHQgY2FyZCBmcm9tIHRoZSBzaG9lLlxuICB0aGlzLmRyYXcgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoY3Vyc29yID49IHN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhyb3coXCJUaGUgZGVjayBoYXMgYmVlbiBleGhhdXN0ZWRcIik7XG4gICAgfVxuICAgIHZhciB0b3BDYXJkID0gc3RhY2tbY3Vyc29yXTtcbiAgICBjdXJzb3IgKz0gMTtcbiAgICByZXR1cm4gdG9wQ2FyZDtcbiAgfTtcblxuICB0aGlzLmNhcmRzTGVmdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzdGFjay5sZW5ndGggLSBjdXJzb3I7XG4gIH1cblxuICAvLyBTaHVmZmxlcyB0aGUgZGVjay4gIEFsbCBjYXJkcyBhcmUgYXNzdW1lZCB0byBiZSBnYXRoZXJlZCBiYWNrLlxuICB0aGlzLnNodWZmbGUgPSBmdW5jdGlvbigpIHtcbiAgICBjdXJzb3IgPSAwO1xuICAgIHZhciBuZXdzdGFjayA9IFtdO1xuICAgIHN0YWNrLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuICAgICAgbmV3c3RhY2suc3BsaWNlKE1hdGguZmxvb3IoKHN0YWNrLmxlbmd0aCArIDEpICogTWF0aC5yYW5kb20oKSksMCxjYXJkKTtcbiAgICB9KTtcbiAgICBzdGFjayA9IG5ld3N0YWNrO1xuICB9O1xuICBcbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgcmVtYWluaW5nIHN0YWNrXG4gIHRoaXMuZ2V0UmVtYWluaW5nQ2FyZHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gc3RhY2suc2xpY2UoY3Vyc29yLCBzdGFjay5sZW5ndGgpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNob2U7XG4iLCIvKipcbiAqIFRoaXMgaXMgdGhlIHN0cmF0ZWd5IGEgZGVhbGVyIGZvbGxvd3MuICBJdCdzIHZlcnkgc2ltcGxlLlxuICovXG5cbi8vIFdpdGggdGhhbmtzIHRvIGh0dHA6Ly93aXphcmRvZm9kZHMuY29tL2dhbWVzL2JsYWNramFjay9zdHJhdGVneS9jYWxjdWxhdG9yL1xudmFyIGJhc2ljSGFyZCA9IHtcbiAgICAvLyAgICAgMiAgICAgMyAgICAgNCAgICAgNSAgICAgNiAgICAgNyAgICAgOCAgICAgOSAgICAgVCAgICAgQVxuXG4gICAgNDogIFsgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCJdLCAgIC8vIEhhcmQgIDRcbiAgICA1OiAgWyBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIl0sICAgLy8gSGFyZCAgNVxuICAgIDY6ICBbIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiXSwgICAvLyBIYXJkICA2XG4gICAgNzogIFsgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCJdLCAgIC8vIEhhcmQgIDdcbiAgICA4OiAgWyBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIl0sICAgLy8gSGFyZCAgOFxuICAgIDk6ICBbIFwiSFwiLCBcIkRIXCIsIFwiREhcIiwgXCJESFwiLCBcIkRIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiXSwgICAvLyBIYXJkICA5XG4gICAgMTA6IFtcIkRIXCIsIFwiREhcIiwgXCJESFwiLCBcIkRIXCIsIFwiREhcIiwgXCJESFwiLCBcIkRIXCIsIFwiREhcIiwgIFwiSFwiLCAgXCJIXCJdLCAgIC8vIEhhcmQgMTBcbiAgICAxMTogW1wiREhcIiwgXCJESFwiLCBcIkRIXCIsIFwiREhcIiwgXCJESFwiLCBcIkRIXCIsIFwiREhcIiwgXCJESFwiLCBcIkRIXCIsICBcIkhcIl0sICAgLy8gSGFyZCAxMVxuICAgIDEyOiBbIFwiSFwiLCAgXCJIXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiXSwgICAvLyBIYXJkIDEyXG4gICAgMTM6IFsgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCJdLCAgIC8vIEhhcmQgMTNcbiAgICAxNDogWyBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIl0sICAgLy8gSGFyZCAxNFxuICAgIDE1OiBbIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsIFwiUkhcIiwgIFwiSFwiXSwgICAvLyBIYXJkIDE1XG4gICAgMTY6IFsgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiSFwiLCAgXCJIXCIsIFwiUkhcIiwgXCJSSFwiLCBcIlJIXCJdLCAgIC8vIEhhcmQgMTZcbiAgICAxNzogWyBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIl0sICAgLy8gSGFyZCAxN1xuICAgIDE4OiBbIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiXSwgICAvLyBIYXJkIDE4XG4gICAgMTk6IFsgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCJdLCAgIC8vIEhhcmQgMTlcbiAgICAyMDogWyBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIl0sICAgLy8gSGFyZCAyMFxuICAgIDIxOiBbIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiXSAgICAvLyBIYXJkIDIxXG59O1xuXG52YXIgYmFzaWNTb2Z0ID0ge1xuICAgIDEyOiBbIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiXSwgICAvLyBTb2Z0IDEyXG4gICAgMTM6IFsgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCBcIkRIXCIsIFwiREhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCJdLCAgIC8vIFNvZnQgMTNcbiAgICAxNDogWyBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsIFwiREhcIiwgXCJESFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIl0sICAgLy8gU29mdCAxNFxuICAgIDE1OiBbIFwiSFwiLCAgXCJIXCIsIFwiREhcIiwgXCJESFwiLCBcIkRIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiXSwgICAvLyBTb2Z0IDE1XG4gICAgMTY6IFsgXCJIXCIsICBcIkhcIiwgXCJESFwiLCBcIkRIXCIsIFwiREhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCJdLCAgIC8vIFNvZnQgMTZcbiAgICAxNzogWyBcIkhcIiwgXCJESFwiLCBcIkRIXCIsIFwiREhcIiwgXCJESFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIl0sICAgLy8gU29mdCAxN1xuICAgIDE4OiBbIFwiU1wiLCBcIkRTXCIsIFwiRFNcIiwgXCJEU1wiLCBcIkRTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiXSwgICAvLyBTb2Z0IDE4XG4gICAgMTk6IFsgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCJdLCAgIC8vIFNvZnQgMTlcbiAgICAyMDogWyBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIl0sICAgLy8gU29mdCAyMFxuICAgIDIxOiBbIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiXSAgICAvLyBTb2Z0IDIxXG59O1xuXG52YXIgYmFzaWNTcGxpdCA9IHtcbiAgICAyOiAgW1wiUUhcIiwgXCJRSFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIl0sICAgLy8gMiwyXG4gICAgMzogIFtcIlFIXCIsIFwiUUhcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCJdLCAgIC8vIDMsM1xuICAgIDQ6ICBbIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgXCJRSFwiLCBcIlFIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiXSwgICAvLyA0LDRcbiAgICA1OiAgW1wiREhcIiwgXCJESFwiLCBcIkRIXCIsIFwiREhcIiwgXCJESFwiLCBcIkRIXCIsIFwiREhcIiwgXCJESFwiLCAgXCJIXCIsICBcIkhcIl0sICAgLy8gNSw1XG4gICAgNjogIFtcIlFIXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiLCAgXCJIXCJdLCAgIC8vIDYsNlxuICAgIDc6ICBbIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiSFwiLCAgXCJIXCIsICBcIkhcIiwgIFwiSFwiXSwgICAvLyA3LDdcbiAgICA4OiAgWyBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIl0sICAgLy8gOCw4XG4gICAgOTogIFsgXCJQXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiU1wiLCAgXCJQXCIsICBcIlBcIiwgIFwiU1wiLCAgXCJTXCJdLCAgIC8vIDksOVxuICAgIDEwOiBbIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiLCAgXCJTXCIsICBcIlNcIiwgIFwiU1wiXSwgICAvLyBULFRcbiAgICAxMTogWyBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIiwgIFwiUFwiLCAgXCJQXCIsICBcIlBcIl0gICAgLy8gQSxBXG59O1xuXG52YXIgZGVhbGVyUmFua1RvSW5kZXggPSB7XG4gIFwiMlwiOiAwLFxuICBcIjNcIjogMSxcbiAgXCI0XCI6IDIsXG4gIFwiNVwiOiAzLFxuICBcIjZcIjogNCxcbiAgXCI3XCI6IDUsXG4gIFwiOFwiOiA2LFxuICBcIjlcIjogNyxcbiAgXCIxMFwiOiA4LFxuICBcIkpcIjogOCxcbiAgXCJRXCI6IDgsXG4gIFwiS1wiOiA4LFxuICBcIkFcIjogOSxcbn07XG5cbnNvbHV0aW9uQ29kZVRvQWN0aW9uID0ge1xuICBcIlNcIjogXCJzdGF5XCIsXG4gIFwiSFwiOiBcImhpdFwiLFxuICBcIlBcIjogXCJzcGxpdFwiLFxuICBcIkRcIjogXCJkb3VibGVcIixcbiAgXCJSXCI6IFwic3VycmVuZGVyXCIsXG4gIFwiUVwiOiBcImludmFsaWRcIlxufTtcblxuZnVuY3Rpb24gQmFzaWNTdHJhdGVneSgpIHtcbiAgdGhpcy5jaG9vc2VCZXQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gMTA7XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgc3RyaW5nIGlmIHdlIGZpbmQgYSB2YWxpZCBwbGF5LCBvdGhlcndpc2UgZmFsc2U7XG4gIHRoaXMuc29sdXRpb25Ub1BsYXkgPSBmdW5jdGlvbihzb2x1dGlvbiwgYWxsb3dlZFBsYXlzKSB7XG4gICAgdmFyIHBsYXk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHNvbHV0aW9uLmxlbmd0aCAmJiAhcGxheTsgaSsrKSB7XG4gICAgICB2YXIgY29kZSA9IHNvbHV0aW9uLmNoYXJBdChpKTtcbiAgICAgIHZhciBjYW5kaWRhdGUgPSBzb2x1dGlvbkNvZGVUb0FjdGlvbltjb2RlXTtcbiAgICAgIGlmIChhbGxvd2VkUGxheXMuaW5kZXhPZihjYW5kaWRhdGUpID49IDApIHtcbiAgICAgICAgcGxheSA9IGNhbmRpZGF0ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYgKCFwbGF5KSB7XG4gICAgICBwbGF5ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBsYXk7XG4gIH1cblxuICB0aGlzLmNob29zZVBsYXkgPSBmdW5jdGlvbihoYW5kLCBkZWFsZXJDYXJkLCBhbGxvd2VkUGxheXMsIHBsYXllciwgZ2FtZSkge1xuICAgIHZhciBkZWFsZXJSYW5rID0gZGVhbGVyQ2FyZC5nZXRSYW5rKCk7XG4gICAgdmFyIGRlYWxlckxvb2t1cEluZGV4ID0gZGVhbGVyUmFua1RvSW5kZXhbZGVhbGVyUmFua107XG5cbiAgICB2YXIgZmluYWxBbnN3ZXI7XG5cbiAgICAvLyBGaXJzdCBjaGVjayBzcGxpdC5cbiAgICB2YXIgZmlyc3RDYXJkID0gaGFuZC5nZXRDYXJkQXQoMCk7XG4gICAgaWYgKGZpcnN0Q2FyZC5nZXRSYW5rKCkgPT0gaGFuZC5nZXRDYXJkQXQoMSkuZ2V0UmFuaygpKSB7XG4gICAgICB2YXIgc29sdXRpb25Sb3cgPSBiYXNpY1NwbGl0W2ZpcnN0Q2FyZC5nZXRWYWx1ZSgpXTtcbiAgICAgIGZpbmFsQW5zd2VyID0gdGhpcy5zb2x1dGlvblRvUGxheShzb2x1dGlvblJvd1tkZWFsZXJMb29rdXBJbmRleF0sIGFsbG93ZWRQbGF5cyk7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbnl0aGluZyB5ZXQsIHRyeSB0aGUgcmVndWxhciB0YWJsZXMuXG4gICAgaWYgKCFmaW5hbEFuc3dlcikge1xuICAgICAgdmFyIHNvbHV0aW9uUm93O1xuICAgICAgaWYgKGhhbmQuaXNTb2Z0KCkpIHtcbiAgICAgICAgc29sdXRpb25Sb3cgPSBiYXNpY1NvZnRbaGFuZC5nZXRWYWx1ZSgpXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCFmaW5hbEFuc3dlcikge1xuICAgICAgICBzb2x1dGlvblJvdyA9IGJhc2ljSGFyZFtoYW5kLmdldFZhbHVlKCldO1xuICAgICAgfVxuICAgICAgZmluYWxBbnN3ZXIgPSB0aGlzLnNvbHV0aW9uVG9QbGF5KHNvbHV0aW9uUm93W2RlYWxlckxvb2t1cEluZGV4XSwgYWxsb3dlZFBsYXlzKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIHNvbWV0aGluZyBieSBub3csIHNvbWV0aGluZyBpcyB3cm9uZy5cbiAgICBpZiAoIWZpbmFsQW5zd2VyKSB7XG4gICAgICB0aHJvdyBcIk15IGJhc2ljIHN0cmF0ZWd5IGlzIGZhaWxpbmcgbWUhXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbmFsQW5zd2VyO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNTdHJhdGVneTtcbiIsIi8qKlxuICogVGhpcyBpcyB0aGUgc3RyYXRlZ3kgYSBkZWFsZXIgZm9sbG93cy4gIEl0J3MgdmVyeSBzaW1wbGUuXG4gKi9cblxuZnVuY3Rpb24gRGVhbGVyU3RyYXRlZ3koKSB7XG4gIC8vIERlYWxlcnMgZG9uJ3QgYmV0LCBvYnZpb3VzbHksIGJ1dCB0aGlzIGZ1bGZpbGxzIHRoZSBpbnRlcmZhY2UgaW4gY2FzZSB3ZVxuICAvLyB3YW50IHRvIHRlc3Qgd2l0aCBpdCBvciBzb21ldGhpbmcuXG4gIHRoaXMuY2hvb3NlQmV0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDEwO1xuICB9XG5cbiAgLy8gQSBkZWFsZXIgb25seSBsb29rcyBhdCBoaXMgb3duIGhhbmQuICBXZSBkb24ndCBldmVuIG5lZWQgdGhlIG90aGVyIGFyZ3VtZW50cy5cbiAgdGhpcy5jaG9vc2VQbGF5ID0gZnVuY3Rpb24oaGFuZCkge1xuICAgIC8vIFRPRE86IGhhbmRsZSBydWxlcyBhYm91dCB0aGluZ3MgbGlrZSBzb2Z0IDE3LlxuICAgIGlmIChoYW5kLmdldFZhbHVlKCkgPCAxNykge1xuICAgICAgcmV0dXJuIFwiaGl0XCI7XG4gICAgfVxuICAgIHJldHVybiBcInN0YXlcIjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYWxlclN0cmF0ZWd5O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiJdfQ==
