# relmact

`(\ -> A way to make your Elm apps live within React habitat <- /)`

#### What is it under the hood ?

Elm widgets will be consumed in React application as React Custom Components that hold reference to Elm app, encapsulated by the shadowDOM that allow us to inject custom CSS (if needed). Data that you want to feed your component with is passed via props (actually, passed to Elm via ports). Since Elm is subscribed to changes via ports, even if you have, for ex: 30 seconds polling in your React app, Elm app will act upon changes and re-render according to newly received data

#### How to use ?

Once you've installed package, you can make an adapter. Pass multiple Elm apps to init function and also style that you want to be encapsulated into shadowDom. You will get back baked React components ready to be used.

```javascript
// elmAdapter.js
...
import getApps from "relmact"; // Since its default export you can name func however you like
import Feeds from '../src/Feeds.elm'
import Articles from '../src/Articles.elm'
import style from "../../style.css?raw"; // Import style as raw file
...
export const { FeedsElm, ArticlesElm } = getApps({
    apps: { Feeds, Articles },
    style
});
...
```

then import those newly build files wherever you want to use in your React app and make sure you populate `contract` prop with data you want your Elm app to be feed with and don't forget to decode that !

```javascript
// YouReactApp.jsx
import { FeedsElm, ArticlesElm } from './elmAdapter.js';
...
return (
    <>
        <h1>My React app !</h1>
        <div>
            <FeedsElm contract={appData} />
            <ArticlesElm contract={secondAppData} />
        </div>
    </>
);
...
```

#### How to build your Elm app ?

You can build your Elm app however you like (just make sure you've checked `disclaimer` section), since data passed from React is send to Elm app via ports, you can pass it as object, array, string or anything that can be passed via ports in Elm, you need to make sure you are decodening value passed from JS.
- Example of things you would need in your Elm app:
```elm
port onContractChange : (Decode.Value -> msg) -> Sub msg

type Msg
    = GotContract Decode.Value

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotContract contractValue ->
            case Decode.decodeValue widgetDataDecoder contractValue of
                Ok data ->
                    ( { model | contract = Just data.contract }, Cmd.none )

                Err _ ->
                    ( { model | contract = Nothing }, Cmd.none )

subscriptions : Model -> Sub Msg
subscriptions _ =
    onContractChange GotContract

```

#### `!Important` - A bit of a disclaimer

- This package is suitable for those who wants to build several separated Elm programs (Browser.element) in isolation, `this package is NOT suitable for those who wants Browser.document or Browser.application type of Elm program`
- Since every Elm module should be app for itself, I am referring to it as app or widget
- For now, there is only one CSS file for custom styling, for all mini apps, if there is a need for style file per widget, please raise a ticket !
- CSS file should come as a raw file, there is a option to import it as a raw file if you use Vite or install package `raw-loader`
### License

[MIT](https://choosealicense.com/licenses/mit/)
