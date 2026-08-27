const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Request failed: ${response.status}`)
  }

  return response.json()
}

export const api = {
  health: () => request('/api/health'),

  analyzeProfile: (profile) => request('/api/profile/analyze', {
    method: 'POST',
    body: JSON.stringify(profile),
  }),

  getUniversities: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return request(`/api/universities?${params.toString()}`)
  },

  getUniversity: (id) => request(`/api/universities/${id}`),

  getRecommendations: (profile) => request('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify(profile),
  }),

  comparePrograms: (selections) => request('/api/compare', {
    method: 'POST',
    body: JSON.stringify(selections),
  }),

  getDeadlines: () => request('/api/deadlines'),

  getAnalytics: (profile) => request('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(profile),
  }),

  chatWithCounselor: (message, profile = {}, context = {}) => request('/api/counselor/chat', {
    method: 'POST',
    body: JSON.stringify({ message, profile, context }),
  }),
}
