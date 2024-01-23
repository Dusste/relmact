import React from "react";

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

export default ({ apps, style }) => {
  if (!apps?.length) throw new Error("You haven't passed Elm components");
  const widgets = transformApps(apps);

  return widgets.reduce((acc, { elmAppName, wrapperDiv, elmApp }) => {
    let elmAppInstance;
    let styleElement;

    acc[`${elmAppName}Elm`] = ({ contract }) => {
      const init = (node) => {
        if (!node) throw new Error("No container provided");

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
          shadowRoot.appendChild(wrapperDiv);

          elmAppInstance = elmApp.init({
            node: wrapperDiv,
          });
        }

        elmAppInstance.ports.onContractChange.send({ contract });
      };

      return React.createElement("re-elm-act", { ref: init });
    };
    return acc;
  }, {});
};
