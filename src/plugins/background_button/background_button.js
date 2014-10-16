var UICorePlugin = require('../../base/ui_core_plugin')
var JST = require('../../base/jst')
var Styler = require('../../base/styler')

class BackgroundButton extends UICorePlugin {
  get template() { return JST.background_button }
  get name() { return 'background_button' }
  get events() {
    return {
      'click .background-button-icon': 'click'
    }
  }
  get attributes() {
    return {
      'class': 'background-button',
      'data-background-button': '',
    }
  }
  constructor(core) {
    super(core)
    this.core = core
    this.settingsUpdate()
  }

  bindEvents() {
    this.listenTo(this.core.mediaControl.container, 'container:state:buffering', this.hide)
    this.listenTo(this.core.mediaControl.container, 'container:state:bufferfull', this.show)
    this.listenTo(this.core.mediaControl.container, 'container:settingsupdate', this.settingsUpdate)
    this.listenTo(this.core.mediaControl.container, 'container:dvr', this.settingsUpdate)
    this.listenTo(this.core.mediaControl, 'mediacontrol:containerchanged', this.settingsUpdate)
    this.listenTo(this.core.mediaControl, 'mediacontrol:show', this.show)
    this.listenTo(this.core.mediaControl, 'mediacontrol:hide', this.hide)
    this.listenTo(this.core.mediaControl, 'mediacontrol:playing', this.playing)
    this.listenTo(this.core.mediaControl, 'mediacontrol:notplaying', this.notplaying)
  }

  settingsUpdate() {
    this.stopListening()
    if(this.shouldRender()) {
      this.render()
      this.bindEvents()
      if (this.core.mediaControl.container.isPlaying()) {
        this.playing()
      } else {
        this.notplaying()
      }
    } else {
      this.hide()
      this.listenTo(this.core.mediaControl.container, 'container:settingsupdate', this.settingsUpdate)
      this.listenTo(this.core.mediaControl.container, 'container:dvr', this.settingsUpdate)
      this.listenTo(this.core.mediaControl, 'mediacontrol:containerchanged', this.settingsUpdate)
    }
  }

  shouldRender() {
    //this plugin should render only if there is a playpause icon in media control
    var settings = this.core.mediaControl.settings
    var useBackgroundButton = this.core.options.useBackgroundButton === undefined || !!this.core.options.useBackgroundButton
    return useBackgroundButton && (this.core.mediaControl.$el.find('[data-playstop]').length > 0 || this.core.mediaControl.$el.find('[data-playpause]').length > 0)
  }

  click() {
    if (this.shouldStop) {
      this.core.mediaControl.togglePlayStop()
    } else {
      this.core.mediaControl.togglePlayPause()
    }
  }

  show() {
    this.$el.removeClass('hide')
  }

  hide() {
    this.$el.addClass('hide')
  }

  enable() {
    this.stopListening()
    super()
    this.$playPauseButton.hide()
    this.$playStopButton.hide()
  }

  disable() {
    super()
    this.$playPauseButton.show()
    this.$playStopButton.show()
  }

  playing() {
    this.$buttonIcon
      .removeClass('notplaying')
      .addClass('playing')
  }

  notplaying() {
    this.$buttonIcon
      .removeClass('playing')
      .addClass('notplaying')
  }

  getExternalInterface() {}

  render() {
    var style = Styler.getStyleFor(this.name)
    this.$el.html(this.template())
    this.$el.append(style)
    this.$playPauseButton = this.core.mediaControl.$el.find('[data-playpause]')
    this.$playStopButton = this.core.mediaControl.$el.find('[data-playstop]')
    this.$buttonIcon = this.$el.find('.background-button-icon[data-background-button]')
    this.shouldStop = this.$playStopButton.length > 0
    this.core.$el.append(this.$el)
    if (this.enabled) {
      this.$playPauseButton.hide()
      this.$playStopButton.hide()
    }
    if (this.shouldStop) {
      this.$buttonIcon.addClass('playstop')
    }
    if (this.core.mediaControl.isVisible()) {
      this.show()
    }
    return this
  }
}

module.exports = BackgroundButton;
