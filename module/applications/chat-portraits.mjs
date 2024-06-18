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

// Preprocess chat message before it is created
export function preprocessChatMessage(messageData, options, userId, diff) {
  let portraitSource;

  if (messageData.speaker.actor) {
    const actor = game.actors.get(messageData.speaker.actor);
    portraitSource = actor.img;
  } else {
    portraitSource = game.user.avatar;
  }

  messageData.updateSource({ flags: { "portrait": { src: portraitSource } } });
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
