// ==================================================
// Strange Qwarq Input
// ==================================================

//#region Plugin header
/*:
 * @target MZ
 * @plugindesc Input overhaul for MZ
 * @author Strange Qwarq
 *
 * @help
 * This plugin makes significant changes to the default RMMZ input system. It
 * was developed in a collaboration between Strange Qwarq
 * (https://qwarq.itch.io/) and Lunar Capital Studios
 * (https://udomyon.com/bh/):
 * - Allows controls to be remapped using any keyboard key or gamepad button
 *
 * - Adds support for the missing standard gamepad buttons (lt, rt, select,
 *   start, l3, r3)
 *
 * - Allows choosing a preferred gamepad and prioritizing inputs from that
 *
 * - Only the active gamepad will be polled
 *
 * - Adds escape commands for text rendering, allowing the mapped button icon
 *   to be displayed
 *
 * - Adds support for escape command parameters to include letters and
 *   underscores, so control names can be used
 *
 * - Adds a custom control function layer
 *
 * - Keeps track of the last device (keyboard or gamepad) that was used and
 *   adjusts displays based on it
 *
 * - Allows the user to choose one of several button sets, which changes the
 *   icons displayed for gamepad inputs
 *
 * - Adds a failsafe for control remapping in case the user puts it in an
 *   unrecoverable state (hold ESC and Tab for 5 seconds)
 *
 * - Adds automatic system-level saving and loading of control options
 *
 * Default input function names are: up, down, left, right, cancel, confirm,
 *   menu and dash
 *
 * Functions represent an action that can occur in the game, such as confirming
 * an option, opening the menu, or moving in a cardinal direction. Keys and/or
 * buttons are assigned to these functions to allow them to fire. RPG Maker
 * only has a few specific functions that it looks for by default, they are:
 * ok, cancel, menu, up, down, left, right, shift. Functions with these names are
 * available by default, even if not defined in the Controls parameter. By
 * default they use the same keys and buttons as RPG Maker's originals, but
 * they can be overridden via the SQControlRemapper scene, or by adding items
 * to the Controls parameter with the same name as the default. For example,
 * if you want to change "ok" function to activate when pressing "enter" on
 * the keyboard, instead of the default of "z', an entry in Controls with the
 * name "ok" and the desired default inputs can be added.
 *
 * Custom functions can be created by using a new name for a Controls entry.
 * They can be used in custom scripts or plugins to have additional effects
 * based on non-standard inputs. For example,
 *
 * Input function can be customized using the Controls parameter. This is an
 * array of objects. Each object contains:
 * - name: a unique name to identify the input function.
 *
 * Additional control names can be added through the customControls parameter.
 * Custom controls are not checked by normal RPG Maker processes but can be
 * used in custom scripts with the standard Input functions:
 *
 * Input.isTriggered(name) : Returns true on the first frame that the given
 * control's input is pressed
 *
 * Input.isPressed(name) : Returns true when the given control's input is
 * currently pressed.
 *
 * Input.isRepeated(name) : Returns true when the given control's input has
 * been held for 24 frames.
 *
 * Additional codes for embedding icons in text:
 *
 * \CTRL[name] to draw the icon for the mapped key on the last-used device.
 * e.g.: \CTRL["ok"] will show the keyboard or gamepad icon associated with
 * the "ok" function.
 *
 * \KBCTRL[name] shows the keyboard icon only. e.g. \KBCTRL["cancel"] will
 * show specifically the keyboard icon for the cancel function.
 *
 * \JPCTRL[name] shows the gamepad icon only. e.g. \JPCTRL["menu"] will show
 *  specifically the gamepad icon for the menu function.
 *
 * Two scaled-down icons can be drawn together in the space of one icon. This
 * is intended for multi-part inputs like diagonals or displaying both keyboard
 * and gamepad inputs in a more compact way. The codes use the following format:
 *
 * \DBL|CODE1|CODE2[name1|name2]
 * CODE1 and CODE2 refer to the above custom codes CTRL, KBCTRL and JPCTRL.
 * name1 and name2 are the names of the inputs.
 *
 * For example, displaying the down-right diagonal icons using the active
 * control method would look this: \DBL|CTRL|CTRL[down|right]
 *
 * Or displaying both the keyboard and gamepad input for the menu would look
 * like this: \DBL|KBCTRL|JPCTRL[menu|menu]
 *
 * Icons for all supported buttons and keys are provided in the template file
 * img/system/SQIcons.png. It's recommended to either edit this file with your
 * own version of the icons, or specify your own icons file using the
 * "buttonIconFile" parameter.
 *
 * The default icon set is based on Mr. Breakfast's Free Prompts:
 * https://mrbreakfastsdelight.itch.io/mr-breakfasts-free-prompts
 *
 * Additional input functionality:
 *
 * Input.getLeftJoystick() : Returns the x and y values for the left gamepad
 * joystick
 *
 * Input.getRightJoystick() : Returns the x and y values for the right gamepad
 * joystick
 *
 * These functions can be used in scripts or plugins to get the exact analog
 * value of each joystick. They return a Javascript object with keys "x" and "y",
 * each having float values representing the stick's position in that axis.
 * Values range from -1 to 1, with 0 being neutral.
 *
 * @ ==========================================================================
 * @ Plugin Parameters
 * @ ==========================================================================
 *
 * @param buttonSetCount
 * @text Number of Button Sets
 * @type number
 * @description The number of controller button sets included in the icons file. Maximum of 4.
 * @default 4
 *
 * @param buttonIconFile
 * @text Button Icons File
 * @type string
 * @description Name of the file containing button icons. The file should exist in img/system.
 * @default SQIcons
 *
 * @param iconOffset
 * @text Button Icons Offset
 * @type number
 * @description If the buttons icon file contains other icons, such as if the standard icons set was expanded to include button icons, this value represents how many icons to skip in order to get to the first button icon.
 * @default 0
 *
 * @param customControls
 * @text Controls
 * @type struct<Control>[]
 * @description A list of custom controls. The default controls are: up, down, left, right, ok, cancel and menu. Adding a custom control with one of these as its name allows overriding the defaults.
 */
/*~struct~Control:
 * @param name
 * @text Name
 * @type string
 * @desc The name of the control. This is used internally to refer to the control
 *
 * @param title
 * @text Title
 * @type string
 * @desc Text to display on the control remapping scene for this control
 *
 * @param keyboardInput
 * @text Default Keyboard Input
 * @type string
 * @desc Identifier for this control's default keyboard input, such as "KeyX", or "ArrowDown". The identifiers are javascript keyboard codes. A list of possible codes is available here: https://www.toptal.com/developers/keycode/table
 *
 * @param controllerInput
 * @text Default Controller Input
 * @type select
 * @option Face Button A
 * @value 0
 * @option Face Button B
 * @value 1
 * @option Face Button X
 * @value 2
 * @option Face Button Y
 * @value 3
 * @option Left Bumper
 * @value 4
 * @option Right Bumper
 * @value 5
 * @option Left Trigger
 * @value 6
 * @option Right Trigger
 * @value 7
 * @option Select
 * @value 8
 * @option Start
 * @value 9
 * @option L3
 * @value 10
 * @option R3
 * @value 11
 * @option D-pad Up
 * @value 12
 * @option D-pad Down
 * @value 13
 * @option D-pad Left
 * @value 14
 * @option D-pad Right
 * @value 15
 * @desc Identifier for this control's default controller input
 */
//#endregion


function SQInput() {
	throw new Error("SQInput is a static class");
}

(function() {
	let sqInputParams = PluginManager.parameters("SQInput");

	// Backup the default input maps
	SQInput.defaultKeyboardMap = Object.create(Input.keyMapper);
	SQInput.defaultGamepadMap = Object.create(Input.gamepadMapper);

	// RPGMaker checks for specific keys when handling input. In order to avoid rewriting every input check
	// in the engine, there needs to be a map between the key that the standard input module is checking for and
	// the corresponding action in the custom input handler
	SQInput.RMMZtoSQ = {
		gamepad: {
			ok: "confirm",
			cancel: "cancel",
			menu: "menu",
			up: "up",
			down: "down",
			left: "left",
			right: "right",
		}
	};

	// The gamepad icons aren't in the same order as the bit field representing the pressed buttons
	// Map the index of the button in the bit field to the appropriate icon index
	SQInput.gamepadIndexToIconIndex = {
		14: 0,
		12: 1,
		15: 2,
		13: 3,
		10: 4,
		11: 5,
		9: 6,
		8: 7,
		3: 8,
		1: 9,
		0: 10,
		2: 11,
		4: 12,
		5: 13,
		6: 14,
		7: 15
	};

	// Default functions
	SQInput.inputs = {
		up: {
			name: "up",
			fieldTitle: "Up",
			keyboardButton: 'ArrowUp',
			gamepadButton: 12,
		},
		down: {
			name: "down",
			fieldTitle: "Down",
			keyboardButton: 'ArrowDown',
			gamepadButton: 13,
		},
		left: {
			name: "left",
			fieldTitle: "Left",
			keyboardButton: 'ArrowLeft',
			gamepadButton: 14,
		},
		right: {
			name: "right",
			fieldTitle: "Right",
			keyboardButton: 'ArrowRight',
			gamepadButton: 15,
		},
		cancel: {
			name: "cancel",
			fieldTitle: "Cancel",
			keyboardButton: 'KeyX', // X
			gamepadButton: 1,
		},
		confirm: {
			name: "confirm",
			fieldTitle: "Confirm",
			keyboardButton: 'KeyZ', // Z
			gamepadButton: 0,
		},
		menu: {
			name: "menu",
			fieldTitle: "Menu",
			keyboardButton: "KeyS", // S
			gamepadButton: 3,
		},
		dash: {
			name: "dash",
			fieldTitle: "Dash",
			keyboardButton: "KeyQ",
			gamepadButton: 6, // Left Trigger
		},
		cycle_right: {
			name: "pageup",
			fieldTitle: "Page Up",
			keyboardButton: "PageUp",
			gamepadButton: 7,
		},
		cycle_left: {
			name: "pagedown",
			fieldTitle:  "Page Down",
			keyboardButton: "PageDown",
			gamepadButton: 8
		},
	};


	// A version of the default mapper that includes entries for all of the gamepad buttons. This encourages
	// the default gamepad system to pick up values for all standard buttons.
	SQInput.gamepadMapper = {
		0: "ok", // A
		1: "cancel", // B
		2: "shift", // X
		3: "menu", // Y
		4: "pageup", // LB
		5: "pagedown", // RB
		6: "lt",
		7: "rt",
		8: "select",
		9: "start",
		10: "l3",
		11: "r3",
		12: "up", // D-pad up
		13: "down", // D-pad down
		14: "left", // D-pad left
		15: "right" // D-pad right
	};

	SQInput.codeToIconIndex = {
		"ArrowLeft": 0,
		"ArrowUp": 1,
		"ArrowRight": 2,
		"ArrowDown": 3,
		null: 0,
		"Enter": 1,
		"Space": 2,
		"ControlLeft": 3,
		"ControlRight": 3,
		"ShiftLeft": 4,
		"ShiftRight": 4,
		"AltLeft": 5,
		"AltRight": 5,
		"Tab": 6,
		"Backspace": 7,
		"Insert": 8,
		"Delete": 9,
		"Home": 10,
		"End": 11,
		"PageUp": 12,
		"PageDown": 13,
		"CapsLock": 14,
		"Pause": 15,
		"Digit0": 16,
		"Digit1": 17,
		"Digit2": 18,
		"Digit3": 19,
		"Digit4": 20,
		"Digit5": 21,
		"Digit6": 22,
		"Digit7": 23,
		"Digit8": 24,
		"Digit9": 25,
		"Numpad0": 16,
		"Numpad1": 17,
		"Numpad2": 18,
		"Numpad3": 19,
		"Numpad4": 20,
		"Numpad5": 21,
		"Numpad6": 22,
		"Numpad7": 23,
		"Numpad8": 24,
		"Numpad9": 25,
		// "Digit1": 26,
		"Slash": 27,
		"Equal": 28,
		"Minus": 29,
		//"Digit8": 30,
		//"Equal": 31,
		"KeyA": 32,
		"KeyB": 33,
		"KeyC": 34,
		"KeyD": 35,
		"KeyE": 36,
		"KeyF": 37,
		"KeyG": 38,
		"KeyH": 39,
		"KeyI": 40,
		"KeyJ": 41,
		"KeyK": 42,
		"KeyL": 43,
		"KeyM": 44,
		"KeyN": 45,
		"KeyO": 46,
		"KeyP": 47,
		"KeyQ": 48,
		"KeyR": 49,
		"KeyS": 50,
		"KeyT": 51,
		"KeyU": 52,
		"KeyV": 53,
		"KeyW": 54,
		"KeyX": 55,
		"KeyY": 56,
		"KeyZ": 57,
		231: 58,
		//"KeyN": 59,
		//"Digit2": 60,
		//"Digit3": 61,
		//"Digit7": 62,
		//"Digit5": 63,
		//"Slash": 64,
		"Backslash": 65,
		"BracketLeft": 66,
		"BracketRight": 67,
		//"Digit9": 68,
		//"Digit0": 69,
		//"BracketLeft": 70,
		//"BracketRight": 71,
		"Comma": 72,
		"Period": 73,
		"Quote": 74,
		"Backquote": 75,
		//"KeyU": 76,
		//"Digit6": 77,
		//"Backquote": 78,
		//"Minus": 79,
		//"Quote": 80,
		//"Quote": 81,
		//"Backslash": 82,
		//"Period": 83,
		//"Comma": 84,
		"Semicolon": 85,
		// "Semicolon": 86,
		//"Backslash": 87,
		//"Digit3": 88,
		//"Digit5": 89,
		//"KeyY": 90,
		//"Digit4": 91,
		//"KeyK": 92,
		//"Digit6": 93,
		//"Backslash": 94,
		"Escape": 95
	}

	// The last device used. Either K for keyboard or G for gamepad. This can affect which icons are drawn
	SQInput.lastInputDevice = "keyboard";

	SQInput.buttonIconSet = sqInputParams["buttonIconFile"] || "SQIcons";

	// Icon index where the control icons begin
	SQInput.baseControlIconIndex = Number(sqInputParams["iconOffset"] || 0);

	SQInput.customControls = sqInputParams["customControls"] ? JSON.parse(sqInputParams["customControls"]) : [];

	// Number of buttons in each set of controller button icons
	SQInput.buttonSetSize = 16;

	SQInput.maxButtonSets = 4;

	// How many different types of buttons
	SQInput.numButtonSets = Math.min(Number(sqInputParams["buttonSetCount"]), SQInput.maxButtonSets) || 4;

	// Icon to use if no other icon is available
	SQInput.defaultButtonIcon = SQInput.baseControlIconIndex + (SQInput.buttonSetSize * SQInput.maxButtonSets);

	// Icon index where keyboard icons start
	SQInput.baseKeyboardIconIndex = SQInput.baseControlIconIndex + (SQInput.buttonSetSize * SQInput.maxButtonSets);

	// Index of the button set that should be used
	SQInput.activeButtonSet = 0;

	// Index of the gamepad being used. Defaults to the first active gamepad.
	SQInput.activeGamepadIndex = null;

	// Name of the gamepad selected by users in the gamepad selection window of the controls menu
	// This is saved and checked whenever the user switches to gamepad input. If a device with this
	// name is connected, it will be prioritized
	SQInput.targetGamepadName = null;

	SQInput.initialize = function() {
		// Save the default button values for SQ functions so they can be restored if needed
		for (let i in this.inputs) {
			this.inputs[i].defaultKeyboardButton = this.inputs[i].keyboardButton;
			this.inputs[i].defaultGamepButton = this.inputs[i].gamepadButton;
			this.inputs[i].id = i;
		}

		Input._gamepadAxes = {};

		// Add a new listener to detect when the keyboard is used and so any key pressed can be detected
		// when remapping a key
		document.addEventListener("keydown", this.nextKeyboardInputHandler.bind(SQInput));
		document.addEventListener("gamepaddisconnected", this.updateActiveGamepad);
		document.addEventListener("gamepadconnected", this.updateActiveGamepad);

		ImageManager.currentIconSet = "IconSet";
		ImageManager.loadSystem(SQInput.buttonIconSet);

		SQInput.initCustomControls();
	}

	SQInput.initCustomControls = function() {
		for (let c of SQInput.customControls) {
			let control = JSON.parse(c);
			if (!(control.name in SQInput.inputs)) {
				SQInput.inputs[control.name] = {};
			}

			SQInput.inputs[control.name].name = control.name;
			SQInput.inputs[control.name].fieldTitle = control.title;
			SQInput.inputs[control.name].keyboardButton = control.keyboardInput;
			SQInput.inputs[control.name].gamepadButton = control.controllerInput;
			SQInput.inputs[control.name].id = control.name;
		}

		this.rebuildButtonMapper();
	}

	SQInput.getInputByIndex = function(index) {
		let keys = Object.keys(this.inputs);
		return this.inputs[keys[index]];
	}


	// Restores the SQ default controls
	SQInput.resetMap = function() {
		for (let i in this.inputs) {
			let input = this.inputs[i];
			input.keyboardButton = input.defaultKeyboardButton;
			input.gamepadButton = input.defaultGamepButton;
		}

		this.rebuildButtonMapper();
	}


	// Replaces Input.keyMapped and Input.gamepadMapper with a new object generated using the SQ control mapping
	// This is the part that actually changes the controls.
	SQInput.rebuildButtonMapper = function() {
		let newKeyboardMap = {};
		for (let i in this.inputs) {
			let input = this.inputs[i];
			newKeyboardMap[input.keyboardButton] = [i];
		}

		// Always ensure the escape and shift keys are available for the last resort control remap reset
		if (!newKeyboardMap["Tab"]) {
			newKeyboardMap["Tab"] = ['static_tab'];
		}

		if (!newKeyboardMap["Escape"]) {
			newKeyboardMap["Escape"] = ['static_escape'];
		}

		// Map some button names that RMMZ looks for so the existing input checks will still work
		newKeyboardMap[this.inputs["cancel"].keyboardButton] = ["cancel"];
		newKeyboardMap[this.inputs["confirm"].keyboardButton] = ["confirm"];
		newKeyboardMap[this.inputs["confirm"].keyboardButton].push("ok");
		newKeyboardMap[this.inputs["dash"].keyboardButton] = ["shift"];
		newKeyboardMap[this.inputs["cycle_left"].keyboardButton] = ["pageup"];
		newKeyboardMap[this.inputs["cycle_right"].keyboardButton] = ["pagedown"];

		Input.keyMapper = newKeyboardMap;

		let newGamepadMap = [];

		for (let i in this.inputs) {
			let input = this.inputs[i]

			if (!(input.gamepadButton in newGamepadMap)) {
				newGamepadMap[input.gamepadButton] = [];
			}

			newGamepadMap[input.gamepadButton].push(i);
		}

		// Merge the base custom gamepad mapper. This will encourage the engine to check for all of the controller buttons
		// so that their states can be checked later
		for (let button in this.gamepadMapper) {
			if (!(button in newGamepadMap)) {
				newGamepadMap[button] = [];
			}
		}

		newGamepadMap[this.inputs["cancel"].gamepadButton] = ["cancel"];
		newGamepadMap[this.inputs["confirm"].gamepadButton] = ["confirm"];
		newGamepadMap[this.inputs["confirm"].gamepadButton].push("ok");
		newGamepadMap[this.inputs["dash"].gamepadButton] = ["shift"];

		Input.gamepadMapper = newGamepadMap;
		Input.clear();
	}


	SQInput.getButtonSet = function() {
		return this.activeButtonSet;
	}


	SQInput.nextButtonSet = function() {
		this.changeButtonSet(this.getButtonSet() + 1);
	}


	SQInput.changeButtonSet = function(setIndex) {
		this.activeButtonSet = setIndex;
		this.activeButtonSet %= this.numButtonSets;
	}


	SQInput.setTargetGamepadName = function(name) {
		this.targetGamepadName = name;
	}


	SQInput.setTargetGamepadIndex = function(gamepadIndex) {
		let allGamepads = navigator.getGamepads();

		if (gamepadIndex in allGamepads && !!allGamepads[gamepadIndex]) {
			this.setTargetGamepadName(allGamepads[gamepadIndex].id);
		}
	}


	SQInput.updateActiveGamepad = function() {
		let allGamepads = navigator.getGamepads();

		if (this.targetGamepadName) {
			for (let index = 0; index < allGamepads.length; index++) {
				let gamepad = allGamepads[index];
				if (!gamepad) continue;
				if (gamepad.id === this.targetGamepadName) {
					this.activeGamepadIndex = index;
					break;
				}
			}
		}

		// No matching gamepad name was found. Default to the first one
		if (!this.activeGamepadIndex) {
			for (let index = 0; index < allGamepads.length; index++) {
				let gamepad = allGamepads[index];
				if (gamepad) {
					this.activeGamepadIndex = index;
					break;
				}
			}
		}
	}


	// Run the given callback the next time a gamepad button is pressed. Only fires once per call.
	SQInput.onNextGamepadInput = function(callback) {
		SQInput.onNextGamepadPress(callback);
	}

	SQInput.onNextGamepadRelease = function(callback) {
		this._gamepadInputCallback = callback;
		this._gamepadInputCallbackType = "release";
	}

	SQInput.onNextGamepadPress = function(callback) {
		this._gamepadInputCallback = callback;
		this._gamepadInputCallbackType = "press";
	}


	SQInput.cancelOnNextGamepadInput = function() {
		this._gamepadInputCallback = null;
		this._gamepadInputCallbackType = null;
	}

	SQInput.nextGamepadInputHandler = function(buttonIndex, type) {
		if (typeof this._gamepadInputCallback === "function" && this._gamepadInputCallbackType === type) {
			let callback = this._gamepadInputCallback;
			this._gamepadInputCallback = null;
			this._gamepadInputCallbackType = null;

			callback(buttonIndex, type);
		}

		// Just switched to gamepad. Check connected controllers to see if any match the saved selected gamepad
		// If there's a match, set activeGamepadIndex to its index. If there's no match or no saved gamepad
		// just use the first device
		if (this.lastInputDevice !== 'gamepad') {
			this.updateActiveGamepad();
			this.lastInputDevice = "gamepad";
		}
	}


	// Run the given callback the next time a keyboard button is pressed. Only fires once per call.
	SQInput.onNextKeyboardInput = function(callback) {
		this._keyboardInputCallback = callback;
	}


	SQInput.cancelOnNextKeyboardInput = function() {
		this._keyboardInputCallback = null;
	}


	SQInput.nextKeyboardInputHandler = function(event) {
		if (this._keyboardInputCallback && typeof this._keyboardInputCallback === "function") {
			this._keyboardInputCallback(event);
			this._keyboardInputCallback = null;
		}

		this.lastInputDevice = "keyboard";
	}


	// Returns an array of the keyboard and gamepad buttons for each SQ function
	// Used to save config data
	SQInput.getControlMap = function() {
		let controlMap = {};
		for (let func in this.inputs) {
			let funcData = this.inputs[func];

			controlMap[func] = {
				keyboardButton: funcData.keyboardButton,
				gamepadButton: funcData.gamepadButton
			};
		}

		return controlMap;
	}


	// Sets the keyboard and gamepad button for each custom function
	// Used when loading config values
	SQInput.setControlMap = function(map) {
		if (map) {
			for (let key in map) {
				let buttons = map[key];
				let func = this.inputs[key];

				if (func) {
					func.gamepadButton = buttons.gamepadButton;
					func.keyboardButton = buttons.keyboardButton;
				}
			}

			SQInput.rebuildButtonMapper();
		}
	}

	// Changes the input for a particular control
	SQInput.setControlButton = function(control, keyCode, type) {
		if (!this.inputs[control]) {
			return;
		}

		// Check whether this keycode is being used anywhere else
		let duplicateFunction = null;
		for (let i in this.inputs) {
			let input = this.inputs[i];
			if (input && input[type] === keyCode && i !== control) {
				duplicateFunction = i;
				break;
			}
		}

		// swap the keys if a duplicate was found
		if (duplicateFunction) {
			let currentControlKey = this.inputs[control][type];
			this.inputs[duplicateFunction][type] = currentControlKey;
		}

		this.inputs[control][type] = keyCode;
		this.rebuildButtonMapper();
	}


	SQInput.setGamepadButton = function(control, buttonIndex) {
		this.setControlButton(control, buttonIndex, "gamepadButton");
	}


	SQInput.setKeyboardButton = function(control, keyCode) {
		this.setControlButton(control, keyCode, "keyboardButton");
	}


	// Draw a keyboard icon based on the name of a SQ function
	SQInput.getKeyboardControlIconIndex = function(param) {
		let keyboardButton = this.inputs[param].keyboardButton;
		let iconIndex = SQInput.baseKeyboardIconIndex + SQInput.codeToIconIndex[keyboardButton];

		// Use the gamepad icons for keyboard
		if (keyboardButton.startsWith("Arrow")) {
			iconIndex -= 64;
		}

		return iconIndex;
	}


	// Draw a gamepad icon based on the name of a SQ function
	SQInput.getGamepadControlIconIndex = function(param) {
		let buttonIndex = this.gamepadIndexToIconIndex[this.inputs[param].gamepadButton];
		return this.baseControlIconIndex + (this.buttonSetSize * this.activeButtonSet) + buttonIndex
	}


	// Checks for a 5-second long press. Used for the failsafe control remap reset
	SQInput.isVeryLongPressed = function(keyName) {
		return (
			Input.isPressed(keyName) &&
			Input._pressedTime >= 300
		);
	};


	// Escape params normally only support integer parameters. To support using names of inputs,
	// the regex is adjusted to also look for letters and underscores. The parseInt call is also
	// replaced by removing the trailing ]. It doesn't seem like the return value must be an integer
	// and that the parse was just a janky way of trimming the string?
	// defaultObtainEscapeParam = Window_Base.prototype.obtainEscapeParam;
	SQInput.obtainEscapeParam = function(textState) {
		const regExp = /^\[[\da-zA-Z_]+\]/;
		const arr = regExp.exec(textState.text.slice(textState.index));
		if (arr) {
			textState.index += arr[0].length;
			return arr[0].slice(1, arr[0].length - 1);
		} else {
			return "";
		}
	};

	Input.getLeftJoystick = function() {
		if (SQInput.activeGamepadIndex >= 0 && SQInput.activeGamepadIndex in this._gamepadAxes) {
			return this._gamepadAxes[SQInput.activeGamepadIndex].left;
		}
	}

	Input.getRightJoystick = function() {
		if (SQInput.activeGamepadIndex >= 0 && SQInput.activeGamepadIndex in this._gamepadAxes) {
			return this._gamepadAxes[SQInput.activeGamepadIndex].right;
		}
	}


	Window_Base.prototype.obtainEscapeCodeIconIndex = function(code, param) {
		let iconIndex = -1;

		ImageManager.setIconImage(SQInput.buttonIconSet)

		if (code === "KBCTRL" && param in SQInput.inputs) {
			iconIndex = SQInput.getKeyboardControlIconIndex(param);
		}
		else if (code === "JPCTRL" && param in SQInput.inputs) {
			iconIndex = SQInput.getGamepadControlIconIndex(param);
		}
		else if (code === "CTRL" && param in SQInput.inputs) {
			iconIndex = 0;
			if (SQInput.lastInputDevice === "keyboard") {
				iconIndex = SQInput.getKeyboardControlIconIndex(param);
			}
			else {
				iconIndex = SQInput.getGamepadControlIconIndex(param);
			}
		}
		else if (code === "KB") {
			iconIndex = SQInput.defaultButtonIcon;

			const arrowCodes = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];

			// A very ugly hack because the keyboard icon set doesn't have its own set of arrows
			// All of the controller button sets have copies of the arrows, so use the first one of those
			if (arrowCodes.includes(param)) {
				iconIndex = SQInput.baseControlIconIndex + arrowCodes.indexOf(param);
			}
			else if (param in SQInput.codeToIconIndex) {
				iconIndex = SQInput.baseKeyboardIconIndex + SQInput.codeToIconIndex[param];
			}
		}
		// JP = Joypad. This was originally GP for Gamepad, but the control character interacts strangely with the "G"
		else if (code === "JP") {
			let iconSet = SQInput.activeButtonSet;
			let iconOffset = SQInput.gamepadIndexToIconIndex[param];

			// Map all arrow icons to the first set of arrows
			if (iconOffset >= 0 && iconOffset <= 3) {
				iconSet = 0;
			}

			iconIndex = SQInput.baseControlIconIndex + (SQInput.buttonSetSize * iconSet) + iconOffset;
		}
		else {
			ImageManager.resetIconImage();
		}

		return iconIndex
	}

	// Override escape character processing to handle custom icon drawing
	// This makes drawing icons based on their function and button set possible
	SQInput.defaultProcessEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
	Window_Base.prototype.processEscapeCharacter = function(code, textState, param = null) {
		let originalState = Object.assign({}, textState);
		let sqParam = param || SQInput.obtainEscapeParam(textState);

		let iconIndex = this.obtainEscapeCodeIconIndex(code, sqParam);

		if (code.startsWith("DBL")) {
			let regex = /\|(\w+)\|(\w+)\[(\w+)\|(\w+)\]/i;
			let matches = textState.text.substring(textState.index).match(regex);

			if (matches.length === 5) {
				let iconIndex1 = this.obtainEscapeCodeIconIndex(matches[1], matches[3]);
				let iconIndex2 = this.obtainEscapeCodeIconIndex(matches[2], matches[4]);

				ImageManager.setIconImage(SQInput.buttonIconSet)
				this.processDrawDoubleIcon(iconIndex1, iconIndex2, textState);
				ImageManager.resetIconImage();

				textState.index += matches[0].length;
			}

		}
		else if (iconIndex >= 0) {
			this.processDrawIcon(iconIndex, textState);
			ImageManager.resetIconImage();
		}
		else {
			Object.assign(textState, originalState);
			SQInput.defaultProcessEscapeCharacter.call(this, code, textState, param);
		}
	}


	Window_Base.prototype.processDrawDoubleIcon = function(iconIndex1, iconIndex2, textState) {
		if (textState.drawing) {
			this.drawDoubleIcon(iconIndex1, iconIndex2, textState.x + 2, textState.y + 2);
		}
		textState.x += ImageManager.iconWidth + 4;
	}

	Window_Base.prototype.drawDoubleIcon = function(iconIndex1, iconIndex2, x, y, scaleX = 0.7, scaleY = 0.7) {
		const bitmap = ImageManager.loadSystem(ImageManager.currentIconSet);
		const pw = ImageManager.iconWidth;
		const ph = ImageManager.iconHeight;
		let sx = (iconIndex1 % 16) * pw;
		let sy = Math.floor(iconIndex1 / 16) * ph;
		this.contents.blt(bitmap, sx, sy, pw, ph, x, y, ImageManager.iconWidth * scaleX, ImageManager.iconHeight * scaleY);

		sx = (iconIndex2 % 16) * pw;
		sy = Math.floor(iconIndex2 / 16) * ph;
		this.contents.blt(bitmap, sx, sy, pw, ph, x + (pw / 2), y + (ph / 2), ImageManager.iconWidth * scaleX, ImageManager.iconHeight * scaleY);
	}

	// Switch the active icon image. Used to render button icons in the control remapper scene
	ImageManager.setIconImage = function(imageName) {
		ImageManager.currentIconSet = imageName;
	}

	ImageManager.resetIconImage = function() {
		ImageManager.currentIconSet = "IconSet";
	}

	Window_Base.prototype.drawIcon = function(iconIndex, x, y) {
		const bitmap = ImageManager.loadSystem(ImageManager.currentIconSet);
		const pw = ImageManager.iconWidth;
		const ph = ImageManager.iconHeight;
		const sx = (iconIndex % 16) * pw;
		const sy = Math.floor(iconIndex / 16) * ph;
		this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
	};

	// This is a copy/paste from the base RMMZ Input._updateGamepadState
	// VisuMZ overwrites this and does something that crashes if the full
	// gamepad object isn't given to it. Whatever VisuMZ is doing hopefully
	// isn't too important.
	SQInput.originalUpdateGamepadState = function(gamepad) {
		const lastState = this._gamepadStates[gamepad.index] || [];
		const newState = [];
		const buttons = gamepad.buttons;
		const axes = gamepad.axes;
		const threshold = 0.5;
		newState[12] = false;
		newState[13] = false;
		newState[14] = false;
		newState[15] = false;
		for (let i = 0; i < buttons.length; i++) {
			newState[i] = buttons[i].pressed;
		}
		if (axes[1] < -threshold) {
			newState[12] = true; // up
		} else if (axes[1] > threshold) {
			newState[13] = true; // down
		}
		if (axes[0] < -threshold) {
			newState[14] = true; // left
		} else if (axes[0] > threshold) {
			newState[15] = true; // right
		}
		for (let j = 0; j < newState.length; j++) {
			if (newState[j] !== lastState[j]) {
				const buttonNames = this.gamepadMapper[j];
				if (buttonNames) {
					for (let b of buttonNames) {
						this._currentState[b] = newState[j];
					}
				}
			}
		}
		this._gamepadStates[gamepad.index] = newState;
		this._gamepadAxes[gamepad.index] = {
			left:  {x: gamepad.axes[0], y: gamepad.axes[1]},
			right: {x: gamepad.axes[2], y: gamepad.axes[3]}
		}
	}

	// Override gamepad updating because this is where new button presses can be detected
	// If there's a new button press, fire the handler.
	SQInput.defaultUpdateGamepadState = Input._updateGamepadState;
	Input._updateGamepadState = function(gamepad) {
		const originalState = this._gamepadStates[gamepad.index] || [];

		if (SQInput.activeGamepadIndex === null) {
			SQInput.updateActiveGamepad();
		}

		if (gamepad.index === SQInput.activeGamepadIndex) {
			SQInput.originalUpdateGamepadState.call(Input, gamepad);
		}

		const newState = this._gamepadStates[gamepad.index] || [];

		for (let i = 0; i < originalState.length; i++) {
			if (originalState[i] !== newState[i]) {
				SQInput.nextGamepadInputHandler(i, newState[i] === true ? "press" : "release");
				break;
			}
		}
	}


	// As a failsafe in case the player messed up the button mapping such that they can't change it back
	// Check whether escape and shift are both long pressed. If they are, reset all control mapping.
	SQInput.defaultInputUpdate = Input.update;
	Input.update = function() {
		this._pollGamepads();

		if (!this._latestButton) {
			this._latestButton = [];
		}

		if (this._latestButton.length && this._currentState[this._latestButton[0]]) {
			this._pressedTime++;
		} else {
			this._latestButton = [];
		}

		for (const name in this._currentState) {
			if (this._currentState[name] && !this._previousState[name]) {
				this._latestButton.push(name);
				this._pressedTime = 0;
				this._date = Date.now();
			}
			this._previousState[name] = this._currentState[name];
		}
		if (this._virtualButton) {
			this._latestButton = [this._virtualButton];
			this._pressedTime = 0;
			this._virtualButton = null;
		}
		this._updateDirection();

		let longPressEscape = SQInput.isVeryLongPressed("escape") || SQInput.isVeryLongPressed("static_escape");
		let longPressTab = SQInput.isVeryLongPressed("tab") || SQInput.isVeryLongPressed("static_tab");

		if (longPressEscape && longPressTab && !SQInput._resetMap) {
			SQInput.resetMap();
			SoundManager.playEquip();
			SQInput._resetMap = true;
		}
		else if (!longPressEscape || !longPressTab) {
			SQInput._resetMap = false;
		}
	}


	// Hook into the keyboard input handlers so that they can use the event.code value
	// to prevent key collisions with gamepad input indexes and to improve compatability
	Input._onKeyDown = function(event) {
		if (this._shouldPreventDefault(event.keyCode)) {
			event.preventDefault();
		}
		if (event.keyCode === 144) {
			// Numlock
			this.clear();
		}
		const buttonNames = this.keyMapper[event.code || event.which];
		if (buttonNames) {
			for (let b of buttonNames) {
				this._currentState[b] = true;
			}
		}
	}


	Input._onKeyUp = function(event) {
		const buttonNames = this.keyMapper[event.code || event.which];
		if (buttonNames) {
			for (let b of buttonNames) {
				this._currentState[b] = false;
			}
		}
	};


	SQInput.defaultInputInitialize = Input.initialize;
	Input.initialize = function() {
		SQInput.defaultInputInitialize.call(Input);
		SQInput.initialize();
	}


	// The map scene isn't very extensible since it explicitly checks for specific actions you can do
	// Making the system menu available from there requires tinkering with the map update internals to
	// add a check for the system menu input
	SQInput.defaultUpdateCallMenu = Scene_Map.prototype.updateCallMenu;
	Scene_Map.prototype.updateCallMenu = function() {
		if (this.isMenuEnabled() && !$gamePlayer.isMoving()) {
			this.menuCalling = this.isMenuCalled();
			if (this.menuCalling) {
				this.callMenu();
			}

			this.systemMenuCalling = this.isSystemMenuCalled();
			if (this.systemMenuCalling) {
				this.callSystemMenu();
			}
		} else {
			this.menuCalling = false;
			this.systemMenuCalling = false;
		}
	};


	Scene_Map.prototype.isSystemMenuCalled = function() {
		return Input.isTriggered("system_menu");
	}


	// Basically a copy of Scene_Map.callMenu with the scene changed. Ths might need some adjustment later?
	Scene_Map.prototype.callSystemMenu = function() {
		SoundManager.playOk();
		SceneManager.push(Scene_GameEnd);
		Window_MenuCommand.initCommandPosition();
		$gameTemp.clearDestination();
		this._mapNameWindow.hide();
		this._waitCount = 2;
	}


	// Clearing the current and previous states when unfocusing the window changes the internal order
	// of the keys, causing the default RMMZ key to not be checked last. Relying on this ordering is
	// awful, but it's better than completely rewriting the input system
	SQInput.defaultInputClear = Input.clear;
	Input.clear = function() {
		if (!this._currentState) this._currentState = {};
		if (!this._previousState) this._previousState = {};

		Object.keys(this._currentState).forEach((k) => { this._currentState[k] = false;});
		Object.keys(this._previousState).forEach((k) => { this._currentState[k] = false;});

		this._gamepadStates = [];
		this._latestButton = null;
		this._pressedTime = 0;
		this._dir4 = 0;
		this._dir8 = 0;
		this._preferredAxis = "";
		this._date = 0;
		this._virtualButton = null;
	}

	SQInput.defaultIsTriggered = Input.isTriggered;
	Input.isTriggered = function(keyName) {
		if (this._isEscapeCompatible(keyName) && this.isTriggered("escape")) {
			return true;
		} else {
			return this._latestButton.contains(keyName) && this._pressedTime === 0;
		}
	}

	SQInput.defaultIsRepeated = Input.isRepeated;
	Input.isRepeated = function (keyName) {
		if (this._isEscapeCompatible(keyName) && this.isRepeated("escape")) {
			return true;
		} else {
			return (
				this._latestButton.contains(keyName) &&
				(this._pressedTime === 0 ||
					(this._pressedTime >= this.keyRepeatWait &&
						this._pressedTime % this.keyRepeatInterval === 0))
			);
		}
	}
})();

function SQConfig() {
	throw new Error("SQConfig is a static class");
}


(function() {
	SQConfig.defaultMakeData = ConfigManager.makeData;
	ConfigManager.makeData = function () {
		let config = SQConfig.defaultMakeData.call(ConfigManager);

		config.SQConfig = {
			buttonSet: SQInput.getButtonSet(),
			gamepadName: SQInput.targetGamepadName,
			controlMap: SQInput.getControlMap()
		}

		return config;
	}

	SQConfig.defaultApplyData = ConfigManager.applyData;
	ConfigManager.applyData = function (config) {
		SQConfig.defaultApplyData.call(ConfigManager, config);

		let sqConfig = config.SQConfig;

		let buttonSet = "buttonSet" in sqConfig
			? parseInt(sqConfig.buttonSet || 0).clamp(0, SQInput.numButtonSets)
			: SQInput.activeButtonSet;

		let gamepadName = "gamepadName" in sqConfig
			? sqConfig.gamepadName
			: null;

		let controlMap = "controlMap" in sqConfig
			? sqConfig.controlMap
			: [];

		SQInput.changeButtonSet(buttonSet);
		SQInput.setTargetGamepadName(gamepadName);
		SQInput.setControlMap(controlMap);
	}

})();
