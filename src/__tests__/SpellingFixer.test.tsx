import axios from "axios"
import { act } from "react-dom/test-utils"
import { mount } from "enzyme"
import mockResponses from "../mock_responses/mock-responses"
import SpellingFixer from "../components/SpellingFixer"

jest.mock("axios")
const mockAxios = axios as jest.Mocked<typeof axios>

describe("SpellingFixer", () => {
  const makeGetMock = (params: any) => {
    mockAxios.get.mockImplementation(
      (url: string, options: any): Promise<any> => {
        if (
          url.includes("corrections") &&
          options.params &&
          options.params.word in params
        ) {
          return Promise.resolve(params[options.params.word])
        }

        return Promise.reject({ status: 422 })
      },
    )
  }

  const makePostMock = (mockResponse: any, uncorrectedText: string) => {
    mockAxios.post.mockImplementationOnce(
      (url: string, params: any): Promise<any> => {
        if (
          url.includes("checkspelling") &&
          params &&
          params.corpus === uncorrectedText
        ) {
          return Promise.resolve(mockResponse)
        }

        return Promise.reject({ status: 422 })
      },
    )
  }

  afterEach(() => jest.resetAllMocks())

  for (const mock of mockResponses) {
    it(`should correct "${mock.corpus}" -> "${mock.expected}"`, async () => {
      makePostMock(mock.POST, mock.corpus)
      makeGetMock(mock.GET)
      const wrapper = mount(<SpellingFixer corpus={mock.corpus} />)

      await act(() => new Promise(setImmediate))
      wrapper.update()

      expect(mockAxios.post).toHaveBeenCalledTimes(1)
      expect(mockAxios.get).toHaveBeenCalledTimes(
        Object.values(mock.GET).length,
      )
      const result = wrapper.find(".corrected-text").hostNodes()
      expect(result.text()).toEqual(mock.expected)
    })
  }
})
