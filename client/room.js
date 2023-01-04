import { io } from "socket.io-client";
import DrawableCanvas from "./DrawableCanvas.js";
const production = process.env.NODE_ENV === "production";

const serverURL = production ? "realsite.com" : "http://localhost:3000";

// To get the user search parameters

const urlParams = new URLSearchParams(window.location.search);

// Get these parameters as single variables

const name = urlParams.get("name");
const roomId = urlParams.get("room-id");

// If someone doesnt have name or room id in URL , return it to the index.html page
if (!name || !roomId) window.location = "index.html";

const socket = io(serverURL);

// Select all the elements we are going to use on a page

const guessForm = document.querySelector("[data-guess-form]");
const guessInput = document.querySelector("[data-guess-input]");
const wordElement = document.querySelector("[data-word]");
const messagesElement = document.querySelector("[data-messages]");
const readyBtn = document.querySelector("[data-ready-button]");
const canvas = document.querySelector("[data-canvas]");
const drawableCanvas = new DrawableCanvas(canvas, socket);
const guessTemplate = document.querySelector("[data-guess-template]");

// Connect to the backend in order to display same results in same room

socket.emit("join-room", { name: name, roomId: roomId });
socket.on("start-drawer", startRoundDrawer);
socket.on("start-guesser", startRoundGuesser);
socket.on("guess", displayGuess);
socket.on("winner", endRound);

// Hide guess form from the start of the game
endRound();
resizeCanvas();
setupHTMLEvents();

function setupHTMLEvents() {
  readyBtn.addEventListener("click", (e) => {
    hide(readyBtn);
    socket.emit("ready");
  });

  guessForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (guessInput.value === "") {
      return;
    }

    socket.emit("make-guess", { guess: guessInput.value });
    displayGuess(name, guessInput.value);

    guessInput.value = "";
  });

  window.addEventListener("resize", resizeCanvas);
}

function displayGuess(guesserName, guess) {
  const guessElement = guessTemplate.content.cloneNode(true);
  const messageElement = guessElement.querySelector("[data-text]");
  const nameElement = guessElement.querySelector("[data-name]");

  nameElement.innerText = guesserName;
  messageElement.innerText = guess;

  messagesElement.append(guessElement);
}

function startRoundDrawer(word) {
  drawableCanvas.canDraw = true;
  drawableCanvas.clearCanvas();
  wordElement.innerText = word;
}

function startRoundGuesser() {
  show(guessForm);
  hide(wordElement);
  wordElement.innerText = "";
  drawableCanvas.clearCanvas();

  messagesElement.innerHTML = "";
}

function resizeCanvas() {
  canvas.width = null;
  canvas.height = null;
  const clientDimensions = canvas.getBoundingClientRect();
  canvas.width = clientDimensions.width;
  canvas.height = clientDimensions.height;
}

function endRound(name, word) {
  if (word && name) {
    wordElement.innerText = word;
    show(wordElement);
    displayGuess(null, `${name} is the winner`);
  }
  drawableCanvas.canDraw = false;
  show(readyBtn);
  hide(guessForm);
}
function hide(element) {
  element.classList.add("hide");
}

function show(element) {
  element.classList.remove("hide");
}
