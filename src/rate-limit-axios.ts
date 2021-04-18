import axios from "axios"

const rateLimitAxios = (windowMs = 10000, maxReq = 200): void => {
  const requests: number[] = []
  axios.interceptors.request.use(
    (config) => {
      const now = Date.now()
      requests.push(now)

      for (; now - requests[0] > windowMs; requests.shift());

      if (requests.length > maxReq) {
        throw new Error(
          `Request limit exceeded (${maxReq} requests per ${
            windowMs / 1000
          }-second window allowed). Do you have an infinite loop or large input?`,
        )
      }

      return config
    },
    (error) => Promise.reject(error),
  )
}

export default rateLimitAxios
