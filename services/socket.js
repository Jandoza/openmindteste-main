// Lightweight event bus to mock socket.io client

let connected = false
const listeners = {
	notification: [],
	message: [],
	'user:status': []
}

export const initSocket = () => {
	connected = true
	return true
}

export const disconnectSocket = () => {
	connected = false
	Object.keys(listeners).forEach(evt => { listeners[evt] = [] })
}

export const onNotification = (callback) => {
	if (typeof callback === 'function') listeners.notification.push(callback)
}

export const offNotification = () => {
	listeners.notification = []
}

export const onMessage = (callback) => {
	if (typeof callback === 'function') listeners.message.push(callback)
}

export const offMessage = () => {
	listeners.message = []
}

export const onUserStatus = (callback) => {
	if (typeof callback === 'function') listeners['user:status'].push(callback)
}

export const offUserStatus = () => {
	listeners['user:status'] = []
}

export const emitTyping = () => {
	// no-op in mock
}

export function emitNotification(notification) {
	if (!connected) return
	listeners.notification.forEach(fn => {
		try { fn(notification) } catch (_) {}
	})
}


