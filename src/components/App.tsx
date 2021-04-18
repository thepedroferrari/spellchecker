import React from "react"
import "./App.css"
import CollectInput from "./CollectInput"
import SpellingFixer from "./SpellingFixer"

const App = () => {
  const [text, setText] = React.useState("")
  return (
    <div className="App">
      <CollectInput onSubmit={setText} />
      {text && <SpellingFixer corpus={text} />}
    </div>
  )
}

export default App
