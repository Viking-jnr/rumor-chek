import { useState } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import ClaimForm from '@/components/ClaimForm';
import VerdictResult from '@/components/VerdictResult';
import BulletinForm from '@/components/BulletinForm';
import AccessGate from '@/components/AccessGate';
import NewsFeed from './components/NewsFeed';
import SettingsPage from './components/SettingsPage';


export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [result, setResult] = useState(null);
  const [accessCode, setAccessCode] = useState(() => sessionStorage.getItem('accessCode') || '');
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem('accessCode'));

  function handleUnlock(code) {
    setAccessCode(code);
    setUnlocked(true);
    sessionStorage.setItem('accessCode', code);
  }

  return (
    <SidebarProvider>
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <SidebarTrigger />
          <span className="font-medium capitalize">{activePage === 'home' ? 'Check a claim' : activePage}</span>
        </header>

        <main className="max-w-xl  w-full py-10 px-4  space-y-6">
          {activePage === 'home' && (
            <>
              <p className="text-gray-600">Heard something? Check if it's true before you share it.</p>
              <ClaimForm onResult={setResult} />
              {result && <VerdictResult result={result} />}
            </>
          )}

          {activePage === 'authority' && (
            unlocked
              ? <BulletinForm accessCode={accessCode} onUnauthorized={() => { setUnlocked(false); sessionStorage.removeItem('accessCode'); }} />
              : <AccessGate onUnlock={handleUnlock} />
          )}

          {activePage === 'news' && <NewsFeed />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}