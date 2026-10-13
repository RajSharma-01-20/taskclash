import { useState, useEffect } from 'react';
import { API_BASE, getJsonHeaders } from '../apiConfig';

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
  winner_id?: number | null;
  outcome?: string | null;
  challenger_reward?: string | null;
  opponent_reward?: string | null;
  challenger_username?: string | null;
  opponent_username?: string | null;
}

export default function ClashArena() {
  const [tab, setTab] = useState<'public' | 'my-clashes'>('public');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [publicClashes, setPublicClashes] = useState<Clash[]>([]);
  const [myClashes, setMyClashes] = useState<Clash[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [newClash, setNewClash] = useState({
    category: 'Tech',
    challenger_task: '',
    reward_stake: '50 PTS',
    deadline: '',
  });

  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [opponentTaskInput, setOpponentTaskInput] = useState('');

  // Proof upload state
  const [proofFiles, setProofFiles] = useState<{ [key: number]: File | null }>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // Winner selection & reward allocation states
  const [selectedOutcome, setSelectedOutcome] = useState<{ [key: number]: 'challenger' | 'opponent' | 'tie' }>({});
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Modal proof preview
  const [modalMedia, setModalMedia] = useState<{ url: string; title: string } | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in or register to join the arena duels.');
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch current user
      const userRes = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUserId(userData.id);
      }

      // 2. Fetch duels depending on tab
      if (tab === 'public') {
        const res = await fetch(`${API_BASE}/api/clashes/public`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPublicClashes(Array.isArray(data) ? data : []);
        }
      } else {
        const res = await fetch(`${API_BASE}/api/clashes/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMyClashes(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      setError('Connection failed. Backend server may still be initializing.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClash = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Log in to deploy a challenge.');
      return;
    }

    try {
      const formattedDeadline = newClash.deadline
        ? new Date(newClash.deadline).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch(`${API_BASE}/api/clashes/`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          category: newClash.category,
          challenger_task: newClash.challenger_task,
          reward_stake: newClash.reward_stake || '50 PTS',
          deadline: formattedDeadline,
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to deploy challenge');
      }

      setSuccess('Challenge deployed to the Arena feed!');
      setNewClash({ category: 'Tech', challenger_task: '', reward_stake: '50 PTS', deadline: '' });
      setShowDeployForm(false);
      setTab('my-clashes');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to deploy clash');
    }
  };

  const handleAcceptClash = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to accept challenges.');
      return;
    }
    if (!opponentTaskInput.trim()) {
      setError('Please define your opposing counter-task.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/clashes/${id}/accept`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify({ opponent_task: opponentTaskInput })
      });

      if (res.ok) {
        setAcceptingId(null);
        setOpponentTaskInput('');
        setSuccess('Challenge locked in! Duel is now ACTIVE.');
        setTab('my-clashes');
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Failed to accept challenge.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }
  };

  const handleSubmitProof = async (id: number) => {
    const token = localStorage.getItem('token');
    const selectedFile = proofFiles[id];
    if (!selectedFile) {
      setError('Please select an image or video proof file first.');
      return;
    }

    setUploadingId(id);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_BASE}/api/clashes/${id}/proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setProofFiles({ ...proofFiles, [id]: null });
        setSuccess('Proof successfully uploaded and verified!');
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Upload failed.');
      }
    } catch (err) {
      setError('Failed to upload proof media.');
    } finally {
      setUploadingId(null);
    }
  };

  // Winner selection & reward allocation resolution
  const handleResolveOutcome = async (clashId: number, outcome: 'challenger' | 'opponent' | 'tie') => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to judge the duel.');
      return;
    }

    setResolvingId(clashId);
    setError('');
    setSuccess('');

    try {
      // First attempt dedicated resolve endpoint
      let res = await fetch(`${API_BASE}/api/clashes/${clashId}/resolve`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ outcome })
      });

      // Fallback to judge endpoint with outcome parameter if resolve route wasn't matched
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/clashes/${clashId}/judge`, {
          method: 'POST',
          headers: getJsonHeaders(),
          body: JSON.stringify({ vote: outcome, outcome })
        });
      }

      if (res.ok) {
        const updatedClash: Clash = await res.json();
        let outcomeMsg = 'Duel finalized!';
        if (outcome === 'challenger') {
          outcomeMsg = `User 1 Wins! 100% of reward awarded (${updatedClash.challenger_reward || '100%'})!`;
        } else if (outcome === 'opponent') {
          outcomeMsg = `User 2 Wins! 100% of reward awarded (${updatedClash.opponent_reward || '100%'})!`;
        } else {
          outcomeMsg = `Honorable Draw! Reward split 50/50 equally!`;
        }
        setSuccess(outcomeMsg);
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Could not record winner outcome.');
      }
    } catch (err) {
      setError('Network error while recording verdict.');
    } finally {
      setResolvingId(null);
    }
  };

  // Dynamic preview helper
  const calculatePreview = (stake: string, outcome: 'challenger' | 'opponent' | 'tie') => {
    const clean = (stake || '50 PTS').trim();
    const match = clean.match(/^([$€£¥]?)\s*([0-9]+(?:\.[0-9]+)?)\s*(.*?)$/);
    if (match && match[2]) {
      const prefix = match[1] || '';
      const num = parseFloat(match[2]);
      const unit = match[3] ? ` ${match[3].trim()}` : '';
      if (outcome === 'challenger') {
        return { c: `${clean} (100%)`, o: `${prefix}0${unit} (0%)` };
      }
      if (outcome === 'opponent') {
        return { c: `${prefix}0${unit} (0%)`, o: `${clean} (100%)` };
      }
      const half1 = Math.ceil(num / 2);
      const half2 = Math.floor(num / 2);
      return { c: `${prefix}${half1}${unit} (50%)`, o: `${prefix}${half2}${unit} (50%)` };
    }
    if (outcome === 'challenger') return { c: `${clean} (100%)`, o: 'None (0%)' };
    if (outcome === 'opponent') return { c: 'None (0%)', o: `${clean} (100%)` };
    return { c: `Split ${clean} (50%)`, o: `Split ${clean} (50%)` };
  };

  const filteredClashes = (tab === 'public' ? publicClashes : myClashes).filter(c => {
    if (categoryFilter === 'all') return true;
    return c.category?.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div className="pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
      
      {/* Header Banner */}
      <div className="pt-8 sm:pt-12 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          Live 1v1 Battleground
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-display tracking-tight uppercase text-white drop-shadow-lg mb-4">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400">Arena</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto font-medium">
          Micro-Tasks. High-Stakes Wagers. Winner claims 100% of the glory and reward.
        </p>

        {/* Action button to open challenge drawer */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowDeployForm(!showDeployForm)}
            className="px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all border border-rose-400/40 flex items-center gap-2"
          >
            <span>{showDeployForm ? '✕ Close Challenge Form' : '⚔️ Deploy New Challenge'}</span>
          </button>
        </div>
      </div>

      {/* Deploy Challenge Form (Collapsible/Toggle) */}
      {showDeployForm && (
        <div className="bg-slate-900/95 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-bold font-display uppercase text-white flex items-center gap-2">
                <span>⚡</span>
                <span>Deploy Arena Challenge</span>
              </h2>
              <p className="text-xs text-slate-400">Set the category, target objective, reward, and deadline.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs uppercase">
              New Duel
            </span>
          </div>

          <form onSubmit={handleCreateClash} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Category
              </label>
              <select
                value={newClash.category}
                onChange={(e) => setNewClash({ ...newClash, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white font-bold focus:border-rose-500 focus:outline-none transition-colors"
              >
                <option value="Tech">💻 Tech / Coding</option>
                <option value="Fitness">🏋️ Fitness / Workout</option>
                <option value="Study">📚 Study / Academic</option>
                <option value="Gaming">🎮 Gaming / Esports</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Reward / Stake (e.g. 100 PTS, $20, Free Lunch)
              </label>
              <input
                type="text"
                placeholder="e.g. 100 PTS, $20, Dinner"
                value={newClash.reward_stake}
                onChange={(e) => setNewClash({ ...newClash, reward_stake: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white font-bold placeholder-slate-600 focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Your Challenge Task Objective
              </label>
              <input
                type="text"
                placeholder="e.g. Solve 3 LeetCode Mediums or 50 Push-ups in under 1 hour"
                value={newClash.challenger_task}
                onChange={(e) => setNewClash({ ...newClash, challenger_task: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white font-bold placeholder-slate-600 focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Target Deadline
              </label>
              <input
                type="datetime-local"
                value={newClash.deadline}
                onChange={(e) => setNewClash({ ...newClash, deadline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white font-bold focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeployForm(false)}
                className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
              >
                Deploy Challenge 🚀
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm text-center flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm text-center flex items-center justify-between">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tab Switcher & Filter HUD */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
        
        {/* Main Tabs */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setTab('public')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all ${
              tab === 'public'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🌐 Public Arenas ({publicClashes.length})
          </button>
          <button
            onClick={() => setTab('my-clashes')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all ${
              tab === 'my-clashes'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚔️ My Active Duels ({myClashes.length})
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {['all', 'Tech', 'Fitness', 'Study', 'Gaming'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-700 text-white border border-slate-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat === 'all' ? 'All Arenas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Area */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">Synchronizing Arena Battle Matrix...</p>
        </div>
      ) : filteredClashes.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-xl font-bold font-display uppercase text-white mb-2">
            No Active Duels Found
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            {tab === 'public'
              ? 'No open challenges right now. Be the first gladiator to deploy one!'
              : 'You have not joined any duels yet. Head to Public Arenas to accept a challenge!'}
          </p>
          {tab === 'public' ? (
            <button
              onClick={() => setShowDeployForm(true)}
              className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500"
            >
              Deploy Challenge
            </button>
          ) : (
            <button
              onClick={() => setTab('public')}
              className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500"
            >
              Explore Public Arenas
            </button>
          )}
        </div>
      ) : tab === 'public' ? (
        /* PUBLIC CLASHES FEED */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClashes.map((clash) => {
            const isMyClash = currentUserId === clash.challenger_id;

            return (
              <div
                key={clash.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                      {clash.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Stake: <strong className="text-amber-400 font-black text-sm">{clash.reward_stake}</strong>
                    </span>
                  </div>

                  <div className="mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block mb-1">
                      Target Task
                    </span>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {clash.challenger_task}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 mb-6 pt-3 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span>Challenger ID:</span>
                      <span className="text-slate-300 font-bold">Gladiator #{clash.challenger_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <span className="text-slate-300">
                        {new Date(clash.deadline).toLocaleDateString()} {new Date(clash.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accept Action */}
                <div>
                  {isMyClash ? (
                    <div className="p-3 rounded-xl bg-slate-800/80 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                      ⏳ Your Challenge • Waiting For Opponent
                    </div>
                  ) : acceptingId === clash.id ? (
                    <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-rose-500/40">
                      <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider">
                        Set Your Opposing Counter-Task
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. I will complete 5 LeetCode problems..."
                        value={opponentTaskInput}
                        onChange={(e) => setOpponentTaskInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptClash(clash.id)}
                          className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30"
                        >
                          Lock In Duel ⚔️
                        </button>
                        <button
                          onClick={() => setAcceptingId(null)}
                          className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAcceptingId(clash.id)}
                      className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 hover:scale-[1.02] transition-transform"
                    >
                      ⚔️ Accept Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MY ACTIVE DUELS FEED */
        <div className="space-y-8">
          {filteredClashes.map((clash) => {
            const isChallenger = currentUserId === clash.challenger_id;
            const currentOutcome = selectedOutcome[clash.id] || 'challenger';
            const preview = calculatePreview(clash.reward_stake, currentOutcome);

            return (
              <div
                key={clash.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                        clash.status === 'finished'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : clash.status === 'review'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : clash.status === 'disputed'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      STATUS: {clash.status}
                    </span>
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      {clash.category} Arena #{clash.id}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-400">
                    Total Stake: <span className="text-amber-400 font-black text-sm">{clash.reward_stake}</span>
                  </div>
                </div>

                {/* 1v1 Arena Duel Cards (Challenger vs Opponent) */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center mb-6">
                  
                  {/* Combatant 1: Challenger */}
                  <div className="md:col-span-2 p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        User 1 (Challenger) {isChallenger ? '• (You)' : ''}
                      </span>
                      {clash.challenger_completed && (
                        <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Proof Ready ✓
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-white mb-4">
                      {clash.challenger_task}
                    </h4>

                    {/* Proof Media Preview */}
                    {clash.challenger_proof ? (
                      <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/60 relative group">
                        {clash.challenger_proof.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <img
                            src={clash.challenger_proof}
                            alt="Challenger Proof"
                            className="w-full h-40 object-cover cursor-pointer hover:opacity-90"
                            onClick={() => setModalMedia({ url: clash.challenger_proof!, title: 'Challenger Proof Media' })}
                          />
                        ) : clash.challenger_proof.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={clash.challenger_proof}
                            controls
                            className="w-full h-40 bg-black"
                          />
                        ) : (
                          <a
                            href={clash.challenger_proof}
                            target="_blank"
                            rel="noreferrer"
                            className="block p-4 text-center text-xs font-bold text-rose-400 hover:underline"
                          >
                            📎 Open Verification Deliverable
                          </a>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-slate-300 font-bold">
                          Click to Expand
                        </span>
                      </div>
                    ) : (
                      <div className="h-20 rounded-xl bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                        Pending Proof Submission
                      </div>
                    )}
                  </div>

                  {/* VS Combat Divider */}
                  <div className="text-center font-display font-black text-2xl text-slate-600 flex flex-col items-center">
                    <span className="w-12 h-12 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-rose-400 shadow-xl font-display font-black text-xl">
                      VS
                    </span>
                  </div>

                  {/* Combatant 2: Opponent */}
                  <div className="md:col-span-2 p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        User 2 (Opponent) {!isChallenger ? '• (You)' : ''}
                      </span>
                      {clash.opponent_completed && (
                        <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Proof Ready ✓
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-white mb-4">
                      {clash.opponent_task || '⏳ Awaiting Opponent Task...'}
                    </h4>

                    {/* Proof Media Preview */}
                    {clash.opponent_proof ? (
                      <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/60 relative group">
                        {clash.opponent_proof.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <img
                            src={clash.opponent_proof}
                            alt="Opponent Proof"
                            className="w-full h-40 object-cover cursor-pointer hover:opacity-90"
                            onClick={() => setModalMedia({ url: clash.opponent_proof!, title: 'Opponent Proof Media' })}
                          />
                        ) : clash.opponent_proof.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={clash.opponent_proof}
                            controls
                            className="w-full h-40 bg-black"
                          />
                        ) : (
                          <a
                            href={clash.opponent_proof}
                            target="_blank"
                            rel="noreferrer"
                            className="block p-4 text-center text-xs font-bold text-cyan-400 hover:underline"
                          >
                            📎 Open Verification Deliverable
                          </a>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-slate-300 font-bold">
                          Click to Expand
                        </span>
                      </div>
                    ) : (
                      <div className="h-20 rounded-xl bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                        Pending Proof Submission
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Proof Pipeline (when active) */}
                {clash.status === 'active' && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        📸 Submit Your Task Proof (Image or Video)
                      </span>
                      <span className="text-[11px] text-slate-500">JPG, PNG, WEBP, MP4 supported</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="flex-1 cursor-pointer bg-slate-900 border border-slate-700 hover:border-rose-500/50 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 flex items-center justify-between transition-colors">
                        <span>{proofFiles[clash.id] ? proofFiles[clash.id]?.name : 'Choose media file...'}</span>
                        <span className="text-rose-400">Browse 📁</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => setProofFiles({ ...proofFiles, [clash.id]: e.target.files?.[0] || null })}
                        />
                      </label>
                      
                      <button
                        onClick={() => handleSubmitProof(clash.id)}
                        disabled={uploadingId === clash.id}
                        className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 disabled:opacity-50"
                      >
                        {uploadingId === clash.id ? 'Uploading...' : 'Submit Proof'}
                      </button>
                    </div>
                  </div>
                )}

                {/* WINNER SELECTION & REWARD ALLOCATION ROOM (When in 'review' status) */}
                {clash.status === 'review' && (
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/20 to-slate-950 border-2 border-amber-500/40 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="text-lg font-bold font-display uppercase text-white flex items-center gap-2">
                          <span>⚖️</span>
                          <span>Verdict Chamber: Select Duel Winner</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Winner takes 100% of the reward stake. A tie triggers an equal 50/50 split.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase">
                        Review Active
                      </span>
                    </div>

                    {/* Three Option Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Option 1: User 1 (Challenger) Wins */}
                      <button
                        type="button"
                        onClick={() => setSelectedOutcome({ ...selectedOutcome, [clash.id]: 'challenger' })}
                        className={`p-4 rounded-xl text-left border transition-all ${
                          currentOutcome === 'challenger'
                            ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black uppercase text-rose-400">User 1 Wins</span>
                          {currentOutcome === 'challenger' && <span className="text-xs">✓ Selected</span>}
                        </div>
                        <p className="font-bold text-sm text-white">Challenger Victory</p>
                        <p className="text-[11px] text-slate-400 mt-1">100% to User 1 • 0% to User 2</p>
                      </button>

                      {/* Option 2: User 2 (Opponent) Wins */}
                      <button
                        type="button"
                        onClick={() => setSelectedOutcome({ ...selectedOutcome, [clash.id]: 'opponent' })}
                        className={`p-4 rounded-xl text-left border transition-all ${
                          currentOutcome === 'opponent'
                            ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black uppercase text-cyan-400">User 2 Wins</span>
                          {currentOutcome === 'opponent' && <span className="text-xs">✓ Selected</span>}
                        </div>
                        <p className="font-bold text-sm text-white">Opponent Victory</p>
                        <p className="text-[11px] text-slate-400 mt-1">100% to User 2 • 0% to User 1</p>
                      </button>

                      {/* Option 3: Both Win / Tie */}
                      <button
                        type="button"
                        onClick={() => setSelectedOutcome({ ...selectedOutcome, [clash.id]: 'tie' })}
                        className={`p-4 rounded-xl text-left border transition-all ${
                          currentOutcome === 'tie'
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black uppercase text-amber-400">Both Win</span>
                          {currentOutcome === 'tie' && <span className="text-xs">✓ Selected</span>}
                        </div>
                        <p className="font-bold text-sm text-white">Honorable Tie</p>
                        <p className="text-[11px] text-slate-400 mt-1">50% Split to Each Gladiator</p>
                      </button>
                    </div>

                    {/* Outcome Confirmation & Live Reward Breakdown Box */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <span className="text-slate-400 uppercase font-bold tracking-wider block">
                          Previewed Reward Allocation for Stake: <strong className="text-white">{clash.reward_stake}</strong>
                        </span>
                        <div className="flex items-center gap-4 text-xs font-bold">
                          <span className="text-rose-400">User 1 Receives: {preview.c}</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-cyan-400">User 2 Receives: {preview.o}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleResolveOutcome(clash.id, currentOutcome)}
                        disabled={resolvingId === clash.id}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {resolvingId === clash.id ? 'Recording Verdict...' : 'Confirm Winner & Award Stake 🏆'}
                      </button>
                    </div>
                  </div>
                )}

                {/* FINISHED DUEL OUTCOME DISPLAY */}
                {clash.status === 'finished' && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <h4 className="text-base font-bold font-display uppercase text-white">
                            Duel Concluded & Rewards Awarded
                          </h4>
                          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                            Outcome: {clash.outcome === 'challenger' ? 'User 1 Victory' : clash.outcome === 'opponent' ? 'User 2 Victory' : 'Honorable Draw / Tie'}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase">
                        VERIFIED RESULT
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs font-bold">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">User 1 (Challenger) Reward:</span>
                        <span className="text-emerald-400 font-black text-sm">
                          {clash.challenger_reward || (clash.outcome === 'challenger' ? `${clash.reward_stake} (100%)` : clash.outcome === 'tie' ? '50% Split' : '0%')}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">User 2 (Opponent) Reward:</span>
                        <span className="text-emerald-400 font-black text-sm">
                          {clash.opponent_reward || (clash.outcome === 'opponent' ? `${clash.reward_stake} (100%)` : clash.outcome === 'tie' ? '50% Split' : '0%')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DISPUTED DUEL */}
                {clash.status === 'disputed' && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-wider text-center">
                    ⚠️ Duel Disputed: Combatants had contradictory claims. Administrator intervention required.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Proof Media Preview Modal */}
      {modalMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalMedia(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">{modalMedia.title}</h3>
              <button
                onClick={() => setModalMedia(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={modalMedia.url}
                alt="Proof Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
