const isProd = process.env.NODE_ENV === 'production'

const config = {
  isProd,
  serverUrlPrefix: isProd ? 'https://sda-556323513019.asia-southeast1.run.app' : 'http://localhost:1337',
  cloud_fun : isProd ? 'https://delete-message-556323513019.asia-southeast1.run.app' : 'http://localhost:1337'
}

export default config;