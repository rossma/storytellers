
function alertIcon (severity) {
  if (severity === 'error') {
    return 'warning'
  } else if (severity === 'warning') {
    return 'warning'
  } else if (severity === 'info') {
    return 'info'
  } else {
    return 'check_circle'
  }
}

export default {
  raiseAlert: (severity, message, ...args) => {
    console.log(`alert raised, severity:${severity} message:${message} args:${args}`)
    return {
      show: true,
      message: message,
      colour: severity,
      icon: alertIcon(severity)
    }
  }
}
