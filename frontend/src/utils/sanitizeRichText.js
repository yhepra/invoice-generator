const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "del",
  "ul",
  "ol",
  "li",
  "br",
  "p",
  "div",
]);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizeTextToHtml = (text) => {
  const escaped = escapeHtml(text);
  return escaped.replaceAll("\n", "<br>");
};

const sanitizeNode = (node, doc) => {
  if (node.nodeType === Node.TEXT_NODE) return node;
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return doc.createTextNode("");
  }

  const tag = node.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) {
    return doc.createTextNode(node.textContent || "");
  }

  const clean = doc.createElement(tag);
  for (const child of Array.from(node.childNodes)) {
    const sanitizedChild = sanitizeNode(child, doc);
    if (sanitizedChild) clean.appendChild(sanitizedChild);
  }

  return clean;
};

export const sanitizeRichText = (htmlOrText) => {
  const input = String(htmlOrText ?? "");
  if (input.trim() === "") return "";

  try {
    const normalized = input.includes("<") ? input : input.replaceAll("\n", "<br>");
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${normalized}</div>`, "text/html");
    const wrapper = doc.body.firstElementChild;
    if (!wrapper) return normalizeTextToHtml(input);

    const outputDoc = document.implementation.createHTMLDocument("");
    const outWrapper = outputDoc.createElement("div");

    for (const child of Array.from(wrapper.childNodes)) {
      outWrapper.appendChild(sanitizeNode(child, outputDoc));
    }

    return outWrapper.innerHTML;
  } catch {
    return normalizeTextToHtml(input);
  }
};
