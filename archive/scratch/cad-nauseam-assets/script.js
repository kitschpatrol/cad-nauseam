// This is basically a port of Daniel Shiffman's
// Wolfram Cellular Automata example from Processing
// With a few modifications...

var sourceBreak = "\n"
var grid = $("grid")
var ruleset = [0, 1, 0, 1, 1, 0, 1, 0]
var generation = 0
var pixelCount = 101 // horizontal resolution
var running = true

var rules = function (a, b, c) {
  if (a === 1 && b === 1 && c === 1) return ruleset[0]
  if (a === 1 && b === 1 && c === 0) return ruleset[1]
  if (a === 1 && b === 0 && c === 1) return ruleset[2]
  if (a === 1 && b === 0 && c === 0) return ruleset[3]
  if (a === 0 && b === 1 && c === 1) return ruleset[4]
  if (a === 0 && b === 1 && c === 0) return ruleset[5]
  if (a === 0 && b === 0 && c === 1) return ruleset[6]
  if (a === 0 && b === 0 && c === 0) return ruleset[7]
  return 0
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/string/pad [rev. #1]
String.prototype.pad = function (l, s, t) {
  return (
    s || (s = " "),
    (l -= this.length) > 0
      ? (s = new Array(Math.ceil(l / s.length) + 1).join(s)).substr(0, (t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2))) +
        this +
        s.substr(0, l - t)
      : this
  )
}

var rulesToString = function (r) {
  var ruleString = ""
  for (var i = 0; i < r.length; i++) {
    ruleString += r[i]
  }

  return ruleString.pad(8, "0")
}

var rulesToArray = function (r) {
  var ruleArray = new Array()
  for (var i = 1; i <= r.length; i++) {
    ruleArray[i] = parseInt(r.substring(i - 1, i))
  }

  // weird undefined at start of array... no idea
  ruleArray = ruleArray.splice(1)

  return ruleArray
}

// gives a more info link at wolfram alpha
var ruleToLink = function (n) {
  return "https://www.wolframalpha.com/input/?i=cellular+automaton+rule+" + n
}

// base conversions to get from a rule number
// to a rule set
var base = function (n, to, from) {
  return parseInt(n, from || 10).toString(to)
}

var decimalToBinary = function (n) {
  // be sure to pad it with 0s
  return base(n, 2, 10).toString().pad(8, "0")
}

var binaryToDecimal = function (n) {
  return base(n, 10, 2)
}

// Set up the control panel
var controls = $("control-panel")
var ruleBox = $("rule-box")
var ruleNumber = $("number-box")
var infoLink = $("info-link")

var RuleControl = new Class({
  initialize: function (a, b, c, ruleIndex) {
    this.a = a
    this.b = b
    this.c = c
    this.element = new Element("div", { class: "rule-control" })
    this.ruleIndex = ruleIndex
    this.rule = ruleset[ruleIndex]

    // build the representations
    this.aElement = new Element("div", { class: "box", style: "left: 5px;  top: 9px;" })
    this.bElement = new Element("div", { class: "box", style: "left: 16px; top: 9px;" })
    this.cElement = new Element("div", { class: "box", style: "left: 27px; top: 9px;" })
    this.switchElement = new Element("div", { class: "box switch", style: "top: 20px; left: 16px;" })

    if (this.a === 1) this.aElement.addClass("on")
    if (this.b === 1) this.bElement.addClass("on")
    if (this.c === 1) this.cElement.addClass("on")
    if (this.rule === 1) this.element.addClass("on")

    this.element.adopt(this.aElement, this.bElement, this.cElement, this.switchElement)

    this.element.addEvent("click", this.toggle.bind(this))
  },

  activate: function () {
    this.switchElement.addClass("on")
    this.element.addClass("on")
    this.rule = 1
    this.setRule()
  },

  deactivate: function () {
    this.switchElement.removeClass("on")
    this.element.removeClass("on")
    this.rule = 0
    this.setRule()
  },

  // applies the currently set rule to the whole sim
  setRule: function () {
    ruleset[this.ruleIndex] = this.rule
    setRuleGlobally(ruleset)
  },

  setState: function (s) {
    if (s === 0) {
      this.switchElement.removeClass("on")
      this.element.removeClass("on")
      this.rule = 0
    } else {
      this.switchElement.addClass("on")
      this.element.addClass("on")
      this.rule = 1
    }
  },

  toggle: function () {
    if (this.rule === 0) {
      this.activate()
    } else {
      this.deactivate()
    }
  },

  toElement: function () {
    return this.element
  },
})

// Instantiate each rule switch
var ruleControls = Array()
ruleControls[0] = new RuleControl(1, 1, 1, 0)
ruleControls[1] = new RuleControl(1, 1, 0, 1)
ruleControls[2] = new RuleControl(1, 0, 1, 2)
ruleControls[3] = new RuleControl(1, 0, 0, 3)
ruleControls[4] = new RuleControl(0, 1, 1, 4)
ruleControls[5] = new RuleControl(0, 1, 0, 5)
ruleControls[6] = new RuleControl(0, 0, 1, 6)
ruleControls[7] = new RuleControl(0, 0, 0, 7)

// Arrange them in a grid
for (var i = 0; i < ruleControls.length; i++) {
  $(ruleControls[i]).set("styles", { left: (i % 2) * 44 + 1 + "px", top: Math.floor(i / 2) * 44 + 55 + "px" })
  ruleBox.adopt($(ruleControls[i]))
}

// Set up the play / pause button
var pausePlay = $("pause-play")

pausePlay.addEvent("click", function (event) {
  if (running) {
    running = false
    this.set("text", "Go")
  } else {
    running = true
    this.set("text", "Stop")
  }
})

// Set up the reseed button
var reseedButton = $("reseed")

reseedButton.addEvent("click", function (event) {
  reseed()
})

// Set up the rule box

// filter the input
// via http://cpojer.net/blog/InputMask_Class_for_MooTools
new InputMask(ruleNumber, {
  mask: "999",
})

ruleNumber.addEvent("keydown", function (event) {
  if (event.key === "enter") {
    event.preventDefault()

    // tiny bit of error correction
    if (ruleNumber.value > 255) {
      ruleNumber.value = 255
    }

    setRuleGlobally(rulesToArray(decimalToBinary(ruleNumber.value)))
  }
})

ruleNumber.addEvent("blur", function () {
  // tiny bit of error correction
  if (ruleNumber.value > 255) {
    ruleNumber.value = 255
  }

  setRuleGlobally(rulesToArray(decimalToBinary(ruleNumber.value)))
})

// take an array of 8 characters and set the rules
var setRuleGlobally = function (newRule) {
  // update the control panel
  for (i = 0; i < newRule.length; i++) {
    ruleControls[i].setState(newRule[i])
  }

  // update the number box
  ruleNumber.set("value", binaryToDecimal(rulesToString(newRule)))

  // update the info link
  infoLink.set("href", ruleToLink(binaryToDecimal(rulesToString(newRule))))

  // update the hash
  window.location.href = "#" + binaryToDecimal(rulesToString(newRule)).toString()

  // update the simulation
  ruleset = newRule
}

// set up the system, load a specific CA from the hash if it's there
var anchor = document.URL.split("#")[1]
if (!anchor) {
  anchor = ""
}

if (anchor == "") {
  // use the default rule
  setRuleGlobally(ruleset)
} else {
  // set the rule from the hash
  setRuleGlobally(rulesToArray(decimalToBinary(anchor)))
}

// Populate a first row of data
var thisGeneration = Array()
var nextGeneration = Array()

var reseed = function () {
  for (var i = 0; i < pixelCount; i++) {
    thisGeneration[i] = 0
  }

  // optionally fill out the borders for debugging
  // thisGeneration[0] = 1;
  // thisGeneration[pixelCount - 1] = 1;

  // one in the center
  thisGeneration[Math.round(pixelCount / 2) - 1] = 1
}

reseed()

var generate = function () {
  // Handle the edges...
  nextGeneration[0] = thisGeneration[0]
  nextGeneration[thisGeneration.length - 1] = thisGeneration[thisGeneration.length - 1]

  for (var i = 1; i < pixelCount - 1; i++) {
    var left = thisGeneration[i - 1] // Left neighbor state
    var me = thisGeneration[i] // Current state
    var right = thisGeneration[i + 1] // Right neighbor state
    nextGeneration[i] = rules(left, me, right) // Compute next generation state based on ruleset
  }

  thisGeneration = nextGeneration.slice() // copies the array

  generation++
}

var asciiGrid = $("ascii-grid")
asciiGrid.appendText(sourceBreak)
var addAsciiRow = function (data) {
  for (var i = 0; i < pixelCount; i++) {
    // faster to just use a string array?

    // set the color
    if (data[i] === 1) {
      asciiGrid.appendText("X")
    } else {
      asciiGrid.appendText(" ")
    }
  }

  asciiGrid.appendText(sourceBreak)
}

// main loop
var update = function () {
  //addRow(thisGeneration);

  if (running) {
    addAsciiRow(thisGeneration)
    generate()
    window.scrollTo(0, window.getScrollSize().y)
  }
}

// run the loop
update.periodical(15)
