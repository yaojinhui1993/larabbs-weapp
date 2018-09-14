import wepy from 'wepy'

const host = 'http://larabbs.test/api'

const request = async (options, showLoading = true) => {
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }
  options.url = host + '/' + options.url

  showLoading && wepy.showLoading({
    title: '加载中'
  })

  let response = await wepy.request(options)

  showLoading && wepy.hideLoading()

  if (response.statusCode === 500) {
    wepy.showModal({
      title: '提示',
      content: '服务器错误，请联系管理员或重试'
    })
  }

  return response
}

const login = async (params = {}) => {
  let loginData = await wepy.login()

  params.code = loginData.code

  let authResponse = await request({
    url: 'weapp/authorizations',
    data: params,
    method: 'POST'
  })

  if (authResponse.statusCode === 201) {
    wepy.setStorageSync('access_token', authResponse.data.access_token)
    wepy.setStorageSync('access_token_expired_at', new Date().getTime() + authResponse.data.expires_in * 1000)
  }

  return authResponse
}

const refreshToken = async (accessToken) => {
  let { statusCode, data } = await request({
    url: 'authorizations/current',
    method: 'PUT',
    header: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (statusCode === 200) {
    wepy.setStorageSync('access_token', data.access_token)
    wepy.setStorageSync('access_token_expired_at', new Date().getTime() + data.expires_in * 1000)
  }

  return { statusCode, data }
}

const getToken = async (options) => {
  let accessToken = wepy.getStorageSync('access_token')
  let expiredAt = wepy.getStorageSync('access_token_expired_at')

  if (accessToken && new Date().getTime() > expiredAt) {
    let { statusCode, data } = await refreshToken(accessToken)

    if (statusCode === 200) {
      accessToken = data.access_token
    } else {
      let { statusCode, data } = await login()
      if (statusCode === 201) {
        accessToken = data.access_token
      }
    }
  }

  return accessToken
}

const authRequest = async (options, showLoading = true) => {
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }

  let accessToken = await getToken()

  let header = options.header || {}
  header.Authorization = `Bearer ${accessToken}`
  options.header = header

  return request(options, showLoading)
}

const logout = async (params = {}) => {
  let { statusCode, data } = await authRequest({
    url: 'authorizations/current',
    method: 'DELETE'
  })

  if (statusCode === 204) {
    wepy.clearStorage()
  }

  return { statusCode, data }
}

const uploadFile = async (options = {}) => {
  wepy.showLoading({
    title: '上传中'
  })

  let accessToken = await getToken()

  options.url = `${host}/${options.url}`
  let header = options.header || {}
  header.Authorization = `Bearer ${accessToken}`
  options.header = header

  let response = await wepy.uploadFile(options)

  wepy.hideLoading()

  return response
}

export default {
  request,
  login,
  refreshToken,
  getToken,
  authRequest,
  logout,
  uploadFile
}
