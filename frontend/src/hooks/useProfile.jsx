import React, { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY_PROFILE = 'unipath_profile'
const STORAGE_KEY_ANALYSIS = 'unipath_analysis'
const STORAGE_KEY_COMPARE = 'unipath_compare_selections'

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
  const saved = localStorage.getItem(STORAGE_KEY_PROFILE)
  if (saved) {
    try {
      return { ...defaultProfile, ...JSON.parse(saved) }
    } catch {
      // ignore
    }
  }
  return defaultProfile
}

function loadAnalysis() {
  const saved = localStorage.getItem(STORAGE_KEY_ANALYSIS)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // ignore
    }
  }
  return null
}

function loadCompareSelections() {
  const saved = localStorage.getItem(STORAGE_KEY_COMPARE)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // ignore
    }
  }
  return []
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(loadProfile)
  const [analysis, setAnalysisState] = useState(loadAnalysis)
  const [loading, setLoading] = useState(false)
  const [compareSelections, setCompareSelectionsState] = useState(loadCompareSelections)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile))
  }, [profile])

  const setCompareSelections = (updater) => {
    setCompareSelectionsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem(STORAGE_KEY_COMPARE, JSON.stringify(next))
      return next
    })
  }

  const setAnalysis = (data) => {
    setAnalysisState(data)
    if (data) {
      localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(data))
      // Compare selections must never outlive the run that produced them. Prune any
      // selection whose program_id isn't in this analysis's recommendations -- this is
      // what clears out a previous run's (e.g. CS) universities when a new profile/program
      // (e.g. BBA) is analyzed, so "Add to Compare" isn't silently blocked by stale picks.
      const validIds = new Set((data.recommendations || []).map((r) => r.program_id))
      setCompareSelectionsState((prev) => {
        const next = prev.filter((s) => validIds.has(s.program_id))
        localStorage.setItem(STORAGE_KEY_COMPARE, JSON.stringify(next))
        return next
      })
    } else {
      localStorage.removeItem(STORAGE_KEY_ANALYSIS)
      setCompareSelectionsState([])
      localStorage.removeItem(STORAGE_KEY_COMPARE)
    }
  }

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const setField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const isComplete = () => {
    return (
      Boolean(profile.name) &&
      profile.matric_percentage !== '' &&
      profile.intermediate_percentage !== '' &&
      Boolean(profile.qualification) &&
      Boolean(profile.preferred_program) &&
      profile.budget !== ''
    )
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        setField,
        analysis,
        setAnalysis,
        loading,
        setLoading,
        isComplete,
        compareSelections,
        setCompareSelections,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
