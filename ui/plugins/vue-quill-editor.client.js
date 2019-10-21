import Vue from 'vue'
import VueQuillEditor, { Quill } from 'vue-quill-editor'
import { ImageDrop } from 'quill-image-drop-module'
import ImageResize from 'quill-image-resize-module'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

// const Delta = Quill.import('delta')

// https://quilljs.com/guides/how-to-customize-quill/#class-vs-inline
// https://stackoverflow.com/questions/38623716/how-to-add-custom-font-sizes-to-quilljs-editor
// https://github.com/quilljs/quill/blob/develop/quill.js#L46
// https://github.com/quilljs/quill/blob/develop/formats/size.js

Quill.register('modules/imageDrop', ImageDrop)
Quill.register('modules/imageResize', ImageResize)

// configure Quill to use inline styles so the preview html format works properly
const DirectionAttribute = Quill.import('attributors/attribute/direction')
Quill.register(DirectionAttribute, true)

const AlignClass = Quill.import('attributors/class/align')
Quill.register(AlignClass, true)

const BackgroundClass = Quill.import('attributors/class/background')
Quill.register(BackgroundClass, true)

const ColorClass = Quill.import('attributors/class/color')
Quill.register(ColorClass, true)

const DirectionClass = Quill.import('attributors/class/direction')
Quill.register(DirectionClass, true)

const FontClass = Quill.import('attributors/class/font')
Quill.register(FontClass, true)

const SizeClass = Quill.import('attributors/class/size')
SizeClass.whitelist = ['small', 'false', 'large', 'huge']
// SizeClass.whitelist = ['normal', 'large', 'huge']
Quill.register(SizeClass, true)

const AlignStyle = Quill.import('attributors/style/align')
Quill.register(AlignStyle, true)

const BackgroundStyle = Quill.import('attributors/style/background')
Quill.register(BackgroundStyle, true)

const ColorStyle = Quill.import('attributors/style/color')
Quill.register(ColorStyle, true)

const DirectionStyle = Quill.import('attributors/style/direction')
Quill.register(DirectionStyle, true)

const FontStyle = Quill.import('attributors/style/font')
Quill.register(FontStyle, true)

const SizeStyle = Quill.import('attributors/style/size')
// SizeStyle.whitelist = ['24px', '26px', '28px']
SizeStyle.whitelist = ['0.75em', '1em', '1.5em', '2em']
// SizeStyle.whitelist = ['14px', '26px', '38px', '48px']
Quill.register(SizeStyle, true)

Vue.use(VueQuillEditor)
