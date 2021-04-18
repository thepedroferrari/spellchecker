import { FormEvent, KeyboardEvent, useState } from "react"
import "./CollectInput.css"

type Props = {
  onSubmit: (string: string) => void
}

const CollectInput = ({ onSubmit }: Props) => {
  const [text, setText] = useState("")

  const handleTextAreaKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault()
      onSubmit(text)
    }
  }

  const handleFormSubmit = (e: FormEvent<EventTarget>) => {
    e.preventDefault()
    onSubmit(text)
  }

  return (
    <form className="collect-input-form" onSubmit={handleFormSubmit}>
      <textarea
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleTextAreaKeyPress}
      />
      <input type="submit" value="Correct Spelling" />
    </form>
  )
}

export default CollectInput
