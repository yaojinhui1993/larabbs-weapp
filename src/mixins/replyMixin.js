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

      let user = await this.$parent.getCurrentUser()
      replies.forEach(reply => {
        reply.created_at_diff = util.diffForHumans(reply.created_at)

        reply.can_delete = this.canDelete(user, reply)
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

  canDelete(user, reply) {
    if (!user) {
      return false
    }

    return reply.user_id === user.id
  }

  methods = {
    async deleteReply({topic_id: topicId, id: replyId}) {
      let res = await wepy.showModal({
        title: '确认删除',
        content: '您确认删除该回复吗',
        confirm: '删除',
        cancelText: '取消'
      })

      if (!res.confirm) {
        return
      }

      let { statusCode, data } = await api.authRequest({
        url: `topics/${topicId}/replies/${replyId}`,
        method: 'DELETE'
      })

      if (statusCode === 204) {
        wepy.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000
        })

        this.replies = this.replies.filter((reply) => reply.id !== replyId)
        this.$apply()
      }

      return { statusCode, data }
    }

  }
}
