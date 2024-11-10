/// ==================================================
// SQControlRemapper.js
// ==================================================

//#region Plugin header
/*:
 * @target MZ
 * @plugindesc Custom Control Remapping Scene for MZ
 * @author Strange Qwarq
 *
 * @help
 * Provides an interface for remapping controls and selecting a gamepad. The
 * "addToOptions" menu will make this scene available in the default interface.
 * It was developed in a collaboration between Strange Qwarq
 * (https://qwarq.itch.io/) and Lunar Capital Studios (https://udomyon.com/bh/)
 * For custom interfaces, the scene can be activated with the script:
 *
 * SceneManager.push(Scene_SQControls);
 *
 * @ ======================================
 * @ Plugin Parameters
 * @ ======================================
 *
 * @param titleWindowHeight
 * @text Title Window Height
 * @type string
 * @description Height of the "Control Options" window as a percentage of the total screen height (between 0 and 1)
 * @default 0.12
 *
 * @param optionLabelWidth
 * @text Option Label Width
 * @type string
 * @description Width of the labels in the upper sub-window (e.g. "Reset to Defaults") as a percentage of the total screen height (between 0 and 1)
 * @default 0.25
 *
 * @param addToOptionsMenu
 * @text Add "Change Controls" option
 * @type boolean
 * @description Adds "Change Controls" to the standard options menu to access the control remapping scene
 * @default true
 *
 * @param optionsWindowHeight
 * @text Options Window Height
 * @type string
 * @description Height of the upper sub-window as a percentage of the total screen height (between 0 and 1)
 * @default 0.25
 *
 * @param subWindowBackground
 * @text Sub-Window Background Type
 * @type number
 * @description A number between 0 and 2 representing the type of background to use for the two sub-windows in the control remapping scene. 0 = dithered, 1 = semi-transparent, 2 = fully transparent
 * @default 0
 *
 * @param localizedStrings
 * @text Localized Text
 * @type multiline_string
 * @description Allow text appearing on the control remapping screen to be adjusted for localization.
 * @default {"window_header": "Control Options",
"device_label": "Controller",
"button_set_label": "Button Set",
"reset_defaults_label": "Reset to Defaults",
"function_label": "Function",
"controller_label": "Controller",
"keyboard_label": "Keyboard",
"reset_prompt": "Reset control options?\nThis action cannot be undone.",
"remap_controls": "Change Controls",
"ok": "OK",
"cancel": "Cancel",
"yes": "Yes",
"no": "No"}
 */
//#endregion


function Scene_SQControls() {
	this.initialize(...arguments);
}

(function() {
	const defaultStrings = {
		"window_header": "Control Options",
		"device_label": "Controller",
		"button_set_label": "Button Set",
		"reset_defaults_label": "Reset to Defaults",
		"function_label": "Function",
		"controller_label": "Controller",
		"keyboard_label": "Keyboard",
		"reset_prompt": "Reset control options?\nThis action cannot be undone.",
		"remap_controls": "Change Controls",
		"ok": "OK",
		"cancel": "Cancel",
		"yes": "Yes",
		"no": "No"
	};

	let params = PluginManager.parameters("SQControlRemapper");

	let uiWidth;
	let uiHeight;
	let windowMargin = 10;

	let titleWindowHeight         = Number(params["titleWindowHeight"] || 0.10);
	let optionLabelWidth          = Number(params["optionLabelWidth"] || 0.25);
	let optionsWindowHeight       = Number(params["optionsWindowHeight"] || 0.25);
	let gamepadSelectWindowWidth  = Number(params["gamepadSelectWindowWidth"] || 0.66);
	let resetControlsWindowHeight = Number(params["resetControlsWindowHeight"] || 0.45);
	let resetControlsWindowWidth  = Number(params["resetControlsWindowWidth"] || 0.6);
	let remapWindowTopMargin      = Number(params["remapWindowTopMargin"] || 60);

	let addToOptionsMenu = !!params["addToOptionsMenu"];

	let localizedStrings = defaultStrings;

	try {
		if (params["localizedStrings"]) {
			localizedStrings = JSON.parse(params["localizedStrings"]);
		}
	}
	catch(e) {
		// probably a json parsing error
	}

	let subWindowBackground = Number(params["subWindowBackground"] || 0);

	function getActiveGamepads() {
		let allGamepads = navigator.getGamepads();
		let activeGamepads = [];
		for (let g of allGamepads) {
			if (g) {
				activeGamepads.push(g);
			}
		}

		return activeGamepads;
	}

	Scene_SQControls.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_SQControls.prototype.constructor = Scene_SQControls;
	Scene_SQControls.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	}

	Scene_SQControls.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);

		uiWidth  = $dataSystem.advanced.uiAreaWidth;
		uiHeight = $dataSystem.advanced.uiAreaHeight;

		this.createTitleWindow();
		this.createMainWindow();

		this.createOptionsWindow();
		this.createControlsRemapWindow();

		// modal windows
		this.createRemapControlPromptWindow();
		this.createGamepadSelectWindow();
		this.createResetControlsWindow();
	}

	Scene_SQControls.prototype.createTitleWindow = function() {
		let rect = new Rectangle(0, 0, uiWidth - windowMargin, this.titleHeight());
		this._titleWindow = new Window_SQControlsTitle(rect);
		this.addWindow(this._titleWindow);
		this._titleWindow.deactivate();
	}

	Scene_SQControls.prototype.createMainWindow = function() {
		let rect = new Rectangle(0, this.titleHeight(), uiWidth - windowMargin, uiHeight - this.titleHeight() - windowMargin);
		this._mainWindow = new Window_SQControlsMain(rect);
		this._mainWindow.setHandler("cancel", this.popScene.bind(this));
		this._mainWindow.scene = this;
		this.addWindow(this._mainWindow);
		this._mainWindow.activate();
	}

	Scene_SQControls.prototype.createOptionsWindow = function() {
		let rect = new Rectangle(windowMargin, this.titleHeight() + 10, uiWidth - (windowMargin * 3), this.optionsHeight());
		this._optionsWindow = new Window_SQControlsOptions(rect);
		this._optionsWindow.setHandler("ok", this.changeOption.bind(this));
		this._optionsWindow.scene = this;
		this.addWindow(this._optionsWindow);
		this._optionsWindow.activate();
	}

	Scene_SQControls.prototype.createControlsRemapWindow = function() {
		let rect = new Rectangle(windowMargin, this.titleHeight() + this.optionsHeight() + remapWindowTopMargin, uiWidth - (windowMargin * 3), uiHeight - this.titleHeight() - this.optionsHeight() - remapWindowTopMargin - (2 * windowMargin));
		this._controlsWindow = new Window_SQControlsRemap(rect);
		this._controlsWindow.setHandler("ok", this.startRemap.bind(this));
		this._controlsWindow.scene = this;
		this.addWindow(this._controlsWindow);
		this._controlsWindow.deactivate();
	}

	Scene_SQControls.prototype.createRemapControlPromptWindow = function() {
		let height = 300;
		let width = 500;
		let rect = new Rectangle(uiWidth / 2 - width / 2, uiHeight / 2 - height / 2, width, height);
		this._remapPromptWindow = new Window_SQControlRemapPrompt(rect);
		this.addWindow(this._remapPromptWindow);
		this._remapPromptWindow._scene = this;
		this._remapPromptWindow.deactivate();
		this._remapPromptWindow.hide();
	}

	Scene_SQControls.prototype.createGamepadSelectWindow = function() {
		let height = navigator.getGamepads().length * (60 + 8);
		let width = 600;
		let rect = new Rectangle(uiWidth / 2 - width / 2, uiHeight / 2 - height / 2, width, height);
		this._gamepadSelectorWindow = new Window_SQGamepadSelector(rect);
		this.addWindow(this._gamepadSelectorWindow);
		this._gamepadSelectorWindow.setHandler("ok", this.confirmGamepadSelection.bind(this));
		this._gamepadSelectorWindow.setHandler("cancel", this.cancelGamepadSelection.bind(this));
		this._gamepadSelectorWindow.setHandler("cancel_button", this.cancelGamepadSelection.bind(this));
		this._gamepadSelectorWindow.deactivate();
		this._gamepadSelectorWindow.hide();
	}

	Scene_SQControls.prototype.createResetControlsWindow = function() {
		let height = uiHeight * resetControlsWindowHeight;
		let width = uiWidth * resetControlsWindowWidth;
		let rect = new Rectangle(uiWidth / 2 - width / 2, uiHeight / 2 - height / 2, width, height);
		this._resetWindow = new Window_SQResetControls(rect);
		this._resetWindow.scene = this;
		this.addWindow(this._resetWindow);
		this._resetWindow.setHandler("ok", this.confirmResetControls.bind(this));
		this._resetWindow.setHandler("cancel", this.cancelResetControls.bind(this));
		this._resetWindow.deactivate();
		this._resetWindow.hide();
	}

	Scene_SQControls.prototype.startGamepadSelection = function() {
		this._gamepadSelectorWindow.activate();
		this._gamepadSelectorWindow.show();
		this._gamepadSelectorWindow.refresh();

		this._mainWindow.deactivate();
		this._optionsWindow.deactivate();
		this._controlsWindow.deactivate();
		this._remapPromptWindow.deactivate();
	}

	Scene_SQControls.prototype.startResetControlsPrompt = function() {
		this._resetWindow.activate();
		this._resetWindow.show();
		this._resetWindow.refresh();
		this._resetWindow.smoothSelect(1);

		this._mainWindow.deactivate();
		this._optionsWindow.deactivate();
		this._controlsWindow.deactivate();
		this._remapPromptWindow.deactivate();
	}

	Scene_SQControls.prototype.confirmGamepadSelection = function() {
		let listIndex = this._gamepadSelectorWindow.index();
		let gamepadIndex = this._gamepadSelectorWindow.commandSymbol(listIndex);

		SQInput.setTargetGamepadIndex(gamepadIndex);
		ConfigManager.save();

		this.cancelGamepadSelection();
	}

	Scene_SQControls.prototype.cancelGamepadSelection = function() {
		this._mainWindow.activate();
		this._optionsWindow.activate();
		this._gamepadSelectorWindow.deactivate();
		this._gamepadSelectorWindow.hide();
	}

	Scene_SQControls.prototype.confirmResetControls = function() {
		let listIndex = this._resetWindow.index();
		if (listIndex === 0) {
			SQInput.resetMap();
			ConfigManager.save();
			SoundManager.playEquip();
			this._controlsWindow.paint();
		}

		this.cancelResetControls();
	}

	Scene_SQControls.prototype.cancelResetControls = function() {
		this._mainWindow.activate();
		this._optionsWindow.activate();
		this._resetWindow.deactivate();
		this._resetWindow.hide();
	}

	Scene_SQControls.prototype.startRemap = function() {
		let selectedIndex = this._controlsWindow.index();
		let indexMod = selectedIndex % 3;

		if (indexMod === 0) {
			// selected one of the labels. do nothing
			return;
		}

		this._controlsWindow.deactivate();
		this._mainWindow.deactivate();
		this._optionsWindow.deactivate();
		this._gamepadSelectorWindow.deactivate();
		this._remapPromptWindow.activate();
		this._remapPromptWindow.show();

		// each row of 4 is a separate function
		let targetFunction = SQInput.getInputByIndex(Math.floor(selectedIndex / 3));
		this._remapPromptWindow.setTargetFunction(targetFunction);

		if (indexMod === 2) {
			// start keyboard remapping
			this._remapPromptWindow.setKeyboardRemap();
			SQInput.onNextKeyboardInput(this.remapKeyboardInputHandler.bind(this, targetFunction));
		}
		else if (indexMod === 1) {
			// start gamepad remapping
			this._remapPromptWindow.setGamepadRemap();
			// Check on release so a long select press can be detected
			SQInput.onNextGamepadPress((() => {
				SQInput.onNextGamepadRelease(this.remapGamepadInputHandler.bind(this, targetFunction));
			}).bind(this));
		}

	}

	Scene_SQControls.prototype.remapKeyboardInputHandler = function(targetFunction, event) {
		// Don't map escape, since it's needed to reset controls
		if (event.which !== 27) {
			SQInput.setKeyboardButton(targetFunction.id, event.code);
			SoundManager.playOk();
			ConfigManager.save();
		}
		else {
			SoundManager.playCancel();
		}

		this.cancelRemap();
	}

	Scene_SQControls.prototype.remapGamepadInputHandler = function(targetFunction, buttonIndex, type) {
		if (type === "release") {
			SQInput.setGamepadButton(targetFunction.id, buttonIndex);
			SoundManager.playOk();
			ConfigManager.save();
		}

		this.cancelRemap();
	}

	Scene_SQControls.prototype.cancelRemap = function() {
		SQInput.cancelOnNextGamepadInput();
		SQInput.cancelOnNextKeyboardInput();

		this._mainWindow.deactivate();
		this._optionsWindow.deactivate();
		this._gamepadSelectorWindow.deactivate();
		this._remapPromptWindow.deactivate();
		this._remapPromptWindow.hide();

		setTimeout(() => {
			this._mainWindow.activate();
			this._controlsWindow.activate();
			this._controlsWindow.refresh();
		}, 250);
	}

	Scene_SQControls.prototype.changeOption = function() {
		let selectedIndex = this._optionsWindow.index();

		switch (selectedIndex) {
			case 0:
				this.startGamepadSelection();
				break;
			case 1:
				SQInput.nextButtonSet();
				ConfigManager.save();
				this._controlsWindow.refresh();
				this._optionsWindow.activate();
				break;
			case 2:
				this.startResetControlsPrompt();
				break;
		}

		this._optionsWindow.refresh();
	}

	Scene_SQControls.prototype.optionsHeight = function() {
		return uiHeight * optionsWindowHeight;
	}

	Scene_SQControls.prototype.titleHeight = function() {
		return uiHeight * titleWindowHeight;
	}

	///////////////////////////////
	// Small bordered window on the top of the screen that just shows the screen name "Control Options"
	function Window_SQControlsTitle() {
		this.initialize(...arguments);
	}

	Window_SQControlsTitle.prototype = Object.create(Window_Base.prototype);
	Window_SQControlsTitle.prototype.constructor = Window_Base;
	Window_SQControlsTitle.prototype.initialize = function(rect) {
		Window_Base.prototype.initialize.call(this, rect);
		this.drawText(localizedStrings["window_header"], 0, 0, uiWidth, "center");
	}


	///////////////////////////////
	// Just the background for the rest of the screen. The Options and Controls windows will be done
	// separately and placed on top of the main window because the other parts have different behaviors.
	// Also includes the headers for the list of controls. Putting it here keeps it from scrolling.
	function Window_SQControlsMain() {
		this.initialize(...arguments);
	}

	Window_SQControlsMain.prototype = Object.create(Window_Selectable.prototype);
	Window_SQControlsMain.prototype.constructor = Window_Selectable;
	Window_SQControlsMain.prototype.initialize = function(rect) {
		Window_Selectable.prototype.initialize.call(this, rect);
		this.refresh();
	}

	Window_SQControlsMain.prototype.paint = function() {
		this.drawControlsHeader();
	}

	// column width = 250
	Window_SQControlsMain.prototype.drawControlsHeader = function() {
		this.changeTextColor(ColorManager.systemColor());

		let textWidth = 250; //uiWidth * 0.33;
		let textY = (uiHeight * titleWindowHeight) + (uiHeight * optionsWindowHeight) - remapWindowTopMargin;

		this.drawText(localizedStrings["function_label"], 10, textY, textWidth, 'left');
		this.drawText(localizedStrings["controller_label"], 10 + (uiWidth / 3), textY, textWidth, 'left');
		this.drawText(localizedStrings["keyboard_label"], (2 * uiWidth / 3), textY, textWidth, 'left');
		this.changeTextColor(ColorManager.normalColor());
	}

	///////////////////////////////
	// Misc control options
	// Allows changing the current input device and button set
	function Window_SQControlsOptions() {
		this.initialize(...arguments);
	}
	Window_SQControlsOptions.prototype = Object.create(Window_Command.prototype);
	Window_SQControlsOptions.prototype.constructor = Window_Command;
	Window_SQControlsOptions.prototype.initialize = function(rect) {
		this._activeGamepadIndex = null;
		Window_Command.prototype.initialize.call(this, rect);
		this.setBackgroundType(subWindowBackground);
	}

	Window_SQControlsOptions.prototype.refresh = function() {
		this.contents.clear();

		this.clearCommandList();
		this.makeCommandList();
		this.drawAllItems();
	}

	Window_SQControlsOptions.prototype.makeCommandList = function() {
		this.addCommand(localizedStrings["device_label"], "controlDevice");
		this.addCommand(localizedStrings["button_set_label"], "controlButtonSet");
		this.addCommand(localizedStrings["reset_defaults_label"], "resetControlMapping");
	}

	Window_SQControlsOptions.prototype.drawAllItems = function() {
		this.resetTextColor();

		this.changePaintOpacity(true);

		// Device
		let rect = this.itemLineRect(0);
		this.drawText(this.commandName(0), rect.x, rect.y, rect.width, "left");
		this.drawCurrentDevice(rect.x + this.statusWidth() + 15, rect.y);

		// Button Set
		rect = this.itemLineRect(1);
		this.drawText(this.commandName(1), rect.x, rect.y, rect.width, "left");
		this.drawButtonSets(rect.x + this.statusWidth() + 15, rect.y);

		// Reset mapping
		rect = this.itemLineRect(2);
		this.drawText(this.commandName(2), rect.x, rect.y, rect.width, "left");
	}

	Window_SQControlsOptions.prototype.drawCurrentDevice = function(x, y) {
		let gamepads = getActiveGamepads();
		let textWidth = uiWidth * 0.92;
		if (gamepads.length) {
			if (this._activeGamepadIndex === null) {
				this._activeGamepadIndex = 0;
			}

			this.drawText(gamepads[this._activeGamepadIndex].id, x, y, textWidth, "left");
		}
	}

	Window_SQControlsOptions.prototype.drawButtonSets = function(x, y) {
		for (let i = 0; i < SQInput.numButtonSets; i++) {
			this.changePaintOpacity(SQInput.getButtonSet() === i);
			this.drawButtonSet(i, x + (ImageManager.iconWidth * 4.2 * i) , y);
		}
		this.changePaintOpacity(true);
	}

	Window_SQControlsOptions.prototype.drawButtonSet = function(setIndex, x, y) {
		ImageManager.setIconImage(SQInput.buttonIconSet);
		for (let i = 0; i < 4; i++) {
			this.drawIcon(this.buttonSetIconOffset() + (setIndex * SQInput.buttonSetSize) + i + 8, x + (i * ImageManager.iconWidth), y);
		}
		ImageManager.resetIconImage();
	}

	Window_SQControlsOptions.prototype.selectNextButtonSet = function() {
		SQInput.changeButtonSet(SQInput.getButtonSet() + 1);
		this.refresh();
	}

	Window_SQControlsOptions.prototype.cursorDown = function() {
		if (this.index() === 2) {
			this.deactivate();
			this.scene._controlsWindow.activate();
			this.scene._controlsWindow.smoothSelect(-2);
			SoundManager.playCursor();
		}
		else {
			Window_Command.prototype.cursorDown.call(this);
		}
	}

	Window_SQControlsOptions.prototype.statusWidth = function() {
		return uiWidth * optionLabelWidth;
	}

	Window_SQControlsOptions.prototype.buttonSetIconOffset = function() {
		return SQInput.baseControlIconIndex;
	}

	Window_SQControlsOptions.prototype.iconsPerButtonSet = function() {
		return 16;
	}

	Window_SQControlsOptions.prototype.numButtonSets = function() {
		return 4;
	}

	Window_SQControlsOptions.prototype.lineHeight = function() {
		return 36;
	}

	///////////////////////////////
	// Controls Remap
	function Window_SQControlsRemap() {
		this.initialize(...arguments);
	}

	Window_SQControlsRemap.prototype = Object.create(Window_Command.prototype);
	Window_SQControlsRemap.prototype.constructor = Window_Command;
	Window_SQControlsRemap.prototype.initialize = function(rect) {
		Window_Command.prototype.initialize.call(this, rect);
		this.setBackgroundType(subWindowBackground);
		this.forceSelect(1);
	}

	Window_SQControlsRemap.prototype.makeCommandList = function() {
		for (let key in SQInput.inputs) {
			let cf = SQInput.inputs[key];
			this.addCommand(cf.fieldTitle, "field_" + key, false);
			this.addCommand(cf.fieldTitle, "kb_" + key);
			this.addCommand(cf.fieldTitle, "gp_" + key);
		}
	}


	Window_SQControlsRemap.prototype.drawAllItems = function() {
		ImageManager.setIconImage("SQIcons");
		let i = 0;
		for (let key in SQInput.inputs) {
			let cf = SQInput.inputs[key];
			let rect = this.itemRect(i++);
			this.drawText(cf.fieldTitle, rect.x, rect.y, 210, 'left');

			rect = this.itemRect(i++);
			this.drawTextEx(` \x1bJP[${cf.gamepadButton}]`, rect.x, rect.y, 25);

			rect = this.itemRect(i++);
			this.drawTextEx(` \x1bKB[${cf.keyboardButton}]`, rect.x, rect.y, 25);
		}
		ImageManager.resetIconImage();
	}

	Window_SQControlsRemap.prototype.cursorUp = function() {
		if (this.index() <= 2) {
			this.deactivate();
			this.scene._optionsWindow.activate();
			this.scene._optionsWindow.forceSelect(2);
			SoundManager.playCursor();
		}
		else {
			Window_Selectable.prototype.cursorUp.call(this);
		}
	}

	Window_SQControlsRemap.prototype.cursorLeft = function() {
		let mod = this.index() % 3;
		if (mod <= 1) {
			this.smoothSelect(this.index() - mod + 2);
		}
		else {
			this.smoothSelect(this.index() - mod + 1);
		}
	}

	Window_SQControlsRemap.prototype.cursorRight = function() {
		let mod = this.index() % 3;
		if (mod === 2) {
			this.smoothSelect(this.index() - mod + 1);
		}
		else {
			this.smoothSelect(this.index() - mod + 2);
		}
	}

	Window_SQControlsRemap.prototype.maxCols = function() {
		return 3;
	}

	///////////////////////////////
	//
	function Window_SQControlRemapPrompt() {
		this.initialize(...arguments);
	}


	Window_SQControlRemapPrompt.prototype = Object.create(Window_Base.prototype);
	Window_SQControlRemapPrompt.prototype.constructor = Window_Base;
	Window_SQControlRemapPrompt.prototype.initialize = function(rect) {
		Window_Base.prototype.initialize.call(this, rect);
		this.text = "";
		this.refresh();
	}

	Window_SQControlRemapPrompt.prototype.update = function() {
		Window_Base.prototype.update.call(this);

		// isLongPressed only looks for the action and can't query a specific button on a controller
		// look directly at the gamepad state and the press time instead
		let selectPressed = false;
		if (SQInput.activeGamepadIndex !== null) {
			let state = Input._gamepadStates[SQInput.activeGamepadIndex];
			if (state) {
				selectPressed = state[8];
			}
		}

		if (this.active && (selectPressed && Input._pressedTime >= 24 || Input.isPressed("static_escape"))){
			SoundManager.playCancel();
			this._scene.cancelRemap();
		}
	}

	Window_SQControlRemapPrompt.prototype.setTargetFunction = function(f) {
		this.targetFunction = f;
	}

	Window_SQControlRemapPrompt.prototype.setKeyboardRemap = function() {
		ImageManager.setIconImage(SQInput.buttonIconSet);
		this.text = `Press a keyboard key for [${this.targetFunction.fieldTitle}]\n\n(\x1bKB[Escape] or hold \x1bJP[8] to cancel)`;
		this.refresh();
		ImageManager.resetIconImage();
	}

	Window_SQControlRemapPrompt.prototype.setGamepadRemap = function() {
		ImageManager.setIconImage(SQInput.buttonIconSet);
		this.text = `Press a button for [${this.targetFunction.fieldTitle}]\n\n(\x1bKB[Escape] or hold \x1bJP[8] to cancel)`;
		this.refresh();
		ImageManager.resetIconImage();
	}

	Window_SQControlRemapPrompt.prototype.refresh = function() {
		if (this.contents) {
			this.contents.clear();
			this.contentsBack.clear();
			this.drawTextEx(this.text, 10, 20, 300);
		}
	}


	///////////////////////////////
	// Displays a list of detected gamepads and lets the player choose which one should be active
	function Window_SQGamepadSelector() {
		this.initialize(...arguments);
	}

	Window_SQGamepadSelector.prototype = Object.create(Window_Command.prototype);
	Window_SQGamepadSelector.prototype.constructor = Window_Command;
	Window_SQGamepadSelector.prototype.initialize = function(rect) {
		this.gamepads = getActiveGamepads();
		Window_Command.prototype.initialize.call(this, rect);
	}

	Window_SQGamepadSelector.prototype.makeCommandList = function() {
		for (let g of getActiveGamepads()) {
			this.addCommand(g.id, g.index);
		}

		this.addCommand(" " + localizedStrings["cancel"], "cancel_button");
	}

	Window_SQGamepadSelector.prototype.update = function() {
		Window_Command.prototype.update.call(this);

		if (this.active) {
			let currentGamepads = getActiveGamepads();
			if (this.gamepads.length !== currentGamepads.length) {
				this.gamepads = currentGamepads;
				this.refresh();
			}
		}
	}

	Window_SQGamepadSelector.prototype.drawAllItems = function() {
		this.gamepads = navigator.getGamepads();
		Window_Selectable.prototype.drawAllItems.call(this);
	}

	Window_SQGamepadSelector.prototype.drawItem = function(index) {
		let rect = this.itemRect(index);
		if (this.gamepads[index]) {
			this.drawText(this.gamepads[index].id, rect.x, rect.y, 600, "left");
		}
		else {
			this.drawText("Cancel", rect.x, rect.y, 600, "left");
		}

	}

	///////////////////////////////
	// Displays a confirmation dialog for resetting control mapping to the default
	function Window_SQResetControls() {
		this.initialize(...arguments);
	}

	Window_SQResetControls.prototype = Object.create(Window_Command.prototype);
	Window_SQResetControls.prototype.constructor = Window_SQResetControls;
	Window_SQResetControls.prototype.initialize = function(rect) {
		Window_Command.prototype.initialize.call(this, rect);
	}

	// Draw the prompt text, then the OK/Cancel options
	Window_SQResetControls.prototype.drawAllItems = function() {
		let padding = 10;
		this.drawTextEx(localizedStrings["reset_prompt"], padding, padding, 400 - (padding * 2));
		Window_Command.prototype.drawAllItems.call(this);
	}

	// Offset items to be below the prompt text
	Window_SQResetControls.prototype.itemRect = function(index) {
		let rect = Window_Command.prototype.itemRect.call(this, index);
		rect.y += 100;
		return rect;
	};

	Window_SQResetControls.prototype.makeCommandList = function() {
		this.addCommand(localizedStrings["ok"], "0");
		this.addCommand(localizedStrings["cancel"], "1");
	}

	///////////////////////////////
	// Override the default options menu to add an item to open the control remapper
	let Window_Options_base_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
	Window_Options.prototype.addGeneralOptions = function() {
		Window_Options_base_addGeneralOptions.call(this);

		if (addToOptionsMenu) {
			this.addCommand(localizedStrings["remap_controls"], "remapControls");
		}
	};

	let Window_Options_base_changeValue = Window_Options.prototype.changeValue;
	Window_Options.prototype.changeValue = function(symbol, value) {
		Window_Options_base_changeValue.call(this, symbol, value);
		if (symbol === "remapControls") {
			SceneManager.push(Scene_SQControls);
		}
	};

	let Window_Options_base_statusText = Window_Options.prototype.statusText;
	Window_Options.prototype.statusText = function(index) {
		const symbol = this.commandSymbol(index);
		if (symbol === "remapControls") {
			return "";
		}

		return Window_Options_base_statusText.call(this, index);
	};
})();
