<template>
  <base-page-publish
    v-model="basePagePublishModel"
    :dialog="dialog"
    :page="page"
    :theme="'secondary'"
    :title="title"
    :uid="uid"
    :user-display-name="userDisplayName"
    @published="this.$emit('published', false)"
    @close="closeDialog()"
  >
    <template #form-action-buttons="slotProps">
      <v-btn
        color="secondary"
        @click="publish()"
      >
        <v-icon float-left>
          mdi-launch
        </v-icon>
        Save & Publish
      </v-btn>
    </template>
  </base-page-publish>
</template>
<script>
import debug from 'debug'
import BasePagePublish from '~/components/BasePagePublish'

const log = debug('app:components/PageContributionPublish')

export default {
  name: 'PageContributionPublish',
  components: {
    BasePagePublish
  },
  props: {
    contribution: {
      type: Object,
      required: true
    },
    dialog: {
      type: Boolean,
      default: false
    },
    quote: {
      type: Object,
      required: true
    },
    imageSrc: {
      type: String,
      default: ''
    },
    uid: {
      type: String,
      required: true
    },
    userDisplayName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      basePagePublishModel: {
        background: {
          type: '',
          val: ''
        },
        summary: ''
      },
    }
  },
  computed: {
    page: function() {
      log('in page', this.quote)
      log('in page this.imageSrc:', this.imageSrc)
      const page = {
        quote: this.quote,
        image: {
          ref: this.imageSrc
        }
      }
      return page
    },
    title: function() {
      return 'Save and Publish Page Collaboration'
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in page contr publish on mounted')
    })
  },
  methods: {
    // isQuotePage: function() {
    //   return true
    //   // return this.page.quote && this.page.quote.src
    // },
    publish() {
      log('publishing')
      // this.$emit('publish', this.summary)
      // todo ...

      this.$emit('publish', this.basePagePublishModel)
    },
    closeDialog() {
      this.$emit('close')
    }
  }
}
</script>
