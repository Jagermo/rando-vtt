const Rando = {
  settings: {
    hotkey: "z"
  },

  init() {
    game.settings.register("rando", "hotkey", {
      name: "Rando Hotkey",
      hint: "Set the key used to randomly select one of the selected tokens.",
      scope: "client",
      config: true,
      type: String,
      default: "z",
      onChange: value => {
        Rando.settings.hotkey = value.toLowerCase();
        console.log(`Rando | Hotkey updated to '${Rando.settings.hotkey}'`);
      }
    });

    Rando.settings.hotkey = game.settings.get("rando", "hotkey").toLowerCase();
  },

  onKeyDown(event) {
    const pressedKey = event.key.toLowerCase();
    if (pressedKey !== Rando.settings.hotkey || !game.user.isGM) return;

    const selectedTokens = canvas.tokens.controlled;
    const untargeted = selectedTokens.filter(t => !t.isTargeted);

    if (selectedTokens.length < 2) {
      ui.notifications.warn("Select two or more tokens.");
      return;
    }
    if (untargeted.length === 0) {
      ui.notifications.warn("All selected tokens are already targeted.");
      return;
    }

    const chosen = untargeted[Math.floor(Math.random() * untargeted.length)];
    chosen._onHoverIn();
    chosen._onHoverOut();
    chosen.control();
    game.user.updateTokenTargets([chosen.document.id]);

    canvas.pings.request({
      x: chosen.center.x,
      y: chosen.center.y,
      user: game.user,
      scene: game.scenes.active,
      type: "pulse"
    });

    ChatMessage.create({
      content: `🎯 <strong>Rando chooses ${chosen.name}</strong>`,
      speaker: { alias: "Rando" }
    });
  }
};

Hooks.once("init", () => {
  console.log("Rando | Initializing...");
  Rando.init();
});

Hooks.once("ready", () => {
  document.addEventListener("keydown", Rando.onKeyDown);
});
