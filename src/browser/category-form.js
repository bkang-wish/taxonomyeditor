const rootEl = document.getElementById("root");

window.addEventListener("message", (event) => {
  const message = event.data; // The JSON data our extension sent
  let category = {};
  switch (message.command) {
    case "update":
      category = JSON.parse(message.category);

      console.log("categoryyy", category);

      // <vscode-text-field value="hello world">Text Field Label</vscode-text-field>
      const nameEl = document.createElement("vscode-text-field");
      nameEl.innerText = "Name";
      nameEl.setAttribute("value", category.name);
      nameEl.onchange = (e) => {
        category.name = e.target.value;
      };

      const translationsContainerEl = document.createElement("div");
      const translationsTitleEl = document.createElement("h2");
      translationsTitleEl.innerText = "Translations";
      const translationEls = category.translations.map((translation) => {
        const translationEl = document.createElement("vscode-text-field");
        translationEl.innerText = translation.lang;
        translationEl.setAttribute("value", translation.value);
        translationEl.onchange = (e) => {
          const targetTranslation = category.translations.find((t) => t.lang === translation.lang);
          targetTranslation.value = e.target.value;
          console.log("neewcat", category);
        };
        return translationEl;
      });
      translationsContainerEl.appendChild(translationsTitleEl);
      translationEls.forEach((el) => translationsContainerEl.appendChild(el));

      // <vscode-data-grid id="basic-grid" aria-label="Basic"></vscode-data-grid>

      const attributesTitleEl = document.createElement("h2");
      attributesTitleEl.innerText = "Attributes";

      const attributesContainerEl = document.createElement("vscode-data-grid");
      attributesContainerEl.ariaLabel = "Basic";
      attributesContainerEl.rowsData = category.attributes.map((attr) => {
        return {
          Name: attr.name,
          Datatype: attr.datatype,
        };
      });

      rootEl.appendChild(nameEl);
      rootEl.appendChild(translationsContainerEl);
      rootEl.appendChild(attributesTitleEl);
      rootEl.appendChild(attributesContainerEl);

      break;
  }
});
