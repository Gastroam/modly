import { useEffect } from 'react'
import { useAppStore } from '@shared/stores/appStore'
import FirstRunSetup from '@areas/setup/FirstRunSetup'
import MainLayout from '@shared/components/layout/MainLayout'

export default function App(): JSX.Element {
  const { checkSetup, setupStatus, initApp, backendStatus } = useAppStore()

  useEffect(() => {
    checkSetup()
  }, [])

  useEffect(() => {
    if (setupStatus === 'done') initApp()
  }, [setupStatus])

  if (backendStatus === 'ready') return <MainLayout />
  return <FirstRunSetup />
}
