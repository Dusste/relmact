import React from "react";

const transformApps = (apps) => {
  return Object.values(apps).reduce((sum, elmApp) => {
    const elmAppName = elmApp["__elmModulePath"][0];
    if (!elmAppName) throw new Error("Invalid Elm app passed");

    sum[elmAppName] = {
      wrapperDiv: document.createElement("div"),
      elmApp,
    };
    return sum;
  }, {});
};

export default ({ apps, style }) => {
  const widgets = transformApps(apps);

  return Object.keys(widgets).reduce((acc, elmAppName) => {
    const wrappedDiv = widgets[elmAppName].wrapperDiv;
    const elmAppRef = widgets[elmAppName].elmApp;
    let elmApp;
    let styleElement;

    acc[`${elmAppName}Elm`] = ({ contract }) => {
      const init = (node) => {
        if (!node) throw new Error("No contaier provided");

        const shadowRoot = node.shadowRoot
          ? node.shadowRoot
          : node.attachShadow({ mode: "closed" });

        if (style) {
          styleElement = document.createElement("style");
          const sheet = new CSSStyleSheet();

          styleElement.type = "text/css";
          styleElement.textContent = style;
        }
        // TODO no present stylesheets is indicator that app has not been initialized - FIND BETTER WAY !
        if (![...shadowRoot.styleSheets].length) {
          shadowRoot.appendChild(styleElement);
          shadowRoot.appendChild(wrappedDiv);
          elmApp = elmAppRef.init({
            node: wrappedDiv,
          });
        }

        elmApp.ports.onContractChange.send({ contract });
      };

      return React.createElement("re-elm-act", { ref: init });
    };
    return acc;
  }, {});
};
