import { useEffect } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import Router from '@shared/router/Router'
import { useCollectionsStore } from '@shared/stores/collectionsStore'

export default function MainLayout(): JSX.Element {
  const loadCollections = useCollectionsStore((s) => s.loadCollections)

  useEffect(() => { loadCollections() }, [])

  return (
    <div className="flex flex-col h-full bg-surface-500">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex flex-1 overflow-hidden">
          <Router />
        </main>
      </div>
    </div>
  )
}
