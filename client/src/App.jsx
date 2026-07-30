import { useState } from 'react';
import ClaimForm  from '@/components/ClaimForm';
import VerdictResult from './components/VerdictResult';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AccessGate from '@/components/AccessGate';
import BulletinForm from '@/components/BulletinForm';

function App() {
  const [result, setResult] = useState(null);
  const [accessCode, setAccessCode] = useState(() => sessionStorage.getItem('accessCode') || '');
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem('accessCode'));

  function handleUnlock(code) {
    setAccessCode(code);
    setUnlocked(true);
    sessionStorage.setItem('accessCode', code);
  }

  return (
    <div className='max-w-xl mx-auto py-12 px-4 space-y-6' style={{ textAlign: 'center'}}>
      <h1 className='text-2xl font-bold'>Rumor Check</h1>

      <Tabs defaultValue="rumor-check">
        <TabsList>
          <TabsTrigger value="rumor-check">Check a Claim</TabsTrigger>
          <TabsTrigger value="authority">Authority Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="rumor-check" className="space-y-6 pt-4">
           <p className='text-gray-600'>Heard Something? Check if it's true before you share it</p>
          <ClaimForm onResult = {setResult} />
          {result && <VerdictResult result={result} />}
        </TabsContent>

        <TabsContent value="authority" className="pt-4">
          {unlocked
            ? <BulletinForm accessCode={accessCode} onUnauthorized = {() => {setUnlocked(false); sessionStorage.removeItem('accessCode');}} />
            : <AccessGate onUnlock={handleUnlock} />
          }
        </TabsContent>
      </Tabs>
     
    </div>
  )
}

export default App
