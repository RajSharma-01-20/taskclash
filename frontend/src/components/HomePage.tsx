import { Link } from 'react-router-dom';

export default function HomePage() {
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen text-slate-100 pb-24 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-80 right-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-16 text-center relative">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-8 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          Competitive 1v1 Productivity Arena
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-display tracking-tight uppercase leading-[0.95] text-white drop-shadow-md mb-6">
          Turn Every Goal Into A <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400">
            High-Stakes Duel
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-lg md:text-xl font-normal leading-relaxed mb-10">
          Stop struggling alone. Challenge rivals in head-to-head accountability clashes across 
          <strong className="text-white font-semibold"> Coding</strong>, <strong className="text-white font-semibold">Fitness</strong>, and <strong className="text-white font-semibold">Academics</strong>. 
          Stake rewards, upload real proof, pick the winner, and dominate the ranks.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link
            to="/arena"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-600/30 hover:scale-105 transition-all text-center flex items-center justify-center gap-2 border border-rose-400/30"
          >
            <span>⚔️</span>
            <span>Enter The Arena</span>
          </Link>
          
          <Link
            to={token ? "/profile" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 hover:text-white transition-all text-center flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <span>{token ? "👤 My Profile" : "⚡ Join As Challenger"}</span>
          </Link>
        </div>

        {/* Live Arena Mock Duel Preview */}
        <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl relative backdrop-blur-xl text-left overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500/20 to-transparent px-4 py-1 text-[11px] font-black uppercase tracking-widest text-rose-400 border-b border-l border-slate-700">
            LIVE MATCH HIGHLIGHT
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <span className="px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs uppercase tracking-wider">
              💻 Tech / Coding Arena
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Stake: <span className="text-amber-400 font-black text-sm">100 PTS</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-6">
            {/* Challenger Card */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 font-black flex items-center justify-center border border-rose-500/30">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">AlexDev</h4>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Proof Submitted ✓</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-medium line-clamp-2">
                "Build and deploy authentication microservice with 10 unit tests."
              </p>
            </div>

            {/* VS Badge */}
            <div className="text-center font-display font-black text-2xl text-slate-500 flex flex-col items-center">
              <span className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 shadow-inner">
                VS
              </span>
            </div>

            {/* Opponent Card */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center border border-cyan-500/30">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">SarahCode</h4>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Proof Submitted ✓</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-medium line-clamp-2">
                "Solve 3 LeetCode Mediums on Graphs & Dynamic Programming."
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 font-medium">
              ⚖️ <strong className="text-white">Review Phase:</strong> The selected winner claims <strong className="text-amber-400">100% of the reward (100 PTS)</strong>!
            </span>
            <Link
              to="/arena"
              className="text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1"
            >
              Inspect Duels →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="text-center mb-16">
          <span className="text-rose-400 text-xs font-black uppercase tracking-widest block mb-2 font-display">
            The Battle Protocol
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-white mb-4">
            How Task Clash Works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            From dropping a challenge to claiming your spoils in four decisive steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-display font-black text-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase font-display">
              Create Or Join A Clash
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Drop an open duel with your task objective, or browse the public feed to challenge a worthy rival.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-display font-black text-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase font-display">
              Set Task & Stake
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Lock in your deadline and define the stake: leaderboard PTS, friendly bets, or undisputed bragging rights.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-display font-black text-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase font-display">
              Submit Real Proof
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Execute your task and upload visual evidence (screenshots, videos, or logs) before the clock ticks to zero.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-display font-black text-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              04
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase font-display">
              Decide Winner & Award
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Select who won! The victor claims 100% of the reward, or a tie triggers an equitable 50/50 prize split.
            </p>
          </div>
        </div>
      </section>

      {/* Reward Economics Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
              Fair & Transparent Distribution
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-white leading-tight">
              Winner-Driven <br />
              <span className="text-amber-400">Reward Allocation</span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              No more forced 50/50 splits when one person clearly crushed the objective. 
              The verified outcome dictates exactly who receives the reward:
            </p>
            <ul className="space-y-3 text-sm text-slate-300 font-medium">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">✓</span>
                <span><strong>User 1 Wins:</strong> Receives 100% of the reward; User 2 receives 0%.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">✓</span>
                <span><strong>User 2 Wins:</strong> Receives 100% of the reward; User 1 receives 0%.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">✓</span>
                <span><strong>Both Win / Tie:</strong> Split equally 50% each with smart rounding.</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/arena"
                className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider text-sm"
              >
                Launch a Clash to Test the System →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Scenario 1: Challenger Wins */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 block mb-2">Outcome #1</span>
                <h4 className="text-lg font-bold text-white uppercase font-display mb-3">User 1 Victory</h4>
                <p className="text-xs text-slate-400 mb-6">User 1 executed superior proof.</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">User 1:</span>
                  <span className="text-emerald-400 font-black">100% Stake</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">User 2:</span>
                  <span className="text-slate-500 font-black">0% (None)</span>
                </div>
              </div>
            </div>

            {/* Scenario 2: Opponent Wins */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block mb-2">Outcome #2</span>
                <h4 className="text-lg font-bold text-white uppercase font-display mb-3">User 2 Victory</h4>
                <p className="text-xs text-slate-400 mb-6">User 2 completed challenge first.</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">User 1:</span>
                  <span className="text-slate-500 font-black">0% (None)</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">User 2:</span>
                  <span className="text-emerald-400 font-black">100% Stake</span>
                </div>
              </div>
            </div>

            {/* Scenario 3: Tie / Both Win */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-2">Outcome #3</span>
                <h4 className="text-lg font-bold text-white uppercase font-display mb-3">Honorable Tie</h4>
                <p className="text-xs text-slate-400 mb-6">Both fighters completed their goals.</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">User 1:</span>
                  <span className="text-amber-400 font-black">50% Split</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">User 2:</span>
                  <span className="text-amber-400 font-black">50% Split</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features & Benefits Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="text-center mb-16">
          <span className="text-rose-400 text-xs font-black uppercase tracking-widest block mb-2 font-display">
            Built For Gladiators
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-white mb-4">
            Key Features & Benefits
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Everything you need to turn vague resolutions into ironclad competitive habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white uppercase font-display mb-2">
              1v1 Direct Rivalry
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Solitary to-do lists fail because nobody is watching. In Task Clash, your rival is watching every second.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
            <div className="text-3xl mb-4">📸</div>
            <h3 className="text-xl font-bold text-white uppercase font-display mb-2">
              Multi-Format Proof Pipeline
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload images, videos, and project deliverables with instant previewing to guarantee zero cheating.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white uppercase font-display mb-2">
              Global Rank Ladder
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Earn arena PTS with every triumph. Climb the ranks from Bronze to Gold and cement your profile as top warrior.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
            <div className="text-3xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-white uppercase font-display mb-2">
              Multi-Discipline Arenas
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Categorized battlefields for Tech & Coding, Fitness & Gym, Study & Exams, and Gaming milestones.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold text-white uppercase font-display mb-2">
              Hard Countdown Deadlines
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No endless delays. Set target timestamps that force focus, create urgency, and drive decisive completion.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white uppercase font-display mb-2">
              Verifiable Consensus
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Both combatants review opposing proof files. Disagreements trigger dispute statuses for fair resolutions.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <h2 className="text-4xl sm:text-5xl font-black font-display uppercase tracking-tight text-white mb-4">
            Are You Ready To Step Into The Arena?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-base mb-8">
            Lock in your first 1v1 duel today. Pick an opponent, stake your reward, and turn daily productivity into a spectator sport.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/arena"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 hover:scale-105 transition-all text-center"
            >
              ⚔️ Drop A Challenge Now
            </Link>
            <Link
              to="/leaderboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all text-center"
            >
              🏆 View Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
