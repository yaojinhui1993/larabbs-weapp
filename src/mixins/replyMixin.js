import wepy from 'wepy'
import api from '@/utils/api'
import util from '@/utils/util'

export default class replyMixin extends wepy.mixin {
  config = {
    enablePullDownRefresh: true
  }

  data = {
    replies: [],
    noMoreData: false,
    isLoading: false,
    page: 1
  }

  async getReplies(reset = false) {
    let { statusCode, data } = await api.request({
      url: this.requestData.url,
      data: {
        page: this.page,
        include: this.requestData.include || 'user'
      }
    })

    if (statusCode === 200) {
      let replies = data.data
      replies.forEach(reply => {
        reply.created_at_diff = util.diffForHumans(reply.created_at)
      })

      this.replies = reset ? replies : [...this.replies, ...replies]
      let pagination = data.meta.pagination
      if (pagination.current_page === pagination.total_pages) {
        this.noMoreData = true
      }

      this.$apply()
    }

    return { statusCode, data }
  }

  async onPullDownRefresh() {
    this.noMoreData = false
    this.page = 1
    await this.getReplies(true)
    wepy.stopPullDownRefresh()
  }

  async onReachBottom() {
    if (this.noMoreData || this.isLoading) {
      return false
    }

    this.isLoading = true
    this.page = this.page + 1
    await this.getReplies()
    this.isLoading = false
    this.$apply()
  }
}
