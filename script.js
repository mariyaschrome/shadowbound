// ================== SHADOWBOUND ==================

const SAVE_KEY = "shadowbound-save";
const START_TEXT = "You wake at the edge of a moonlit forest. Behind you, a ruined chapel. Ahead, a fog-covered bridge. A hooded stranger stands in the middle of it, waiting.";

const defaultState = {
  hp: 10,
  mana: 3,
  inventory: [],
  scene: "start",
  visited: ["Bridge"],
  text: START_TEXT
};

// ---------- Places on the map ----------
const places = ["Bridge", "Graveyard", "Chapel", "River", "Cave", "Witch's Hut", "Castle"];

// ---------- Story scenes ----------
const scenes = {
  start: {
    place: "Bridge",
    text: START_TEXT,
    choices: [
      { label: "Speak to the stranger", next: "stranger" },
      { label: "Sneak around the bridge", next: "river" },
      { label: "Enter the chapel", next: "chapel" },
      { label: "Search the old graveyard", next: "graveyard", hideIf: "Silver Key" },
      { label: "Follow the smoke to a hut", next: "hut" }
    ]
  },
  stranger: {
    place: "Bridge",
    text: "The stranger lowers their hood. Their eyes glow violet. 'You are Shadowbound,' they whisper. 'The darkness chose you.' They offer you a cloak woven from midnight.",
    choices: [
      { label: "Accept the cloak", next: "cloak", give: "Midnight Cloak" },
      { label: "Refuse and walk away", next: "start" }
    ]
  },
  cloak: {
    place: "Bridge",
    text: "The cloak settles on your shoulders and the shadows bend toward you. The stranger vanishes into mist. Far across the bridge, a pale castle glows. The path to it is open.",
    choices: [
      { label: "Cross the bridge to the castle", next: "castle" },
      { label: "Go back", next: "start" }
    ]
  },
  river: {
    place: "River",
    text: "You slip down to the water. Something pale moves beneath the surface, and a hand grabs your ankle. You tear free, but not before it scratches you.",
    hp: -2,
    choices: [
      { label: "Climb back up", next: "start" },
      { label: "Follow the river", next: "cave" }
    ]
  },
  chapel: {
    place: "Chapel",
    text: "Inside the chapel, candles light themselves. On the altar lies a silver dagger and an old book that whispers your name.",
    choices: [
      { label: "Take the dagger", next: "chapel_done", give: "Silver Dagger" },
      { label: "Open the book", next: "chapel_done", give: "Whispering Book", mana: 2 }
    ]
  },
  chapel_done: {
    place: "Chapel",
    text: "The candles flicker out, one by one. Whatever you took from this place, it took something from the silence too. You step back outside.",
    choices: [
      { label: "Return to the bridge", next: "start" }
    ]
  },
  graveyard: {
    place: "Graveyard",
    text: "Rows of crooked stones lean in the moonlight. One grave has been freshly disturbed, and a Silver Key lies half-buried in the dirt.",
    choices: [
      { label: "Take the Silver Key", next: "graveyard_done", give: "Silver Key" },
      { label: "Leave quietly", next: "start" }
    ]
  },
  graveyard_done: {
    place: "Graveyard",
    text: "You pocket the key. Somewhere under the earth, something sighs. The graveyard feels emptier now.",
    choices: [
      { label: "Return to the bridge", next: "start" }
    ]
  },
  hut: {
    place: "Witch's Hut",
    text: "A crooked hut glows green from within. An old witch stirs a cauldron. 'Bring me a feather from my ravens,' she croaks, 'and I'll brew you something.'",
    choices: [
      { label: "Trade the Raven Feather for a brew", next: "hut_brew", requires: "Raven Feather", take: "Raven Feather", restore: true },
      { label: "Ask for a prophecy", next: "hut_prophecy" },
      { label: "Leave", next: "start" }
    ]
  },
  hut_brew: {
    place: "Witch's Hut",
    text: "She hands you a smoking cup. It tastes of smoke and honey. Warmth floods through you. Your health and mana are fully restored.",
    choices: [
      { label: "Step outside", next: "start" }
    ]
  },
  hut_prophecy: {
    place: "Witch's Hut",
    text: "The witch's eyes roll white. 'The key sleeps among the dead. The blade sleeps behind a stone door beneath the river. The book will answer, if you dare listen. And the Queen only fears what she cannot buy.'",
    choices: [
      { label: "Back to the hut", next: "hut" }
    ]
  },
  cave: {
    place: "Cave",
    text: "The river leads to a cave mouth shaped like a screaming face. Inside, a stone door is carved with a silver keyhole. Cold air breathes through the cracks.",
    choices: [
      { label: "Unlock the door with the Silver Key", next: "vault", requires: "Silver Key", hideIf: "Moonblade" },
      { label: "Pry at the door with your hands", next: "cave_fail" },
      { label: "Go back", next: "start" }
    ]
  },
  cave_fail: {
    place: "Cave",
    text: "The door doesn't budge, and the cave seems to laugh at you. A loose stone falls and strikes your shoulder.",
    hp: -1,
    choices: [
      { label: "Back away", next: "cave" }
    ]
  },
  vault: {
    place: "Cave",
    text: "The door swings open. Inside, on a velvet cushion, rests the Moonblade, a sword that hums with pale light.",
    choices: [
      { label: "Take the Moonblade", next: "start", give: "Moonblade" }
    ]
  },
  castle: {
    place: "Castle",
    text: "The castle gates stand open. On a throne of black glass sits the Hollow Queen, her crown made of cold stars. 'Shadowbound,' she smiles. 'I have waited so long for you.'",
    choices: [
      { label: "Fight her with the Moonblade", next: "ending_hero", requires: "Moonblade" },
      { label: "Cast a binding spell (2 mana)", next: "ending_mage", requires: "Whispering Book", manaCost: 2 },
      { label: "Strike with the Silver Dagger", next: "ending_dagger", requires: "Silver Dagger" },
      { label: "Kneel before her", next: "ending_dark" }
    ]
  },
  ending_hero: {
    place: "Castle",
    text: "The Moonblade blazes. With one swing, the Hollow Queen's crown shatters and the night shudders. Dawn breaks over the castle for the first time in a hundred years. You are free. THE END.",
    ending: true,
    sound: "win",
    choices: []
  },
  ending_mage: {
    place: "Castle",
    text: "The words from the book pour out of you. Silver chains of light wrap around the Queen. 'Clever,' she whispers, fading. 'But the book will remember you.' The shadows go quiet. THE END.",
    ending: true,
    sound: "win",
    choices: []
  },
  ending_dagger: {
    place: "Castle",
    text: "The silver dagger finds its mark, but the Queen only laughs. 'A dagger from my own chapel?' The dark closes over you. You were never meant to win this way. THE END.",
    ending: true,
    sound: "lose",
    choices: []
  },
  ending_dark: {
    place: "Castle",
    text: "You kneel. The Queen places her crown on your head and the stars go cold. You are Shadowbound, and now you rule the night. THE END.",
    ending: true,
    sound: "lose",
    choices: []
  }
};

// ---------- Sound (made in code, no files needed) ----------
let soundOn = localStorage.getItem("shadowbound-sound") !== "off";
let audioCtx = null;

function tone(freq, duration, type, volume, delay) {
  if (!soundOn) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const start = audioCtx.currentTime + (delay || 0);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + duration);
  } catch (e) {
    // If sound fails, the game still works.
  }
}

const sounds = {
  click: function () { tone(300, 0.12, "sine", 0.15); },
  item: function () {
    tone(660, 0.15, "triangle", 0.2);
    tone(880, 0.3, "triangle", 0.2, 0.12);
  },
  hurt: function () {
    tone(140, 0.35, "sawtooth", 0.2);
    tone(90, 0.4, "sawtooth", 0.2, 0.1);
  },
  magic: function () {
    tone(440, 0.2, "sine", 0.2);
    tone(554, 0.2, "sine", 0.2, 0.1);
    tone(659, 0.4, "sine", 0.2, 0.2);
  },
  win: function () {
    tone(523, 0.3, "triangle", 0.2);
    tone(659, 0.3, "triangle", 0.2, 0.25);
    tone(784, 0.3, "triangle", 0.2, 0.5);
    tone(1047, 0.7, "triangle", 0.2, 0.75);
  },
  lose: function () {
    tone(220, 0.5, "sawtooth", 0.2);
    tone(165, 0.5, "sawtooth", 0.2, 0.4);
    tone(110, 1.0, "sawtooth", 0.2, 0.8);
  }
};

function playSound(name) {
  if (sounds[name]) sounds[name]();
}

// ---------- Save and load ----------
function copyDefault() {
  return JSON.parse(JSON.stringify(defaultState));
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      // Merging with defaults keeps old saves from breaking after updates.
      return Object.assign(copyDefault(), JSON.parse(saved));
    } catch (e) {
      return copyDefault();
    }
  }
  return copyDefault();
}

let state = loadGame();
if (!scenes[state.scene]) state.scene = "start";

// ---------- Page elements ----------
const storyText = document.getElementById("story-text");
const stats = document.getElementById("stats");
const inventoryList = document.getElementById("inventory");
const gameBox = document.querySelector(".game");

// ---------- Helpers ----------
function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function has(item) {
  return state.inventory.includes(item);
}

function addItem(item) {
  if (!has(item)) {
    state.inventory.push(item);
  }
}

function removeItem(item) {
  state.inventory = state.inventory.filter(function (i) {
    return i !== item;
  });
}

function restartAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth; // forces the browser to replay the animation
  element.classList.add(className);
}

function checkDeath() {
  if (state.hp <= 0) {
    state.text += " Darkness swallows you. Press New Game to rise again.";
  }
}

// ---------- Story choices ----------
function goToScene(choice) {
  if (state.hp <= 0) return;

  if (choice.manaCost) {
    if (state.mana < choice.manaCost) {
      state.text = "You don't have enough mana to cast that.";
      update();
      return;
    }
    state.mana -= choice.manaCost;
  }

  if (choice.take) removeItem(choice.take);
  if (choice.give) addItem(choice.give);
  if (choice.mana) state.mana = Math.min(5, state.mana + choice.mana);
  if (choice.restore) {
    state.hp = 10;
    state.mana = 5;
  }

  const scene = scenes[choice.next];
  state.scene = choice.next;
  state.text = scene.text;
  if (scene.hp) state.hp = Math.max(0, state.hp + scene.hp);

  if (state.visited.indexOf(scene.place) === -1) {
    state.visited.push(scene.place);
  }

  playSound(scene.sound || "click");
  checkDeath();
  update();
}

function showChoices() {
  const box = document.getElementById("choices");
  box.innerHTML = "";

  if (state.hp <= 0) return;

  const scene = scenes[state.scene];

  if (scene.ending) {
    const again = document.createElement("button");
    again.textContent = "Play Again";
    again.addEventListener("click", newGame);
    box.appendChild(again);
    return;
  }

  scene.choices.forEach(function (choice) {
    if (choice.requires && !has(choice.requires)) return;
    if (choice.hideIf && has(choice.hideIf)) return;

    const btn = document.createElement("button");
    btn.textContent = choice.label;
    btn.addEventListener("click", function () {
      goToScene(choice);
    });
    box.appendChild(btn);
  });
}

// ---------- Explore (random events) ----------
const exploreEvents = [
  function () {
    state.hp = Math.max(0, state.hp - 2);
    return "A shadow lunges from the fog and claws at you. You lose 2 HP.";
  },
  function () {
    state.mana = Math.min(5, state.mana + 1);
    return "You find a glowing rune carved into an old tree. Mana +1.";
  },
  function () {
    addItem("Raven Feather");
    return "A raven watches you, then drops a feather at your feet. You found a Raven Feather.";
  },
  function () {
    return "You wander for hours. The woods are silent. Nothing happens... this time.";
  },
  function () {
    addItem("Moonstone");
    return "A pale stone hums in the grass. You found a Moonstone.";
  }
];

function explore() {
  if (state.hp <= 0) return;
  playSound("click");
  state.text = pick(exploreEvents)();
  checkDeath();
  update();
}

// ---------- Magic ----------
function castMagic() {
  if (state.hp <= 0) return;

  if (state.mana <= 0) {
    state.text = "You reach for your power, but nothing answers. You need more mana. Try exploring.";
    update();
    return;
  }

  state.mana--;
  playSound("magic");

  const spells = [
    function () {
      state.hp = Math.min(10, state.hp + 3);
      return "Violet light wraps around you. The pain fades. You heal 3 HP.";
    },
    function () {
      addItem("Shadow Orb");
      return "You pull darkness into your hands and shape it. You created a Shadow Orb.";
    },
    function () {
      return "You whisper a spell. The shadows shiver, then settle. Whatever it was, it's listening.";
    }
  ];

  state.text = pick(spells)();
  update();
}

// ---------- New game ----------
function newGame() {
  state = copyDefault();
  update();
}

// ---------- Map ----------
function showMap() {
  const box = document.getElementById("map");
  box.innerHTML = "";
  const current = scenes[state.scene].place;

  places.forEach(function (name) {
    const span = document.createElement("span");
    span.className = "place";

    if (state.visited.indexOf(name) !== -1) {
      span.textContent = name;
      span.classList.add("visited");
    } else {
      span.textContent = "???";
    }

    if (name === current) span.classList.add("current");
    box.appendChild(span);
  });
}

// ---------- Update the screen ----------
let shownHp = state.hp;
let shownItems = state.inventory.length;

function update() {
  storyText.textContent = state.text;
  restartAnimation(storyText, "fade-in");

  stats.textContent = "❤️ HP: " + state.hp + "   🔮 Mana: " + state.mana;

  // Hurt effect: shake the screen and play a sound
  if (state.hp < shownHp) {
    restartAnimation(gameBox, "shake");
    playSound(state.hp <= 0 ? "lose" : "hurt");
  }
  shownHp = state.hp;

  // New item sound
  if (state.inventory.length > shownItems) {
    playSound("item");
  }
  shownItems = state.inventory.length;

  inventoryList.innerHTML = "";
  if (state.inventory.length === 0) {
    inventoryList.innerHTML = "<li>Empty</li>";
  } else {
    state.inventory.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      inventoryList.appendChild(li);
    });
  }

  showChoices();
  showMap();
  saveGame();
}

// ---------- Sound button ----------
const soundBtn = document.getElementById("btn-sound");

function updateSoundButton() {
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
}

soundBtn.addEventListener("click", function () {
  soundOn = !soundOn;
  localStorage.setItem("shadowbound-sound", soundOn ? "on" : "off");
  updateSoundButton();
  playSound("click");
});

// ---------- Buttons ----------
document.getElementById("btn-explore").addEventListener("click", explore);
document.getElementById("btn-magic").addEventListener("click", castMagic);
document.getElementById("btn-reset").addEventListener("click", newGame);

// ---------- Start ----------
updateSoundButton();
update();