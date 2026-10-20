// ---------- Game state ----------
const SAVE_KEY = "shadowbound-save";

const defaultState = {
  hp: 10,
  mana: 3,
  inventory: [],
  text: "The night is quiet. Something in the shadows is waiting for you..."
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

  saveGame();
}

// ---------- Buttons ----------
document.getElementById("btn-explore").addEventListener("click", explore);
document.getElementById("btn-magic").addEventListener("click", castMagic);
document.getElementById("btn-reset").addEventListener("click", newGame);

// ---------- Start ----------
update();