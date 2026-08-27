import { useState, useEffect } from 'react'

const STORAGE_KEY = 'unipath_profile'

const defaultProfile = {
  name: '',
  matric_percentage: '',
  intermediate_percentage: '',
  qualification: '',
  subjects: [],
  tests: [],
  preferred_program: '',
  budget: '',
  location: 'Lahore',
}

function loadProfile() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return { ...defaultProfile, ...JSON.parse(saved) }
    } catch {
      // ignore
    }
  }
  return defaultProfile
}

export function useProfile() {
  const [profile, setProfile] = useState(loadProfile)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const setField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const isComplete = () => {
    return (
      profile.name &&
      profile.matric_percentage !== '' &&
      profile.intermediate_percentage !== '' &&
      profile.qualification &&
      profile.preferred_program &&
      profile.budget !== ''
    )
  }

  return {
    profile,
    setProfile,
    updateProfile,
    setField,
    analysis,
    setAnalysis,
    loading,
    setLoading,
    isComplete,
  }
}
