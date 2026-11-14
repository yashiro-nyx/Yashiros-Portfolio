import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  CheckCircle2,
  Copy,
  Send,
  AlertCircle,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { PROFILE_DATA } from '../data/portfolioData';
import {
  InquiryPayload,
  generateInquiryRefId,
  formatManilaTimestamp,
  sendPortfolioInquiry,
} from '../utils/contactEmailService';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FieldName = 'name' | 'email' | 'organization' | 'message';

interface FormErrors {
  name?: string;
  email?: string;
  organization?: string;
  message?: string;
}

interface TouchedFields {
  name: boolean;
  email: boolean;
  organization: boolean;
  message: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MESSAGE_LENGTH = 2;
const MAX_MESSAGE_LENGTH = 1000;

const PROJECT_SCOPES = [
  'Full-Stack Web App',
  'UI/UX & Design',
  'Marketplace / Booking',
  'AI & Vision Systems',
  'Internship / Role',
] as const;

const TIMELINE_OPTIONS = [
  'Immediate (< 2 wks)',
  '1–2 Months',
  'Flexible / Ongoing',
  'Full-Time / Intern',
] as const;

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const orgInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [service, setService] = useState<string>(PROJECT_SCOPES[0]);
  const [timeline, setTimeline] = useState<string>(TIMELINE_OPTIONS[1]);
  const [message, setMessage] = useState('');

  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    email: false,
    organization: false,
    message: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success states
  const [submittedSummary, setSubmittedSummary] =
    useState<InquiryPayload | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [copied, setCopied] = useState(false);

  const validateField = (
    field: FieldName,
    value: string
  ): string | undefined => {
    const trimmed = value.trim();

    if (field === 'name') {
      if (!trimmed) return 'Please enter your name.';
      if (trimmed.length > 80) return 'Name must be 80 characters or fewer.';
      return undefined;
    }

    if (field === 'email') {
      if (!trimmed) return 'Please enter your email address.';
      if (trimmed.includes('..') || !EMAIL_REGEX.test(trimmed)) {
        return 'Enter a valid email address (e.g., alex@company.com).';
      }
      return undefined;
    }

    if (field === 'organization') {
      if (trimmed.length > 80) {
        return 'Organization must be 80 characters or fewer.';
      }
      return undefined;
    }

    if (field === 'message') {
      if (!trimmed) return 'Please enter your inquiry or message.';
      if (trimmed.length < MIN_MESSAGE_LENGTH) {
        return `Please enter at least ${MIN_MESSAGE_LENGTH} characters.`;
      }
      if (value.length > MAX_MESSAGE_LENGTH) {
        return `Message exceeds ${MAX_MESSAGE_LENGTH.toLocaleString()} characters.`;
      }
      return undefined;
    }

    return undefined;
  };

  const errors: FormErrors = {
    name: validateField('name', name),
    email: validateField('email', email),
    organization: validateField('organization', organization),
    message: validateField('message', message),
  };

  const isFormValid =
    !errors.name && !errors.email && !errors.organization && !errors.message;

  const invalidCount = [
    errors.name,
    errors.email,
    errors.organization,
    errors.message,
  ].filter(Boolean).length;

  // Readiness progress across 4 key parts: Name, Email, Scope, Message
  const readinessCompleted =
    Number(!errors.name) +
    Number(!errors.email) +
    1 + // Scope always selected
    Number(!errors.message);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(PROFILE_DATA.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Automatically clears all form input fields after submission
   */
  const clearFormInputs = () => {
    setName('');
    setEmail('');
    setOrganization('');
    setService(PROJECT_SCOPES[0]);
    setTimeline(TIMELINE_OPTIONS[1]);
    setMessage('');
    setTouched({
      name: false,
      email: false,
      organization: false,
      message: false,
    });
    setSubmitAttempted(false);
  };

  const resetAll = () => {
    clearFormInputs();
    setIsSubmitting(false);
    setSubmittedSummary(null);
    setShowSuccessModal(false);
    setShowSuccessToast(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSubmitting) return;

    setSubmitAttempted(true);
    setTouched({
      name: true,
      email: true,
      organization: true,
      message: true,
    });

    if (!isFormValid) {
      if (errors.name) {
        nameInputRef.current?.focus();
      } else if (errors.email) {
        emailInputRef.current?.focus();
      } else if (errors.organization) {
        orgInputRef.current?.focus();
      } else if (errors.message) {
        messageInputRef.current?.focus();
      }
      return;
    }

    const snapshot: InquiryPayload = {
      refId: generateInquiryRefId(),
      submittedAt: formatManilaTimestamp(new Date()),
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
      service,
      timeline,
      message: message.trim(),
    };

    setIsSubmitting(true);

    // Send inquiry directly without any sign-in or popup
    await sendPortfolioInquiry(snapshot);

    setIsSubmitting(false);

    // Automatically clear all form fields immediately upon submission
    clearFormInputs();

    // Display centered success message and floating toast notification
    setSubmittedSummary(snapshot);
    setShowSuccessModal(true);
    setShowSuccessToast(true);

    // Ensure modal scrolls to top so the success message is in full view
    modalContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    window.setTimeout(() => {
      setShowSuccessToast(false);
    }, 7000);
  };

  const getFieldClass = (field: FieldName, error?: string) => {
    const isDirty = touched[field] || submitAttempted;
    if (!isDirty) {
      return 'border-stroke focus:border-[#89AACC] focus:ring-1 focus:ring-[#89AACC]/30';
    }
    if (error) {
      return 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30';
    }
    return 'border-[#89AACC]/70 focus:border-[#89AACC] focus:ring-1 focus:ring-[#89AACC]/30';
  };

  const hasAnyInput = Boolean(
    name.trim() || email.trim() || organization.trim() || message.trim()
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6"
        >
          {/* Floating Top Success Toast Notification */}
          <AnimatePresence>
            {showSuccessToast && submittedSummary && (
              <motion.div
                initial={{ opacity: 0, y: -24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="fixed top-5 left-1/2 -translate-x-1/2 z-[140] w-[92vw] max-w-lg rounded-2xl border border-emerald-400/60 bg-[#071712] text-white px-4 py-3.5 shadow-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                      Inquiry Sent Successfully! ({submittedSummary.refId})
                    </p>
                    <p className="text-[11px] text-zinc-200 truncate">
                      Thank you, {submittedSummary.name}! Sent to{' '}
                      {PROFILE_DATA.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSuccessToast(false)}
                  className="text-zinc-400 hover:text-white p-1 cursor-pointer shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={modalContainerRef}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-stroke bg-surface text-text-primary shadow-2xl grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close contact dialog"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40 w-9 h-9 rounded-full border border-stroke bg-bg/90 flex items-center justify-center text-muted hover:text-text-primary hover:border-[#89AACC] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Column: Editorial Info, Direct Channels & Readiness */}
            <aside className="lg:col-span-5 bg-bg/55 border-b lg:border-b-0 lg:border-r border-stroke p-6 sm:p-8 flex flex-col justify-between gap-8">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#89AACC] block mb-2">
                  Direct Inquiry
                </span>
                <h3
                  id="contact-modal-title"
                  className="text-3xl sm:text-4xl font-light tracking-tight leading-[1.05]"
                >
                  Start a{' '}
                  <span className="font-display italic">conversation</span>.
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed mt-3">
                  Share your project goals, internship opportunity, or system
                  architecture needs. Every inquiry is sent directly to{' '}
                  <span className="text-text-primary font-mono">
                    {PROFILE_DATA.email}
                  </span>{' '}
                  along with an automated minimalist confirmation email to your
                  inbox.
                </p>
              </div>

              {/* Direct Contact Details (Hairline Rows) */}
              <div className="divide-y divide-stroke/70 border-y border-stroke/70 text-xs">
                <div className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-[#89AACC] shrink-0" />
                    <span className="font-mono text-text-primary truncate">
                      {PROFILE_DATA.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[#89AACC] hover:underline shrink-0 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="py-3.5 flex items-center gap-2.5 text-muted">
                  <MapPin className="w-3.5 h-3.5 text-[#89AACC] shrink-0" />
                  <span>{PROFILE_DATA.location}</span>
                </div>

                <div className="py-3.5 flex items-center gap-2.5 text-muted">
                  <Clock className="w-3.5 h-3.5 text-[#89AACC] shrink-0" />
                  <span>Replies within 24 hours · UTC+8</span>
                </div>
              </div>

              {/* Readiness Indicator & Social Shortcuts */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                    <span className="text-muted uppercase tracking-[0.16em]">
                      Brief Readiness
                    </span>
                    <span className="text-[#89AACC] tabular-nums">
                      0{readinessCompleted} / 04
                    </span>
                  </div>
                  <div className="h-[2px] w-full bg-stroke/60 overflow-hidden">
                    <motion.div
                      animate={{ width: `${(readinessCompleted / 4) * 100}%` }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-[#89AACC]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-muted">
                  <a
                    href={PROFILE_DATA.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-text-primary transition-colors"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3 h-3 text-[#89AACC]" />
                  </a>
                  <span aria-hidden="true" className="text-stroke">
                    ·
                  </span>
                  <a
                    href={PROFILE_DATA.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-text-primary transition-colors"
                  >
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3 h-3 text-[#89AACC]" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Right Column: Centered Success Confirmation Screen OR Cleared Inquiry Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center relative">
              <AnimatePresence mode="wait">
                {showSuccessModal && submittedSummary ? (
                  /* Clean, Minimalist Success Confirmation View */
                  <motion.div
                    key={`success-screen-${submittedSummary.refId}`}
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    role="status"
                    aria-live="polite"
                    className="py-6 flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <div className="rounded-2xl border border-emerald-500/45 bg-emerald-500/10 p-6 sm:p-8 text-center flex flex-col items-center space-y-4 w-full">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 18,
                        }}
                        className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg"
                      >
                        <CheckCircle2 className="w-9 h-9" />
                      </motion.div>

                      <div className="space-y-1.5">
                        <span className="inline-block font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Reference · {submittedSummary.refId}
                        </span>
                        <h4 className="text-2xl sm:text-3xl font-display italic text-text-primary pt-1">
                          Inquiry Sent Successfully!
                        </h4>
                      </div>

                      <p className="text-xs sm:text-sm text-muted max-w-md leading-relaxed">
                        Thank you for reaching out,{' '}
                        <span className="text-text-primary font-medium">
                          {submittedSummary.name}
                        </span>
                        . Your inquiry has been sent and I will get back to you
                        at{' '}
                        <span className="font-mono text-text-primary font-medium">
                          {submittedSummary.email}
                        </span>{' '}
                        within 24 hours.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmittedSummary(null);
                          setShowSuccessModal(false);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-stroke hover:border-[#89AACC] bg-bg px-4 py-2.5 text-xs font-medium text-text-primary transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#89AACC]" />
                        <span>Send Another Inquiry</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSubmittedSummary(null);
                          setShowSuccessModal(false);
                          onClose();
                        }}
                        className="rounded-full bg-emerald-500 text-[#04120c] hover:bg-emerald-400 px-6 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-md"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Inquiry Form View */
                  <motion.div
                    key="inquiry-form-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-5 pr-0 lg:pr-2"
                  >
                    {/* Compact Inline Success Banner if user returned to cleared form */}
                    {submittedSummary && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="rounded-2xl border border-emerald-500/45 bg-emerald-500/10 px-4 py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-text-primary truncate">
                            <strong className="text-emerald-400 font-semibold">
                              Inquiry Sent Successfully!
                            </strong>{' '}
                            ({submittedSummary.refId}) — Form cleared.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSuccessModal(true)}
                          className="font-mono text-[11px] text-[#89AACC] hover:underline shrink-0 cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </div>
                    )}

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="flex flex-col gap-4"
                    >
                      {/* Validation Summary Alert on Failed Submit */}
                      {submitAttempted && !isFormValid && (
                        <div
                          role="alert"
                          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-rose-300"
                        >
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>
                            Please complete{' '}
                            <strong className="font-semibold">
                              {invalidCount} required field
                              {invalidCount === 1 ? '' : 's'}
                            </strong>{' '}
                            highlighted below.
                          </span>
                        </div>
                      )}

                      {/* Row 1: Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name Field */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="contact-name"
                              className="font-mono text-[11px] uppercase tracking-wider text-muted"
                            >
                              Your Name <span className="text-[#89AACC]">*</span>
                            </label>
                            {(touched.name || submitAttempted) &&
                              !errors.name && (
                                <Check className="w-3.5 h-3.5 text-[#89AACC]" />
                              )}
                          </div>
                          <input
                            ref={nameInputRef}
                            id="contact-name"
                            type="text"
                            autoComplete="name"
                            maxLength={80}
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (!touched.name) {
                                setTouched((prev) => ({ ...prev, name: true }));
                              }
                            }}
                            onBlur={() =>
                              setTouched((prev) => ({ ...prev, name: true }))
                            }
                            aria-invalid={
                              (touched.name || submitAttempted) && !!errors.name
                            }
                            aria-describedby={
                              (touched.name || submitAttempted) && errors.name
                                ? 'name-error'
                                : undefined
                            }
                            placeholder="Alex Rivera"
                            className={`w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-muted/55 focus:outline-none transition-colors ${getFieldClass(
                              'name',
                              errors.name
                            )}`}
                          />
                          {(touched.name || submitAttempted) && errors.name && (
                            <p
                              id="name-error"
                              role="alert"
                              className="inline-flex items-start gap-1.5 text-[11px] text-rose-400 leading-snug"
                            >
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{errors.name}</span>
                            </p>
                          )}
                        </div>

                        {/* Email Field */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="contact-email"
                              className="font-mono text-[11px] uppercase tracking-wider text-muted"
                            >
                              Email Address{' '}
                              <span className="text-[#89AACC]">*</span>
                            </label>
                            {(touched.email || submitAttempted) &&
                              !errors.email && (
                                <Check className="w-3.5 h-3.5 text-[#89AACC]" />
                              )}
                          </div>
                          <input
                            ref={emailInputRef}
                            id="contact-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (!touched.email) {
                                setTouched((prev) => ({
                                  ...prev,
                                  email: true,
                                }));
                              }
                            }}
                            onBlur={() =>
                              setTouched((prev) => ({ ...prev, email: true }))
                            }
                            aria-invalid={
                              (touched.email || submitAttempted) &&
                              !!errors.email
                            }
                            aria-describedby={
                              (touched.email || submitAttempted) && errors.email
                                ? 'email-error'
                                : undefined
                            }
                            placeholder="alex@company.com"
                            className={`w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-muted/55 focus:outline-none transition-colors ${getFieldClass(
                              'email',
                              errors.email
                            )}`}
                          />
                          {(touched.email || submitAttempted) &&
                            errors.email && (
                              <p
                                id="email-error"
                                role="alert"
                                className="inline-flex items-start gap-1.5 text-[11px] text-rose-400 leading-snug"
                              >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{errors.email}</span>
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Row 2: Organization (Optional) & Timeline */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="contact-org"
                              className="font-mono text-[11px] uppercase tracking-wider text-muted"
                            >
                              Company / Team
                            </label>
                            <span className="font-mono text-[10px] text-muted/75">
                              Optional
                            </span>
                          </div>
                          <input
                            ref={orgInputRef}
                            id="contact-org"
                            type="text"
                            autoComplete="organization"
                            maxLength={80}
                            value={organization}
                            onChange={(e) => {
                              setOrganization(e.target.value);
                              if (!touched.organization) {
                                setTouched((prev) => ({
                                  ...prev,
                                  organization: true,
                                }));
                              }
                            }}
                            placeholder="Studio, Startup, or Self"
                            className={`w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-muted/55 focus:outline-none transition-colors ${getFieldClass(
                              'organization',
                              errors.organization
                            )}`}
                          />
                          {(touched.organization || submitAttempted) &&
                            errors.organization && (
                              <p
                                role="alert"
                                className="inline-flex items-start gap-1.5 text-[11px] text-rose-400 leading-snug"
                              >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{errors.organization}</span>
                              </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="contact-timeline"
                            className="font-mono text-[11px] uppercase tracking-wider text-muted"
                          >
                            Target Timeline
                          </label>
                          <select
                            id="contact-timeline"
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full rounded-xl border border-stroke bg-bg px-3.5 py-2.5 text-sm text-text-primary focus:border-[#89AACC] focus:ring-1 focus:ring-[#89AACC]/30 focus:outline-none transition-colors cursor-pointer"
                          >
                            {TIMELINE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Interactive Project Scope Selector */}
                      <div className="flex flex-col gap-2">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                          Project Scope
                        </span>
                        <div
                          role="group"
                          aria-label="Project Scope"
                          className="flex flex-wrap gap-1.5"
                        >
                          {PROJECT_SCOPES.map((item) => {
                            const isSelected = service === item;
                            return (
                              <button
                                key={item}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setService(item)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                                  isSelected
                                    ? 'bg-text-primary text-bg border-text-primary'
                                    : 'border-stroke bg-bg text-muted hover:text-text-primary hover:border-[#89AACC]/50'
                                }`}
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 4: Project Details (Message) Field */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="contact-message"
                            className="font-mono text-[11px] uppercase tracking-wider text-muted"
                          >
                            Project Brief / Message{' '}
                            <span className="text-[#89AACC]">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono text-[11px] tabular-nums ${
                                message.length > MAX_MESSAGE_LENGTH
                                  ? 'text-rose-400'
                                  : message.trim().length >= MIN_MESSAGE_LENGTH
                                    ? 'text-[#89AACC]'
                                    : 'text-muted'
                              }`}
                            >
                              {message.trim().length} / {MAX_MESSAGE_LENGTH}
                            </span>
                            {(touched.message || submitAttempted) &&
                              !errors.message && (
                                <Check className="w-3.5 h-3.5 text-[#89AACC]" />
                              )}
                          </div>
                        </div>
                        <textarea
                          ref={messageInputRef}
                          id="contact-message"
                          rows={4}
                          maxLength={MAX_MESSAGE_LENGTH + 50}
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            if (!touched.message) {
                              setTouched((prev) => ({
                                ...prev,
                                message: true,
                              }));
                            }
                          }}
                          onBlur={() =>
                            setTouched((prev) => ({ ...prev, message: true }))
                          }
                          aria-invalid={
                            (touched.message || submitAttempted) &&
                            !!errors.message
                          }
                          aria-describedby={
                            (touched.message || submitAttempted) &&
                            errors.message
                              ? 'message-error'
                              : undefined
                          }
                          placeholder="Share what you are building, key deliverables, or collaboration details..."
                          className={`w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-muted/55 focus:outline-none transition-colors resize-none ${getFieldClass(
                            'message',
                            errors.message
                          )}`}
                        />
                        {(touched.message || submitAttempted) &&
                          errors.message && (
                            <p
                              id="message-error"
                              role="alert"
                              className="inline-flex items-start gap-1.5 text-[11px] text-rose-400 leading-snug"
                            >
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{errors.message}</span>
                            </p>
                          )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stroke/80">
                        {hasAnyInput ? (
                          <button
                            type="button"
                            onClick={resetAll}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-text-primary transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Clear Form</span>
                          </button>
                        ) : (
                          <span className="font-mono text-[11px] text-muted/80">
                            <span className="text-[#89AACC]">*</span> Required
                            fields
                          </span>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-full bg-text-primary text-bg hover:opacity-90 disabled:opacity-60 px-6 py-2.5 text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-opacity cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending Inquiry...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Inquiry</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
