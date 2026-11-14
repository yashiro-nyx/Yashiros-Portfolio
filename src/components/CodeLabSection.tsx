import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, Play, ShieldAlert, ShieldCheck } from 'lucide-react';
import { CODE_SAMPLES, PROFILE_DATA } from '../data/portfolioData';

export const CodeLabSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(CODE_SAMPLES[0].id);
  const [copied, setCopied] = useState(false);

  // Interactive Permora RBAC Simulator State
  const [actorRole, setActorRole] = useState<'requester' | 'approver' | 'admin'>('approver');
  const [sameUser, setSameUser] = useState(false);
  const [action, setAction] = useState<'approve' | 'return' | 'deny'>('approve');
  const [reason, setReason] = useState(
    'Verified departmental clearance and student lab schedule.'
  );

  const activeSample =
    CODE_SAMPLES.find((s) => s.id === selectedId) || CODE_SAMPLES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSample.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  // Run live evaluation matching Permora's approval-routing-policy.ts
  const evaluateSim = () => {
    if (actorRole !== 'approver') {
      return {
        ok: false,
        code: 'FORBIDDEN_ROLE',
        status: 'blocked',
        message: 'Only designated approvers can record review decisions.',
      };
    }
    if (sameUser) {
      return {
        ok: false,
        code: 'CONFLICT_OF_INTEREST',
        status: 'blocked',
        message: 'Self-approval is strictly prohibited (actorId === requesterId).',
      };
    }
    if (!reason || reason.trim().length < 8) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        status: 'blocked',
        message: 'Audit decision reason must be at least 8 characters.',
      };
    }

    const nextStatus =
      action === 'approve'
        ? 'approved_pending_activation'
        : action === 'return'
        ? 'returned_for_revision'
        : 'denied';

    return {
      ok: true,
      code: 'TRANSITION_COMMITTED',
      status: nextStatus,
      message: `Immutable audit log recorded. Request transitioned to "${nextStatus}".`,
    };
  };

  const simResult = evaluateSim();

  return (
    <section id="journal" className="bg-bg py-16 md:py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Header (Framer Motion whileInView) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">
                Engineering Journal &amp; Code
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-text-primary mb-3">
              Recent <span className="font-display italic">thoughts</span> &amp;{' '}
              <span className="font-display italic">architecture</span>
            </h2>
            <p className="text-sm md:text-base text-muted max-w-xl">
              Select any entry below to inspect real production code snippets, architectural tradeoffs, and source files from my repositories.
            </p>
          </div>

          <a
            href={PROFILE_DATA.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex group relative rounded-full p-[1.5px] transition-transform duration-300 hover:scale-105"
          >
            <span className="absolute inset-0 rounded-full bg-stroke group-hover:opacity-0 transition-opacity" />
            <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-xs font-medium text-text-primary whitespace-nowrap">
              <span>View all repositories</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </span>
          </a>
        </motion.div>

        {/* 4 Journal Entries displayed as Horizontal Pills */}
        <div className="flex flex-col gap-4 mb-10">
          {CODE_SAMPLES.map((entry, idx) => {
            const isSelected = entry.id === selectedId;
            return (
              <motion.button
                key={entry.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                onClick={() => setSelectedId(entry.id)}
                className={`w-full text-left rounded-[40px] sm:rounded-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 p-4 transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-surface border-[#89AACC]/60 shadow-lg shadow-[#89AACC]/5'
                    : 'bg-surface/30 hover:bg-surface border-stroke'
                }`}
              >
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-stroke shrink-0 bg-bg">
                    <img
                      src={entry.image}
                      alt={entry.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted font-mono mb-1">
                      <span className="text-[#89AACC]">{entry.project}</span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.filePath}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-display italic text-text-primary truncate">
                      {entry.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-1 hidden sm:block">
                      {entry.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pl-2 sm:pl-0 pr-3 shrink-0">
                  <div className="text-right font-mono text-xs text-muted">
                    <span>{entry.readTime}</span>
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span>{entry.date}</span>
                  </div>
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors text-xs ${
                      isSelected
                        ? 'accent-gradient text-bg border-transparent font-semibold'
                        : 'border-stroke text-muted'
                    }`}
                  >
                    ↗
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Interactive Code Viewer + Live RBAC Guard Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Code Snippet Inspector (7 cols) */}
          <div className="lg:col-span-7 bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-stroke flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-muted">
                  <span className="text-[#89AACC]">{activeSample.project}</span>
                  <span aria-hidden="true">/</span>
                  <span className="text-text-primary">{activeSample.filePath}</span>
                </div>
                <p className="text-xs text-muted mt-1">{activeSample.explanation}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg border border-stroke hover:border-[#89AACC] text-xs text-text-primary transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-muted" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <a
                  href={activeSample.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg border border-stroke hover:border-[#89AACC] text-xs text-text-primary transition-colors"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#89AACC]" />
                </a>
              </div>
            </div>

            <pre className="p-6 text-xs sm:text-[13px] font-mono text-text-primary/90 overflow-x-auto leading-relaxed flex-1 bg-bg/60">
              <code>{activeSample.code}</code>
            </pre>
          </div>

          {/* Live Permora RBAC Sandbox (5 cols) */}
          <div className="lg:col-span-5 bg-surface border border-stroke rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#89AACC]">
                  Interactive Sandbox
                </span>
                <span className="text-xs font-mono text-muted">
                  Permora Governance
                </span>
              </div>

              <h3 className="text-2xl font-display italic text-text-primary mb-2">
                Test RBAC Approval Guard Live
              </h3>
              <p className="text-xs text-muted mb-5 leading-relaxed">
                Interact with the state machine from{' '}
                <code className="text-text-primary font-mono">
                  approval-routing-policy.ts
                </code>{' '}
                to verify how Permora blocks unauthorized roles or self-approval attempts.
              </p>

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    1. Actor Role (`input.actorRole`)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['requester', 'approver', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setActorRole(r)}
                        className={`py-2 px-3 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                          actorRole === r
                            ? 'bg-text-primary text-bg border-text-primary font-medium'
                            : 'bg-bg text-muted border-stroke hover:text-text-primary'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    2. Decision Action (`input.action`)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['approve', 'return', 'deny'] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAction(a)}
                        className={`py-2 px-3 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                          action === a
                            ? 'bg-text-primary text-bg border-text-primary font-medium'
                            : 'bg-bg text-muted border-stroke hover:text-text-primary'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-stroke">
                  <div>
                    <div className="text-xs text-text-primary font-medium">
                      Simulate Conflict of Interest
                    </div>
                    <div className="text-[11px] text-muted font-mono">
                      actorId === requesterId
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSameUser((prev) => !prev)}
                    className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
                      sameUser
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-surface text-muted border-stroke'
                    }`}
                  >
                    {sameUser ? 'Same User (Blocked)' : 'Distinct Users'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    3. Audit Reason (`input.reason` — min 8 chars)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter audit decision reason..."
                    className="w-full px-3.5 py-2 rounded-xl bg-bg border border-stroke text-xs text-text-primary font-mono focus:outline-none focus:border-[#89AACC]"
                  />
                </div>
              </div>
            </div>

            {/* Output Result */}
            <div
              className={`mt-6 p-4 rounded-2xl border ${
                simResult.ok
                  ? 'bg-[#89AACC]/10 border-[#89AACC]/40'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-text-primary">
                  {simResult.ok ? (
                    <ShieldCheck className="w-4 h-4 text-[#89AACC]" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  )}
                  {simResult.code}
                </span>
                <span className="text-[11px] font-mono text-muted flex items-center gap-1">
                  <Play className="w-3 h-3" /> Live State
                </span>
              </div>
              <p className="text-xs text-text-primary/85 leading-relaxed">
                {simResult.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
