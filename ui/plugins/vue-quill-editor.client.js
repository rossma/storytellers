import Vue from 'vue'
import Quill from 'quill'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

import ImageResize from 'quill-image-resize-module'

Quill.register('modules/imageResize', ImageResize)

Vue.use(VueQuillEditor)
