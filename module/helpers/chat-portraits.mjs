// Create image or video element for portraits
function createPortraitElement(src, isVideo) {
  const element = isVideo ? document.createElement("video") : document.createElement("img");
  element.src = src;
  element.width = 36;
  element.height = 36;
  element.autoplay = false;
  element.controls = false;
  element.muted = true;
  element.classList.add("portrait");
  return element;
}

// Check if the file extension is webm
function isWebm(file) {
  return /(?:\.([^.]+))?$/.exec(file)?.[1] === "webm";
}

// Get the token texture source for a given scene and token
function getTokenTextureSource({ scene, token }) {
  const sceneObj = game.scenes.get(scene);
  return sceneObj?.tokens.get(token)?.texture?.src;
}

// Get the actor token or prototype token texture source for a given actor
function getActorTextureSource({ actor }) {
  const actorObj = game.actors.get(actor);
  const prototypeToken = actorObj?.prototypeToken;
  return prototypeToken?.randomImg ? null : prototypeToken?.texture?.src;
}

// Get the portrait source for a chat message
function getPortraitSource({ speaker }) {
  return speaker.token ? getTokenTextureSource(speaker) : getActorTextureSource(speaker);
}

// Preprocess chat message before it is created
export function preprocessChatMessage(messageData, options, userId, diff) {
  const portraitSource = getPortraitSource(messageData);
  if (portraitSource) {
    messageData.updateSource({ flags: { "portrait": { src: portraitSource } } });
  }
};

// Render chat message
export function renderChatMessage(message, html, data) {
  const { src: portraitSource } = message.flags?.["portrait"] || {};
  if (!portraitSource) return;

  const isVideo = isWebm(portraitSource);
  const portraitElement = createPortraitElement(portraitSource, isVideo);

  const headerElement = html.find(".message-header")?.[0];
  if (headerElement) {
    headerElement.prepend(portraitElement);
    headerElement.style.paddingBottom = "3px";
  }

  const senderElement = html.find(".message-sender")?.[0];
  if (senderElement) {
    senderElement.style.alignSelf = "center";
  }
};
