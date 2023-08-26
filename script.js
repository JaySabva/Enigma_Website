let leftRotorType = document.getElementById("leftRotorType").value;
let middleRotorType = document.getElementById("middleRotorType").value;
let rightRotorType = document.getElementById("rightRotorType").value;

let leftRotorPosition = 0;
let middleRotorPosition = 0;
let rightRotorPosition = 0;

let leftRotorRingSetting = 0;
let middleRotorRingSetting = 0;
let rightRotorRingSetting = 0;

let reflector = "B";

let plugboard = "";
// Rotor Class
class Rotor {
  constructor(name, encoding, rotorPosition, notchPosition, ringSetting) {
    this.name = name;
    this.forwardWiring = this.decodeWiring(encoding);
    this.backwardWiring = this.inverseWiring(this.forwardWiring);
    this.rotorPosition = rotorPosition;
    this.notchPosition = notchPosition;
    this.ringSetting = ringSetting;
  }

  static Create(name, rotorPosition, ringSetting) {
    if (name === "I")
      return new Rotor(
        "I",
        "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
        rotorPosition,
        16,
        ringSetting
      );
    else if (name === "II")
      return new Rotor(
        "II",
        "AJDKSIRUXBLHWTMCQGZNPYFVOE",
        rotorPosition,
        4,
        ringSetting
      );
    else if (name === "III")
      return new Rotor(
        "III",
        "BDFHJLCPRTXVZNYEIWGAKMUSQO",
        rotorPosition,
        21,
        ringSetting
      );
    else if (name === "IV")
      return new Rotor(
        "IV",
        "ESOVPZJAYQUIRHXLNFTGKDCMWB",
        rotorPosition,
        9,
        ringSetting
      );
    else if (name === "V")
      return new Rotor(
        "V",
        "VZBRGITYUPSDNHLXAWMJQOFECK",
        rotorPosition,
        25,
        ringSetting
      );
    else if (name === "VI")
      return new Rotor(
        "VI",
        "JPGVOUMFYQBENHZRDKASXLICTW",
        rotorPosition,
        0,
        ringSetting
      );
    else if (name === "VII")
      return new Rotor(
        "VII",
        "NZJHGRCXMYSWBOUFAIVLPEKQDT",
        rotorPosition,
        0,
        ringSetting
      );
    else if (name === "VIII")
      return new Rotor(
        "VIII",
        "FKQHTLXOCBJSPDZRAMEWNIUYGV",
        rotorPosition,
        0,
        ringSetting
      );
    else
      return new Rotor(
        "JaySabva",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        rotorPosition,
        0,
        ringSetting
      );
  }

  getName() {
    return this.name;
  }

  getPosition() {
    return this.rotorPosition;
  }

  forward(c) {
    return this.encode(
      c,
      this.rotorPosition,
      this.ringSetting,
      this.forwardWiring
    );
  }

  backward(c) {
    return this.encode(
      c,
      this.rotorPosition,
      this.ringSetting,
      this.backwardWiring
    );
  }

  isNotch() {
    return this.rotorPosition === this.notchPosition;
  }

  turnover() {
    this.rotorPosition = (this.rotorPosition + 1) % 26;
  }

  decodeWiring(encoding) {
    const wiring = new Array(26);
    for (let i = 0; i < 26; i++) {
      wiring[i] = encoding.charCodeAt(i) - "A".charCodeAt(0);
    }
    return wiring;
  }

  inverseWiring(wiring) {
    const inverse = new Array(26);
    for (let i = 0; i < 26; i++) {
      inverse[wiring[i]] = i;
    }
    return inverse;
  }

  encode(c, rotorPosition, ringSetting, wiring) {
    c = (c + rotorPosition - ringSetting + 26) % 26;
    c = wiring[c];
    c = (c - rotorPosition + ringSetting + 26) % 26;
    return c;
  }
}

class Reflector {
  constructor(encoding) {
    this.wiring = this.decodeWiring(encoding);
  }

  static Create(name) {
    if (name === "B") return new Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT");
    else if (name === "C") return new Reflector("FVPJIAOYEDRZXWGCTKUQSBNMHL");
    else return new Reflector("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  }

  forward(c) {
    return this.wiring[c];
  }

  decodeWiring(encoding) {
    const wiring = new Array(26);
    for (let i = 0; i < 26; i++) {
      wiring[i] = encoding.charCodeAt(i) - "A".charCodeAt(0);
    }
    return wiring;
  }
}

class Plugboard {
  constructor(connections) {
    this.wiring = this.decodePlugboard(connections);
    console.log(this.wiring);
  }

  forward(ch) {
    return this.wiring[ch];
  }

  decodePlugboard(plugboard) {
    const mapping = Array.from({ length: 26 }, (_, i) => i);

    let tmp = "";
    for (const c of plugboard) {
      if (/[A-Za-z]/.test(c)) {
        tmp += c;
      }
    }

    for (let i = 0; i < tmp.length; i += 2) {
      const c1 = tmp.charCodeAt(i) - "A".charCodeAt(0);
      const c2 = tmp.charCodeAt(i + 1) - "A".charCodeAt(0);

      [mapping[c1], mapping[c2]] = [mapping[c2], mapping[c1]];
    }
    return mapping;
  }
}

class Enigma {
  constructor(
    leftRotorType,
    middleRotorType,
    rightRotorType,
    reflectorType,
    leftRotorPosition,
    middleRotorPosition,
    rightRotorPosition,
    leftRingSetting,
    middleRingSetting,
    rightRingSetting,
    plugboardConnections
  ) {
    this.leftRotor = Rotor.Create(
      leftRotorType,
      leftRotorPosition,
      leftRingSetting
    );
    this.middleRotor = Rotor.Create(
      middleRotorType,
      middleRotorPosition,
      middleRingSetting
    );
    this.rightRotor = Rotor.Create(
      rightRotorType,
      rightRotorPosition,
      rightRingSetting
    );
    this.reflector = Reflector.Create(reflectorType);
    this.plugboard = new Plugboard(plugboardConnections);
  }

  encrypt(c) {
    this.rotate();

    c = this.plugboard.forward(c);

    let c1 = this.rightRotor.forward(c);
    let c2 = this.middleRotor.forward(c1);
    let c3 = this.leftRotor.forward(c2);

    let c4 = this.reflector.forward(c3);

    let c5 = this.leftRotor.backward(c4);
    let c6 = this.middleRotor.backward(c5);
    let c7 = this.rightRotor.backward(c6);

    c = this.plugboard.forward(c7);

    return c;
  }

  encryptString(input) {
    let output = "";
    for (const char of input) {
      if (char.match(/[A-Za-z]/)) {
        output += String.fromCharCode(
          "A".charCodeAt(0) +
            this.encrypt(char.toUpperCase().charCodeAt(0) - "A".charCodeAt(0))
        );
      } else {
        output += char;
      }
    }
    return output;
  }

  getLeftRotorPosition() {
    return this.leftRotor.getPosition();
  }

  getMiddleRotorPosition() {
    return this.middleRotor.getPosition();
  }

  getRightRotorPosition() {
    return this.rightRotor.getPosition();
  }

  rotate() {
    if (this.middleRotor.isNotch()) {
      this.middleRotor.turnover();
      this.leftRotor.turnover();
    } else if (this.rightRotor.isNotch()) {
      this.middleRotor.turnover();
    }
    this.rightRotor.turnover();
  }
}

function updateRotorPos(rotor, incOrDec) {
  if (rotor === "left") {
    if (incOrDec === "inc") {
      leftRotorPosition = (leftRotorPosition + 1) % 26;
    } else {
      leftRotorPosition = (leftRotorPosition - 1 + 26) % 26;
    }
  } else if (rotor === "middle") {
    if (incOrDec === "inc") {
      middleRotorPosition = (middleRotorPosition + 1) % 26;
    } else {
      middleRotorPosition = (middleRotorPosition - 1 + 26) % 26;
    }
  } else {
    if (incOrDec === "inc") {
      rightRotorPosition = (rightRotorPosition + 1) % 26;
    } else {
      rightRotorPosition = (rightRotorPosition - 1 + 26) % 26;
    }
  }
  console.log(rotor);
  document.getElementById(rotor + "RotorPos").innerHTML =
    rotor === "left"
      ? leftRotorPosition
      : rotor === "middle"
      ? middleRotorPosition
      : rightRotorPosition;

  console.log(rotor + "RotorPos");

  newEnigma();
}

function updateRotorType(rotor, type) {
  let rotorType = document.getElementById(rotor + "RotorType").value;
  if (rotor === "left") {
    leftRotorType = rotorType;
  } else if (rotor === "middle") {
    middleRotorType = rotorType;
  } else {
    rightRotorType = rotorType;
  }
  newEnigma();
}

function updateRotorRingSetting(rotor, incOrDec) {
  if (rotor === "left") {
    if (incOrDec === "inc") {
      leftRotorRingSetting = (leftRotorRingSetting + 1) % 26;
    } else {
      leftRotorRingSetting = (leftRotorRingSetting - 1) % 26;
    }
  } else if (rotor === "middle") {
    if (incOrDec === "inc") {
      middleRotorRingSetting = (middleRotorRingSetting + 1) % 26;
    } else {
      middleRotorRingSetting = (middleRotorRingSetting - 1) % 26;
    }
  } else {
    if (incOrDec === "inc") {
      rightRotorRingSetting = (rightRotorRingSetting + 1) % 26;
    } else {
      rightRotorRingSetting = (rightRotorRingSetting - 1) % 26;
    }
  }
  newEnigma();
}

function updateReflector() {
  let type = document.getElementById("reflectorType").value;
  reflector = type;
  newEnigma();
}

function updatePlugboard() {
  let plugboardConnections = document.getElementById("plugboard").value;
  // check if the plugboard connections are valid and warening should be reflected on the page not the elert
  console.log(plugboardConnections);
  if (plugboardConnections.length > 20) {
    document.getElementById("plugboardError").value = "Too many connections";
    return;
  }
  for (let i = 2; i < plugboardConnections.length; i += 3) {
    if (plugboardConnections[i] !== " ") {
      document.getElementById("plugboardError").textContent =
        "Invalid connections";
      return;
    }
  }
  document.getElementById("plugboardError").textContent = "";
  plugboard = plugboardConnections.toUpperCase().replace(/\s/g, "");
  console.log(plugboardConnections);
  newEnigma();
}

function newEnigma() {
  enigma = new Enigma(
    leftRotorType,
    middleRotorType,
    rightRotorType,
    reflector,
    leftRotorPosition,
    middleRotorPosition,
    rightRotorPosition,
    leftRotorRingSetting,
    middleRotorRingSetting,
    rightRotorRingSetting,
    plugboard
  );
  ciphertext = enigma.encryptString(document.getElementById("texti").value);
  document.getElementById("texto").value = ciphertext;
  console.log(ciphertext);
}

function defult() {
  document.getElementById("leftRotorType").value = "I";
  document.getElementById("middleRotorType").value = "I";
  document.getElementById("rightRotorType").value = "I";

  document.getElementById("leftRotorPos").innerHTML = 0;
  document.getElementById("middleRotorPos").innerHTML = 0;
  document.getElementById("rightRotorPos").innerHTML = 0;

  document.getElementById("reflectorType").value = "B";
  document.getElementById("plugboard").textContent = "";
}
defult();
newEnigma();
