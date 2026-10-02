import { useState, useEffect } from 'react';

// ... (Keep your exact same Clash interface from before) ...
interface Clash {
  id: number;
  challenger_id: number;
  opponent_id: number | null;
  category: string;
  challenger_task: string;
  opponent_task: string | null;
  challenger_proof: string | null;
  opponent_proof: string | null;
  challenger_completed: boolean;
  opponent_completed: boolean;
  challenger_vote: string | null;
  opponent_vote: string | null;
  reward_stake: string;
  deadline: string;
  status: string;
}

export default function ClashArena() {
  const [tab, setTab] = useState<'public' | 'my-clashes'>('public');
  const [publicClashes, setPublicClashes] = useState<Clash[]>([]);
  const [myClashes, setMyClashes] = useState<Clash[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const [newClash, setNewClash] = useState({ category: 'Tech', challenger_task: '', reward_stake: '', deadline: '' });
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [opponentTaskInput, setOpponentTaskInput] = useState('');
  
  const [proofFiles, setProofFiles] = useState<{ [key: number]: File | null }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ... (Keep all your exact same useEffect and fetch/submit functions here) ...
  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Log in to access the Arena.'); return; }
    try {
      const userRes = await fetch('http://localhost:8000/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } });
      if (userRes.ok) { setCurrentUserId((await userRes.json()).id); }
      if (tab === 'public') {
        const res = await fetch('http://localhost:8000/api/clashes/public', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setPublicClashes(await res.json());
      } else {
        const res = await fetch('http://localhost:8000/api/clashes/', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setMyClashes(await res.json());
      }
    } catch (err) { setError('Failed to sync arena data.'); }
  };

  const handleCreateClash = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    const token = localStorage.getItem('token');
    try {
      const formattedDeadline = new Date(newClash.deadline).toISOString();
      const res = await fetch('http://localhost:8000/api/clashes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newClash, deadline: formattedDeadline })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to drop challenge');
      }
      setSuccess('Challenge dropped! Check "My Active Duels".');
      setNewClash({ category: 'Tech', challenger_task: '', reward_stake: '', deadline: '' });
      fetchData();
    } catch (err: any) { setError(err.message); }
  };

  const handleAcceptClash = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/clashes/${id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ opponent_task: opponentTaskInput })
      });
      if (res.ok) { setAcceptingId(null); setOpponentTaskInput(''); setTab('my-clashes'); fetchData(); }
    } catch (err) { setError('Failed to accept'); }
  };

  const handleSubmitProof = async (id: number) => {
    const token = localStorage.getItem('token');
    const selectedFile = proofFiles[id];
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await fetch(`http://localhost:8000/api/clashes/${id}/proof`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (res.ok) { setProofFiles({ ...proofFiles, [id]: null }); fetchData(); setSuccess('Proof uploaded successfully!'); }
    } catch (err) { setError('Upload failed'); }
  };

  const handleJudge = async (id: number, vote: 'approve' | 'reject') => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/clashes/${id}/judge`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ vote })
      });
      if (res.ok) { setSuccess(`You voted to ${vote}!`); fetchData(); }
    } catch (err) { setError('Failed to submit verdict'); }
  };

  return (
    <div className="pb-24 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Giant Header */}
        <div className="text-center mt-10">
          <h1 className="text-[5rem] md:text-[9rem] font-black text-[#F14A3B] tracking-tighter uppercase leading-none transform scale-y-110 mb-4 drop-shadow-sm animate-bounce">
            ARENA
          </h1>
          <p className="text-stone-600 font-bold tracking-wider uppercase text-sm md:text-base">Micro-tasks. Macro-stakes. Let's go.</p>
        </div>

        {error && <div className="p-5 bg-red-100 text-[#F14A3B] rounded-2xl text-center font-black uppercase tracking-widest">{error}</div>}
        {success && <div className="p-5 bg-green-100 text-green-700 rounded-2xl text-center font-black uppercase tracking-widest">{success}</div>}

        {/* Tab Switcher - Pill style */}
        <div className="flex justify-center gap-4 bg-white p-2 rounded-full shadow-lg w-fit mx-auto border-2 border-[#FDEBD0]">
          <button onClick={() => setTab('public')} className={`px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm transition-all ${tab === 'public' ? 'bg-[#F14A3B] text-white shadow-md transform scale-105' : 'bg-transparent text-stone-400 hover:text-[#F14A3B]'}`}>🌐 Public Feed</button>
          <button onClick={() => setTab('my-clashes')} className={`px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm transition-all ${tab === 'my-clashes' ? 'bg-[#F14A3B] text-white shadow-md transform scale-105' : 'bg-transparent text-stone-400 hover:text-[#F14A3B]'}`}>⚔️ Active Duels</button>
        </div>

        {/* Create Challenge Form */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-4 border-transparent hover:border-[#F14A3B]/10 transition-all duration-300">
          <h2 className="text-3xl font-black mb-8 text-[#F14A3B] tracking-tighter uppercase">Drop a Challenge</h2>
          <form onSubmit={handleCreateClash} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase text-stone-400 mb-2 font-black tracking-widest">Category</label>
              <select value={newClash.category} onChange={(e) => setNewClash({ ...newClash, category: e.target.value })} className="w-full bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-2xl px-5 py-4 text-stone-800 font-bold focus:border-[#F14A3B] outline-none transition-colors">
                <option value="Tech">💻 Tech / Coding</option>
                <option value="Fitness">🏋‍♂️️ Fitness / Gym</option>
                <option value="Study">📚 Study / Academics</option>
                <option value="Gaming">🎮 Gaming</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-400 mb-2 font-black tracking-widest">Reward / Stake</label>
              <input type="text" placeholder="Winner gets bragging rights" value={newClash.reward_stake} onChange={(e) => setNewClash({ ...newClash, reward_stake: e.target.value })} required className="w-full bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-2xl px-5 py-4 text-stone-800 font-bold focus:border-[#F14A3B] outline-none transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase text-stone-400 mb-2 font-black tracking-widest">Target Task</label>
              <input type="text" placeholder="Solve 3 LeetCode Meds" value={newClash.challenger_task} onChange={(e) => setNewClash({ ...newClash, challenger_task: e.target.value })} required className="w-full bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-2xl px-5 py-4 text-stone-800 font-bold focus:border-[#F14A3B] outline-none transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase text-stone-400 mb-2 font-black tracking-widest">Deadline</label>
              <input type="datetime-local" value={newClash.deadline} onChange={(e) => setNewClash({ ...newClash, deadline: e.target.value })} required className="w-full bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-2xl px-5 py-4 text-stone-800 font-bold focus:border-[#F14A3B] outline-none transition-colors" />
            </div>
            <button type="submit" className="md:col-span-2 bg-[#F14A3B] text-white font-black text-xl uppercase tracking-widest py-5 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-[#F14A3B]/20 mt-2">Deploy Challenge</button>
          </form>
        </div>

        {tab === 'public' ? (
          <div className="space-y-6">
            {publicClashes.map((clash) => (
              <div key={clash.id} className="bg-white border-4 border-transparent hover:border-[#F14A3B] transition-all rounded-[2rem] p-8 shadow-xl transform hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-[#FDEBD0] text-[#F14A3B]">{clash.category}</span>
                  <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Stake: <strong className="text-[#F14A3B] text-sm">{clash.reward_stake}</strong></span>
                </div>
                <div className="bg-[#FDEBD0]/30 p-6 rounded-3xl mb-6">
                  <p className="text-xs text-[#F14A3B] uppercase font-black tracking-widest mb-2">Target Task</p>
                  <p className="text-stone-800 font-black text-2xl leading-tight">{clash.challenger_task}</p>
                </div>
                {acceptingId === clash.id ? (
                  <div className="space-y-4 bg-stone-50 p-6 rounded-3xl border-2 border-stone-200">
                    <input type="text" placeholder="Your Competing Task..." value={opponentTaskInput} onChange={(e) => setOpponentTaskInput(e.target.value)} className="w-full bg-white border-2 border-stone-200 rounded-2xl px-5 py-4 text-stone-800 focus:border-[#F14A3B] outline-none font-bold" />
                    <div className="flex gap-3">
                      <button onClick={() => handleAcceptClash(clash.id)} className="flex-1 bg-[#F14A3B] text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:scale-105 transition-transform">Lock In Match</button>
                      <button onClick={() => setAcceptingId(null)} className="px-6 py-4 bg-stone-200 text-stone-500 font-black uppercase tracking-widest rounded-2xl hover:bg-stone-300 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAcceptingId(clash.id)} className="w-full bg-[#F14A3B] text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-[#F14A3B]/30">Accept Challenge</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {myClashes.map((clash) => {
              const isChallenger = currentUserId === clash.challenger_id;
              const myVote = isChallenger ? clash.challenger_vote : clash.opponent_vote;
              const opponentHasVoted = isChallenger ? clash.opponent_vote !== null : clash.challenger_vote !== null;

              return (
                <div key={clash.id} className="bg-white rounded-[2rem] p-8 shadow-xl border-4 border-transparent hover:border-[#F14A3B]/10 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                      clash.status === 'finished' ? 'bg-green-100 text-green-600' :
                      clash.status === 'disputed' ? 'bg-red-100 text-red-600' :
                      clash.status === 'review' ? 'bg-yellow-100 text-yellow-600' :
                      clash.status === 'active' ? 'bg-blue-100 text-blue-600' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      STATUS: {clash.status}
                    </span>
                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Stake: <strong className="text-[#F14A3B]">{clash.reward_stake}</strong></span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FDEBD0]/30 p-6 rounded-3xl">
                    <div className="space-y-3">
                      <p className="text-xs text-[#F14A3B] uppercase font-black tracking-widest">Challenger Task</p>
                      <p className="text-stone-800 font-black text-xl">{clash.challenger_task}</p>
                      {clash.challenger_proof && (
                        <div className="mt-3 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                          {clash.challenger_proof.match(/\.(jpeg|jpg|gif|png)$/i) ? <img src={clash.challenger_proof} className="w-full h-48 object-cover" /> :
                           clash.challenger_proof.match(/\.(mp4|webm|ogg)$/i) ? <video src={clash.challenger_proof} controls className="w-full h-48 bg-black" /> :
                           <a href={clash.challenger_proof} target="_blank" className="text-[#F14A3B] text-sm font-black p-4 block bg-white text-center hover:bg-stone-50 uppercase tracking-widest">📎 View File</a>}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xs text-[#F14A3B] uppercase font-black tracking-widest">Opponent Task</p>
                      <p className="text-stone-800 font-black text-xl">{clash.opponent_task || '⏳ Waiting for match...'}</p>
                      {clash.opponent_proof && (
                        <div className="mt-3 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                          {clash.opponent_proof.match(/\.(jpeg|jpg|gif|png)$/i) ? <img src={clash.opponent_proof} className="w-full h-48 object-cover" /> :
                           clash.opponent_proof.match(/\.(mp4|webm|ogg)$/i) ? <video src={clash.opponent_proof} controls className="w-full h-48 bg-black" /> :
                           <a href={clash.opponent_proof} target="_blank" className="text-[#F14A3B] text-sm font-black p-4 block bg-white text-center hover:bg-stone-50 uppercase tracking-widest">📎 View File</a>}
                        </div>
                      )}
                    </div>
                  </div>

                  {clash.status === 'active' && (
                    <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
                      <label className="flex-1 w-full cursor-pointer bg-white border-2 border-dashed border-[#F14A3B] hover:bg-[#FDEBD0]/20 rounded-2xl px-6 py-4 text-sm font-black text-[#F14A3B] uppercase tracking-widest text-center transition-colors">
                        {proofFiles[clash.id] ? proofFiles[clash.id]?.name : '📸 Select Proof File'}
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setProofFiles({ ...proofFiles, [clash.id]: e.target.files?.[0] || null })} />
                      </label>
                      <button onClick={() => handleSubmitProof(clash.id)} className="w-full md:w-auto bg-[#F14A3B] px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white shadow-lg hover:scale-105 transition-transform">Submit</button>
                    </div>
                  )}

                  {/* JUDGE ROOM UI */}
                  {clash.status === 'review' && (
                    <div className="mt-6 p-8 bg-yellow-50 border-4 border-yellow-200 rounded-3xl text-center">
                      {!myVote ? (
                        <div className="space-y-6">
                          <p className="font-black text-yellow-600 uppercase tracking-widest text-lg">⚖️ Judge Opponent's Proof</p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => handleJudge(clash.id, 'approve')} className="bg-green-500 hover:bg-green-400 px-8 py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">APPROVE ✅</button>
                            <button onClick={() => handleJudge(clash.id, 'reject')} className="bg-[#F14A3B] hover:bg-red-400 px-8 py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">REJECT ❌</button>
                          </div>
                        </div>
                      ) : (
                        <p className="font-black text-yellow-600 uppercase tracking-widest">
                          {opponentHasVoted ? '⏳ Calculating verdict...' : '⏳ Waiting for opponent to judge...'}
                        </p>
                      )}
                    </div>
                  )}

                  {clash.status === 'finished' && (
                    <div className="mt-6 p-6 bg-green-100 rounded-2xl text-center text-green-700 font-black tracking-widest uppercase text-xl animate-pulse">
                      🏆 Duel Completed! +50 Points!
                    </div>
                  )}
                  {clash.status === 'disputed' && (
                    <div className="mt-6 p-6 bg-red-100 rounded-2xl text-center text-red-600 font-black tracking-widest uppercase text-xl">
                      ⚠️ Duel Disputed!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}