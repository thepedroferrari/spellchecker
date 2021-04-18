import axios, { AxiosResponse } from "axios"
import _words from "lodash/words"
import { useEffect, useState } from "react"
import {
  GET_CORRECTIONS_ENDPOINT,
  GET_MISPELLED_ENDPOINT,
  POST_CHECK_SPELLING_ENDPOINT,
} from "../constants"
import LoadingSpinner from "./LoadingSpinner"
import ShowCorrected from "./ShowCorrected"

type Props = { corpus: string }

type MispelledApiResponse = {
  word: string
  mispelled: boolean
}

type CorrectionsApiResponse = {
  corrections: string[]
}

type MispellingPosition = {
  start: number
  end: number
}

type PositionApiResponse = {
  misspellings: MispellingPosition[]
}

const getCorrections = async (words: AxiosResponse<MispelledApiResponse>[]) => {
  const incorrectWordsRequest: Promise<
    AxiosResponse<CorrectionsApiResponse>
  >[] = []

  words.forEach(({ data: { word, mispelled } }) => {
    if (mispelled) {
      incorrectWordsRequest.push(
        axios.get<CorrectionsApiResponse>(`${GET_CORRECTIONS_ENDPOINT}`, {
          params: {
            word,
          },
        }),
      )
    }
  })

  const incorrectWordsResponse = await Promise.all([
    ...incorrectWordsRequest,
  ]).then(async (res) => {
    return res
  })

  const correctWords = incorrectWordsResponse.map((w) => w.data.corrections[0])

  return correctWords
}

const getMispelledWords = async (words: string) => {
  const wordsArr = _words(words)
  const checkMispelledRequest = wordsArr.map((word) =>
    axios.get<MispelledApiResponse>(`${GET_MISPELLED_ENDPOINT}`, {
      params: {
        word,
      },
    }),
  )

  const mispelledResponses = await Promise.all([...checkMispelledRequest]).then(
    async (res) => res,
  )

  return mispelledResponses
}

const getWordPosition = async (corpus: string) => {
  const positions = await axios
    .post<PositionApiResponse>(`${POST_CHECK_SPELLING_ENDPOINT}`, {
      corpus,
    })
    .then((data) => data.data.misspellings)
  return positions
}

const setCharAt = (str: string, start: number, end: number, word: string) => {
  const before = str.substr(0, start)
  const after = str.substr(end)

  return `${before}${word}${after}`
}

const makeNewCorpus = (
  corrections: string[],
  positions: MispellingPosition[],
  originalCorpus: string,
) => {
  let newCorpus = originalCorpus

  corrections.reverse().forEach((correction, i) => {
    const { start, end } = positions[positions.length - 1 - i]
    newCorpus = setCharAt(newCorpus, start, end, correction)
  })

  return newCorpus
}

/**
 *
 * @param corpus string
 * @requires getMispelledWords
 * @requires getCorrections
 *
 * @description This function will breakdown a string into multiple words and
 * make API requests in order to make spell corrections
 *
 * @returns corrected corpus as string
 */
const fetchAllWords = async (corpus: string) => {
  // 1. Check api to see which words are mispelled
  const mispelledWords = await getMispelledWords(corpus)
  // 2. Get the correction for those words
  const corrections = await getCorrections(mispelledWords)
  // 3. Get the position within the text that those words belong
  const positions = await getWordPosition(corpus)
  // 4. Return a new text with corrected words changed, while keeping everything
  //    else the same.
  const newCorpus = makeNewCorpus(corrections, positions, corpus)

  return newCorpus
}

const SpellingFixer = ({ corpus }: Props) => {
  const [corrected, setCorrected] = useState<string | null>(null)

  useEffect(() => {
    // const cancelToken = axios.CancelToken
    // const source = cancelToken.source()
    setCorrected(null)

    const asyncFunc = async () => {
      try {
        const correctedCorpus = await fetchAllWords(corpus)
        setCorrected(correctedCorpus)
      } catch (error) {
        // throw new Error(error.message)
      }
    }
    asyncFunc()

    return () => {
      // source.cancel("axios request cancelled")
    }
  }, [corpus])

  return (
    <>
      {corrected === null ? (
        <LoadingSpinner />
      ) : (
        <ShowCorrected text={corrected} />
      )}
    </>
  )
}

export default SpellingFixer
