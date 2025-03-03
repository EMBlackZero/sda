const isProd = process.env.NODE_ENV === 'production'

const config = {
  isProd,
  serverUrlPrefix: isProd ? 'https://sda-556323513019.asia-southeast1.run.app' : 'https://sda-556323513019.asia-southeast1.run.app'
}

export default config;