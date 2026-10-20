// ---------- Game state ----------
const SAVE_KEY = "shadowbound-save";

const defaultState = {
  hp: 10,
  mana: 3,
  inventory: [],
  scene: "start",
  text: "You wake at the edge of a moonlit forest. Behind you, a ruined shapel. Ahead, a fog-covered bridge. A hooded stranger stands in the middle of it, waiting."
};

const scenes = {
    start: {
        text: "You wake at ther edge of a moonlit forest. Behind you, a ruined chapel. Ahead, a fog-covered bridge. ded stranger stands in the middle of it, waiting.",
        choices: [
            { label: "Speak to the stranger", next: "stranger" },
            { label: "Sneak around the bridge", next: "river" },
            { label: "Enter the chapel", next: "chapel" }
        ]
    },
    stranger: {
        text: "The stranger lowers their hood. Their eyes glow violet. 'You are Shadowbound,' they whisper. 'The darkness chose you.' They offer you a cloak woven from midnight.",
        choices: [
            { label: "Accept the cloak", next:"cloak", give: "Midnight Cloak" },
            { label: "Refuse and walk away", next: "start" }
        ]
    },
    river: {
        text: "You slip down to the water. Something pale moves beneath the surface, and a hand grabs your ankle. You tear free, but not before it scratches you.",
        hp: -2,
        choices: [
            { label: "Climb back up", next: "start" },
            { label: "Follow the river", next: "cave" }
        ]
    },
    chapel: {
        text: "Inside the chapel, candles light themselves. On the altar lies a silver dagger and an old book that whispers your name.",
        choices: [
            { label: "Take the dagger", next: "chapel_done", give: "Silver Dagger" },
            { label: "Open the book", next: "chapel-done", give: "Whispering Book", mana: 2 }
        ]
    },
    chapel_done: {
        text: "The candles flicker out, one by one. Whatever you took from this place, it took something from the silence too. You step back outside.",
        choices: [
            { label: "Return to the bridge", next: "start" }
        ]
    },
    cloak: {
        text: "The cloak settles on your shoulder and the shadows bend toward you. The stranger vanishes into mist. The bridge is clear, and the forest feels like it knows you now. To be continued...",
        choices: [
            { label: "Begin again", next: "start" }
        ]
    },
    cave: {
        text: "The river leads to a cave mouth shaped like a screaming face. Cold air breathes out of it. To be continued...",
        choices: [
            { label: "Go back", next: "start" }
        ]
    }
};

let state = loadGame();

// ---------- Page elements ----------
const storyText = document.getElementById("story-text");
const stats = document.getElementById("stats");
const inventoryList = document.getElementById("inventory");

// ---------- Helpers ----------
function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function addItem(item) {
  if (!state.inventory.includes(item)) {
    state.inventory.push(item);
    return true;
  }
  return false;
}

// ---------- Scenes ----------
function goToScene(choice) {
    if (state.hp <= 0) return;

    if (choice.give) addItem(choice.give);
    if(choice.mana) state.mana = Math.min(5, state.mana + choice.mana);

    const scene = scenes[choice.next];
    state.scene = choice.next;
    state.text = scene.text;
    if (scene.hp) state.hp = Math.max(0, state.hp + scene.hp);

    checkDeath();
    update();
}

function showChoices() {
    const box = document.getElementById("choices");
    box.innerHTML = "";

    if (state.hp <= 0) return;

    const scene  = scenes[state.scene] || scenes.start;
    scene.choices.forEach(function (choice) {
        const btn = document.createElement("button");
        btn.textContent = choice.label;
        btn.addEventListener("click", function () {
            goToScene(choice);
        });
        box.appendChild(btn);
    });
}

// ---------- Explore ----------
const exploreEvents = [
  () => {
    addItem("Silver Key");
    return "Beneath a crooked gravestone, something glints. You found a Silver Key.";
  },
  () => {
    state.hp = Math.max(0, state.hp - 2);
    return "A shadow lunges from the fog and claws at you. You lose 2 HP.";
  },
  () => {
    state.mana = Math.min(5, state.mana + 1);
    return "You find a glowing rune carved into an old tree. Mana +1.";
  },
  () => {
    addItem("Raven Feather");
    return "A raven watches you, then drops a feather at your feet. You found a Raven Feather.";
  },
  () => "You wander for hours. The woods are silent. Nothing happens... this time.",
  () => {
    addItem("Moonstone");
    return "A pale stone hums in the grass. You found a Moonstone.";
  }
];

function explore() {
  if (state.hp <= 0) return;
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

  const spells = [
    () => {
      state.hp = Math.min(10, state.hp + 3);
      return "Violet light wraps around you. The pain fades. You heal 3 HP.";
    },
    () => {
      addItem("Shadow Orb");
      return "You pull darkness into your hands and shape it. You created a Shadow Orb.";
    },
    () => "You whisper a spell. The shadows shiver, then settle. Whatever it was, it's listening."
  ];

  state.text = pick(spells)();
  update();
}

// ---------- Death and reset ----------
function checkDeath() {
  if (state.hp <= 0) {
    state.text += " Darkness swallows you. Press New Game to rise again.";
  }
}

function newGame() {
  state = JSON.parse(JSON.stringify(defaultState));
  state.text = scenes.start.text;
  update();
}

// ---------- Save and load ----------
function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return JSON.parse(JSON.stringify(defaultState));
}

// ---------- Update the screen ----------
function update() {
  storyText.textContent = state.text;
  stats.textContent = "❤️ HP: " + state.hp + "   🔮 Mana: " + state.mana;

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
  saveGame();
}

// ---------- Buttons ----------
document.getElementById("btn-explore").addEventListener("click", explore);
document.getElementById("btn-magic").addEventListener("click", castMagic);
document.getElementById("btn-reset").addEventListener("click", newGame);

// ---------- Start ----------
update();