// In-memory/localStorage backed mock API to run without a backend/DB

const STORAGE_KEYS = {
	USERS: 'mock_users',
	NOTIFS_PREFIX: 'mock_notifications_',
	CONTACTED_PREFIX: 'mock_contacted_patients_'
}

function delay(ms = 300) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function generateId(prefix = 'id') {
	return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

function readJSON(key, fallback) {
	try {
		const raw = localStorage.getItem(key)
		return raw ? JSON.parse(raw) : fallback
	} catch (_) {
		return fallback
	}
}

function writeJSON(key, value) {
	localStorage.setItem(key, JSON.stringify(value))
}

function getCurrentUser() {
	const raw = localStorage.getItem('user')
	if (!raw) return null
	try { return JSON.parse(raw) } catch { return null }
}

function seedUsersIfNeeded() {
	const existing = readJSON(STORAGE_KEYS.USERS, null)
	if (existing && Array.isArray(existing) && existing.length) return existing

	const now = new Date().toISOString()
	const psychologists = [
		{
			_id: 'psy_1', name: 'Dr. Ana Souza', email: 'ana.souza@example.com', userType: 'psicologo',
			specialties: ['Ansiedade', 'Depressão'], description: 'Estagiária dedicada com foco em TCC.',
			experience: '6 meses de estágio supervisionado', availability: 'Seg à Sex, 14h-18h', createdAt: now
		},
		{
			_id: 'psy_2', name: 'Dr. Bruno Lima', email: 'bruno.lima@example.com', userType: 'psicologo',
			specialties: ['Autoestima', 'Relacionamentos'], description: 'Atendimento acolhedor e humanizado.',
			experience: '8 meses de estágio', availability: 'Seg, Qua e Sex, 9h-12h', createdAt: now
		},
		{
			_id: 'psy_3', name: 'Dra. Camila Reis', email: 'camila.reis@example.com', userType: 'psicologo',
			specialties: ['Estresse', 'Burnout'], description: 'Abordagem centrada na pessoa.',
			experience: '1 ano de estágio', availability: 'Ter e Qui, 13h-17h', createdAt: now
		}
	]

	const patients = [
		{ _id: 'pat_1', name: 'Lucas Pereira', email: 'lucas.pereira@example.com', userType: 'paciente', phone: '(11) 98888-0001', createdAt: now },
		{ _id: 'pat_2', name: 'Mariana Alves', email: 'mariana.alves@example.com', userType: 'paciente', phone: '(11) 98888-0002', createdAt: now },
		{ _id: 'pat_3', name: 'Rafael Gomes', email: 'rafael.gomes@example.com', userType: 'paciente', phone: '(11) 98888-0003', createdAt: now }
	]

	const users = [...psychologists, ...patients]
	writeJSON(STORAGE_KEYS.USERS, users)
	return users
}

function getAllUsers() {
	return seedUsersIfNeeded()
}

function setAllUsers(users) {
	writeJSON(STORAGE_KEYS.USERS, users)
}

function getUserNotifications(userId) {
	return readJSON(STORAGE_KEYS.NOTIFS_PREFIX + userId, [])
}

function setUserNotifications(userId, notifications) {
	writeJSON(STORAGE_KEYS.NOTIFS_PREFIX + userId, notifications)
}

function getContactedPatients(psychologistId) {
	return readJSON(STORAGE_KEYS.CONTACTED_PREFIX + psychologistId, [])
}

function setContactedPatients(psychologistId, patients) {
	writeJSON(STORAGE_KEYS.CONTACTED_PREFIX + psychologistId, patients)
}

// Import lazy to avoid potential circulars when bundlers reorder
let emitNotification
try {
	// eslint-disable-next-line no-undef
	({ emitNotification } = await import('./socket.js'))
} catch (_) {
	// ignore if not available during initial eval; will be undefined
}

async function handlePost(url, body) {
	const currentUser = getCurrentUser()
	switch (true) {
		case url === '/auth/login': {
			const { email, userType } = body || {}
			let users = getAllUsers()
			let user = users.find(u => u.email === email && (!userType || u.userType === userType))
			if (!user) {
				user = { _id: generateId('u'), name: email.split('@')[0], email, userType: userType || 'paciente', createdAt: new Date().toISOString() }
				users = [...users, user]
				setAllUsers(users)
			}
			const token = 'mock-token-' + user._id
			return { data: { data: { user, token } } }
		}
		case url === '/auth/register': {
			const { name, email, userType, phone, crp } = body || {}
			let users = getAllUsers()
			if (users.some(u => u.email === email)) {
				throw new Error('Email já cadastrado')
			}
			const user = { _id: generateId('u'), name, email, userType, phone: phone || '', crp: crp || '', createdAt: new Date().toISOString() }
			users = [...users, user]
			setAllUsers(users)
			const token = 'mock-token-' + user._id
			return { data: { data: { user, token } } }
		}
		case url === '/notifications': {
			if (!currentUser) throw new Error('Não autenticado')
			const { recipient, type, title, message, actionUrl } = body || {}
			if (!recipient) throw new Error('Recipient é obrigatório')
			const notif = {
				_id: generateId('n'),
				type: type || 'message',
				title: title || 'Nova Notificação',
				message: message || '',
				read: false,
				createdAt: new Date().toISOString(),
				actionUrl: actionUrl || '',
				sender: { _id: currentUser._id, name: currentUser.name, email: currentUser.email },
				recipient
			}
			const currentList = getUserNotifications(recipient)
			setUserNotifications(recipient, [notif, ...currentList])
			// Track contacted patients when a psychologist views a profile
			if (type === 'profile_view') {
				const contacted = getContactedPatients(currentUser._id)
				const users = getAllUsers()
				const patient = users.find(u => u._id === recipient)
				if (patient && !contacted.find(p => p._id === patient._id)) {
					setContactedPatients(currentUser._id, [{ ...patient }, ...contacted])
				}
			}
			if (typeof emitNotification === 'function') {
				try { emitNotification(notif) } catch (_) {}
			}
			return { data: { data: notif } }
		}
		default:
			throw new Error(`Endpoint não suportado (POST): ${url}`)
	}
}

async function handleGet(url) {
	const currentUser = getCurrentUser()
	switch (true) {
		case url === '/notifications': {
			if (!currentUser) throw new Error('Não autenticado')
			const list = getUserNotifications(currentUser._id)
			const unreadCount = list.filter(n => !n.read).length
			return { data: { data: list, unreadCount } }
		}
		case url === '/users/psychologists': {
			const data = getAllUsers().filter(u => u.userType === 'psicologo')
			return { data: { data } }
		}
		case url === '/users/patients': {
			const data = getAllUsers().filter(u => u.userType === 'paciente')
			return { data: { data } }
		}
		case url === '/users/patients-contacted': {
			if (!currentUser) throw new Error('Não autenticado')
			const data = getContactedPatients(currentUser._id)
			return { data: { data } }
		}
		default:
			throw new Error(`Endpoint não suportado (GET): ${url}`)
	}
}

async function handlePut(url, body) {
	const currentUser = getCurrentUser()
	switch (true) {
		case url.startsWith('/notifications/') && url.endsWith('/read'): {
			if (!currentUser) throw new Error('Não autenticado')
			const id = url.split('/')[2]
			const list = getUserNotifications(currentUser._id)
			const updated = list.map(n => n._id === id ? { ...n, read: true } : n)
			setUserNotifications(currentUser._id, updated)
			return { data: { success: true } }
		}
		case url === '/notifications/read-all': {
			if (!currentUser) throw new Error('Não autenticado')
			const list = getUserNotifications(currentUser._id).map(n => ({ ...n, read: true }))
			setUserNotifications(currentUser._id, list)
			return { data: { success: true } }
		}
		case url === '/users/profile': {
			if (!currentUser) throw new Error('Não autenticado')
			const users = getAllUsers()
			const idx = users.findIndex(u => u._id === currentUser._id)
			if (idx === -1) throw new Error('Usuário não encontrado')
			const updatedUser = { ...users[idx], ...body }
			users[idx] = updatedUser
			setAllUsers(users)
			localStorage.setItem('user', JSON.stringify(updatedUser))
			return { data: { data: updatedUser } }
		}
		default:
			throw new Error(`Endpoint não suportado (PUT): ${url}`)
	}
}

async function handleDelete(url) {
	const currentUser = getCurrentUser()
	switch (true) {
		case url.startsWith('/notifications/'): {
			if (!currentUser) throw new Error('Não autenticado')
			const id = url.split('/')[2]
			const list = getUserNotifications(currentUser._id)
			const updated = list.filter(n => n._id !== id)
			setUserNotifications(currentUser._id, updated)
			return { data: { success: true } }
		}
		default:
			throw new Error(`Endpoint não suportado (DELETE): ${url}`)
	}
}

const api = {
	async get(url) {
		await delay()
		return handleGet(url)
	},
	async post(url, body) {
		await delay()
		return handlePost(url, body)
	},
	async put(url, body) {
		await delay()
		return handlePut(url, body)
	},
	async delete(url) {
		await delay()
		return handleDelete(url)
	}
}

export default api


