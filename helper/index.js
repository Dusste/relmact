import React from "react";

/**
 * Returns transformed array that contains elm app related stuff
 *
 * @param {apps} x Array of Elm apps
 * @return {array} x Array of objects with keys: elmAppName (String), wapperDiv (Node), elmApp: (Function)
 */
const transformApps = (apps) => {
  return apps.reduce((sum, elmApp) => {
    const elmAppName = elmApp["__elmModulePath"][0];
    if (!elmAppName) throw new Error("Invalid Elm component initialised");

    const helperObject = {
      elmAppName,
      wrapperDiv: document.createElement("div"),
      elmApp,
    };
    sum.push(helperObject);
    return sum;
  }, []);
};

let timestamp;

/**
 * Returns Elm components as React components
 *
 * @param {apps} x Array of Elm apps
 * @param (optional) {style} Stylesheet, must be raw file
 * @return {array} x React apps
 */
export default ({ apps, style }) => {
  if (!apps?.length) throw new Error("You haven't passed Elm components");
  const widgets = transformApps(apps);

  return widgets.reduce((acc, { elmAppName, wrapperDiv, elmApp }) => {
    let elmAppInstance;
    let styleElement;

    acc[`${elmAppName}Elm`] = ({ contract }) => {
      const init = (node) => {
        if (!node) return null;

        timestamp = Date.now();
        const shadowRoot =
          node?.shadowRoot ?? node?.attachShadow({ mode: "open" });

        if (style) {
          styleElement = document.createElement("style");
          const sheet = new CSSStyleSheet();

          styleElement.type = "text/css";
          styleElement.textContent = style;
        }
        // TODO no present stylesheets is indicator that app has not been initialized - FIND BETTER WAY !
        if (![...shadowRoot.styleSheets].length) {
          shadowRoot.appendChild(styleElement);
          shadowRoot.appendChild(wrapperDiv);

          elmAppInstance = elmApp.init({
            node: wrapperDiv,
          });
        }

        elmAppInstance.ports.onContractChange.send({ contract });
      };

      return React.createElement("re-elm-act", { ref: init, key: timestamp });
    };
    return acc;
  }, {});
};
